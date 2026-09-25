import type { Redirect } from "next/dist/lib/load-custom-routes";
import legacyUploads from "./legacy-uploads.json";

/**
 * Old WordPress URLs → current pages.
 *
 * Old URLs whose path still exists (/, /services/, /blog/, /contact/) are not
 * listed: they keep working and only lose the trailing slash. Everything here
 * points straight at a page that returns 200, so each old URL is exactly one
 * 301. Sources are the HTTrack mirror of the old site (../jarzdigital.com),
 * the migrated blog feed and the Technical & On-Page SEO Audit (Sept 2026).
 */
export const LEGACY_PAGES: Array<[string, string]> = [
  // Service landing pages
  ["/full-business-management-services", "/services/business-management"],
  ["/local-seo-services", "/services/local-seo"],
  ["/website-development-services", "/services/website-development"],
  ["/website-seo-services", "/services/seo"],
  ["/social-media-marketing-services", "/services/social-media-marketing"],
  ["/advertising-services", "/services/google-ads"],
  ["/web-application-development-services", "/services/web-application-development"],
  ["/software-development-services", "/services/software-development"],
  ["/social-media-marketing", "/services/social-media-marketing"],
  // Old /services/ child pages still indexed by Google
  ["/services/web-application", "/services/web-application-development"],
  ["/services/website-seo", "/services/seo"],
  ["/services/local-seo-service", "/services/local-seo"],
  ["/services/ads-campaign", "/services/google-ads"],
  ["/services/advertising-service", "/services/google-ads"],
  // Company pages
  ["/about-jarz-digital", "/about"],
  ["/about-us", "/about"],
  ["/contact-jarz-digital", "/contact"],
  ["/subscription", "/pricing"],
  ["/blogs", "/blog"],
  // WooCommerce products → the matching service; shop pages → pricing
  ["/product/business-management", "/services/business-management"],
  ["/product/local-seo-service", "/services/local-seo"],
  ["/product/website-development", "/services/website-development"],
  ["/product/website-seo", "/services/seo"],
  ["/product/social-media-marketing", "/services/social-media-marketing"],
  ["/product/ads-campaign", "/services/google-ads"],
  ["/product/web-application", "/services/web-application-development"],
  ["/product/software-development", "/services/software-development"],
  ["/product/ads-campaign/feed", "/services/google-ads"],
  ["/product/web-application/feed", "/services/web-application-development"],
  ["/product/software-development/feed", "/services/software-development"],
  ["/product", "/pricing"],
  ["/shop", "/pricing"],
  ["/cart", "/pricing"],
  ["/checkout", "/pricing"],
  ["/shopengine-template/shoppage", "/pricing"],
  ["/my-account", "/login"],
  // Feeds and Yoast/RankMath/core sitemaps
  ["/feed", "/blog/rss.xml"],
  ["/comments/feed", "/blog/rss.xml"],
  ["/sitemap_index.xml", "/sitemap.xml"],
  ["/post-sitemap.xml", "/sitemap.xml"],
  ["/page-sitemap.xml", "/sitemap.xml"],
  ["/product-sitemap.xml", "/sitemap.xml"],
  ["/category-sitemap.xml", "/sitemap.xml"],
  ["/wp-sitemap.xml", "/sitemap.xml"],
];

/** Old WordPress blog categories and tags that exist on the new blog under the same slug. */
const BLOG_CATEGORIES = ["local-seo", "seo", "business-management"];
const BLOG_TAGS = ["small-business", "business-management", "google-maps", "guides", "local-seo", "website-seo", "google-business-profile", "dallas"];

type Rule = { source: string; destination: string; has?: Redirect["has"] };

/** Old URL patterns (each also matched with a trailing slash). */
function patternRules(): Rule[] {
  const date = "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug";
  return [
    { source: `${date}/feed`, destination: "/blog/:slug" },
    { source: date, destination: "/blog/:slug" },
    ...BLOG_CATEGORIES.map((c) => ({ source: `/category/${c}`, destination: `/blog/category/${c}` })),
    { source: "/category/:slug*", destination: "/blog" },
    ...BLOG_TAGS.map((t) => ({ source: `/tag/${t}`, destination: `/blog/tag/${t}` })),
    { source: "/tag/:slug*", destination: "/blog" },
    { source: "/author/:name*", destination: "/about" },
    { source: "/product-category/:slug*", destination: "/pricing" },
  ];
}

/** Old /wp-content/uploads/ images that were migrated to /images/ (see scripts/migrate-assets.mjs). */
function uploadRules(): Rule[] {
  return (legacyUploads as Array<{ to: string; from: string[] }>).flatMap(({ to, from }) =>
    from.map((old) => ({ source: `/${old.replace(/[()[\]{}?*+:]/g, "\\$&")}`, destination: `/images/${to}` })),
  );
}

const withSlash = (rules: Rule[]) => rules.flatMap((r) => [r, { ...r, source: `${r.source}/` }]);

/**
 * All redirects, in match order. `siteUrl` is the canonical origin; when
 * `canonicalHost` is true, requests for any other host (the *.vercel.app
 * domain, the bare domain) are sent to the same page on the canonical host in
 * a single hop — including old URLs, which go straight to their new page.
 */
export function buildRedirects(siteUrl: string, { canonicalHost }: { canonicalHost: boolean }): Redirect[] {
  const legacy: Rule[] = withSlash([...LEGACY_PAGES.map(([source, destination]) => ({ source, destination })), ...patternRules()]);
  // Any other URL with a trailing slash → the same URL without it (Next's own slash redirect is disabled).
  const slash: Rule = { source: "/:path+/", destination: "/:path+" };
  const rules: Rule[] = [...legacy, ...uploadRules(), slash];

  // The other apex/www variant plus every *.vercel.app alias (no lookaheads: Vercel's router needs plain regex).
  const host = new URL(siteUrl).hostname;
  const twin = host.startsWith("www.") ? host.slice(4) : `www.${host}`;
  const elsewhere = [{ type: "host" as const, value: `(?:${twin.replace(/\./g, "\\.")}|.+\\.vercel\\.app)` }];
  const offHost: Rule[] = canonicalHost
    ? [...rules, { source: "/:path*", destination: "/:path*" }].map((r) => ({ ...r, destination: `${siteUrl}${r.destination}`, has: elsewhere }))
    : [];

  return [...offHost, ...rules].map((r) => ({ ...r, statusCode: 301 }) as Redirect);
}

/** Temporary redirects for old WordPress admin entry points (not for search engines). */
export const WORDPRESS_ADMIN_REDIRECTS: Redirect[] = [
  { source: "/wp-admin/:path*", destination: "/admin", permanent: false },
  { source: "/wp-login.php", destination: "/login", permanent: false },
];
