import type { Metadata } from "next";
import { Suspense } from "react";
import { BillingStudio } from "@/components/admin/billing/billing-studio";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Quotations & invoices" };

export default async function BillingPage() {
  await requirePermission("billing:manage");
  return (
    <Suspense>
      <BillingStudio />
    </Suspense>
  );
}
