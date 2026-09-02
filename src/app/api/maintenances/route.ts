import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { sendTicketAssignmentEmail } from '@/lib/email';
import { MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const technicianId = searchParams.get('technicianId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status as MaintenanceStatus;
    if (priority) where.priority = priority as MaintenancePriority;
    if (type) where.type = type as MaintenanceType;
    if (technicianId) where.technicianId = technicianId;
    if (search) {
      where.OR = [
        { equipment: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const maintenances = await prisma.maintenance.findMany({
      where,
      include: {
        equipment: {
          select: { name: true, inventoryNumber: true, serialNumber: true },
        },
        reportedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: {
        reportedDate: 'desc',
      },
    });

    return NextResponse.json(maintenances);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des maintenances" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    let reporterId = session.user.id;
    if (!reporterId && session.user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser) reporterId = dbUser.id;
    }

    if (!reporterId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { equipmentId, description, type, priority, technicianId } = body;

    if (!equipmentId || !description) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const maintenance = await prisma.$transaction(async (tx) => {
      const newMaintenance = await tx.maintenance.create({
        data: {
          equipmentId,
          description: description.trim(),
          type: type ? (type as MaintenanceType) : 'CORRECTIVE',
          priority: priority ? (priority as MaintenancePriority) : 'MEDIUM',
          status: technicianId ? 'ASSIGNED' : 'REPORTED',
          technicianId: technicianId || undefined,
          reportedById: reporterId,
          reportedDate: new Date(),
          startDate: technicianId ? new Date() : undefined,
        },
        include: {
          equipment: true,
          reportedBy: true,
          technician: true,
        },
      });

      await tx.equipment.update({
        where: { id: equipmentId },
        data: { status: 'MAINTENANCE' },
      });

      await tx.movement.create({
        data: {
          equipmentId,
          type: 'MAINTENANCE',
          date: new Date(),
          notes: `Mise en maintenance: ${description.slice(0, 80)}`,
          performedById: reporterId,
        },
      });

      return newMaintenance;
    });

    // 📧 SEND EMAIL NOTIFICATION TO TECHNICIAN(S)
    try {
      const equipment = maintenance.equipment;
      const reporter = maintenance.reportedBy;
      const reporterName = reporter ? `${reporter.firstName} ${reporter.lastName}` : (session.user.name || 'Collaborateur');

      if (technicianId) {
        // Direct assignment to a specific technician
        const tech = maintenance.technician || (await prisma.user.findUnique({ where: { id: technicianId } }));
        if (tech && tech.email) {
          await sendTicketAssignmentEmail({
            to: tech.email,
            technicianName: `${tech.firstName} ${tech.lastName}`,
            ticketId: maintenance.id,
            equipmentName: equipment?.name || 'Équipement',
            serialNumber: equipment?.serialNumber || undefined,
            priority: maintenance.priority,
            description: maintenance.description,
            reportedByName: reporterName,
            assignedByName: reporterName,
          });
          console.log(`[EMAIL DISPATCH] Ticket assigné envoyé à ${tech.email}`);
        }
      } else {
        // Incident declared by an employee: notify all active technicians
        const activeTechnicians = await prisma.user.findMany({
          where: { role: 'TECHNICIAN', isActive: true },
          select: { id: true, firstName: true, lastName: true, email: true },
        });

        for (const tech of activeTechnicians) {
          if (tech.email) {
            await sendTicketAssignmentEmail({
              to: tech.email,
              technicianName: `${tech.firstName} ${tech.lastName}`,
              ticketId: maintenance.id,
              equipmentName: equipment?.name || 'Équipement',
              serialNumber: equipment?.serialNumber || undefined,
              priority: maintenance.priority,
              description: maintenance.description,
              reportedByName: reporterName,
              assignedByName: 'Support DSI Cathedis',
            });
            console.log(`[EMAIL DISPATCH] Alerte nouveau ticket envoyée au technicien ${tech.email}`);
          }
        }
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de maintenance:', emailError);
    }

    await logAudit(reporterId, 'CREATE', 'Maintenance', maintenance.id, { description });

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error('Maintenance create error:', error);
    return NextResponse.json({ error: "Erreur lors de la création de la maintenance" }, { status: 500 });
  }
}
