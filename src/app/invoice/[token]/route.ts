import type { NextRequest } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { env } from "@/lib/env";
import { pdfResponse, renderPdf } from "@/lib/ecommerce-builder/pdf";
import { findInvoiceByToken } from "@/lib/ecommerce-builder/quotes";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { clientIp } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";
import { BuilderOrder } from "@/models/builder";

export const dynamic = "force-dynamic";

/** Customer invoice PDF. Access requires the secret link token; void invoices are gone. */
export async function GET(request: NextRequest, ctx: RouteContext<"/invoice/[token]">) {
  const { token } = await ctx.params;
  if (!isDbConfigured) return new Response("Not found", { status: 404 });
  const limited = await rateLimit("quotePdf", clientIp(request));
  if (!limited.ok) return new Response("Too many requests", { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });

  const invoice = await findInvoiceByToken(token);
  if (!invoice) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  await connectDB();
  const order = await BuilderOrder.findById(invoice.order).select("amountPaid").lean();

  const bytes = await renderPdf({
    kind: "invoice",
    number: invoice.number,
    issuedAt: new Date(invoice.issuedAt ?? invoice.createdAt),
    untilAt: invoice.dueAt,
    reference: invoice.orderNumber ?? undefined,
    customer: invoice.customer,
    breakdown: invoice.breakdown as QuoteBreakdown,
    paymentTerms: invoice.paymentTerms,
    amountPaid: order?.amountPaid ?? 0,
    siteUrl: env.SITE_URL,
  });
  return pdfResponse(bytes, `Jarz-Digital-Invoice-${invoice.number}.pdf`, request.nextUrl.searchParams.has("download"));
}
