import "server-only";
import { env } from "@/lib/env";

/**
 * Branded transactional email templates. Table-based markup for broad
 * email-client support; every template also returns a plain-text version.
 */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(opts: { preheader: string; heading: string; body: string; cta?: { label: string; href: string } }) {
  const logo = new URL("/images/brand/logo.png", env.SITE_URL).toString();
  const cta = opts.cta
    ? `<tr><td style="padding:8px 0 24px"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:#00afb9;color:#03060b;text-decoration:none;font-weight:600;padding:14px 22px;border-radius:10px">${esc(opts.cta.label)} &rarr;</a></td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f7f9;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#060b13">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f9;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #d9e1e8">
<tr><td style="padding:28px 32px;border-bottom:1px solid #eaeff3"><img src="${logo}" alt="Jarz Digital" width="140" style="display:block;height:auto"></td></tr>
<tr><td style="padding:32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:22px;font-weight:700;letter-spacing:-0.02em;padding-bottom:16px">${esc(opts.heading)}</td></tr>
<tr><td style="font-size:15px;line-height:1.65;color:#3a4654;padding-bottom:16px">${opts.body}</td></tr>
${cta}
</table></td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #eaeff3;font-size:12px;color:#677787">Jarz Digital · Dallas · Denver · Calgary<br>info@jarzdigital.com · +1 267-766-9055</td></tr>
</table></td></tr></table></body></html>`;
}

const url = (path: string) => new URL(path, env.SITE_URL).toString();

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to Jarz Digital",
    html: layout({
      preheader: "Your client account is ready.",
      heading: `Welcome, ${name.split(" ")[0]}.`,
      body: "Your Jarz Digital account is ready. From your dashboard you can submit project requests, follow their progress and message our team directly.",
      cta: { label: "Open your dashboard", href: url("/dashboard") },
    }),
    text: `Welcome to Jarz Digital, ${name}.\n\nYour account is ready. Open your dashboard: ${url("/dashboard")}`,
  };
}

export function passwordResetEmail(name: string, token: string) {
  const link = url(`/reset-password?token=${encodeURIComponent(token)}`);
  return {
    subject: "Reset your Jarz Digital password",
    html: layout({
      preheader: "This link expires in 60 minutes.",
      heading: "Reset your password",
      body: `Hi ${esc(name.split(" ")[0])}, we received a request to reset your password. This link expires in 60 minutes. If you didn't request it, you can safely ignore this email.`,
      cta: { label: "Choose a new password", href: link },
    }),
    text: `Reset your password (expires in 60 minutes): ${link}\n\nIf you didn't request this, ignore this email.`,
  };
}

export function leadConfirmationEmail(name: string) {
  return {
    subject: "We received your message — Jarz Digital",
    html: layout({
      preheader: "We respond within 24 hours.",
      heading: `Thanks, ${esc(name.split(" ")[0])} — we're on it.`,
      body: "Your message has reached the Jarz Digital team. We respond within 24 hours with next steps and, where it helps, a customized strategy for your business.",
      cta: { label: "Explore our work", href: url("/work") },
    }),
    text: `Thanks ${name}, we received your message and will respond within 24 hours.`,
  };
}

export function leadNotificationEmail(lead: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}) {
  const rows = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Company", lead.company],
    ["Service", lead.service],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<strong>${k}:</strong> ${esc(String(v))}`)
    .join("<br>");
  return {
    subject: `New lead: ${lead.name}${lead.service ? ` — ${lead.service}` : ""}`,
    html: layout({
      preheader: lead.message.slice(0, 90),
      heading: "New website lead",
      body: `${rows}<br><br>${esc(lead.message).replace(/\n/g, "<br>")}`,
      cta: { label: "Open in admin", href: url(`/admin/leads/${lead.id}`) },
    }),
    text: `New lead from ${lead.name} <${lead.email}>\n\n${lead.message}\n\n${url(`/admin/leads/${lead.id}`)}`,
  };
}

export function projectRequestNotificationEmail(req: { id: string; title: string; clientName: string; service?: string }) {
  return {
    subject: `New project request: ${req.title}`,
    html: layout({
      preheader: `${req.clientName} submitted a project request.`,
      heading: "New project request",
      body: `<strong>${esc(req.clientName)}</strong> submitted “${esc(req.title)}”${req.service ? ` for ${esc(req.service)}` : ""}.`,
      cta: { label: "Review request", href: url(`/admin/requests/${req.id}`) },
    }),
    text: `${req.clientName} submitted a project request: ${req.title}\n${url(`/admin/requests/${req.id}`)}`,
  };
}

export function requestUpdateEmail(name: string, title: string, update: string, requestId: string) {
  return {
    subject: `Update on “${title}”`,
    html: layout({
      preheader: update.slice(0, 90),
      heading: "Your project has an update",
      body: `Hi ${esc(name.split(" ")[0])}, there's an update on <strong>${esc(title)}</strong>:<br><br>${esc(update)}`,
      cta: { label: "View in dashboard", href: url(`/dashboard/requests/${requestId}`) },
    }),
    text: `Update on ${title}: ${update}\n${url(`/dashboard/requests/${requestId}`)}`,
  };
}

export function adminNotificationEmail(title: string, body: string, href?: string) {
  return {
    subject: title,
    html: layout({ preheader: body.slice(0, 90), heading: title, body: esc(body), cta: href ? { label: "Open admin", href: url(href) } : undefined }),
    text: `${title}\n\n${body}${href ? `\n${url(href)}` : ""}`,
  };
}
