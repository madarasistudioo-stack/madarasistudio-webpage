import nodemailer from "nodemailer";

export const mailConfigured = () => Boolean(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM);

// Sends through the same SMTP settings as email sign-in (Resend). Returns false
// when email isn't set up yet, so callers can carry on without it.
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
    });
    await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, replyTo: process.env.EMAIL_REPLY_TO });
    return true;
  } catch (err) {
    console.error("Email failed:", err);
    return false;
  }
}
