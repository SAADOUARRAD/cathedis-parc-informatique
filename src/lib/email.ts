import nodemailer from 'nodemailer';

interface SendTicketEmailParams {
  to: string;
  technicianName: string;
  ticketId: string;
  equipmentName: string;
  serialNumber?: string;
  priority: string;
  description: string;
  reportedByName: string;
  assignedByName?: string;
}

export async function sendTicketAssignmentEmail(params: SendTicketEmailParams) {
  const {
    to,
    technicianName,
    ticketId,
    equipmentName,
    serialNumber,
    priority,
    description,
    reportedByName,
    assignedByName = 'Administrateur IT'
  } = params;

  // Priority color & badge
  let priorityLabel = 'Normale';
  let priorityColor = '#D97706';
  let priorityBg = '#FEF3C7';

  if (priority === 'CRITICAL') {
    priorityLabel = '⚡ Critique (Blocage Total)';
    priorityColor = '#DC2626';
    priorityBg = '#FEE2E2';
  } else if (priority === 'HIGH') {
    priorityLabel = '🔴 Haute';
    priorityColor = '#EA580C';
    priorityBg = '#FFEDD5';
  } else if (priority === 'LOW') {
    priorityLabel = '🟢 Basse';
    priorityColor = '#0284C7';
    priorityBg = '#E0F2FE';
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ticketUrl = `${appUrl}/dashboard/technician`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau Ticket de Maintenance Assigné</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F8FAFC; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%); padding: 30px; text-align: center; color: #FFFFFF;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CATHEDIS PARC INFORMATIQUE</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #FFCDD2; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
                🛠️ Nouveau Ticket de Maintenance Assigné
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; margin: 0 0 16px; font-weight: 600; color: #1E293B;">
                Bonjour <strong>${technicianName}</strong> 👋,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                L'administrateur (<strong>${assignedByName}</strong>) vous a attribué un nouveau ticket d'intervention technique sur le parc informatique.
              </p>

              <!-- Ticket Info Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border-radius: 10px; border-left: 5px solid #E31E24; padding: 18px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B; width: 140px;">Réf. Ticket :</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #1E293B;">#TCK-${ticketId.slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Équipement :</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #1E293B;">${equipmentName}</td>
                </tr>
                ${serialNumber ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">N° de Série (S/N) :</td>
                  <td style="padding: 6px 0; font-size: 13px; font-family: monospace; font-weight: 700; color: #0F172A;">${serialNumber}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Niveau d'Urgence :</td>
                  <td style="padding: 6px 0;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; background-color: ${priorityBg}; color: ${priorityColor};">
                      ${priorityLabel}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Demandeur :</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #1E293B;">${reportedByName}</td>
                </tr>
              </table>

              <!-- Description Box -->
              <div style="margin-bottom: 28px;">
                <p style="font-size: 13px; font-weight: 700; color: #64748B; margin: 0 0 8px; text-transform: uppercase;">
                  Description de l'anomalie :
                </p>
                <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; font-size: 14px; line-height: 1.5; color: #334155; font-style: italic;">
                  "${description}"
                </div>
              </div>

              <!-- Action Button CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${ticketUrl}" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #E31E24 0%, #C41018 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 800; box-shadow: 0 4px 14px rgba(227, 30, 36, 0.35);">
                      🛠️ Ouvrir mon Espace Technique
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 24px 0 0;">
                Connectez-vous pour prendre en charge l'intervention et saisir votre diagnostic.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 18px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 12px; color: #64748B; font-weight: 600;">
                © ${new Date().getFullYear()} Cathedis IT Support • Système Automatisé de Gestion du Parc
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

  // Determine SMTP transport (Gmail or custom SMTP)
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
  const from = process.env.SMTP_FROM || user || 'Cathedis IT <support-it@cathedis.com>';

  if (!user || !pass || user.includes('example.com')) {
    console.log(`[EMAIL SIMULATOR] Email de notification ticket envoyé à : ${to}`);
    console.log(`[EMAIL SIMULATOR] Sujet : [CATHEDIS IT] Nouveau ticket de maintenance assigné : ${equipmentName}`);
    return { success: true, simulated: true };
  }

  try {
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
      subject: `[CATHEDIS IT] 🛠️ Nouveau ticket de maintenance assigné : ${equipmentName}`,
      html: htmlContent,
    });

    console.log('[EMAIL SENT] MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email via Gmail/SMTP:', error);
    return { success: false, error };
  }
}
