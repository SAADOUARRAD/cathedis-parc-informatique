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
          { equipment: { inventoryNumber: { contains: search } } },
          { equipment: { serialNumber: { contains: search } } },
          { assignedTo: { firstName: { contains: search } } },
          { assignedTo: { lastName: { contains: search } } },
          { assignedTo: { email: { contains: search } } },
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
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          department: { select: { id: true, name: true, location: true } }
        }
      },
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
    const body = await request.json();
    const { equipmentId, equipmentIds, assignedToId, notes, signatureBase64 } = body;

    const targetEquipmentIds: string[] = equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0
      ? equipmentIds
      : (equipmentId ? [equipmentId] : []);

    if (targetEquipmentIds.length === 0 || !assignedToId) {
      return NextResponse.json({ error: 'Équipement(s) et utilisateur requis' }, { status: 400 });
    }

    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
      include: { department: true }
    });

    if (!assignedUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const createdAssignments = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const eqId of targetEquipmentIds) {
        const equipment = await tx.equipment.findUnique({ where: { id: eqId } });
        if (!equipment || equipment.status !== EquipmentStatus.AVAILABLE) {
          throw new Error(`L'équipement ${equipment?.name || eqId} n'est pas disponible pour affectation.`);
        }

        const assignment = await tx.assignment.create({
          data: {
            equipmentId: eqId,
            assignedToId,
            assignedById: session.user.id,
            status: AssignmentStatus.ACTIVE,
            notes,
            startDate: new Date(),
          }
        });

        // If signature was provided during wizard
        if (signatureBase64) {
          await tx.signature.create({
            data: {
              assignmentId: assignment.id,
              userId: assignedToId,
              signatureData: signatureBase64,
              type: 'ASSIGNMENT',
              status: 'VALID',
            }
          });
        }

        await tx.equipment.update({
          where: { id: eqId },
          data: {
            status: EquipmentStatus.ASSIGNED,
            departmentId: assignedUser.departmentId || undefined,
          }
        });

        await tx.movement.create({
          data: {
            equipmentId: eqId,
            performedById: session.user.id,
            assignmentId: assignment.id,
            type: MovementType.ASSIGNMENT,
            date: new Date(),
            notes: notes || `Affectation à ${assignedUser.firstName} ${assignedUser.lastName}`
          }
        });

        results.push(assignment);
      }

      return results;
    });

    await logAudit(
      'ASSIGNMENT_CREATE',
      `Affectation de ${createdAssignments.length} équipement(s) à ${assignedUser.firstName} ${assignedUser.lastName}`,
      session.user.id,
      createdAssignments[0]?.id
    );

    return NextResponse.json(createdAssignments.length === 1 ? createdAssignments[0] : createdAssignments, { status: 201 });
  } catch (error: any) {
    console.error('Assignment error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création de l\'affectation' }, { status: 500 });
  }
}
