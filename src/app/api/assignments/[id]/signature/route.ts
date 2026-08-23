import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await req.json();

    if (!body.signatureData) {
      return NextResponse.json({ error: 'La donnée de signature est requise' }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { equipment: true, assignedTo: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Affectation introuvable' }, { status: 404 });
    }

    // Create signature record
    const signature = await prisma.signature.create({
      data: {
        assignmentId,
        userId: session.user.id,
        signatureData: body.signatureData,
      },
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        action: 'SIGN_ASSIGNMENT',
        entity: 'Assignment',
        entityId: assignmentId,
        userId: session.user.id,
        details: JSON.stringify({
          equipment: assignment.equipment.name,
          recipient: `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`,
          signedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Procès-verbal signé électroniquement avec succès !',
      signatureId: signature.id,
    });
  } catch (error) {
    console.error('Signature save error:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde de la signature' }, { status: 500 });
  }
}
