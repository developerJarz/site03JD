import { COUNTRY_PAGES } from "@/content/country-sites";
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
      "Website development, SEO, local SEO, Google Ads, social media and business management from Jarz Digital — teams in Dhaka, Dallas, Calgary and Cork.",
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
      "Founded in Dallas in 2019, Jarz Digital is a digital agency with offices in Dhaka, Dallas, Calgary and Cork, helping businesses grow online.",
  },
  {
    path: "/rokonuzzaman-jony",
    label: "Founder profile (Rokonuzzaman Jony)",
    title: "Md Rokonuzzaman Jony — Founder & CEO",
    description:
      "Founder & CEO of Jarz Digital: SEO strategist, web developer and AI automation expert with 800–1,000+ projects for businesses in the USA, Canada and UK.",
  },
  {
    path: "/pricing",
    label: "Pricing",
    title: "Pricing — Web, SEO, Social Media & Ads Plans",
    description: "Transparent pricing: SEO and local SEO from $40/month, websites from $50/month, ad management from $200/month and business management at $1,000/month.",
  },
  {
    path: "/proposal",
    label: "Project proposal (6-month plan)",
    title: "6-Month Growth Proposal & Ads Calculator",
    description: "Jarz Digital’s 6-month growth plan — website, SEO, ads, social media and content in one plan — with an ads profit calculator for your monthly budget.",
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
      "Get a free consultation from Jarz Digital — WhatsApp or call +8801925982536, or email us. Offices in Dhaka, Dallas, Calgary and Cork. Replies within 24 hours.",
  },
  {
    path: "/locations",
    label: "Locations",
    title: "Our Offices — Dhaka, Dallas, Calgary & Cork",
    description: "Jarz Digital offices in Dhaka, Dallas, Calgary and Cork — addresses, Google Maps, WhatsApp and the services each team provides to local businesses.",
  },
  // /usa, /canada and their city pages (src/content/country-sites).
  ...COUNTRY_PAGES,
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
