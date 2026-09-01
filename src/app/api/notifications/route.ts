import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // 1. Fetch user notifications stored in DB
    const dbNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // 2. Generate Real-time Fleet Alerts based on role
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const liveAlerts: any[] = [];

    if (userRole === 'ADMIN') {
      // Alert 1: Warranties expiring within 30 days
      const expiringWarranties = await prisma.warranty.findMany({
        where: {
          endDate: { gte: now, lte: thirtyDaysFromNow }
        },
        include: { equipment: true },
        take: 3
      });

      expiringWarranties.forEach(w => {
        const daysLeft = Math.ceil((new Date(w.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        liveAlerts.push({
          id: `warranty-${w.id}`,
          title: 'Garantie Expirant Bientôt ⚠️',
          message: `La garantie de ${w.equipment.name} expire dans ${daysLeft} jour(s).`,
          type: 'WARRANTY_EXPIRING',
          read: false,
          link: '/dashboard/warranties',
          createdAt: w.createdAt,
          badgeColor: '#EF4444'
        });
      });

      // Alert 2: Unassigned Critical / High Maintenances
      const criticalMaintenances = await prisma.maintenance.findMany({
        where: {
          status: 'REPORTED',
          priority: { in: ['HIGH', 'CRITICAL'] }
        },
        include: { equipment: true },
        take: 3
      });

      criticalMaintenances.forEach(m => {
        liveAlerts.push({
          id: `maint-${m.id}`,
          title: 'Ticket Critique en Attente 🚨',
          message: `Incident déclaré sur ${m.equipment.name} : "${m.description.slice(0, 45)}..."`,
          type: 'MAINTENANCE_UPDATE',
          read: false,
          link: '/dashboard/maintenances',
          createdAt: m.createdAt,
          badgeColor: '#DC2626'
        });
      });

      // Alert 3: Pending Equipment Requests
      const pendingRequests = await prisma.equipmentRequest.findMany({
        where: { status: 'PENDING' },
        include: { requestedBy: true },
        take: 3
      });

      pendingRequests.forEach(req => {
        liveAlerts.push({
          id: `req-${req.id}`,
          title: 'Nouvelle Demande de Matériel 📦',
          message: `${req.requestedBy.firstName} ${req.requestedBy.lastName} a demandé : "${req.title}".`,
          type: 'SYSTEM',
          read: false,
          link: '/dashboard/equipment-requests',
          createdAt: req.createdAt,
          badgeColor: '#2563EB'
        });
      });
    } else if (userRole === 'TECHNICIAN') {
      // Alert for Technician: Assigned or in-progress tickets
      const assignedTickets = await prisma.maintenance.findMany({
        where: {
          status: { in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'] }
        },
        include: { equipment: true },
        take: 5
      });

      assignedTickets.forEach(t => {
        liveAlerts.push({
          id: `tech-maint-${t.id}`,
          title: 'Intervention Technique Assignée 🛠️',
          message: `Matériel : ${t.equipment.name} (SN: ${t.equipment.serialNumber || 'N/A'}) - Statut : ${t.status}`,
          type: 'MAINTENANCE_UPDATE',
          read: false,
          link: '/dashboard/technician/maintenances',
          createdAt: t.createdAt,
          badgeColor: '#0284C7'
        });
      });
    } else if (userRole === 'EMPLOYEE') {
      // Alert for Employee: Active assignments or resolved tickets
      const myTickets = await prisma.maintenance.findMany({
        where: {
          reportedById: userId,
          status: 'COMPLETED'
        },
        include: { equipment: true },
        orderBy: { updatedAt: 'desc' },
        take: 3
      });

      myTickets.forEach(t => {
        liveAlerts.push({
          id: `emp-ticket-${t.id}`,
          title: 'Ticket Réparé & Résolu 🎉',
          message: `Votre ${t.equipment.name} a été réparé par l'équipe IT.`,
          type: 'MAINTENANCE_UPDATE',
          read: false,
          link: '/dashboard/employee/mes-tickets',
          createdAt: t.updatedAt,
          badgeColor: '#059669'
        });
      });
    }

    // Combine DB notifications + Live Alerts
    const allNotifications = [...dbNotifications, ...liveAlerts];
    const unreadCount = allNotifications.filter(n => !n.read).length;

    return NextResponse.json({
      notifications: allNotifications,
      unreadCount
    });

  } catch (error) {
    console.error('Erreur API Notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Mark all DB notifications as read for this user
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    return NextResponse.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur PATCH Notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
