import type { Office } from "@/types/content";
import { officePath } from "./locations";

/**
 * Built-in (non-CMS) pages and their default SEO. Admins can override any of
 * these in Admin → SEO → Page SEO; overrides live in settings.seo.pages[path].
 * Titles exclude the site suffix (“ | Jarz Digital”), so keep them ≤ 45 characters.
 */
export interface StaticPageSeo {
  path: string;
  label: string;
  title: string;
  description: string;
}

export const STATIC_PAGES: StaticPageSeo[] = [
  {
    path: "/services",
    label: "Services",
    title: "Web Development, SEO & Marketing Services",
    description:
      "Web development, SEO, local SEO, Google Ads, social media and business management from Jarz Digital — teams in the USA, Canada and Dhaka, Bangladesh.",
  },
  {
    path: "/work",
    label: "Our work",
    title: "Our Work — Websites, SEO & Marketing Projects",
    description: "Websites, local SEO and marketing projects by Jarz Digital for businesses in the USA, Canada and Bangladesh — from service companies to e-commerce brands.",
  },
  {
    path: "/industries",
    label: "Industries",
    title: "Industries We Serve — Web Design & Local SEO",
    description: "Web design, local SEO and digital growth for auto repair, dental, healthcare, HVAC, law firms, restaurants, real estate, construction and more.",
  },
  {
    path: "/about",
    label: "About",
    title: "About Jarz Digital — Our Team & Offices",
    description:
      "Founded in Dallas in 2019, Jarz Digital is a digital agency with offices in Dallas, Denver, Calgary and Dhaka, Bangladesh, helping businesses grow online.",
  },
  {
    path: "/pricing",
    label: "Pricing",
    title: "Pricing — Web, SEO, Social Media & Ads Plans",
    description: "Transparent pricing: SEO and local SEO from $40/month, websites from $50/month, ad management from $200/month and business management at $1,000/month.",
  },
  {
    path: "/blog",
    label: "Insights (blog)",
    title: "Insights — Local SEO & Business Growth Guides",
    description: "Practical guides from Jarz Digital on local SEO, Google Maps ranking, Google Business Profile and running your business’s digital presence.",
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact Us — Free Consultation",
    description:
      "Get a free consultation from Jarz Digital. Offices in Dallas, Denver, Calgary and Dhaka, Bangladesh — we reply within 24 hours. Call +1 267-766-9055.",
  },
  {
    path: "/locations",
    label: "Locations",
    title: "Our Offices — Dallas, Denver, Calgary & Dhaka",
    description: "Jarz Digital offices in Dallas, Denver, Calgary and Dhaka, Bangladesh — addresses, phone numbers and the services each team provides to local businesses.",
  },
];

export const staticPageSeo = (path: string) => STATIC_PAGES.find((p) => p.path === path);

/** “Dallas, Texas”, “Calgary, Alberta”, “Dhaka, Bangladesh”. */
export const officePlace = (o: Office) => `${o.city}, ${o.region && o.region !== o.city ? o.region : o.country}`;

export function locationPageSeo(o: Office): StaticPageSeo {
  const place = officePlace(o);
  return {
    path: officePath(o),
    label: `Location · ${o.city}`,
    title: `Web Design & SEO Agency in ${place}`,
    description: `Web development, local SEO, Google Ads and social media marketing for businesses in ${place}. Contact Jarz Digital ${o.city}: ${o.phone}.`,
  };
}
