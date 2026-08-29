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

    const suppliers = await prisma.supplier.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { contactName: { contains: search } },
          { email: { contains: search } },
        ]
      } : undefined,
      include: {
        _count: {
          select: { equipments: true }
        },
        equipments: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            status: true,
            purchasePrice: true,
            purchaseDate: true,
            serialNumber: true,
            inventoryNumber: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const enrichedSuppliers = suppliers.map(s => {
      const totalSpending = s.equipments.reduce((sum, eq) => sum + (Number(eq.purchasePrice) || 0), 0);
      const activeCount = s.equipments.filter(e => e.status === 'ASSIGNED' || e.status === 'AVAILABLE').length;
      return {
        ...s,
        equipmentsCount: s._count.equipments,
        totalSpending,
        activeCount,
      };
    });

    return NextResponse.json(enrichedSuppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des fournisseurs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, contactName, email, phone, address, website, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: { name, contactName, email, phone, address, website, notes }
    });

    await logAudit('CREATE_SUPPLIER', `Fournisseur créé: ${name}`, session.user.id);

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: "Erreur lors de la création du fournisseur" }, { status: 500 });
  }
}
