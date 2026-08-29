import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { to, subject, message, templateType } = body;

    if (!to || !to.includes('@')) {
      return NextResponse.json({ error: "Adresse email du fournisseur invalide" }, { status: 400 });
    }

    if (!subject || !message) {
      return NextResponse.json({ error: "Le sujet et le message sont requis" }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });
    }

    const senderUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : 'Direction IT Cathedis';
    const senderEmail = senderUser?.email || process.env.SMTP_USER;

    // Build professional branded HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F8FAFC; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%); padding: 30px; text-align: center; color: #FFFFFF;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CATHEDIS PARC INFORMATIQUE</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #FFCDD2; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
                ✉️ Communication Officielle Fournisseur
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; margin: 0 0 16px; font-weight: 600; color: #1E293B;">
                Bonjour ${supplier.contactName ? `<strong>${supplier.contactName}</strong> (${supplier.name})` : `l'équipe <strong>${supplier.name}</strong>`},
              </p>
              
              <div style="background-color: #F8FAFC; border-left: 4px solid #E31E24; border-radius: 8px; padding: 20px; margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-line;">
${message}
              </div>

              <!-- Sender Signature Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="font-size: 14px; color: #1E293B; font-weight: 700;">
                    ${senderName}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748B;">
                    Département Informatique & Gestion du Parc • <strong>CATHEDIS</strong>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #E31E24; font-weight: 600;">
                    Email de réponse : ${senderEmail}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 18px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 12px; color: #64748B; font-weight: 600;">
                © ${new Date().getFullYear()} Cathedis IT Support • Plateforme de Gestion des Équipements
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Transport SMTP
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
    const from = process.env.SMTP_FROM || user || 'Cathedis IT <support-it@cathedis.com>';

    if (!user || !pass) {
      return NextResponse.json({
        success: false,
        error: "Configuration SMTP manquante dans le fichier .env"
      }, { status: 500 });
    }

    const isGmail = host.includes('gmail') || user.includes('@gmail.com');
    const transporter = isGmail
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        })
      : nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });

    const info = await transporter.sendMail({
      from,
      to,
      replyTo: senderEmail,
      subject: subject,
      html: htmlContent,
    });

    await logAudit(
      'SEND_EMAIL_SUPPLIER',
      `Email envoyé à ${supplier.name} (${to}) - Sujet: ${subject}`,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email expédié avec succès à ${to} !`
    });
  } catch (error: any) {
    console.error('Error sending email to supplier:', error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}
