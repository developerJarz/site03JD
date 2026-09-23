import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Optimistic auth gate at the network boundary: requests to private areas
 * without a session cookie are redirected to sign-in before rendering.
 * Real authorization (session validity, roles) is enforced again in every
 * layout, page, server action and route handler.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
