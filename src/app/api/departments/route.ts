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

    const departments = await prisma.department.findMany({
      where: search ? {
        name: { contains: search }
      } : undefined,
      include: {
        _count: {
          select: { users: true, equipments: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des départements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, location } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Ce département existe déjà" }, { status: 409 });
    }

    const department = await prisma.department.create({
      data: { name, description, location }
    });

    await logAudit('CREATE_DEPARTMENT', `Département créé: ${name}`, session.user.id);

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: "Erreur lors de la création du département" }, { status: 500 });
  }
}
