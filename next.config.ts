import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy.
 * A static policy keeps every marketing page statically renderable
 * (nonce-based CSP forces dynamic rendering). Inline scripts are limited
 * to Next.js' own bootstrap and JSON-LD blocks.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'" + (isDev ? " ws:" : ""),
  "frame-src https://www.google.com https://maps.google.com",
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

/** Old WordPress URLs → new routes (permanent, preserves search equity). */
const legacyRedirects: Array<[string, string]> = [
  ["/full-business-management-services", "/services/business-management"],
  ["/local-seo-services", "/services/local-seo"],
  ["/website-development-services", "/services/website-development"],
  ["/website-seo-services", "/services/seo"],
  ["/social-media-marketing-services", "/services/social-media-marketing"],
  ["/advertising-services", "/services/google-ads"],
  ["/web-application-development-services", "/services/web-application-development"],
  ["/software-development-services", "/services/software-development"],
  ["/about-jarz-digital", "/about"],
  ["/about-us", "/about"],
  ["/contact-jarz-digital", "/contact"],
  ["/subscription", "/pricing"],
  ["/product/business-management", "/services/business-management"],
  ["/product/local-seo-service", "/services/local-seo"],
  ["/product/website-development", "/services/website-development"],
  ["/product/website-seo", "/services/seo"],
  ["/product/social-media-marketing", "/services/social-media-marketing"],
  ["/product/ads-campaign", "/services/google-ads"],
  ["/product/web-application", "/services/web-application-development"],
  ["/product/software-development", "/services/software-development"],
  ["/product", "/pricing"],
  ["/shopengine-template/shoppage", "/pricing"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/media/**" }],
    remotePatterns: [
      // Enable when a remote storage driver is configured.
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
    optimizePackageImports: ["lucide-react", "motion"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      ...legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true })),
      ...legacyRedirects.map(([source, destination]) => ({ source: `${source}/`, destination, permanent: true })),
      { source: "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/feed", destination: "/blog/rss.xml", permanent: true },
      { source: "/wp-admin/:path*", destination: "/admin", permanent: false },
      { source: "/wp-login.php", destination: "/login", permanent: false },
    ];
  },
};

export default nextConfig;
