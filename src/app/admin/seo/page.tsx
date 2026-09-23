import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GlobalSeoForm } from "@/components/admin/seo-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/public";

export const metadata: Metadata = { title: "Global SEO" };

const FILES = [
  { href: "/sitemap.xml", desc: "XML sitemap — rebuilt automatically when content changes" },
  { href: "/robots.txt", desc: "Crawler rules — admin, dashboard and APIs are disallowed" },
  { href: "/blog/rss.xml", desc: "RSS feed for Insights" },
  { href: "/opengraph-image", desc: "Default social share image" },
];

export default async function GlobalSeoPage() {
  await requirePermission("seo:global");
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader title="Global SEO" description="Defaults used when a page has no SEO overrides." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "SEO" }]} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="Defaults">
          <GlobalSeoForm initial={settings.seo} />
        </Card>
        <div className="space-y-6">
          <Card title="Generated files">
            <ul className="space-y-3 text-sm">
              {FILES.map((f) => (
                <li key={f.href}>
                  <a href={f.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline">
                    {f.href} <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                  <p className="text-xs text-mist-500">{f.desc}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Structured data">
            <p className="text-sm text-mist-600">
              Organization, WebSite, ProfessionalService (per market), Service, BlogPosting, FAQPage, BreadcrumbList and CreativeWork schema are generated from your content automatically.
            </p>
            <Link href="/admin/seo/pages" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
              Review page-level SEO →
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
