/**
 * Old WordPress files. The ones migrated to /images/ are 301-redirected in
 * next.config.ts (src/config/legacy-uploads.json); everything else is gone for
 * good, and 410 tells search engines to drop it faster than a 404.
 */
export function GET() {
  return new Response("Gone", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=86400" },
  });
}
