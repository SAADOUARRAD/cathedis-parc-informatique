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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipments: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération de la catégorie" }, { status: 500 });
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
    const { name, description, prefix } = body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, description, prefix }
    });

    await logAudit('UPDATE_CATEGORY', `Catégorie mise à jour: ${category.name}`, session.user.id);

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la catégorie" }, { status: 500 });
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipments: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    if (category._count.equipments > 0) {
      return NextResponse.json({ error: "Impossible de supprimer cette catégorie car elle contient des équipements" }, { status: 409 });
    }

    await prisma.category.delete({ where: { id } });

    await logAudit('DELETE_CATEGORY', `Catégorie supprimée: ${category.name}`, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression de la catégorie" }, { status: 500 });
  }
}
