import "server-only";
import { env } from "@/lib/env";

/**
 * CSRF defence for Route Handlers that mutate state. Server Actions already
 * compare Origin and Host automatically; route handlers call this explicitly.
 * Combined with SameSite=Lax session cookies this blocks cross-site posts.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Non-browser clients omit Origin; require a same-site fetch hint instead.
    return request.headers.get("sec-fetch-site") === "same-origin";
  }
  try {
    const o = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host && o.host === host) return true;
    return o.origin === new URL(env.SITE_URL).origin;
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
}
