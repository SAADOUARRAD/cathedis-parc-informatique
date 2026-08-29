import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testGmail() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`Connecting to Gmail with user: ${user}...`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  try {
    const verified = await transporter.verify();
    console.log('✅ Connection verification to Gmail SMTP:', verified);

    // Send real test email
    const info = await transporter.sendMail({
      from: `"Cathedis IT Support" <${user}>`,
      to: user,
      subject: "🚀 [CATHEDIS IT] Test de Connexion Réelle Réussi !",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #E31E24;">✅ Félicitations ! Votre messagerie Cathedis est active !</h2>
          <p>Le système de notification automatique par email de <strong>Cathedis Parc Informatique</strong> est maintenant opérationnel à 100%.</p>
          <p>Tous les tickets de maintenance et assignations de techniciens seront désormais envoyés en temps réel avec ce compte.</p>
          <hr style="border: 1px solid #e2e8f0;" />
          <small style="color: #64748b;">Envoyé automatiquement par la plateforme Cathedis IT.</small>
        </div>
      `
    });

    console.log('🎉 REAL EMAIL SENT SUCCESSFULLY! MessageId:', info.messageId);
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
  }
}

testGmail();
