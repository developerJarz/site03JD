import type { NextRequest } from "next/server";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { env } from "@/lib/env";
import { pdfResponse, renderPdf } from "@/lib/ecommerce-builder/pdf";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { BuilderInvoice, BuilderOrder } from "@/models/builder";

export const dynamic = "force-dynamic";

/** Staff download of an invoice, including void ones (marked in the file name). */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/ecommerce-builder/invoices/[id]/pdf">) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "builder:orders")) return new Response("Forbidden", { status: 403 });
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{24}$/.test(id)) return new Response("Not found", { status: 404 });
  await connectDB();
  const invoice = await BuilderInvoice.findById(id).lean();
  if (!invoice) return new Response("Not found", { status: 404 });
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
  const suffix = invoice.status === "void" ? "-VOID" : "";
  return pdfResponse(bytes, `Jarz-Digital-Invoice-${invoice.number}${suffix}.pdf`, request.nextUrl.searchParams.has("download"));
}
