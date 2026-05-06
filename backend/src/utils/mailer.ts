import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetPasswordEmail = async (to: string, resetToken: string) => {
  const from = process.env.SMTP_FROM;
  const frontendUrl = process.env.FRONTEND_URL;
  const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from,
    to,
    subject: 'Estokitas - Redefinição de Senha',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF0033;">Estokitas</h2>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Clique no botão abaixo para redefinir sua senha. Este link é válido por 1 hora.</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4A4A4A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Redefinir Senha</a>
        <p style="color: #666; font-size: 12px;">Se você não solicitou a redefinição, por favor ignore este email.</p>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[Mailer] SMTP_USER or SMTP_PASS not set. Skipping email send. Reset token is:', resetToken);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Reset password email sent to ${to}`);
  } catch (error) {
    console.error('[Mailer] Error sending email:', error);
    throw new Error('Falha ao enviar o email de redefinição.');
  }
};
