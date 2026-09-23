import type { MetadataRoute } from "next";
import { getCategories, getIndustries, getPosts, getProjects, getPublishedPageSlugs, getServices, getTeam } from "@/lib/data/public";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, industries, posts, categories, team, pages] = await Promise.all([
    getServices(),
    getProjects(),
    getIndustries(),
    getPosts(),
    getCategories("post"),
    getTeam(),
    getPublishedPageSlugs(),
  ]);
  const url = (path: string) => `${SITE_URL}${path}`;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: url("/work"), changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: url("/industries"), changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: url("/pricing"), changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.8, lastModified: now },
  ];

  return [
    ...staticRoutes,
    ...services.map((s) => ({ url: url(`/services/${s.slug}`), lastModified: s.updatedAt ? new Date(s.updatedAt) : now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...projects.map((p) => ({ url: url(`/work/${p.slug}`), lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...industries.map((i) => ({ url: url(`/industries/${i.slug}`), lastModified: i.updatedAt ? new Date(i.updatedAt) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: new Date(p.updatedAt ?? p.publishedAt ?? now), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...categories.map((c) => ({ url: url(`/blog/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
    ...team.map((m) => ({ url: url(`/team/${m.slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
    ...pages.map((slug) => ({ url: url(`/${slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
