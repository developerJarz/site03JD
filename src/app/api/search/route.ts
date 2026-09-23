import { NextResponse, type NextRequest } from "next/server";
import { searchContent } from "@/lib/data/public";
import { clientIp } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const limited = await rateLimit("search", clientIp(request));
  if (!limited.ok) {
    return NextResponse.json({ results: [], error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });
  }
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const results = await searchContent(q);
  return NextResponse.json({ results }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
