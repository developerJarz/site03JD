import "server-only";
import { env } from "@/lib/env";

/**
 * Branded transactional email templates. Table-based markup for broad
 * email-client support; every template also returns a plain-text version.
 */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(opts: { preheader: string; heading: string; body: string; cta?: { label: string; href: string } }) {
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const cta = opts.cta
    ? `<tr><td style="padding:8px 0 24px"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:#00afb9;color:#03060b;text-decoration:none;font-weight:600;padding:14px 22px;border-radius:10px">${esc(opts.cta.label)} &rarr;</a></td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f7f9;font-family:${font};color:#060b13">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f9;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #d9e1e8">
<tr><td style="padding:24px 32px;border-bottom:1px solid #eaeff3">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="vertical-align:middle;padding-right:10px">
        <div style="background:#00afb9;color:#06121a;font-weight:900;font-size:15px;width:32px;height:32px;line-height:32px;text-align:center;border-radius:8px;display:inline-block;font-family:${font}">JD</div>
      </td>
      <td style="vertical-align:middle">
        <span style="font-size:19px;font-weight:700;letter-spacing:-0.02em;color:#060b13;font-family:${font};text-decoration:none">Jarz Digital</span>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:22px;font-weight:700;letter-spacing:-0.02em;padding-bottom:16px">${esc(opts.heading)}</td></tr>
<tr><td style="font-size:15px;line-height:1.65;color:#3a4654;padding-bottom:16px">${opts.body}</td></tr>
${cta}
</table></td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #eaeff3;font-size:12px;color:#677787">Jarz Digital · Dallas · Denver · Calgary · Dhaka<br>info@jarzdigital.com · +1 267-766-9055</td></tr>
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

/**
 * One-time code email for verifying a new account or resetting a password.
 * Standalone layout: dark brand header, large copyable code, security note.
 * The code is also in the subject and preheader so it shows in inbox previews.
 */
export function otpEmail(opts: { code: string; purpose: "register" | "reset"; minutes: number; to: string; name?: string }) {
  const { code, purpose, minutes, to, name } = opts;
  const isReset = purpose === "reset";
  const first = name?.trim().split(/\s+/)[0];
  const year = new Date().getFullYear();

  const copy = isReset
    ? {
        subject: `${code} is your Jarz Digital password reset code`,
        tag: "Password reset",
        heading: "Reset your password",
        intro: "We received a request to reset the password for your Jarz Digital account. Enter this code on the password reset page, together with your new password.",
        notYou: "Didn’t ask to reset your password? You can safely ignore this email — your password won’t change and your account stays secure.",
      }
    : {
        subject: `${code} is your Jarz Digital verification code`,
        tag: "Verify your email",
        heading: "Confirm your email address",
        intro: "Thanks for signing up with Jarz Digital. Enter this code on the sign-up page to verify your email and activate your client account.",
        notYou: "Didn’t try to create an account? You can safely ignore this email — no account will be created without this code.",
      };

  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const mono = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eef3f6;font-family:${font};color:#060b13;-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your code is ${esc(code)} — it expires in ${minutes} minutes.&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef3f6">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#06121a;border-radius:18px 18px 0 0;border-top:4px solid #00afb9;padding:24px 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="left">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;padding-right:10px">
              <div style="background:#00afb9;color:#06121a;font-weight:900;font-size:15px;width:32px;height:32px;line-height:32px;text-align:center;border-radius:8px;display:inline-block;font-family:${font}">JD</div>
            </td>
            <td style="vertical-align:middle">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;font-family:${font};text-decoration:none">Jarz Digital</span>
            </td>
          </tr>
        </table>
      </td>
      <td align="right" style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#7fdde2">${esc(copy.tag)}</td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:36px 32px 8px">
    <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#060b13">${esc(copy.heading)}</h1>
    <p style="margin:0 0 6px;font-size:15px;line-height:1.65;color:#3a4654">${first ? `Hi ${esc(first)},` : "Hi there,"}</p>
    <p style="margin:0;font-size:15px;line-height:1.65;color:#3a4654">${esc(copy.intro)}</p>
  </td></tr>

  <!-- Code -->
  <tr><td style="background:#ffffff;padding:24px 32px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fbfb;border:2px solid #00afb9;border-radius:16px">
      <tr><td align="center" style="padding:22px 16px 6px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#00848c">Your ${isReset ? "reset" : "verification"} code</td></tr>
      <tr><td align="center" style="padding:4px 16px 8px;font-family:${mono};font-size:40px;line-height:1.2;font-weight:700;letter-spacing:12px;color:#060b13">${esc(code)}</td></tr>
      <tr><td align="center" style="padding:0 16px 22px">
        <span style="display:inline-block;background:#ffffff;border:1px solid #bfeef0;border-radius:999px;padding:6px 14px;font-size:12px;font-weight:600;color:#3a4654">Expires in ${minutes} minutes</span>
      </td></tr>
    </table>
  </td></tr>

  <!-- Security -->
  <tr><td style="background:#ffffff;padding:20px 32px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f8fa;border-radius:12px">
      <tr><td style="padding:16px 18px;font-size:13px;line-height:1.6;color:#3a4654">
        <strong style="color:#060b13">Keep this code private.</strong> Jarz Digital will never ask you for it by phone, email or chat. The code works once and can only be used for ${esc(to)}.
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:#ffffff;padding:16px 32px 32px;border-radius:0 0 18px 18px">
    <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#677787">${esc(copy.notYou)}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#677787">Need help? Email <a href="mailto:info@jarzdigital.com" style="color:#00848c;text-decoration:none;font-weight:600">info@jarzdigital.com</a> or call <a href="tel:+12677669055" style="color:#00848c;text-decoration:none;font-weight:600;white-space:nowrap">+1 267-766-9055</a>.</p>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding:24px 16px 8px;font-size:12px;line-height:1.7;color:#8494a3">
    <a href="${url("/")}" style="color:#3a4654;text-decoration:none;font-weight:600">Jarz Digital</a> · Dallas · Denver · Calgary · Dhaka<br>
    You’re receiving this because a ${isReset ? "password reset" : "sign-up"} was requested for ${esc(to)} on jarzdigital.com.<br>
    <a href="${url("/privacy-policy")}" style="color:#8494a3">Privacy Policy</a> · © ${year} Jarz Digital
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  const text = [
    `${copy.heading} — Jarz Digital`,
    "",
    first ? `Hi ${first},` : "Hi there,",
    "",
    copy.intro,
    "",
    `Your ${isReset ? "reset" : "verification"} code: ${code}`,
    `It expires in ${minutes} minutes.`,
    "",
    "Keep this code private. Jarz Digital will never ask you for it.",
    copy.notYou,
    "",
    "Need help? info@jarzdigital.com · +1 267-766-9055",
  ].join("\n");

  return { subject: copy.subject, html, text };
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
