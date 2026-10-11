import type { NextRequest } from "next/server";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { env } from "@/lib/env";
import { pdfResponse, renderPdf } from "@/lib/ecommerce-builder/pdf";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { BuilderQuote } from "@/models/builder";

export const dynamic = "force-dynamic";

/** Staff download of any quotation (no customer token needed). */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/ecommerce-builder/quotes/[id]/pdf">) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "builder:orders")) return new Response("Forbidden", { status: 403 });
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{24}$/.test(id)) return new Response("Not found", { status: 404 });
  await connectDB();
  const quote = await BuilderQuote.findById(id).lean();
  if (!quote) return new Response("Not found", { status: 404 });
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
