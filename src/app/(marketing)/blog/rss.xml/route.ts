import { getPosts, getSiteSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()]);
  const items = posts
    .slice(0, 50)
    .map(
      (p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${SITE_URL}/blog/${p.slug}</link>
  <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
  <pubDate>${new Date(p.publishedAt ?? Date.now()).toUTCString()}</pubDate>
  <description>${esc(p.excerpt)}</description>
  ${p.category ? `<category>${esc(p.category.name)}</category>` : ""}
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(settings.general.siteName)} — Insights</title>
  <link>${SITE_URL}/blog</link>
  <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
  <description>${esc(settings.seo.defaultDescription)}</description>
  <language>en-us</language>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
