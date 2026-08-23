import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const users = await prisma.user.findMany({
      where: {
        ...(search ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } }
          ]
        } : {}),
        ...(role ? { role: role as Role } : {})
      },
      include: {
        department: { select: { name: true } }
      },
      orderBy: { lastName: 'asc' }
    });

    // Exclure les mots de passe de la réponse
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, password, role, departmentId, position, phone } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Veuillez fournir toutes les informations obligatoires" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        departmentId,
        position,
        phone
      }
    });

    await logAudit('CREATE_USER', `Utilisateur créé: ${email}`, session.user.id);

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 500 });
  }
}
