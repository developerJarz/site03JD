import type { MetadataRoute } from "next";
import { getCategories, getIndexablePageSlugs, getIndustries, getPosts, getProjects, getServices, getSiteSettings, getTeam } from "@/lib/data/public";
import { SITE_URL, postModifiedAt, teamProfileIndexable } from "@/lib/seo";
import { locationOffices, officePath } from "@/lib/seo/locations";

export const revalidate = 3600;

/**
 * Only indexable, canonical URLs that return 200. `lastModified` is given
 * only where it reflects a real content change (blog posts); build or seed
 * timestamps would teach Google to ignore lastmod.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, services, projects, industries, posts, categories, team, pages] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getProjects(),
    getIndustries(),
    getPosts(),
    getCategories("post"),
    getTeam(),
    getIndexablePageSlugs(),
  ]);
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/work"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/industries"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/pricing"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.8 },
    { url: url("/locations"), changeFrequency: "monthly", priority: 0.7 },
  ];
  // Pages an admin marked noindex (Admin → SEO → Pages) stay out of the sitemap.
  const hidden = new Set(Object.entries(settings.seo.pages ?? {}).filter(([, v]) => v?.noindex).map(([k]) => k));
  const visible = (path: string) => !hidden.has(path);

  return [
    ...staticRoutes.filter((r) => visible(r.url.slice(SITE_URL.length) || "/")),
    ...locationOffices(settings)
      .filter((o) => visible(officePath(o)))
      .map((o) => ({ url: url(officePath(o)), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...services.filter((x) => !x.seo?.noindex).map((s) => ({ url: url(`/services/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...projects.filter((x) => !x.seo?.noindex).map((p) => ({ url: url(`/work/${p.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...industries.filter((x) => !x.seo?.noindex).map((i) => ({ url: url(`/industries/${i.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.filter((x) => !x.seo?.noindex).map((p) => {
      const modified = postModifiedAt(p);
      return { url: url(`/blog/${p.slug}`), ...(modified ? { lastModified: new Date(modified) } : {}), changeFrequency: "monthly" as const, priority: 0.7 };
    }),
    ...categories.map((c) => ({ url: url(`/blog/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
    ...team.filter(teamProfileIndexable).map((m) => ({ url: url(`/team/${m.slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
    ...pages.map((slug) => ({ url: url(`/${slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
