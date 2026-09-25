/**
 * Public origin of the site, shared by next.config.ts (redirects, build
 * validation) and the server env module (canonicals, sitemap, robots, OG).
 *
 * Production on Vercel must set SITE_URL explicitly — there is deliberately
 * no fallback to the *.vercel.app domain, which would tell search engines the
 * site lives there. Previews and local builds fall back to their own URL.
 */
export const PRIMARY_SITE_URL = "https://www.jarzdigital.com";

type Env = Record<string, string | undefined>;

/** Treats "", whitespace and accidentally quoted values as unset. */
function clean(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
  return v === "" ? undefined : v;
}

function toOrigin(value: string): string | undefined {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
  } catch {
    return undefined;
  }
}

export function isVercelProduction(env: Env = process.env) {
  return env.VERCEL_ENV === "production";
}

/** Throws in Vercel production when SITE_URL is missing or points at a non-public host. */
export function resolveSiteUrl(env: Env = process.env): string {
  const configured = clean(env.SITE_URL);

  if (isVercelProduction(env)) {
    const origin = configured && toOrigin(configured);
    if (!origin) throw new Error(`SITE_URL must be set in production (e.g. ${PRIMARY_SITE_URL}).`);
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "https:" || hostname.endsWith(".vercel.app") || hostname === "localhost") {
      throw new Error(`SITE_URL must be the public https domain in production (e.g. ${PRIMARY_SITE_URL}), not "${origin}".`);
    }
    return origin;
  }

  for (const candidate of [configured, clean(env.VERCEL_BRANCH_URL), clean(env.VERCEL_URL)]) {
    const origin = candidate && toOrigin(candidate);
    if (origin) return origin;
    if (candidate) console.warn(`[env] Ignoring invalid site URL "${candidate}".`);
  }
  return "http://localhost:3000";
}
