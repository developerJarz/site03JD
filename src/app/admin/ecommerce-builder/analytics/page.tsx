import type { Metadata } from "next";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { Card, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { analyticsEnabled } from "@/lib/analytics";
import { requirePermission } from "@/lib/auth/session";
import { isDbConfigured } from "@/lib/db/connect";
import { getBuilderStats } from "@/lib/ecommerce-builder/admin-data";
import { ORDER_STATUS_META } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Builder analytics" };

export default async function BuilderAnalyticsPage() {
  await requirePermission("builder:orders");
  const header = (
    <PageHeader
      title="Leads & analytics"
      description="Quotations, orders and what customers choose — computed from stored records."
      crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "E-commerce Builder", href: "/admin/ecommerce-builder" }, { label: "Analytics" }]}
    />
  );
  if (!isDbConfigured) {
    return (
      <>
        {header}
        <EmptyState title="Connect a database" description="Set MONGODB_URI to collect builder statistics." />
      </>
    );
  }
  const s = await getBuilderStats();

  return (
    <>
      {header}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Quotations generated" value={formatNumber(s.quotes)} hint={`${s.quotes30} in the last 30 days`} />
        <StatCard label="Orders submitted" value={formatNumber(s.orders)} hint={`${s.orders30} in the last 30 days`} />
        <StatCard label="Quote → order rate" value={s.quotes ? `${Math.round(s.conversion * 100)}%` : "—"} hint="Quotations that became an order" />
        <StatCard label="Confirmed order value" value={formatMoney(s.confirmedValue)} hint={`Estimated (all open): ${formatMoney(s.estimatedValue)}`} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Orders per week">
          <ColumnChart data={s.weekly} valueLabel="Orders" title="Orders per week, last 8 weeks" />
        </Card>
        <Card title="Orders by status">
          <BarList data={s.byStatus.map((x) => ({ label: ORDER_STATUS_META[x.status].label, value: x.n }))} valueLabel="Orders" empty="No orders yet." />
        </Card>
        <Card title="Popular templates (orders)">
          <BarList data={s.topTemplates} valueLabel="Orders" empty="No orders yet." />
        </Card>
        <Card title="Most selected premium features (orders)">
          <BarList data={s.topFeatures} valueLabel="Orders" empty="No orders yet." />
        </Card>
      </div>

      <Card title="Page visits" className="mt-6">
        <p className="text-sm leading-relaxed text-mist-600">
          {analyticsEnabled
            ? "Visits and funnel steps are tracked in Google Analytics (with visitor consent): builder_template_selected, builder_quote_created and generate_lead (form: ecommerce_builder). View them in GA4 → Reports → Engagement → Events."
            : "Visit tracking isn’t configured. Set NEXT_PUBLIC_GA_ID (or NEXT_PUBLIC_GTM_ID) to record visits and the builder events builder_template_selected, builder_quote_created and generate_lead in Google Analytics. The builder doesn’t store visit counts itself."}
        </p>
      </Card>
    </>
  );
}
