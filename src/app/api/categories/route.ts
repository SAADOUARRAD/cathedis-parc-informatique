import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const categories = await prisma.category.findMany({
      where: search ? {
        name: { contains: search }
      } : undefined,
      include: {
        _count: {
          select: { equipments: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des catégories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, prefix } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Cette catégorie existe déjà" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name, description, prefix }
    });

    await logAudit('CREATE_CATEGORY', `Catégorie créée: ${name}`, session.user.id);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: "Erreur lors de la création de la catégorie" }, { status: 500 });
  }
}
