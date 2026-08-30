import nodemailer from 'nodemailer';

// Gmail STARTTLS with app password, mirrors api-go mailer.go.
// null = not configured; callers degrade (register logs, reset throws 500).

let transport: nodemailer.Transporter | null | undefined;

function getTransport(): nodemailer.Transporter | null {
  if (transport === undefined) {
    transport = null;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    if (user !== undefined && user !== '' && pass !== undefined && pass !== '') {
      transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
      });
    }
  }

  return transport;
}

export function frontendUrl(): string {
  return process.env.FRONTEND_URL ?? '';
}

export function mailEnabled(): boolean {
  return getTransport() !== null;
}

export async function send(to: string, subject: string, html: string): Promise<void> {
  const t = getTransport();
  if (t === null) {
    throw new Error('mailer: MAIL_USER/MAIL_PASS not configured');
  }

  await t.sendMail({ from: `WebDev Studios <${process.env.MAIL_USER}>`, to, subject, html });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${frontendUrl()}/auth/verify-email?token=${token}`;
  const body =
    `<p>Welcome to WebDev Studios!</p>` +
    `<p><a href="${link}">Click here to verify your email</a></p>` +
    '<p>This link expires in 24 hours.</p>';
  await send(to, 'Verify your email', body);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${frontendUrl()}/auth/reset-password?token=${token}`;
  const body =
    '<p>Reset your password:</p>' +
    `<p><a href="${link}">${link}</a></p>` +
    '<p>Expires in 24 hours.</p>';
  await send(to, 'Password reset', body);
}
