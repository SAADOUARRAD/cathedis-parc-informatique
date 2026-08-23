import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
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
    const { action, ...data } = body;

    const existing = await prisma.maintenance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Maintenance introuvable" }, { status: 404 });
    }

    let updated;
    await prisma.$transaction(async (tx) => {
      if (action === 'assign') {
        updated = await tx.maintenance.update({
          where: { id },
          data: {
            technicianId: data.technicianId,
            status: 'ASSIGNED',
            startDate: new Date(),
          },
        });
      } else if (action === 'start') {
        updated = await tx.maintenance.update({
          where: { id },
          data: {
            status: 'IN_PROGRESS',
            startDate: existing.startDate || new Date(),
          },
        });
      } else if (action === 'complete') {
        updated = await tx.maintenance.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            endDate: new Date(),
            diagnosis: data.diagnosis,
            solution: data.solution,
            cost: data.cost ? parseFloat(data.cost) : null,
          },
        });
        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: { status: 'AVAILABLE' },
        });
      } else if (action === 'cancel') {
        updated = await tx.maintenance.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });
        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: { status: 'AVAILABLE' },
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
          },
        });
      }
    });

    await logAudit(`MAINTENANCE_UPDATE_${action || 'UPDATE'}`, `Maintenance mise à jour: ${action || 'Champs'}`, session.user.id, id);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

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
    await logAudit('MAINTENANCE_DELETE', "Maintenance supprimée", session.user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
