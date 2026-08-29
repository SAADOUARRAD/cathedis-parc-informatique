import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { sendTicketAssignmentEmail } from '@/lib/email';
import { MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: {
        equipment: true,
        reportedBy: true,
        technician: true,
      },
    });

    if (!maintenance) {
      return NextResponse.json({ error: "Maintenance introuvable" }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, status, ...data } = body;

    const existing = await prisma.maintenance.findUnique({
      where: { id },
      include: {
        equipment: true,
        reportedBy: true,
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Maintenance introuvable" }, { status: 404 });
    }

    let updated: any;
    let newlyAssignedTechId: string | null = null;

    await prisma.$transaction(async (tx) => {
      if (action === 'assign' || status === 'ASSIGNED' || (data.technicianId && data.technicianId !== existing.technicianId)) {
        const targetTechId = data.technicianId || session.user.id;
        newlyAssignedTechId = targetTechId;

        updated = await tx.maintenance.update({
          where: { id },
          data: {
            technicianId: targetTechId,
            status: 'ASSIGNED',
            startDate: new Date(),
          },
          include: {
            equipment: true,
            reportedBy: true,
            technician: true,
          }
        });
      } else if (action === 'start' || status === 'IN_PROGRESS') {
        updated = await tx.maintenance.update({
          where: { id },
          data: {
            status: 'IN_PROGRESS',
            technicianId: existing.technicianId || session.user.id,
            startDate: existing.startDate || new Date(),
          },
        });
      } else if (action === 'complete' || status === 'COMPLETED') {
        updated = await tx.maintenance.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            technicianId: existing.technicianId || session.user.id,
            endDate: new Date(),
            diagnosis: data.diagnosis,
            solution: data.solution,
            cost: data.cost ? parseFloat(data.cost) : null,
          },
        });

        // Check if equipment has an active assignment
        const activeAssignment = await tx.assignment.findFirst({
          where: { equipmentId: existing.equipmentId, status: 'ACTIVE' },
        });

        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: { status: activeAssignment ? 'ASSIGNED' : 'AVAILABLE' },
        });
      } else if (action === 'cancel' || status === 'CANCELLED') {
        updated = await tx.maintenance.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        const activeAssignment = await tx.assignment.findFirst({
          where: { equipmentId: existing.equipmentId, status: 'ACTIVE' },
        });

        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: { status: activeAssignment ? 'ASSIGNED' : 'AVAILABLE' },
        });
      } else {
        updated = await tx.maintenance.update({
          where: { id },
          data: {
            description: data.description,
            priority: data.priority ? (data.priority as MaintenancePriority) : undefined,
            type: data.type ? (data.type as MaintenanceType) : undefined,
            diagnosis: data.diagnosis,
            solution: data.solution,
            cost: data.cost ? parseFloat(data.cost) : undefined,
            technicianId: data.technicianId || undefined,
          },
        });
      }
    });

    // Send email notification to technician if assigned
    if (newlyAssignedTechId) {
      try {
        const technician = await prisma.user.findUnique({
          where: { id: newlyAssignedTechId },
        });

        if (technician && technician.email) {
          const adminUser = await prisma.user.findUnique({
            where: { id: session.user.id }
          });

          await sendTicketAssignmentEmail({
            to: technician.email,
            technicianName: `${technician.firstName} ${technician.lastName}`,
            ticketId: existing.id,
            equipmentName: existing.equipment?.name || 'Équipement',
            serialNumber: existing.equipment?.serialNumber || undefined,
            priority: existing.priority,
            description: existing.description,
            reportedByName: existing.reportedBy ? `${existing.reportedBy.firstName} ${existing.reportedBy.lastName}` : 'Collaborateur',
            assignedByName: adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Administrateur IT'
          });
        }
      } catch (emailErr) {
        console.error('Erreur lors de l\'envoi de l\'email de notification au technicien:', emailErr);
      }
    }

    await logAudit(
      session.user.id,
      'UPDATE',
      'Maintenance',
      id,
      { status: status || action || 'UPDATE', technicianId: newlyAssignedTechId || undefined }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Maintenance update error:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.maintenance.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Maintenance introuvable" }, { status: 404 });
    }

    if (existing.status !== 'REPORTED' && existing.status !== 'CANCELLED') {
      return NextResponse.json({ error: "Impossible de supprimer cette maintenance" }, { status: 400 });
    }

    await prisma.maintenance.delete({ where: { id } });
    await logAudit(session.user.id, 'DELETE', 'Maintenance', id, { status: existing.status });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
