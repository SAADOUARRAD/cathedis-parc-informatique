import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendTicketAssignmentEmail } from '@/lib/email';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { to } = body;

    if (!to || !to.includes('@')) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const result = await sendTicketAssignmentEmail({
      to: to.trim(),
      technicianName: "Technicien Test Cathedis",
      ticketId: "DEMO-99999",
      equipmentName: "PC Portable Dell Latitude 5540 Pro",
      serialNumber: "SN-CAT-2026-X88",
      priority: "HIGH",
      description: "Test d'envoi réel d'email de maintenance depuis la plateforme Cathedis Parc Informatique.",
      reportedByName: `${session.user.name || 'Administrateur'}`,
      assignedByName: "Service IT Cathedis"
    });

    if (result.simulated) {
      return NextResponse.json({
        success: false,
        warning: "Identifiants Gmail/SMTP non configurés dans le fichier .env. Veuillez renseigner SMTP_USER et SMTP_PASS pour activer l'envoi réel.",
        details: result
      });
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: "Erreur lors de l'envoi via Gmail. Vérifiez votre mot de passe d'application Google.",
        details: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Email réel expédié avec succès à ${to} !`,
      messageId: result.messageId
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
