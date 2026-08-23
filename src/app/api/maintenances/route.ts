import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@prisma/client';

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
          select: { name: true, inventoryNumber: true },
        },
        reportedBy: {
          select: { firstName: true, lastName: true },
        },
        technician: {
          select: { firstName: true, lastName: true },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { equipmentId, description, type, priority } = body;

    if (!equipmentId || !description) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const maintenance = await prisma.$transaction(async (tx) => {
      const newMaintenance = await tx.maintenance.create({
        data: {
          equipmentId,
          description,
          type: type ? (type as MaintenanceType) : 'CORRECTIVE',
          priority: priority ? (priority as MaintenancePriority) : 'MEDIUM',
          status: 'REPORTED',
          reportedById: session.user.id,
          reportedDate: new Date(),
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
          notes: "Mise en maintenance",
          performedById: session.user.id,
        },
      });

      return newMaintenance;
    });

    await logAudit('MAINTENANCE_CREATE', "Nouvelle maintenance déclarée", session.user.id, maintenance.id);

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création de la maintenance" }, { status: 500 });
  }
}
