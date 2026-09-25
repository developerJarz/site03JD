/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import type { CmsPage, Faq, Industry, Post, Project, Ref, Service, TeamMember, Testimonial } from "@/types/content";

/**
 * Maps Mongoose lean documents (with populated relations) into the plain
 * content types used by the UI. Input is loosely typed on purpose: lean()
 * output with populate() has no reliable static type.
 */
type Doc = Record<string, any>;

const str = (v: unknown) => (v == null ? "" : String(v));
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : undefined);

export function toRef(doc: Doc | null | undefined, titleKey = "title"): Ref | null {
  if (!doc || typeof doc !== "object" || !doc.slug) return null;
  return { _id: str(doc._id), slug: doc.slug, title: doc.shortTitle || doc[titleKey] || doc.name || doc.slug };
}

const refs = (list: unknown, titleKey?: string) =>
  (Array.isArray(list) ? list : []).map((d) => toRef(d as Doc, titleKey)).filter((r): r is Ref => Boolean(r));

const image = (v: any) => (v && v.src ? { src: v.src, alt: v.alt ?? "", width: v.width, height: v.height } : null);

export function mapService(d: Doc): Service {
  return {
    _id: str(d._id),
    slug: d.slug,
    title: d.title,
    shortTitle: d.shortTitle || d.title,
    icon: d.icon || "sparkles",
    tagline: d.tagline ?? "",
    summary: d.summary ?? "",
    heroTitle: d.heroTitle || d.title,
    heroSubtitle: d.heroSubtitle ?? "",
    overview: d.overview ?? "",
    image: image(d.image),
    problems: d.problems ?? [],
    included: (d.included ?? []).map((g: Doc) => ({ title: g.title, description: g.description, items: g.items ?? [] })),
    benefits: d.benefits ?? [],
    process: d.process ?? [],
    capabilities: d.capabilities ?? [],
    plans: (d.plans ?? []).map((p: Doc) => ({ ...p, features: p.features ?? [] })),
    planNote: d.planNote,
    startingPrice: d.startingPrice,
    faqs: d.faqs ?? [],
    related: refs(d.related),
    category: d.category ? { _id: str(d.category._id), slug: d.category.slug, title: d.category.name } : null,
    order: d.order ?? 0,
    featured: Boolean(d.featured),
    published: Boolean(d.published),
    seo: d.seo ?? {},
    updatedAt: iso(d.updatedAt),
  };
}

export function mapIndustry(d: Doc): Industry {
  return {
    _id: str(d._id),
    slug: d.slug,
    name: d.name,
    headline: d.headline || d.name,
    icon: d.icon || "building-2",
    intro: d.intro ?? "",
    challenges: d.challenges ?? [],
    solutions: d.solutions ?? [],
    services: refs(d.services),
    order: d.order ?? 0,
    published: Boolean(d.published),
    needsReview: Boolean(d.needsReview),
    seo: d.seo ?? {},
    updatedAt: iso(d.updatedAt),
  };
}

export function mapProject(d: Doc): Project {
  return {
    _id: str(d._id),
    slug: d.slug,
    title: d.title,
    client: d.client,
    location: d.location,
    industry: d.industry ? toRef(d.industry, "name") : null,
    services: refs(d.services),
    categories: d.categories ?? [],
    summary: d.summary ?? "",
    description: d.description ?? "",
    coverImage: image(d.coverImage) ?? { src: "/images/brand/mark.png", alt: d.title },
    gallery: (d.gallery ?? []).map(image).filter(Boolean),
    beforeAfter: image(d.beforeAfter),
    technologies: d.technologies ?? [],
    results: d.results ?? [],
    websiteUrl: d.websiteUrl,
    year: d.year,
    featured: Boolean(d.featured),
    order: d.order ?? 0,
    published: Boolean(d.published),
    needsReview: Boolean(d.needsReview),
    seo: d.seo ?? {},
    updatedAt: iso(d.updatedAt),
  };
}

export function mapTeam(d: Doc): TeamMember {
  return {
    _id: str(d._id),
    slug: d.slug,
    name: d.name,
    role: d.role ?? "",
    region: d.region,
    bio: d.bio ?? "",
    highlights: d.highlights ?? [],
    photo: image(d.photo),
    socials: d.socials ?? {},
    order: d.order ?? 0,
    published: Boolean(d.published),
  };
}

export function mapTestimonial(d: Doc): Testimonial {
  return {
    _id: str(d._id),
    author: d.author,
    role: d.role,
    company: d.company,
    quote: d.quote,
    rating: d.rating,
    avatar: image(d.avatar),
    published: Boolean(d.published),
    order: d.order ?? 0,
  };
}

export function mapFaq(d: Doc): Faq {
  return {
    _id: str(d._id),
    question: d.question,
    answer: d.answer,
    group: d.group ?? "general",
    order: d.order ?? 0,
    published: Boolean(d.published),
  };
}

export function mapPost(d: Doc): Post {
  return {
    _id: str(d._id),
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt ?? "",
    content: d.content ?? "",
    coverImage: image(d.coverImage),
    category: d.category && d.category.slug ? { _id: str(d.category._id), slug: d.category.slug, name: d.category.name } : null,
    tags: (d.tags ?? []).filter((t: Doc) => t && t.slug).map((t: Doc) => ({ _id: str(t._id), slug: t.slug, name: t.name })),
    authorName: d.authorMember?.name || d.author?.name || d.authorName || "Jarz Digital Team",
    authorMember: d.authorMember?.slug
      ? { slug: d.authorMember.slug, name: d.authorMember.name, role: d.authorMember.role ?? "", bio: d.authorMember.bio ?? "", photo: image(d.authorMember.photo), socials: d.authorMember.socials ?? {} }
      : null,
    status: d.status,
    publishedAt: iso(d.publishedAt) ?? null,
    contentUpdatedAt: iso(d.contentUpdatedAt) ?? null,
    featured: Boolean(d.featured),
    views: d.views ?? 0,
    readingTime: d.readingTime ?? 1,
    seo: d.seo ?? {},
    updatedAt: iso(d.updatedAt),
  };
}

export function mapPage(d: Doc): CmsPage {
  return {
    _id: str(d._id),
    slug: d.slug,
    title: d.title,
    intro: d.intro,
    content: d.content ?? "",
    status: d.status,
    needsReview: Boolean(d.needsReview),
    seo: d.seo ?? {},
    updatedAt: iso(d.updatedAt),
  };
}
