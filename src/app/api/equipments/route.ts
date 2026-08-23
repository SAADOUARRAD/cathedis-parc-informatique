import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EquipmentStatus } from '@prisma/client';
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
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const departmentId = searchParams.get('departmentId');

    const equipments = await prisma.equipment.findMany({
      where: {
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { inventoryNumber: { contains: search } },
            { serialNumber: { contains: search } }
          ]
        } : {}),
        ...(status ? { status: status as EquipmentStatus } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(departmentId ? { departmentId } : {})
      },
      include: {
        category: true,
        department: true,
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(equipments);
  } catch (error) {
    console.error('Error fetching equipments:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des équipements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    let { name, serialNumber, inventoryNumber, categoryId, departmentId, supplierId, status, purchasePrice, purchaseDate, description } = body;

    if (!name || !categoryId || !status) {
      return NextResponse.json({ error: "Informations requises manquantes" }, { status: 400 });
    }

    if (!inventoryNumber) {
      const count = await prisma.equipment.count();
      inventoryNumber = `CAT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
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

    await logAudit('CREATE_EQUIPMENT', `Équipement créé: ${inventoryNumber}`, session.user.id);

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: "Erreur lors de la création de l'équipement" }, { status: 500 });
  }
}
