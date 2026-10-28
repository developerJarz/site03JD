import type { Metadata } from "next";
import { Suspense } from "react";
import { BillingStudio } from "@/components/admin/billing/billing-studio";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadBillingCatalog, loadOrderImport } from "@/lib/billing/catalog-server";

export const metadata: Metadata = { title: "Quotations & invoices" };

export default async function BillingPage({ searchParams }: PageProps<"/admin/billing">) {
  const user = await requirePermission("billing:manage");
  const sp = await searchParams;
  const orderId = typeof sp.fromOrder === "string" ? sp.fromOrder : "";
  const [catalog, orderImport] = await Promise.all([loadBillingCatalog(), orderId && can(user.role, "builder:orders") ? loadOrderImport(orderId) : null]);
  return (
    <Suspense>
      <BillingStudio catalog={catalog} orderImport={orderImport} importAs={sp.as === "invoice" ? "invoice" : "quotation"} />
    </Suspense>
  );
}
