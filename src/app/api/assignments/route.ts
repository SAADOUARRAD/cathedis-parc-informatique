import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { AssignmentStatus, EquipmentStatus, MovementType } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  
  const assignments = await prisma.assignment.findMany({
    where: {
      ...(status ? { status: status as AssignmentStatus } : {}),
      ...(search ? {
        OR: [
          { equipment: { name: { contains: search } } },
          { assignedTo: { firstName: { contains: search } } },
          { assignedTo: { lastName: { contains: search } } },
        ]
      } : {}),
    },
    include: {
      equipment: {
        include: {
          category: true,
          department: true,
        }
      },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
      signatures: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { equipmentId, assignedToId, notes } = await request.json();

    if (!equipmentId || !assignedToId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return NextResponse.json({ error: 'Équipement introuvable' }, { status: 404 });
    }
    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      return NextResponse.json({ error: 'L\'équipement n\'est pas disponible' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          equipmentId,
          assignedToId,
          assignedById: session.user.id,
          status: AssignmentStatus.ACTIVE,
          notes,
          startDate: new Date(),
        }
      });

      await tx.equipment.update({
        where: { id: equipmentId },
        data: { status: EquipmentStatus.ASSIGNED }
      });

      await tx.movement.create({
        data: {
          equipmentId,
          performedById: session.user.id,
          assignmentId: assignment.id,
          type: MovementType.ASSIGNMENT,
          date: new Date(),
        }
      });

      return assignment;
    });

    await logAudit('ASSIGNMENT_CREATE', `Assignation de l'équipement ${equipmentId}`, session.user.id, result.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'assignation' }, { status: 500 });
  }
}
