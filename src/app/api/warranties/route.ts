import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  
  const warranties = await prisma.warranty.findMany({
    where: {
      ...(search ? {
        OR: [
          { provider: { contains: search } },
          { equipment: { name: { contains: search } } },
          { equipment: { inventoryNumber: { contains: search } } },
        ]
      } : {}),
    },
    include: {
      equipment: { select: { id: true, name: true, inventoryNumber: true } },
    },
    orderBy: { endDate: 'asc' },
  });
  
  return NextResponse.json(warranties);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { equipmentId, startDate, endDate, provider, terms, documentUrl } = await request.json();

    if (!equipmentId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return NextResponse.json({ error: 'Équipement introuvable' }, { status: 404 });
    }

    const warranty = await prisma.warranty.create({
      data: {
        equipmentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        provider,
        terms,
        documentUrl
      }
    });

    await logAudit('WARRANTY_CREATE', `Création d'une garantie pour l'équipement ${equipmentId}`, session.user.id, warranty.id);

    return NextResponse.json(warranty, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la création de la garantie' }, { status: 500 });
  }
}
