/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, EyeOff, FileSearch } from "lucide-react";
import { PageSeoEditor } from "@/components/admin/page-seo-editor";
import { PageHeader, StatCard, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/session";
import { MODELS } from "@/lib/cms/server";
import { getSiteSettings } from "@/lib/data/public";
import { connectDB } from "@/lib/db/connect";
import { SITE_URL } from "@/lib/seo";
import { applyTemplate, auditAll, type SeoIssue } from "@/lib/seo/audit";
import { locationOffices } from "@/lib/seo/locations";
import { STATIC_PAGES, locationPageSeo } from "@/lib/seo/pages";
import { cn } from "@/lib/utils";
import type { SeoFields } from "@/types/content";

export const metadata: Metadata = { title: "Page SEO" };

interface Row {
  key: string;
  group: string;
  label: string;
  path: string;
  title: string;
  fullTitle: string;
  description: string;
  noindex: boolean;
  custom: boolean;
  /** Built-in pages are edited in a dialog; CMS content links to its editor. */
  edit: { kind: "dialog"; defaults: { title: string; description: string }; override?: SeoFields } | { kind: "link"; href: string; label: string };
}

const CMS = [
  { key: "services", group: "Services", filter: { published: true }, fields: "title slug seo summary", path: (d: any) => `/services/${d.slug}`, label: (d: any) => d.title, title: (d: any) => `${d.title} Services`, desc: (d: any) => d.summary },
  { key: "industries", group: "Industries", filter: { published: true }, fields: "name headline slug seo intro", path: (d: any) => `/industries/${d.slug}`, label: (d: any) => d.name, title: (d: any) => `${d.headline} & Local SEO`, desc: (d: any) => d.intro },
  { key: "projects", group: "Portfolio", filter: { published: true }, fields: "title client slug seo summary", path: (d: any) => `/work/${d.slug}`, label: (d: any) => d.client || d.title, title: (d: any) => `${d.client} — Case Study`, desc: (d: any) => d.summary },
  { key: "posts", group: "Blog posts", filter: { status: "published" }, fields: "title slug seo excerpt", path: (d: any) => `/blog/${d.slug}`, label: (d: any) => d.title, title: (d: any) => d.title, desc: (d: any) => d.excerpt },
  { key: "pages", group: "Custom pages", filter: { status: "published" }, fields: "title slug seo intro", path: (d: any) => `/${d.slug}`, label: (d: any) => d.title, title: (d: any) => d.title, desc: (d: any) => d.intro || d.title },
] as const;

const levelTone = { error: "danger", warning: "warning", info: "neutral" } as const;

export default async function PageSeoPage({ searchParams }: PageProps<"/admin/seo/pages">) {
  await requirePermission("seo:page");
  const { filter } = await searchParams;
  const onlyIssues = filter === "issues";

  const settings = await getSiteSettings();
  const template = settings.seo.titleTemplate;
  const overrides = settings.seo.pages ?? {};
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const rows: Row[] = [];

  // Homepage — edited under Global SEO.
  rows.push({
    key: "/",
    group: "Main pages",
    label: "Home",
    path: "/",
    title: settings.seo.defaultTitle,
    fullTitle: settings.seo.defaultTitle,
    description: settings.seo.defaultDescription,
    noindex: false,
    custom: true,
    edit: { kind: "link", href: "/admin/seo", label: "Global SEO" },
  });

  const builtIn = [
    ...STATIC_PAGES.map((p) => ({ ...p, group: "Main pages" })),
    ...locationOffices(settings).map((o) => ({ ...locationPageSeo(o), label: `${o.city}, ${o.country}`, group: "Location pages" })),
  ];
  for (const p of builtIn) {
    const o = overrides[p.path] ?? {};
    const title = o.title || p.title;
    rows.push({
      key: p.path,
      group: p.group,
      label: p.label,
      path: p.path,
      title,
      fullTitle: applyTemplate(title, template),
      description: o.description || p.description,
      noindex: Boolean(o.noindex),
      custom: Boolean(o.title || o.description || o.ogImage || o.noindex),
      edit: { kind: "dialog", defaults: { title: p.title, description: p.description }, override: overrides[p.path] },
    });
  }

  await connectDB();
  const cmsDocs = await Promise.all(CMS.map((c) => (MODELS as any)[c.key].find(c.filter).select(c.fields).sort({ order: 1, createdAt: -1 }).lean() as Promise<any[]>));
  CMS.forEach((c, i) => {
    for (const d of cmsDocs[i]) {
      const title = d.seo?.title || c.title(d);
      rows.push({
        key: `${c.key}:${d._id}`,
        group: c.group,
        label: c.label(d),
        path: c.path(d),
        title,
        fullTitle: applyTemplate(title, template),
        description: d.seo?.description || c.desc(d) || "",
        noindex: Boolean(d.seo?.noindex),
        custom: Boolean(d.seo?.title || d.seo?.description),
        edit: { kind: "link", href: `/admin/${c.key}/${d._id}`, label: "Open editor" },
      });
    }
  });

  const issues = auditAll(rows);
  const needsWork = (r: Row) => (issues.get(r.key) ?? []).some((i) => i.level !== "info");
  const counts = {
    total: rows.length,
    ready: rows.filter((r) => !needsWork(r) && !r.noindex).length,
    attention: rows.filter(needsWork).length,
    hidden: rows.filter((r) => r.noindex).length,
  };
  const visible = onlyIssues ? rows.filter(needsWork) : rows;
  const groups = Array.from(new Set(visible.map((r) => r.group)));

  return (
    <>
      <PageHeader
        title="Page SEO"
        description="Every public page with the title and description Google will show. Fix anything flagged, and edit built-in and location pages right here."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "SEO", href: "/admin/seo" }, { label: "Pages" }]}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pages checked" value={counts.total} icon={<FileSearch className="size-4" />} href="/admin/seo/pages" />
        <StatCard label="Ready" value={counts.ready} hint="No issues found" icon={<CheckCircle2 className="size-4" />} />
        <StatCard label="Need attention" value={counts.attention} hint="Titles or descriptions to improve" icon={<AlertTriangle className="size-4" />} href="/admin/seo/pages?filter=issues" tone={counts.attention ? "brand" : "default"} />
        <StatCard label="Hidden (noindex)" value={counts.hidden} icon={<EyeOff className="size-4" />} />
      </div>

      <nav aria-label="Filter pages" className="mb-6 flex gap-2 text-sm">
        {[
          { href: "/admin/seo/pages", label: `All pages (${counts.total})`, active: !onlyIssues },
          { href: "/admin/seo/pages?filter=issues", label: `Needs attention (${counts.attention})`, active: onlyIssues },
        ].map((t) => (
          <Link key={t.href} href={t.href} aria-current={t.active ? "page" : undefined} className={cn("rounded-full px-4 py-1.5", t.active ? "bg-ink-900 text-white" : "bg-white text-mist-700 ring-1 ring-mist-200 hover:ring-mist-300")}>
            {t.label}
          </Link>
        ))}
      </nav>

      {visible.length === 0 && <p className="rounded-2xl border border-mist-200 bg-white p-8 text-center text-sm text-mist-600">Nothing needs attention — every page has a well-sized title and description.</p>}

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">
              {g} <span className="font-normal text-mist-500">({visible.filter((r) => r.group === g).length})</span>
            </h2>
            <Table>
              <thead>
                <tr>
                  <th scope="col" className={cn(th, "w-[22%]")}>Page</th>
                  <th scope="col" className={th}>Search result preview</th>
                  <th scope="col" className={cn(th, "w-[26%]")}>Checks</th>
                  <th scope="col" className={cn(th, "w-32")}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible
                  .filter((r) => r.group === g)
                  .map((r) => {
                    const list: SeoIssue[] = issues.get(r.key) ?? [];
                    return (
                      <tr key={r.key} className="align-top hover:bg-mist-25">
                        <td className={td}>
                          <span className="font-medium text-ink-900">{r.label}</span>
                          <a href={r.path} target="_blank" rel="noopener noreferrer" className="block text-xs text-mist-500 hover:text-brand-700">
                            {r.path}
                          </a>
                          {r.custom && r.edit.kind === "dialog" && (
                            <Badge tone="brand" className="mt-1.5">
                              Custom SEO
                            </Badge>
                          )}
                        </td>
                        <td className={td}>
                          <p className="line-clamp-1 text-[0.95rem] text-[#1a0dab]">{r.fullTitle}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-mist-600">{r.description || <em className="text-danger-500">No description</em>}</p>
                        </td>
                        <td className={td}>
                          {list.length === 0 ? (
                            <Badge tone="success">Looks good</Badge>
                          ) : (
                            <ul className="space-y-1">
                              {list.map((i) => (
                                <li key={i.message}>
                                  <Badge tone={levelTone[i.level]} className="whitespace-normal text-left">
                                    {i.message}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className={cn(td, "text-right")}>
                          {r.edit.kind === "dialog" ? (
                            <PageSeoEditor path={r.path} label={r.label} host={host} titleTemplate={template} defaults={r.edit.defaults} override={r.edit.override} />
                          ) : (
                            <Link href={r.edit.href} className="text-sm font-medium text-brand-700 hover:underline">
                              {r.edit.label} →
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </section>
        ))}
      </div>
    </>
  );
}
