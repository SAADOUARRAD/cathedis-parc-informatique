import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    const [
      myEquipments,
      historyEquipments,
      myMaintenances,
      myMovements,
      totalMyEquipments,
      pendingMaintenances,
      completedMaintenances,
    ] = await Promise.all([
      // 1. Actively assigned equipment currently in hands of employee
      prisma.assignment.findMany({
        where: {
          assignedToId: userId,
          status: 'ACTIVE',
          equipment: {
            status: 'ASSIGNED',
          },
        },
        include: {
          signatures: true,
          equipment: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // 2. Returned or previous equipment history since joining Cathedis
      prisma.assignment.findMany({
        where: {
          assignedToId: userId,
          OR: [
            { status: 'RETURNED' },
            { equipment: { status: { not: 'ASSIGNED' } } },
          ],
        },
        include: {
          signatures: true,
          equipment: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          endDate: 'desc',
        },
      }),
      prisma.maintenance.findMany({
        where: {
          reportedById: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          equipment: true,
        },
      }),
      prisma.movement.findMany({
        where: {
          performedById: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          equipment: true,
        },
      }),
      prisma.assignment.count({
        where: {
          assignedToId: userId,
          status: 'ACTIVE',
          equipment: {
            status: 'ASSIGNED',
          },
        },
      }),
      prisma.maintenance.count({
        where: {
          reportedById: userId,
          status: {
            in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
      }),
      prisma.maintenance.count({
        where: {
          reportedById: userId,
          status: 'COMPLETED',
        },
      }),
    ]);

    return NextResponse.json({
      myEquipments: myEquipments.map((item) => ({
        id: item.id,
        assignmentId: item.id,
        name: item.equipment.name,
        serialNumber: item.equipment.serialNumber || '-',
        status: item.equipment.status,
        assignmentStatus: item.status,
        category: item.equipment.category?.name || 'Matériel Informatique',
        assignedAt: item.startDate || item.createdAt,
        returnedAt: item.endDate || null,
        signatures: item.signatures || [],
        equipment: {
          id: item.equipment.id,
          name: item.equipment.name,
          serialNumber: item.equipment.serialNumber || '-',
          status: item.equipment.status,
          category: item.equipment.category?.name || 'Matériel Informatique',
        },
      })),
      historyEquipments: historyEquipments.map((item) => ({
        id: item.id,
        assignmentId: item.id,
        name: item.equipment.name,
        serialNumber: item.equipment.serialNumber || '-',
        status: item.equipment.status,
        assignmentStatus: item.status,
        category: item.equipment.category?.name || 'Matériel Informatique',
        assignedAt: item.startDate || item.createdAt,
        returnedAt: item.endDate || null,
        signatures: item.signatures || [],
        equipment: {
          id: item.equipment.id,
          name: item.equipment.name,
          serialNumber: item.equipment.serialNumber || '-',
          status: item.equipment.status,
          category: item.equipment.category?.name || 'Matériel Informatique',
        },
      })),
      stats: {
        totalEquipments: totalMyEquipments,
        totalHistoryEquipments: historyEquipments.length,
        pendingMaintenances,
        completedMaintenances,
      },
      recentMaintenances: myMaintenances.map((m) => ({
        id: m.id,
        description: m.description,
        status: m.status,
        priority: m.priority,
        equipmentName: m.equipment?.name || '-',
        createdAt: m.createdAt,
      })),
      recentMovements: myMovements.map((mov) => ({
        id: mov.id,
        type: mov.type,
        equipmentName: mov.equipment?.name || '-',
        notes: mov.notes || '',
        createdAt: mov.createdAt,
      })),
    });
  } catch (error) {
    console.error('Employee stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques de l\'employé' },
      { status: 500 }
    );
  }
}
