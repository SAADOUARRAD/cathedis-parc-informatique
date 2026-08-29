import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testSend() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const testEmail = "saadouarrad7@cathedis.com";
  console.log(`Tentative d'envoi d'email à : ${testEmail}...`);

  try {
    const info = await transporter.sendMail({
      from: `"Cathedis IT Support" <${user}>`,
      to: testEmail,
      subject: "Test maintenance pour Oualid",
      text: "Ceci est un test pour Oualid"
    });
    console.log("Résultat de l'envoi :", info);
  } catch (err: any) {
    console.error("Erreur lors de l'envoi à " + testEmail + " :", err.message);
  }
}

testSend().finally(() => process.exit(0));
