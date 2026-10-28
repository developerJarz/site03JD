import "server-only";
import { getServices } from "@/lib/data/public";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { getPublishedPricebook } from "@/lib/ecommerce-builder/server";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { BuilderOrder, BuilderQuote } from "@/models/builder";
import { buildCatalog, EMPTY_CATALOG, type BillingCatalog, type OrderImport } from "./catalog";

/** Published service plans + the live E-commerce Builder pricebook, as one rate list. */
export async function loadBillingCatalog(): Promise<BillingCatalog> {
  const [services, pricebook] = await Promise.all([getServices().catch(() => []), getPublishedPricebook().catch(() => null)]);
  if (!services.length && !pricebook) return EMPTY_CATALOG;
  return buildCatalog(services, pricebook);
}

/** A builder order in the shape the billing studio imports, or null when it doesn't exist. */
export async function loadOrderImport(id: string): Promise<OrderImport | null> {
  if (!isDbConfigured || !/^[a-f0-9]{24}$/.test(id)) return null;
  await connectDB();
  const order = await BuilderOrder.findById(id).lean();
  if (!order) return null;
  const [quote, pricebook] = await Promise.all([
    BuilderQuote.findById(order.quote).select("terms validUntil createdAt").lean(),
    getPublishedPricebook().catch(() => null),
  ]);
  const c = order.customer;
  const days = quote ? Math.round((new Date(quote.validUntil).getTime() - new Date(quote.createdAt).getTime()) / 86_400_000) : 0;
  return {
    id: String(order._id),
    number: order.number,
    quoteNumber: order.quoteNumber,
    status: order.status ?? "new",
    createdAt: new Date(order.createdAt).toISOString(),
    customer: {
      name: c?.name ?? "",
      phone: c?.phone ?? "",
      email: c?.email ?? "",
      businessName: c?.businessName ?? "",
      domain: c?.domain ?? "",
      requirements: c?.requirements ?? "",
    },
    breakdown: order.breakdown as QuoteBreakdown,
    currency: order.currency === "BDT" ? "BDT" : "USD",
    payments: (order.payments ?? []).map((p) => ({
      amount: p.amount,
      method: p.method ?? "",
      reference: p.reference ?? "",
      receivedAt: new Date(p.receivedAt ?? order.createdAt).toISOString(),
    })),
    paymentTerms: quote?.terms?.paymentTerms ?? "",
    disclaimer: quote?.terms?.disclaimer ?? "",
    validityDays: days > 0 ? days : (pricebook?.rules.quoteValidityDays ?? 30),
    usdToBdt: pricebook?.rules.bdtPerUsd ?? null,
  };
}
