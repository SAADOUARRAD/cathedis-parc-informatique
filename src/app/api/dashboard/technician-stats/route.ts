import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const [
      assignedMaintenances,
      completedMaintenances,
      totalAssigned,
      inProgressCount,
      criticalCount,
      completedThisMonth,
      equipmentInMaintenance,
    ] = await Promise.all([
      // Maintenances actives / assignées
      prisma.maintenance.findMany({
        where: {
          status: {
            in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          equipment: true,
          reportedBy: true,
        },
      }),

      // Maintenances terminées
      prisma.maintenance.findMany({
        where: {
          status: 'COMPLETED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          equipment: true,
          reportedBy: true,
        },
      }),

      // Stats: totalAssigned
      prisma.maintenance.count({
        where: {
          status: {
            in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
      }),

      // Stats: inProgressCount
      prisma.maintenance.count({
        where: {
          status: 'IN_PROGRESS',
        },
      }),

      // Stats: criticalCount
      prisma.maintenance.count({
        where: {
          priority: {
            in: ['HIGH', 'CRITICAL'],
          },
          status: {
            not: 'COMPLETED',
          },
        },
      }),

      // Stats: completedThisMonth
      prisma.maintenance.count({
        where: {
          status: 'COMPLETED',
        },
      }),

      // Équipements actuellement en maintenance
      prisma.equipment.findMany({
        where: {
          status: 'MAINTENANCE',
        },
        include: {
          category: true,
          department: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalAssigned,
        inProgressCount,
        criticalCount,
        completedThisMonth,
      },
      assignedMaintenances: assignedMaintenances.map((m) => ({
        id: m.id,
        description: m.description,
        status: m.status,
        priority: m.priority,
        type: m.type,
        diagnosis: m.diagnosis,
        solution: m.solution,
        cost: m.cost !== null ? Number(m.cost) : null,
        equipmentName: m.equipment?.name || '-',
        equipmentId: m.equipmentId,
        serialNumber: m.equipment?.serialNumber || '-',
        reportedBy: m.reportedBy
          ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}`
          : '-',
        createdAt: m.createdAt,
      })),
      completedMaintenances: completedMaintenances.map((m) => ({
        id: m.id,
        description: m.description,
        status: m.status,
        priority: m.priority,
        type: m.type,
        diagnosis: m.diagnosis,
        solution: m.solution,
        cost: m.cost !== null ? Number(m.cost) : null,
        equipmentName: m.equipment?.name || '-',
        reportedBy: m.reportedBy
          ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}`
          : '-',
        createdAt: m.createdAt,
        endDate: m.endDate,
      })),
      equipmentInMaintenance: equipmentInMaintenance.map((eq) => ({
        id: eq.id,
        name: eq.name,
        serialNumber: eq.serialNumber || '-',
        categoryName: eq.category?.name || '-',
        departmentName: eq.department?.name || '-',
      })),
    });
  } catch (error) {
    console.error('Technician stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques du technicien' },
      { status: 500 }
    );
  }
}
