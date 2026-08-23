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

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipments: true }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération du fournisseur" }, { status: 500 });
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
    const { name, contactName, email, phone, address, website } = body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, contactName, email, phone, address, website }
    });

    await logAudit('UPDATE_SUPPLIER', `Fournisseur mis à jour: ${supplier.name}`, session.user.id);

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du fournisseur" }, { status: 500 });
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

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipments: true }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }

    if (supplier._count.equipments > 0) {
      return NextResponse.json({ error: "Impossible de supprimer ce fournisseur car il contient des équipements" }, { status: 409 });
    }

    await prisma.supplier.delete({ where: { id } });

    await logAudit('DELETE_SUPPLIER', `Fournisseur supprimé: ${supplier.name}`, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression du fournisseur" }, { status: 500 });
  }
}
