import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { RequestStatus } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Only admin/technician can approve/reject
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminResponse } = body;

    const updated = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status: status as RequestStatus,
        adminResponse,
        handledById: session.user.id,
        handledAt: new Date(),
      },
    });

    await logAudit(session.user.id, 'UPDATE', 'EquipmentRequest', id, { status, adminResponse });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Equipment request PATCH error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const req = await prisma.equipmentRequest.findUnique({ where: { id } });
    if (!req) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    // Only the requester or admin can delete
    if (session.user.role === 'EMPLOYEE' && req.requestedById !== session.user.id) {
      return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
    }

    await prisma.equipmentRequest.delete({ where: { id } });
    await logAudit(session.user.id, 'DELETE', 'EquipmentRequest', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Equipment request DELETE error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
