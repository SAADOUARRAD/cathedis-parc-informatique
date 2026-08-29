import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 1. Fetch All Equipments with Category, Department, Active Assignment & Maintenances
    const equipments = await prisma.equipment.findMany({
      include: {
        category: true,
        department: true,
        supplier: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            assignedTo: {
              select: { id: true, firstName: true, lastName: true, email: true, department: true }
            },
            signatures: true
          }
        },
        maintenances: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch All Maintenances
    const maintenances = await prisma.maintenance.findMany({
      include: {
        equipment: {
          include: { category: true, department: true }
        },
        reportedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        technician: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch All Assignments & Signatures
    const assignments = await prisma.assignment.findMany({
      include: {
        equipment: {
          include: { category: true }
        },
        assignedTo: {
          include: { department: true }
        },
        assignedBy: {
          select: { firstName: true, lastName: true }
        },
        signatures: true
      },
      orderBy: { startDate: 'desc' }
    });

    // 4. Compute Financial & Depreciation Data
    const now = new Date();
    let totalAcquisitionValue = 0;
    let totalResidualVNC = 0;
    let totalCumulativeDepreciation = 0;
    let totalMaintenanceSpent = 0;

    const formattedEquipments = equipments.map((eq) => {
      const price = eq.purchasePrice ? Number(eq.purchasePrice) : 0;
      totalAcquisitionValue += price;

      // Lifespan in years (3 years for Laptops/Accessories, 5 years for Servers/Monitors)
      const catName = (eq.category?.name || '').toLowerCase();
      const lifespanYears = catName.includes('serveur') || catName.includes('écran') || catName.includes('ecran') ? 5 : 3;

      // Age in months
      const pDate = eq.purchaseDate ? new Date(eq.purchaseDate) : new Date(eq.createdAt);
      const ageInMonths = Math.max(0, (now.getFullYear() - pDate.getFullYear()) * 12 + (now.getMonth() - pDate.getMonth()));
      const totalMonths = lifespanYears * 12;

      // Linear depreciation
      const depreciationRatio = Math.min(1, ageInMonths / totalMonths);
      const cumulativeDepreciation = price * depreciationRatio;
      const vnc = Math.max(0, price - cumulativeDepreciation);

      totalCumulativeDepreciation += cumulativeDepreciation;
      totalResidualVNC += vnc;

      const activeAssign = eq.assignments[0];

      return {
        id: eq.id,
        inventoryNumber: eq.inventoryNumber,
        name: eq.name,
        brand: eq.brand || '-',
        model: eq.model || '-',
        serialNumber: eq.serialNumber || '-',
        status: eq.status,
        category: eq.category?.name || 'Non classé',
        department: eq.department?.name || (activeAssign?.assignedTo?.department?.name || 'Non attribué'),
        purchasePrice: price,
        purchaseDate: eq.purchaseDate || eq.createdAt,
        lifespanYears,
        ageInMonths,
        cumulativeDepreciation: Math.round(cumulativeDepreciation),
        vnc: Math.round(vnc),
        holderName: activeAssign?.assignedTo ? `${activeAssign.assignedTo.firstName} ${activeAssign.assignedTo.lastName}` : null,
        holderEmail: activeAssign?.assignedTo?.email || null,
        isSigned: activeAssign?.signatures && activeAssign.signatures.length > 0
      };
    });

    // Compute Maintenance Summary
    let correctiveCount = 0;
    let preventiveCount = 0;
    let criticalCount = 0;
    let completedMaintenanceCount = 0;

    const formattedMaintenances = maintenances.map((m) => {
      const cost = m.cost ? Number(m.cost) : 0;
      totalMaintenanceSpent += cost;

      if (m.type === 'CORRECTIVE') correctiveCount++;
      if (m.type === 'PREVENTIVE') preventiveCount++;
      if (m.priority === 'CRITICAL' || m.priority === 'HIGH') criticalCount++;
      if (m.status === 'COMPLETED') completedMaintenanceCount++;

      return {
        id: m.id,
        equipmentName: m.equipment?.name || 'Matériel',
        serialNumber: m.equipment?.serialNumber || '-',
        category: m.equipment?.category?.name || '-',
        department: m.equipment?.department?.name || '-',
        type: m.type,
        status: m.status,
        priority: m.priority,
        description: m.description,
        diagnosis: m.diagnosis || '-',
        solution: m.solution || '-',
        cost,
        reporterName: m.reportedBy ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}` : '-',
        technicianName: m.technician ? `${m.technician.firstName} ${m.technician.lastName}` : 'Non assigné',
        createdAt: m.createdAt,
        endDate: m.endDate
      };
    });

    // Compute Assignments & Compliance Summary
    let totalAssignmentsCount = assignments.length;
    let activeAssignmentsCount = 0;
    let signedAssignmentsCount = 0;
    let pendingSignatureCount = 0;

    const formattedAssignments = assignments.map((a) => {
      const isSigned = a.signatures && a.signatures.length > 0;
      if (a.status === 'ACTIVE') {
        activeAssignmentsCount++;
        if (isSigned) signedAssignmentsCount++;
        else pendingSignatureCount++;
      }

      return {
        id: a.id,
        equipmentName: a.equipment?.name || '-',
        serialNumber: a.equipment?.serialNumber || '-',
        category: a.equipment?.category?.name || '-',
        userName: a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : '-',
        userEmail: a.assignedTo?.email || '-',
        department: a.assignedTo?.department?.name || '-',
        assignedBy: a.assignedBy ? `${a.assignedBy.firstName} ${a.assignedBy.lastName}` : 'DSI Cathedis',
        status: a.status,
        startDate: a.startDate,
        endDate: a.endDate,
        isSigned,
        signedAt: isSigned ? a.signatures[0].signedAt : null
      };
    });

    const complianceRate = activeAssignmentsCount > 0
      ? Math.round((signedAssignmentsCount / activeAssignmentsCount) * 100)
      : 100;

    return NextResponse.json({
      inventoryReport: {
        stats: {
          total: equipments.length,
          available: equipments.filter(e => e.status === 'AVAILABLE').length,
          assigned: equipments.filter(e => e.status === 'ASSIGNED').length,
          maintenance: equipments.filter(e => e.status === 'MAINTENANCE').length,
          decommissioned: equipments.filter(e => e.status === 'DECOMMISSIONED').length,
        },
        items: formattedEquipments
      },
      financialReport: {
        stats: {
          totalAcquisitionValue: Math.round(totalAcquisitionValue),
          totalCumulativeDepreciation: Math.round(totalCumulativeDepreciation),
          totalResidualVNC: Math.round(totalResidualVNC),
          totalMaintenanceSpent: Math.round(totalMaintenanceSpent),
          tcoTotal: Math.round(totalAcquisitionValue + totalMaintenanceSpent),
          depreciationRate: totalAcquisitionValue > 0 ? Math.round((totalCumulativeDepreciation / totalAcquisitionValue) * 100) : 0
        },
        items: formattedEquipments
      },
      maintenanceReport: {
        stats: {
          total: maintenances.length,
          corrective: correctiveCount,
          preventive: preventiveCount,
          critical: criticalCount,
          completed: completedMaintenanceCount,
          totalCost: Math.round(totalMaintenanceSpent),
          resolutionRate: maintenances.length > 0 ? Math.round((completedMaintenanceCount / maintenances.length) * 100) : 100
        },
        items: formattedMaintenances
      },
      complianceReport: {
        stats: {
          totalAssignments: totalAssignmentsCount,
          activeAssignments: activeAssignmentsCount,
          signedPV: signedAssignmentsCount,
          pendingSignature: pendingSignatureCount,
          complianceRate
        },
        items: formattedAssignments
      }
    });

  } catch (error: any) {
    console.error('Error compiling reports data:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération des données de rapports' }, { status: 500 });
  }
}
