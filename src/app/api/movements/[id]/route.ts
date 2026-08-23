import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  
  const movement = await prisma.movement.findUnique({
    where: { id },
    include: {
      equipment: true,
      performedBy: true,
      fromDepartment: true,
      toDepartment: true,
      assignment: true,
    }
  });

  if (!movement) return NextResponse.json({ error: 'Mouvement introuvable' }, { status: 404 });
  return NextResponse.json(movement);
}
