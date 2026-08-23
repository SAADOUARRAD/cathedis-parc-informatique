import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(inventories);
  } catch (error: any) {
    console.error("GET /api/inventories error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des inventaires" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, startDate } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const inventory = await prisma.inventory.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        status: 'PLANNED',
        createdById: session.user.id,
      },
    });

    await logAudit(session.user.id, "CREATE", "Inventory");

    return NextResponse.json(inventory, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventories error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'inventaire" }, { status: 500 });
  }
}
