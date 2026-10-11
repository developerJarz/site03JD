/**
 * Contact details used where site settings aren't available (emails, error
 * messages, auth pages). Pages read the same values from Admin → Settings,
 * which the seed initialises from here — keep them in sync.
 */
export const CONTACT_EMAIL = "jarzdigital36@gmail.com";
export const CONTACT_PHONE = "+8801925982536";
export const WHATSAPP_NUMBER = "+8801925982536";

/**
 * WhatsApp lines by market: Bangladesh (Dhaka office, /bangladesh) uses the main
 * number; every other country (USA, Canada, Ireland offices and country pages)
 * shares the international line. The site-wide number stays in Admin → Settings.
 */
export const WHATSAPP_BANGLADESH = "+8801925982536";
export const WHATSAPP_INTERNATIONAL = "+8801677248045";
export const whatsappFor = (country: string) => (/bangladesh/i.test(country) ? WHATSAPP_BANGLADESH : WHATSAPP_INTERNATIONAL);

/** Site-wide buttons (header, floating button): the international line on pages under `intlPaths`, else `main`. */
export const whatsappForPath = (pathname: string, main: string, intlPaths: readonly string[]) =>
  intlPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ? WHATSAPP_INTERNATIONAL : main;
export const OFFICE_CITIES = ["Dhaka", "Dallas", "Calgary", "Cork"] as const;

/**
 * wa.me link with a prefilled message. Every message says where the visitor
 * came from so the team knows which service or page the enquiry is about.
 */
export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** "Hi Jarz Digital! I'm interested in … — Sent from: <page>" */
export function whatsappMessage({ intent, from }: { intent: string; from: string }): string {
  return `Hi Jarz Digital! ${intent}\n\nSent from: ${from}`;
}

/** Public page URL for WhatsApp messages — always the live domain, even on localhost or previews. */
export const publicUrl = (path = "/") => `https://www.jarzdigital.com${path.startsWith("/") ? path : `/${path}`}`;

export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

/** The WhatsApp number as people read it: the formatted phone when it's the same number, else as stored. */
export function whatsappDisplay(contact: { phone: string; whatsapp: string }): string {
  const digits = (s: string) => s.replace(/\D/g, "");
  return digits(contact.phone) === digits(contact.whatsapp) ? contact.phone : contact.whatsapp;
}
