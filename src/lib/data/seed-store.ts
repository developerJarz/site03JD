import "server-only";
import {
  categorySeed,
  faqSeed,
  industrySeed,
  pageSeed,
  postSeed,
  projectSeed,
  serviceSeed,
  siteSeed,
  tagSeed,
  teamSeed,
} from "@/content/seed";
import { readingTime } from "@/lib/utils";
import type {
  Category,
  CmsPage,
  Faq,
  Industry,
  Post,
  Project,
  Ref,
  Service,
  SiteSettings,
  Tag,
  TeamMember,
  Testimonial,
} from "@/types/content";

/**
 * Normalised, read-only view of the migrated seed content, shaped exactly like
 * the database layer's output. IDs are derived from slugs.
 */
const id = (prefix: string, slug: string) => `${prefix}_${slug}`;

const categories: Category[] = categorySeed.map((c) => ({ ...c, _id: id("cat", c.slug) }));
const tags: Tag[] = tagSeed.map((t) => ({ ...t, _id: id("tag", t.slug) }));

const serviceRef = (slug: string): Ref | null => {
  const s = serviceSeed.find((x) => x.slug === slug);
  return s ? { _id: id("svc", s.slug), slug: s.slug, title: s.shortTitle || s.title } : null;
};

const services: Service[] = serviceSeed.map(({ relatedSlugs, categorySlug, ...s }) => {
  const cat = categories.find((c) => c.slug === categorySlug);
  return {
    ...s,
    _id: id("svc", s.slug),
    related: relatedSlugs.map(serviceRef).filter((r): r is Ref => Boolean(r)),
    category: cat ? { _id: cat._id, slug: cat.slug, title: cat.name } : null,
  };
});

const industries: Industry[] = industrySeed.map(({ serviceSlugs, ...i }) => ({
  ...i,
  _id: id("ind", i.slug),
  services: serviceSlugs.map(serviceRef).filter((r): r is Ref => Boolean(r)),
}));

const projects: Project[] = projectSeed.map(({ industrySlug, serviceSlugs, ...p }) => {
  const ind = industries.find((i) => i.slug === industrySlug);
  return {
    ...p,
    _id: id("prj", p.slug),
    industry: ind ? { _id: ind._id, slug: ind.slug, title: ind.name } : null,
    services: serviceSlugs.map(serviceRef).filter((r): r is Ref => Boolean(r)),
  };
});

const team: TeamMember[] = teamSeed.map((m) => ({ ...m, _id: id("tm", m.slug) }));
const faqs: Faq[] = faqSeed.map((f, i) => ({ ...f, _id: id("faq", `${f.group}-${i}`) }));
const testimonials: Testimonial[] = [];

const posts: Post[] = postSeed
  .map((p) => {
    const cat = categories.find((c) => c.slug === p.category);
    return {
      _id: id("post", p.slug),
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage ? { src: p.coverImage, alt: p.title, width: 1080, height: 720 } : null,
      category: cat ? { _id: cat._id, slug: cat.slug, name: cat.name } : null,
      tags: tags.filter((t) => p.tags.includes(t.slug)),
      authorName: p.authorName,
      status: "published" as const,
      publishedAt: p.publishedAt,
      featured: false,
      views: 0,
      readingTime: readingTime(p.content),
      seo: p.seo ?? {},
      updatedAt: p.publishedAt,
    };
  })
  .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
if (posts[0]) posts[0].featured = true;

const pages: CmsPage[] = pageSeed.map((p) => ({ ...p, _id: id("page", p.slug) }));

export const seedStore = {
  settings: siteSeed as SiteSettings,
  categories,
  tags,
  services,
  industries,
  projects,
  team,
  faqs,
  testimonials,
  posts,
  pages,
};
