import "server-only";
import { env } from "@/lib/env";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<void>;
}

/* ------------------------------- Providers ------------------------------- */

const consoleProvider: EmailProvider = {
  name: "console",
  async send(m) {
    console.info(`\n[email:console] → ${[m.to].flat().join(", ")}\nSubject: ${m.subject}\n${m.text}\n`);
  },
};

const smtpProvider: EmailProvider = {
  name: "smtp",
  async send(m) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_SECURE === "true",
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: env.EMAIL_FROM, to: m.to, subject: m.subject, html: m.html, text: m.text, replyTo: m.replyTo });
  },
};

const resendProvider: EmailProvider = {
  name: "resend",
  async send(m) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [m.to].flat(), subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo }),
    });
    if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  },
};

const brevoProvider: EmailProvider = {
  name: "brevo",
  async send(m) {
    const match = env.EMAIL_FROM.match(/^(.*)<(.+)>$/);
    const sender = match ? { name: match[1].trim(), email: match[2].trim() } : { email: env.EMAIL_FROM };
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY ?? "", "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender,
        to: [m.to].flat().map((email) => ({ email })),
        subject: m.subject,
        htmlContent: m.html,
        textContent: m.text,
        ...(m.replyTo ? { replyTo: { email: m.replyTo } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
  },
};

const providers: Record<string, EmailProvider> = {
  console: consoleProvider,
  smtp: smtpProvider,
  resend: resendProvider,
  brevo: brevoProvider,
};

export function getEmailProvider(): EmailProvider {
  return providers[env.EMAIL_PROVIDER] ?? consoleProvider;
}

/**
 * Sends an email without ever throwing — delivery failures are logged so
 * that a mail outage never blocks sign-ups or lead capture.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  try {
    await getEmailProvider().send(message);
    return true;
  } catch (err) {
    console.error("[email] delivery failed:", message.subject, err);
    return false;
  }
}

/**
 * False when emails can't reach real inboxes: the console provider on a
 * deployed (Vercel) site. Features that depend on delivery — sign-up and
 * reset codes — check this instead of silently "sending" to the log.
 */
export function canDeliverEmail(): boolean {
  if (env.EMAIL_PROVIDER !== "console" || !process.env.VERCEL) return true;
  console.error("[email] EMAIL_PROVIDER is \"console\" on this deployment — codes can't be delivered. Set EMAIL_PROVIDER and SMTP_* in Vercel, then redeploy.");
  return false;
}
