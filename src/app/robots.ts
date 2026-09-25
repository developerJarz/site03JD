import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Private areas stay out of search. /media/ (CMS uploads used in posts and
 * share images) stays crawlable. No Host line — it isn't a Google directive.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/", "/login", "/register", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
