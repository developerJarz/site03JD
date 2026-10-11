import { publicUrl, whatsappForPath, whatsappLink, whatsappMessage } from "@/config/contact";

export interface NavService {
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  group: string;
}

export interface NavIndustry {
  slug: string;
  name: string;
  icon: string;
}

export interface NavData {
  services: NavService[];
  industries: NavIndustry[];
  phone: string;
  email: string;
  /** WhatsApp number for "Start a Project" (message includes the current page). */
  whatsapp: string;
  /** Pages for markets outside Bangladesh (USA, Canada, their offices): these use the international WhatsApp line. */
  intlPaths: string[];
}

/** WhatsApp number for the header on this page: the country line on USA/Canada pages, else the main one. */
export const navWhatsapp = (data: Pick<NavData, "whatsapp" | "intlPaths">, pathname: string) => whatsappForPath(pathname, data.whatsapp, data.intlPaths);

/** WhatsApp link for the header "Start a Project" buttons, tagged with the page the visitor is on. */
export const startProjectHref = (number: string, pathname: string) =>
  whatsappLink(number, whatsappMessage({ intent: "I’d like to start a project.", from: publicUrl(pathname) }));

export const PRIMARY_LINKS = [
  { label: "Services", href: "/services", menu: "services" as const },
  { label: "Work", href: "/work" },
  { label: "Industries", href: "/industries", menu: "industries" as const },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
