import "server-only";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import type { FaqItem, Office, Post, Project, SeoFields, Service, SiteSettings, TeamMember } from "@/types/content";
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

/**
 * Parses addresses written the usual way — "Street, City, ST 12345[, Country]"
 * (US) or "Street, City, AB T1A 1A1[, Country]" (Canada). Returns null for
 * anything else so callers never publish a guessed breakdown.
 */
export function parsePostalAddress(text: string): Json | null {
  const m = text.trim().match(/^(.+?),\s*([^,]+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?|[A-Z]\d[A-Z]\s?\d[A-Z]\d)(?:,\s*(.+))?$/i);
  if (!m) return null;
  const [, street, city, region, postal, country] = m;
  const canadian = /^[A-Z]\d[A-Z]/i.test(postal);
  return {
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: city,
    addressRegion: region.toUpperCase(),
    postalCode: postal.toUpperCase(),
    addressCountry: country ? countryCode(country) : canadian ? "CA" : "US",
  };
}

/** Site-wide Organization. Contact details come from Settings; the founder from the team list. */
export function organizationSchema(s: SiteSettings, founder?: Pick<TeamMember, "slug" | "name" | "role" | "socials"> | null): Json {
  const sameAs = Object.values(s.socials).filter(Boolean);
  const address = s.contact.mailingAddress ? parsePostalAddress(s.contact.mailingAddress) ?? s.contact.mailingAddress : null;
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
    ...(address ? { address } : {}),
    areaServed: [...officeCountries(s), "Europe"],
    contactPoint: contactPoints(s),
    ...(founder ? { founder: personRef(founder) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

const personId = (slug: string) => `${SITE_URL}/team/${slug}#person`;

/** Compact Person reference (used for founder and article authors). */
function personRef(m: Pick<TeamMember, "slug" | "name" | "role" | "socials">): Json {
  const sameAs = [m.socials.linkedin, m.socials.twitter, m.socials.website].filter(Boolean);
  return { "@type": "Person", "@id": personId(m.slug), name: m.name, jobTitle: m.role, url: abs(`/team/${m.slug}`), ...(sameAs.length ? { sameAs } : {}) };
}

export const isFounder = (m: Pick<TeamMember, "role">) => /founder/i.test(m.role);

/**
 * Short profiles are thin pages: they stay visible but out of search until the
 * bio reaches ~200 words. The founder’s page is always indexable.
 */
export function teamProfileIndexable(m: Pick<TeamMember, "role" | "bio" | "highlights">): boolean {
  const words = `${m.bio} ${m.highlights.join(" ")}`.split(/\s+/).filter(Boolean).length;
  return isFounder(m) || words >= 200;
}

/** Full Person for a team member’s own page. */
export function personSchema(m: TeamMember): Json {
  return {
    "@context": "https://schema.org",
    ...personRef(m),
    description: m.bio,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    ...(m.photo ? { image: abs(m.photo.src) } : {}),
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

/** Offices listed as "online only" are service areas, not places a customer can visit. */
export const isPhysicalOffice = (o: Office) => !/online only/i.test(o.address);

/** Street part of an office address that isn't in "Street, City, ST 12345" form (e.g. Dhaka). */
function officeStreet(o: Office): string {
  const tail = new RegExp(`(,\\s*${escapeRe(o.city)})?(,\\s*${escapeRe(o.country)})?\\s*$`, "i");
  return o.address.replace(tail, "").trim();
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * ProfessionalService for one office — output only on that office’s own
 * location page, and only for offices with a real address. Service-area
 * offices ("online only") get no LocalBusiness markup.
 */
export function localBusinessSchema(o: Office, s: SiteSettings): Json | null {
  if (!isPhysicalOffice(o)) return null;
  const parsed = parsePostalAddress(o.address);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": officeId(o),
    name: `Jarz Digital ${o.city}`,
    description: o.description,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    url: abs(officePath(o)),
    image: abs(o.image?.src ?? s.branding.logo),
    logo: abs(s.branding.logo),
    telephone: o.phone,
    ...(o.email ? { email: o.email } : {}),
    hasMap: mapUrl(o),
    areaServed: [
      { "@type": "City", name: o.city },
      { "@type": "Country", name: o.country },
    ],
    address: parsed ?? {
      "@type": "PostalAddress",
      streetAddress: officeStreet(o),
      addressLocality: o.city,
      addressRegion: o.region,
      addressCountry: countryCode(o.country),
    },
    priceRange: "$$",
  };
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

/** Date the article body last changed; falls back to the publish date (never a migration/seed timestamp). */
export const postModifiedAt = (post: Post) => post.contentUpdatedAt ?? post.publishedAt ?? null;

export function articleSchema(post: Post): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: abs(`/blog/${post.slug}`),
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: postModifiedAt(post),
    ...(post.coverImage ? { image: [abs(post.coverImage.src)] } : {}),
    // A Person only when a real team member is credited; otherwise the company.
    author: post.authorMember ? personRef(post.authorMember) : { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: post.authorName, url: SITE_URL },
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
