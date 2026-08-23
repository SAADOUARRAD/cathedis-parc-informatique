import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    // Employees see only their own requests, admins see all
    if (session.user.role === 'EMPLOYEE') {
      where.requestedById = session.user.id;
    } else if (userId) {
      where.requestedById = userId;
    }

    const requests = await prisma.equipmentRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: true,
        handledBy: true,
        category: true,
      },
    });

    return NextResponse.json(requests.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      quantity: r.quantity,
      reason: r.reason,
      adminResponse: r.adminResponse,
      categoryName: r.category?.name || null,
      categoryId: r.categoryId,
      requestedBy: `${r.requestedBy.firstName} ${r.requestedBy.lastName}`,
      requestedById: r.requestedById,
      handledBy: r.handledBy ? `${r.handledBy.firstName} ${r.handledBy.lastName}` : null,
      createdAt: r.createdAt,
      handledAt: r.handledAt,
    })));
  } catch (error) {
    console.error('Equipment requests GET error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, quantity, reason, categoryId } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
    }

    const newRequest = await prisma.equipmentRequest.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        quantity: quantity || 1,
        reason,
        categoryId: categoryId || null,
        requestedById: session.user.id,
      },
    });

    await logAudit(session.user.id, 'CREATE', 'EquipmentRequest', newRequest.id, { title });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Equipment requests POST error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
