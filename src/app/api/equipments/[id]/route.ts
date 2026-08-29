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

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        supplier: true,
        currentAssignment: {
          include: {
            user: true
          }
        }
      }
    });

    if (!equipment) {
      return NextResponse.json({ error: "Équipement non trouvé" }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération de l'équipement" }, { status: 500 });
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
    const { name, brand, model, serialNumber, inventoryNumber, categoryId, departmentId, supplierId, status, purchasePrice, purchaseDate, description } = body;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        brand,
        model,
        serialNumber,
        inventoryNumber,
        categoryId,
        departmentId,
        supplierId,
        status,
        purchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        description
      }
    });

    await logAudit('UPDATE_EQUIPMENT', `Équipement mis à jour: ${equipment.inventoryNumber}`, session.user.id);

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'équipement" }, { status: 500 });
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

    const equipment = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!equipment) {
      return NextResponse.json({ error: "Équipement non trouvé" }, { status: 404 });
    }

    if (equipment.status === 'ASSIGNED') {
      return NextResponse.json({ error: "Impossible de supprimer cet équipement car il est actuellement affecté" }, { status: 409 });
    }

    await prisma.equipment.delete({ where: { id } });

    await logAudit('DELETE_EQUIPMENT', `Équipement supprimé: ${equipment.inventoryNumber}`, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression de l'équipement" }, { status: 500 });
  }
}
