import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { AssignmentStatus, EquipmentStatus, MovementType } from '@prisma/client';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      equipment: true,
      assignedTo: true,
      assignedBy: true,
      movements: true,
      signatures: true,
    }
  });

  if (!assignment) return NextResponse.json({ error: 'Assignation introuvable' }, { status: 404 });
  return NextResponse.json(assignment);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  try {
    const data = await request.json();
    const { action, notes, newUserId } = data;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { assignedTo: true }
    });

    if (!assignment) return NextResponse.json({ error: 'Assignation introuvable' }, { status: 404 });
    if (assignment.status !== AssignmentStatus.ACTIVE) {
      return NextResponse.json({ error: 'Cette assignation n\'est plus active' }, { status: 400 });
    }

    if (action === 'return') {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.assignment.update({
          where: { id },
          data: { status: AssignmentStatus.RETURNED, endDate: new Date() }
        });

        await tx.equipment.update({
          where: { id: assignment.equipmentId },
          data: { status: EquipmentStatus.AVAILABLE }
        });

        await tx.movement.create({
          data: {
            equipmentId: assignment.equipmentId,
            performedById: session.user.id,
            assignmentId: assignment.id,
            type: MovementType.RETURN,
            date: new Date(),
          }
        });

        return updated;
      });
      await logAudit('ASSIGNMENT_RETURN', `Retour de l'équipement ${assignment.equipmentId}`, session.user.id, id);
      return NextResponse.json(result);
    } else if (action === 'transfer') {
      if (!newUserId) return NextResponse.json({ error: 'Le nouvel utilisateur est requis' }, { status: 400 });

      const newUser = await prisma.user.findUnique({ where: { id: newUserId } });
      if (!newUser) return NextResponse.json({ error: 'Nouvel utilisateur introuvable' }, { status: 404 });

      const result = await prisma.$transaction(async (tx) => {
        await tx.assignment.update({
          where: { id },
          data: { status: AssignmentStatus.TRANSFERRED, endDate: new Date() }
        });

        const newAssignment = await tx.assignment.create({
          data: {
            equipmentId: assignment.equipmentId,
            assignedToId: newUserId,
            assignedById: session.user.id,
            status: AssignmentStatus.ACTIVE,
            startDate: new Date(),
            notes
          }
        });

        await tx.movement.create({
          data: {
            equipmentId: assignment.equipmentId,
            performedById: session.user.id,
            assignmentId: newAssignment.id,
            type: MovementType.TRANSFER,
            fromDepartmentId: assignment.assignedTo.departmentId,
            toDepartmentId: newUser.departmentId,
            date: new Date(),
          }
        });

        return newAssignment;
      });
      await logAudit('ASSIGNMENT_TRANSFER', `Transfert de l'équipement ${assignment.equipmentId}`, session.user.id, id);
      return NextResponse.json(result);
    } else {
      const updated = await prisma.assignment.update({
        where: { id },
        data: { notes }
      });
      await logAudit('ASSIGNMENT_UPDATE', `Mise à jour de l'assignation`, session.user.id, id);
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  try {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) return NextResponse.json({ error: 'Assignation introuvable' }, { status: 404 });
    if (assignment.status === AssignmentStatus.ACTIVE) {
      return NextResponse.json({ error: 'Impossible de supprimer une assignation active' }, { status: 400 });
    }

    await prisma.assignment.delete({ where: { id } });
    await logAudit('ASSIGNMENT_DELETE', `Suppression de l'assignation ${id}`, session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
