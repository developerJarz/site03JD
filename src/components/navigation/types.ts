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
}

export const PRIMARY_LINKS = [
  { label: "Services", href: "/services", menu: "services" as const },
  { label: "Work", href: "/work" },
  { label: "Industries", href: "/industries", menu: "industries" as const },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
