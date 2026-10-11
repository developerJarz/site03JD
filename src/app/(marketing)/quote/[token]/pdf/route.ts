import type { NextRequest } from "next/server";
import { isDbConfigured } from "@/lib/db/connect";
import { env } from "@/lib/env";
import { pdfResponse, renderPdf } from "@/lib/ecommerce-builder/pdf";
import { findQuoteByToken } from "@/lib/ecommerce-builder/quotes";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { clientIp } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

/** Customer quotation PDF. Access requires the secret link token. */
export async function GET(request: NextRequest, ctx: RouteContext<"/quote/[token]/pdf">) {
  const { token } = await ctx.params;
  if (!isDbConfigured) return new Response("Not found", { status: 404 });
  const limited = await rateLimit("quotePdf", clientIp(request));
  if (!limited.ok) return new Response("Too many requests", { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });

  const quote = await findQuoteByToken(token);
  if (!quote) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });

  const bytes = await renderPdf({
    kind: "quotation",
    number: quote.number,
    issuedAt: new Date(quote.createdAt),
    untilAt: quote.validUntil,
    customer: quote.customer,
    breakdown: quote.breakdown as QuoteBreakdown,
    paymentTerms: quote.terms?.paymentTerms,
    disclaimer: quote.terms?.disclaimer,
    siteUrl: env.SITE_URL,
  });
  return pdfResponse(bytes, `Jarz-Digital-Quotation-${quote.number}.pdf`, request.nextUrl.searchParams.has("download"));
}
