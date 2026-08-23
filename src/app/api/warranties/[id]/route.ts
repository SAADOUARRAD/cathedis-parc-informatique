import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  
  const warranty = await prisma.warranty.findUnique({
    where: { id },
    include: {
      equipment: true,
    }
  });

  if (!warranty) return NextResponse.json({ error: 'Garantie introuvable' }, { status: 404 });
  return NextResponse.json(warranty);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  try {
    const { startDate, endDate, provider, terms, documentUrl } = await request.json();

    const warranty = await prisma.warranty.update({
      where: { id },
      data: {
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        provider,
        terms,
        documentUrl
      }
    });

    await logAudit('WARRANTY_UPDATE', `Mise à jour de la garantie`, session.user.id, id);
    return NextResponse.json(warranty);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.warranty.delete({ where: { id } });
    await logAudit('WARRANTY_DELETE', `Suppression de la garantie ${id}`, session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
