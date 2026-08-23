import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Parallel queries for performance
    const [
      totalEquipments,
      availableCount,
      assignedCount,
      maintenanceCount,
      decommissionedCount,
      totalUsers,
      totalDepartments,
      totalCategories,
      totalSuppliers,
      activeAssignments,
      maintenances,
      recentMovements,
      equipmentsByCategory,
      equipmentsByDepartment,
      recentMaintenances,
      warranties,
      inventories,
    ] = await Promise.all([
      prisma.equipment.count(),
      prisma.equipment.count({ where: { status: 'AVAILABLE' } }),
      prisma.equipment.count({ where: { status: 'ASSIGNED' } }),
      prisma.equipment.count({ where: { status: 'MAINTENANCE' } }),
      prisma.equipment.count({ where: { status: 'DECOMMISSIONED' } }),
      prisma.user.count(),
      prisma.department.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.assignment.count({ where: { status: 'ACTIVE' } }),
      prisma.maintenance.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { equipment: true, technician: true },
      }),
      prisma.movement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { equipment: true, performedBy: true },
      }),
      prisma.category.findMany({
        include: { _count: { select: { equipments: true } } },
      }),
      prisma.department.findMany({
        include: { _count: { select: { equipments: true } } },
      }),
      prisma.maintenance.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { equipment: true, technician: true },
      }),
      prisma.warranty.findMany({
        include: { equipment: true },
      }),
      prisma.inventory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { _count: { select: { items: true } } },
      }),
    ]);

    // Maintenance stats
    const maintenanceReported = maintenances.filter(m => m.status === 'REPORTED').length;
    const maintenanceInProgress = maintenances.filter(m => m.status === 'IN_PROGRESS' || m.status === 'ASSIGNED').length;
    const maintenanceCompleted = maintenances.filter(m => m.status === 'COMPLETED').length;

    // Warranty expiring soon (within 30 days)
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWarranties = warranties.filter(w => {
      const end = new Date(w.endDate);
      return end >= now && end <= in30Days;
    });
    const expiredWarranties = warranties.filter(w => new Date(w.endDate) < now);

    // Monthly equipment acquisition (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      const count = await prisma.equipment.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const maintCount = await prisma.maintenance.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      monthlyData.push({
        month: startOfMonth.toLocaleDateString('fr-FR', { month: 'short' }),
        equipments: count,
        maintenances: maintCount,
      });
    }

    // Category distribution
    const categoryData = equipmentsByCategory
      .map(c => ({ name: c.name, value: c._count.equipments }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);

    // Department distribution
    const departmentData = equipmentsByDepartment
      .map(d => ({ name: d.name, value: d._count.equipments }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // Total asset value
    const totalValue = await prisma.equipment.aggregate({
      _sum: { purchasePrice: true },
    });

    return NextResponse.json({
      kpis: {
        totalEquipments,
        availableCount,
        assignedCount,
        maintenanceCount,
        decommissionedCount,
        totalUsers,
        totalDepartments,
        totalCategories,
        totalSuppliers,
        activeAssignments,
        totalValue: Number(totalValue._sum?.purchasePrice) || 0,
      },
      maintenance: {
        reported: maintenanceReported,
        inProgress: maintenanceInProgress,
        completed: maintenanceCompleted,
      },
      warranties: {
        total: warranties.length,
        expiring: expiringWarranties.length,
        expired: expiredWarranties.length,
      },
      charts: {
        monthlyData,
        categoryData,
        departmentData,
        statusData: [
          { name: 'Disponible', value: availableCount, color: '#4CAF50' },
          { name: 'Affecté', value: assignedCount, color: '#2196F3' },
          { name: 'Maintenance', value: maintenanceCount, color: '#FF9800' },
          { name: 'Réformé', value: decommissionedCount, color: '#F44336' },
        ],
      },
      recentMovements: recentMovements.map(m => ({
        id: m.id,
        type: m.type,
        equipmentName: m.equipment?.name || '-',
        performedBy: m.performedBy ? `${m.performedBy.firstName} ${m.performedBy.lastName}` : 'Système',
        notes: m.notes,
        createdAt: m.createdAt,
      })),
      recentMaintenances: recentMaintenances.map(m => ({
        id: m.id,
        status: m.status,
        priority: m.priority,
        equipmentName: m.equipment?.name || '-',
        assignedTo: m.technician ? `${m.technician.firstName} ${m.technician.lastName}` : '-',
        description: m.description,
        createdAt: m.createdAt,
      })),
      recentInventories: inventories.map(inv => ({
        id: inv.id,
        name: inv.name,
        status: inv.status,
        itemCount: inv._count.items,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
