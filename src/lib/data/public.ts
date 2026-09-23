import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { escapeRegex } from "@/lib/utils";
import { Category, Faq as FaqModel, Industry as IndustryModel, Page, Post as PostModel, Project as ProjectModel, Service as ServiceModel, Tag, TeamMember as TeamModel, Testimonial as TestimonialModel } from "@/models/content";
import { SiteSettingsModel } from "@/models/operations";
import type { Category as CategoryT, CmsPage, Faq, Industry, Post, Project, SearchResult, Service, SiteSettings, Tag as TagT, TeamMember, Testimonial } from "@/types/content";
import { TAGS } from "./cache-tags";
import { mapFaq, mapIndustry, mapPage, mapPost, mapProject, mapService, mapTeam, mapTestimonial } from "./mappers";
import { seedStore } from "./seed-store";

/**
 * Public, cached content queries.
 *
 * Every function reads from MongoDB when MONGODB_URI is configured and
 * falls back to the migrated seed content otherwise. Results are cached
 * with Next.js tags; CMS mutations call `revalidateTag` to refresh them.
 */
const REVALIDATE = 3600;

function cached<A extends unknown[], R>(key: string, tags: string[], fn: (...args: A) => Promise<R>) {
  const wrapped = unstable_cache(fn, [key], { tags, revalidate: REVALIDATE });
  // React.cache de-duplicates within a single render pass.
  return cache(wrapped);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base) || typeof base !== "object" || base === null) return (override ?? base) as T;
  if (typeof override !== "object" || override === null) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = b && typeof b === "object" && !Array.isArray(b) ? deepMerge(b, v) : v === undefined ? b : v;
  }
  return out as T;
}

/* --------------------------------- Settings -------------------------------- */

export const getSiteSettings = cached("site-settings", [TAGS.settings], async (): Promise<SiteSettings> => {
  if (!isDbConfigured) return seedStore.settings;
  await connectDB();
  const doc = await SiteSettingsModel.findOne({ key: "site" }).lean();
  return deepMerge(seedStore.settings, doc?.data ?? {});
});

/* --------------------------------- Services -------------------------------- */

export const getServices = cached("services", [TAGS.services], async (): Promise<Service[]> => {
  if (!isDbConfigured) return seedStore.services.filter((s) => s.published);
  await connectDB();
  const docs = await ServiceModel.find({ published: true })
    .sort({ order: 1, title: 1 })
    .populate("related", "slug title shortTitle")
    .populate("category", "slug name")
    .lean();
  return docs.map(mapService);
});

export const getServiceBySlug = cached("service", [TAGS.services], async (slug: string): Promise<Service | null> => {
  const all = await getServices();
  return all.find((s) => s.slug === slug) ?? null;
});

/* -------------------------------- Industries ------------------------------- */

export const getIndustries = cached("industries", [TAGS.industries, TAGS.services], async (): Promise<Industry[]> => {
  if (!isDbConfigured) return seedStore.industries.filter((i) => i.published);
  await connectDB();
  const docs = await IndustryModel.find({ published: true }).sort({ order: 1, name: 1 }).populate("services", "slug title shortTitle").lean();
  return docs.map(mapIndustry);
});

export const getIndustryBySlug = cached("industry", [TAGS.industries, TAGS.services], async (slug: string): Promise<Industry | null> => {
  const all = await getIndustries();
  return all.find((i) => i.slug === slug) ?? null;
});

/* --------------------------------- Projects -------------------------------- */

export const getProjects = cached("projects", [TAGS.projects, TAGS.industries, TAGS.services], async (): Promise<Project[]> => {
  if (!isDbConfigured) return seedStore.projects.filter((p) => p.published);
  await connectDB();
  const docs = await ProjectModel.find({ published: true })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(200)
    .populate("industry", "slug name")
    .populate("services", "slug title shortTitle")
    .lean();
  return docs.map(mapProject);
});

export const getProjectBySlug = cached("project", [TAGS.projects, TAGS.industries, TAGS.services], async (slug: string): Promise<Project | null> => {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
});

/* ----------------------------------- Team ---------------------------------- */

export const getTeam = cached("team", [TAGS.team], async (): Promise<TeamMember[]> => {
  if (!isDbConfigured) return seedStore.team.filter((m) => m.published);
  await connectDB();
  const docs = await TeamModel.find({ published: true }).sort({ order: 1, name: 1 }).lean();
  return docs.map(mapTeam);
});

export const getTeamMemberBySlug = cached("team-member", [TAGS.team], async (slug: string): Promise<TeamMember | null> => {
  const all = await getTeam();
  return all.find((m) => m.slug === slug) ?? null;
});

/* ------------------------------- Testimonials ------------------------------ */

export const getTestimonials = cached("testimonials", [TAGS.testimonials], async (): Promise<Testimonial[]> => {
  if (!isDbConfigured) return seedStore.testimonials;
  await connectDB();
  const docs = await TestimonialModel.find({ published: true }).sort({ order: 1, createdAt: -1 }).limit(24).lean();
  return docs.map(mapTestimonial);
});

/* ----------------------------------- FAQs ---------------------------------- */

export const getFaqs = cached("faqs", [TAGS.faqs], async (group: string = "general"): Promise<Faq[]> => {
  if (!isDbConfigured) return seedStore.faqs.filter((f) => f.group === group && f.published);
  await connectDB();
  const docs = await FaqModel.find({ group, published: true }).sort({ order: 1 }).lean();
  return docs.map(mapFaq);
});

/* ----------------------------------- Blog ---------------------------------- */

export const getPosts = cached("posts", [TAGS.posts, TAGS.taxonomy], async (): Promise<Post[]> => {
  if (!isDbConfigured) return seedStore.posts;
  await connectDB();
  const docs = await PostModel.find({ status: "published", publishedAt: { $lte: new Date() } })
    .sort({ featured: -1, publishedAt: -1 })
    .limit(500)
    .select("-content")
    .populate("category", "slug name")
    .populate("tags", "slug name")
    .lean();
  return docs.map(mapPost).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
});

export const getPostBySlug = cached("post", [TAGS.posts, TAGS.taxonomy], async (slug: string): Promise<Post | null> => {
  if (!isDbConfigured) return seedStore.posts.find((p) => p.slug === slug) ?? null;
  await connectDB();
  const doc = await PostModel.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } })
    .populate("category", "slug name")
    .populate("tags", "slug name")
    .populate("author", "name")
    .lean();
  return doc ? mapPost(doc) : null;
});

export const getCategories = cached("categories", [TAGS.taxonomy], async (kind: "post" | "service" = "post"): Promise<CategoryT[]> => {
  if (!isDbConfigured) return seedStore.categories.filter((c) => c.kind === kind);
  await connectDB();
  const docs = await Category.find({ kind }).sort({ name: 1 }).lean();
  return docs.map((d) => ({ _id: String(d._id), name: d.name, slug: d.slug, description: d.description ?? undefined, kind: d.kind as "post" | "service" }));
});

export const getTags = cached("tags", [TAGS.taxonomy], async (): Promise<TagT[]> => {
  if (!isDbConfigured) return seedStore.tags;
  await connectDB();
  const docs = await Tag.find().sort({ name: 1 }).lean();
  return docs.map((d) => ({ _id: String(d._id), name: d.name, slug: d.slug }));
});

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const all = await getPosts();
  const tagSlugs = new Set(post.tags.map((t) => t.slug));
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score: (p.category?.slug === post.category?.slug ? 2 : 0) + p.tags.filter((t) => tagSlugs.has(t.slug)).length,
    }))
    .sort((a, b) => b.score - a.score || (b.p.publishedAt ?? "").localeCompare(a.p.publishedAt ?? ""))
    .slice(0, limit)
    .map((x) => x.p);
}

/* ----------------------------------- Pages --------------------------------- */

export const getPageBySlug = cached("page", [TAGS.pages], async (slug: string): Promise<CmsPage | null> => {
  if (!isDbConfigured) return seedStore.pages.find((p) => p.slug === slug && p.status === "published") ?? null;
  await connectDB();
  const doc = await Page.findOne({ slug, status: "published" }).lean();
  return doc ? mapPage(doc) : null;
});

export const getPublishedPageSlugs = cached("page-slugs", [TAGS.pages], async (): Promise<string[]> => {
  if (!isDbConfigured) return seedStore.pages.filter((p) => p.status === "published").map((p) => p.slug);
  await connectDB();
  const docs = await Page.find({ status: "published" }).select("slug").lean();
  return docs.map((d) => d.slug);
});

/* ---------------------------------- Search --------------------------------- */

export async function searchContent(query: string, limit = 12): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const re = new RegExp(escapeRegex(q), "i");
  const [services, projects, posts, industries] = await Promise.all([getServices(), getProjects(), getPosts(), getIndustries()]);

  const results: Array<SearchResult & { score: number }> = [];
  const score = (title: string, body: string) => (re.test(title) ? 2 : 0) + (re.test(body) ? 1 : 0);

  for (const s of services) {
    const sc = score(s.title, `${s.summary} ${s.tagline} ${s.capabilities.join(" ")}`);
    if (sc) results.push({ type: "service", title: s.title, description: s.tagline, href: `/services/${s.slug}`, score: sc + 1 });
  }
  for (const p of projects) {
    const sc = score(`${p.title} ${p.client}`, `${p.summary} ${p.location ?? ""}`);
    if (sc) results.push({ type: "project", title: p.client, description: p.summary, href: `/work/${p.slug}`, score: sc });
  }
  for (const p of posts) {
    const sc = score(p.title, `${p.excerpt} ${p.tags.map((t) => t.name).join(" ")}`);
    if (sc) results.push({ type: "post", title: p.title, description: p.excerpt, href: `/blog/${p.slug}`, score: sc });
  }
  for (const i of industries) {
    const sc = score(`${i.name} ${i.headline}`, i.intro);
    if (sc) results.push({ type: "industry", title: i.headline, description: i.intro, href: `/industries/${i.slug}`, score: sc });
  }
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...r }) => r);
}
