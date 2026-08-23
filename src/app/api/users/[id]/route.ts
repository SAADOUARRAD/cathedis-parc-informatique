import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération de l'utilisateur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, password, role, departmentId, position, phone } = body;

    const updateData: any = {
      firstName,
      lastName,
      email,
      role,
      departmentId,
      position,
      phone
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    await logAudit('UPDATE_USER', `Utilisateur mis à jour: ${user.email}`, session.user.id);

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'utilisateur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignmentsReceived: {
          where: {
            status: 'ACTIVE' as const
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.assignmentsReceived && user.assignmentsReceived.length > 0) {
      return NextResponse.json({ error: "Impossible de supprimer cet utilisateur car il a des équipements qui lui sont affectés" }, { status: 409 });
    }

    await prisma.user.delete({ where: { id } });

    await logAudit('DELETE_USER', `Utilisateur supprimé: ${user.email}`, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur" }, { status: 500 });
  }
}
