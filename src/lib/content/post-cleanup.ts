/**
 * Cleans up posts migrated from WordPress: the RSS export repeated the post
 * title as the first heading, skipped heading levels (h3/h4 with no h2) and
 * dropped the colons from some titles. Safe to run more than once.
 */
const norm = (s: string) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, "").replace(/[^a-z0-9]/g, "");

/** Colons lost in the WordPress export, keyed by slug. */
export const POST_TITLE_FIXES: Record<string, string> = {
  "how-to-open-a-google-business-profile-2": "How to Open a Google Business Profile: A Step-by-Step Guide for Local Businesses",
  "how-to-rank-1-on-google-map-for-your-dallas-business": "How to Rank #1 on Google Map for Your Dallas Business: The Ultimate Local SEO Guide",
  "why-local-seo-is-a-game-changer-for": "Why Local SEO is a Game-Changer for Businesses in Dallas: Boost Your Online Visibility",
};

/**
 * - drops a leading heading that repeats the title (the page already has it as the H1)
 * - makes the first section heading an h2 and nests the rest beneath it (h2 → h3 → h4)
 */
export function normalizePostHeadings(html: string, title: string): string {
  let out = html.trim();
  const first = out.match(/^\s*(?:<p>\s*<\/p>\s*)*<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/);
  if (first && norm(first[2]) === norm(title)) out = out.slice(first[0].length).trimStart();

  const levels = [...out.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  if (!levels.length) return out;
  const top = levels[0];
  const map = (n: number) => (n <= top ? 2 : Math.min(4, 2 + (n - top)));
  return out.replace(/<(\/?)h([1-6])(\s[^>]*)?>/g, (_m, slash: string, n: string, attrs = "") => `<${slash}h${map(Number(n))}${slash ? "" : attrs}>`);
}
