#!/usr/bin/env node
/**
 * Extracts the published blog posts from the mirrored WordPress RSS feed
 * (../jarzdigital.com/feed/index.html) into src/content/seed/posts.json.
 *
 * - Strips WordPress block classes / data attributes.
 * - Rewrites links to old WordPress URLs so they point at the new routes.
 * - Keeps the original slugs so existing search rankings carry over
 *   (old /YYYY/MM/DD/slug URLs are 301-redirected in next.config.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const feedFile = path.resolve(projectRoot, "..", "jarzdigital.com", "feed", "index.html");
const outFile = path.join(projectRoot, "src", "content", "seed", "posts.json");

export const LEGACY_ROUTES = {
  "full-business-management-services": "/services/business-management",
  "local-seo-services": "/services/local-seo",
  "website-development-services": "/services/website-development",
  "website-seo-services": "/services/seo",
  "social-media-marketing-services": "/services/social-media-marketing",
  "advertising-services": "/services/google-ads",
  "web-application-development-services": "/services/web-application-development",
  "software-development-services": "/services/software-development",
  "about-jarz-digital": "/about",
  "contact-jarz-digital": "/contact",
  subscription: "/pricing",
  services: "/services",
  blog: "/blog",
};

// Editorial categorisation (the WordPress site filed everything under "Uncategorized").
const TAXONOMY = {
  "why-local-seo-is-a-game-changer-for": { category: "local-seo", tags: ["dallas", "local-seo", "google-maps"], cover: "why-local-seo-is-a-game-changer-for-dallas" },
  "how-to-rank-1-on-google-map-for-your-dallas-business": { category: "local-seo", tags: ["dallas", "google-maps", "google-business-profile"], cover: "how-to-rank-1-on-google-map-dallas" },
  "how-to-open-a-google-business-profile-2": { category: "local-seo", tags: ["google-business-profile", "guides"], cover: "how-to-open-a-google-business-profile" },
  "how-to-rank-your-junk-car-buyer": { category: "local-seo", tags: ["google-maps", "guides"], cover: "how-to-rank-your-junk-car-buyer-business" },
  "why-website-local-seo-is-important": { category: "seo", tags: ["local-seo", "website-seo"], cover: "why-website-local-seo-is-important" },
  "why-map-ranking-is-crucial-for-small-businesses": { category: "local-seo", tags: ["google-maps", "small-business"], cover: "why-map-ranking-is-crucial" },
  "why-our-full-business-management-service-package": { category: "business-management", tags: ["small-business", "business-management"], cover: "why-full-business-management-package" },
  "why-small-business-owners-should-invest": { category: "business-management", tags: ["small-business", "business-management"], cover: "why-small-business-owners-should-invest" },
};

const decode = (s) =>
  s
    .replace(/&#8217;|&#8216;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

function rewriteHref(href) {
  const m = href.match(/^https?:\/\/(?:www\.)?jarzdigital\.com\/(.*)$/i);
  if (!m) return href;
  const rest = m[1].replace(/[?#].*$/, "").replace(/\/+$/, "");
  const post = rest.match(/^\d{4}\/\d{2}\/\d{2}\/([^/]+)$/);
  if (post) return `/blog/${post[1]}`;
  const product = rest.match(/^product\/([^/]+)$/);
  if (product) return "/services";
  return LEGACY_ROUTES[rest] ?? (rest === "" ? "/" : `/${rest}`);
}

function clean(html) {
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(class|id|style|data-[\w-]+)="[^"]*"/g, "")
    .replace(/<(\/?)strong>/g, "<$1strong>")
    .replace(/href="([^"]+)"/g, (_, h) => `href="${rewriteHref(h)}"`)
    .replace(/\n{2,}/g, "\n")
    .trim();
  // The first heading of every post repeats the title — drop it.
  out = out.replace(/^<h2>[\s\S]*?<\/h2>\s*/, "");
  // Headings wrapped entirely in <strong> are redundant.
  out = out.replace(/<(h[2-4])><strong>([\s\S]*?)<\/strong><\/\1>/g, "<$1>$2</$1>");
  return decode(out);
}

const xml = fs.readFileSync(feedFile, "utf8");
const items = xml.split("<item>").slice(1).map((chunk) => chunk.split("</item>")[0]);

const tag = (chunk, name) => {
  const m = chunk.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim() : "";
};

const posts = items.map((chunk) => {
  const link = tag(chunk, "link");
  const slug = link.replace(/\/+$/, "").split("/").pop();
  const content = clean(tag(chunk, "content:encoded"));
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const firstPara = (content.match(/<p>([\s\S]*?)<\/p>/) ?? [])[1] ?? text;
  const excerpt = firstPara.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const meta = TAXONOMY[slug] ?? { category: "insights", tags: [] };
  return {
    slug,
    title: decode(tag(chunk, "title")),
    excerpt: excerpt.length > 240 ? excerpt.slice(0, 237).replace(/\s+\S*$/, "") + "…" : excerpt,
    content,
    publishedAt: new Date(tag(chunk, "pubDate")).toISOString(),
    legacyUrl: link,
    authorName: "Jarz Digital Team",
    category: meta.category,
    tags: meta.tags,
    coverImage: meta.cover ? `/images/blog/${meta.cover}.webp` : null,
    wordCount: text.split(" ").length,
  };
});

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(posts, null, 2));
console.log(`Extracted ${posts.length} posts → ${path.relative(projectRoot, outFile)}`);
for (const p of posts) console.log(` - ${p.slug} (${p.wordCount} words, ${p.category})`);
