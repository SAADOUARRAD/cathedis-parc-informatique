import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { MovementType } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const equipmentId = searchParams.get('equipmentId');
  const search = searchParams.get('search');
  
  const movements = await prisma.movement.findMany({
    where: {
      ...(type ? { type: type as MovementType } : {}),
      ...(equipmentId ? { equipmentId } : {}),
      ...(search ? {
        OR: [
          { equipment: { name: { contains: search } } },
          { equipment: { inventoryNumber: { contains: search } } },
        ]
      } : {}),
    },
    include: {
      equipment: { select: { id: true, name: true, inventoryNumber: true } },
      performedBy: { select: { id: true, firstName: true, lastName: true } },
      fromDepartment: { select: { id: true, name: true } },
      toDepartment: { select: { id: true, name: true } },
      assignment: true,
    },
    orderBy: { date: 'desc' },
  });
  
  return NextResponse.json(movements);
}
