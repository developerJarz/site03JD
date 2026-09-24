import "server-only";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import type { FaqItem, Office, Post, Project, SeoFields, Service, SiteSettings } from "@/types/content";
import { countryCode, officeCountries, officePath } from "./locations";

export const SITE_URL = env.SITE_URL.replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = "/opengraph-image";
export const abs = (path = "/") => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/**
 * Builds page metadata with canonical URL, Open Graph and Twitter cards.
 * CMS-provided SEO fields override the page defaults.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  seo,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  seo?: SeoFields;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const finalTitle = seo?.title || title;
  const finalDescription = seo?.description || description;
  const canonical = seo?.canonical || abs(path);
  // Page openGraph replaces the layout’s, so always fall back to the generated share image.
  const ogImage = seo?.ogImage || image || DEFAULT_OG_IMAGE;
  const ogSize = ogImage === DEFAULT_OG_IMAGE ? { width: 1200, height: 630 } : {};
  const hide = noindex || seo?.noindex;

  return {
    title: absoluteTitle ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      title: finalTitle,
      description: finalDescription,
      siteName: "Jarz Digital",
      locale: "en_US",
      images: [{ url: abs(ogImage), ...ogSize, alt: finalTitle }],
      ...(type === "article" && publishedTime ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [abs(ogImage)],
    },
    robots: hide ? { index: false, follow: true } : undefined,
  };
}

/* ------------------------------ JSON-LD ------------------------------ */

type Json = Record<string, unknown>;

export function organizationSchema(s: SiteSettings): Json {
  const sameAs = Object.values(s.socials).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: s.general.siteName,
    url: SITE_URL,
    logo: abs(s.branding.logo),
    description: s.general.description,
    foundingDate: String(s.general.foundedYear),
    email: s.contact.email,
    telephone: s.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1024 Alyssa Ln",
      addressLocality: "Carrollton",
      addressRegion: "TX",
      postalCode: "75006",
      addressCountry: "US",
    },
    areaServed: [...officeCountries(s), "Europe"],
    contactPoint: contactPoints(s),
    department: s.offices.map((o) => ({ "@id": officeId(o) })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** One contact point per distinct office phone, tagged with the countries it serves. */
function contactPoints(s: SiteSettings): Json[] {
  const byPhone = new Map<string, Set<string>>();
  for (const o of s.offices) byPhone.set(o.phone, (byPhone.get(o.phone) ?? new Set()).add(countryCode(o.country)));
  return [...byPhone].map(([telephone, areas]) => ({
    "@type": "ContactPoint",
    telephone,
    contactType: "customer service",
    areaServed: [...areas],
  }));
}

const officeId = (o: Office) => `${SITE_URL}/#office-${o.code.toLowerCase()}`;
const mapUrl = (o: Office) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapQuery || o.address)}`;

export function websiteSchema(s: SiteSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: s.general.siteName,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * One ProfessionalService per office, linked to its location page. Only
 * offices with a physical address (Dhaka) publish a street address; the US
 * branches are service-based.
 */
export function localBusinessSchemas(s: SiteSettings): Json[] {
  return s.offices.map((o) => {
    const physical = !/online only/i.test(o.address);
    return {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": officeId(o),
      name: `Jarz Digital ${o.city}`,
      description: o.description,
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      url: o.hidePage ? SITE_URL : abs(officePath(o)),
      image: abs(o.image?.src ?? s.branding.logo),
      logo: abs(s.branding.logo),
      telephone: o.phone,
      ...(o.email ? { email: o.email } : {}),
      hasMap: mapUrl(o),
      areaServed: [
        { "@type": "City", name: o.city },
        { "@type": "Country", name: o.country },
      ],
      address: {
        "@type": "PostalAddress",
        ...(physical && o.country === "Bangladesh" ? { streetAddress: o.address.replace(/,\s*Dhaka,\s*Bangladesh$/i, "") } : {}),
        addressLocality: o.city,
        addressRegion: o.region,
        addressCountry: countryCode(o.country),
      },
      priceRange: "$$",
    };
  });
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: abs(item.path) })),
  };
}

export function serviceSchema(service: Service, areaServed: string[] = ["United States", "Canada"]): Json {
  const offers = service.plans
    .map((p) => ({ plan: p, price: Number(p.price.replace(/[^\d.]/g, "")) }))
    .filter((o) => o.price > 0)
    .map(({ plan, price }) => ({
      "@type": "Offer",
      name: plan.name,
      price,
      priceCurrency: "USD",
      description: plan.description,
    }));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url: abs(`/services/${service.slug}`),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed,
    ...(offers.length ? { offers } : {}),
  };
}

export function faqSchema(faqs: FaqItem[]): Json | null {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function articleSchema(post: Post): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: abs(`/blog/${post.slug}`),
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    ...(post.coverImage ? { image: [abs(post.coverImage.src)] } : {}),
    author: { "@type": "Organization", name: post.authorName, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    articleSection: post.category?.name,
    keywords: post.tags.map((t) => t.name).join(", "),
  };
}

export function projectSchema(project: Project): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: abs(`/work/${project.slug}`),
    image: abs(project.coverImage.src),
    creator: { "@id": `${SITE_URL}/#organization` },
    about: project.client,
  };
}
