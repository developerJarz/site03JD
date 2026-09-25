/**
 * Search titles and descriptions for migrated content, written from each
 * page’s own copy. Titles exclude the “ | Jarz Digital” suffix (≤ 45 chars);
 * descriptions stay within ~160 characters. Applied to the seed data and
 * written to the CMS’s SEO fields, where editors can change them.
 */
type Seo = { title?: string; description?: string; noindex?: boolean };

export const seoOverrides: Record<"services" | "posts" | "projects" | "industries", Record<string, Seo>> = {
  services: {
    "website-development": {
      title: "Website Development — WordPress & Shopify",
      description: "Fast, secure, mobile-friendly websites that rank on Google and convert visitors into customers. Plans from $50/month — teams in the USA, Canada and Dhaka.",
    },
    seo: {
      title: "SEO Services — Rank Higher on Google",
      description: "Keyword research, technical SEO, on-page optimization, content and link building. SEO plans from $40/month for businesses in the USA and Canada.",
    },
    "local-seo": { title: "Local SEO Services — Rank on Google Maps" },
    "social-media-marketing": { title: "Social Media Marketing Services" },
    "google-ads": { title: "Google Ads & PPC Management Services" },
    "business-management": { title: "Monthly Business Management Package" },
    "web-application-development": { title: "Custom Web Application Development" },
  },
  posts: {
    "why-small-business-owners-should-invest": {
      title: "Why Small Businesses Need Business Management",
      description: "Running a small business means juggling customers, operations and finances. Here’s why handing your SEO, social media and ads to one team pays off.",
    },
    "why-our-full-business-management-service-package": {
      title: "Why Full Business Management Drives Growth",
      description: "Handling digital marketing, your website, social media and local SEO yourself is overwhelming. See how one full-service package keeps your business growing.",
    },
    "why-map-ranking-is-crucial-for-small-businesses": {
      title: "Why Google Map Ranking Matters in 2025",
      description: "Google is the go-to source for local searches. Learn why appearing in the Google Map Pack is now essential for small businesses that want local customers.",
    },
    "how-to-rank-your-junk-car-buyer": {
      title: "Rank Your Junk Car Business on Google Maps",
      description: "Practical steps to get your junk car buying business noticed on Google Maps and in local search, so more people nearby find you and call.",
    },
    "why-website-local-seo-is-important": {
      title: "Why Local SEO Matters for Business Growth",
      description: "A local SEO strategy is no longer optional. Learn how local SEO helps small shops, service businesses and larger companies win more customers nearby.",
    },
    "how-to-open-a-google-business-profile-2": {
      title: "How to Create a Google Business Profile",
      description: "A step-by-step guide to creating your Google Business Profile (formerly Google My Business) to improve your visibility in Google Search and Maps.",
    },
    "how-to-rank-1-on-google-map-for-your-dallas-business": {
      title: "How to Rank #1 on Google Maps in Dallas",
      description: "The local SEO guide for Dallas business owners who want to reach the top of Google’s Map Pack and attract more customers from local search.",
    },
    "why-local-seo-is-a-game-changer-for": {
      title: "Why Local SEO Is a Game-Changer in Dallas",
      description: "Local SEO has become essential for Dallas businesses of every size. See how ranking in local search boosts your online visibility and brings in customers.",
    },
  },
  projects: {
    "doorstep-spa": { description: "Website design and development for Doorstep Spa, a spa brand. See the project and explore more web design work by Jarz Digital." },
    "commercial-roofing-seo": { description: "Search engine optimization and local search work for a commercial roofing contractor. See the project and more SEO work by Jarz Digital." },
  },
  industries: {
    // No client work in these verticals yet (audit, Sept 2026): kept for visitors, out of search until there is.
    banking: { noindex: true },
    "venture-capital": { noindex: true },
    manufacturing: { noindex: true },
    corporate: { noindex: true },
    healthcare: { description: "Clinics and healthcare providers need patients to find them locally and book with confidence. We combine local search, clear websites and social content." },
  },
};

export function withSeo<T extends { slug: string; seo?: Seo }>(items: T[], kind: keyof typeof seoOverrides): T[] {
  return items.map((item) => {
    const o = seoOverrides[kind][item.slug];
    return o ? { ...item, seo: { ...item.seo, ...o } } : item;
  });
}
