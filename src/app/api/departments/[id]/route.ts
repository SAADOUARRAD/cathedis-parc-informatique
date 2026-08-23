import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { auth } from '@/lib/auth';

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

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, equipments: true }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération du département" }, { status: 500 });
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
    const { name, description, location } = body;

    const department = await prisma.department.update({
      where: { id },
      data: { name, description, location }
    });

    await logAudit('UPDATE_DEPARTMENT', `Département mis à jour: ${department.name}`, session.user.id);

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du département" }, { status: 500 });
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

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, equipments: true }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 });
    }

    if (department._count.users > 0 || department._count.equipments > 0) {
      return NextResponse.json({ error: "Impossible de supprimer ce département car il contient des utilisateurs ou des équipements liés" }, { status: 409 });
    }

    await prisma.department.delete({ where: { id } });

    await logAudit('DELETE_DEPARTMENT', `Département supprimé: ${department.name}`, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression du département" }, { status: 500 });
  }
}
