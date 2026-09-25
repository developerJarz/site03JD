import type { NextConfig } from "next";
import { WORDPRESS_ADMIN_REDIRECTS, buildRedirects } from "./src/config/redirects";
import { isVercelProduction, resolveSiteUrl } from "./src/config/site-url";

const isDev = process.env.NODE_ENV !== "production";

// Fails the build on Vercel production when SITE_URL is missing or wrong.
const siteUrl = resolveSiteUrl();
// Send other hosts (*.vercel.app, the bare domain) to the canonical one — production only, so previews keep working.
const isPublicOrigin = /^https:\/\//.test(siteUrl) && !/\.vercel\.app$/.test(new URL(siteUrl).hostname);
const canonicalHost = isVercelProduction() || (!process.env.VERCEL && isPublicOrigin);

// Analytics hosts are only allowed when an ID is configured (see src/components/analytics).
const analytics = Boolean(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GTM_ID);
const gaScript = analytics ? " https://www.googletagmanager.com" : "";
const gaConnect = analytics ? " https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com" : "";
const gaFrame = analytics ? " https://www.googletagmanager.com" : "";

/**
 * Content Security Policy.
 * A static policy keeps every marketing page statically renderable
 * (nonce-based CSP forces dynamic rendering). Inline scripts are limited
 * to Next.js' own bootstrap, JSON-LD blocks and the consent-gated analytics loader.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${gaScript}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'" + (isDev ? " ws:" : "") + gaConnect,
  `frame-src https://www.google.com https://maps.google.com${gaFrame}`,
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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Old WordPress URLs end in "/". Next's automatic slash redirect would add a hop before the
  // legacy rules run, so it is off and src/config/redirects.ts strips the slash itself (one 301).
  skipTrailingSlashRedirect: true,
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
    return [...buildRedirects(siteUrl, { canonicalHost }), ...WORDPRESS_ADMIN_REDIRECTS];
  },
};

export default nextConfig;
