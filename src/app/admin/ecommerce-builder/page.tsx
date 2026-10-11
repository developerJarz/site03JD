import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Layers, LayoutTemplate, Puzzle, ShoppingCart } from "lucide-react";
import { PublishPricing } from "@/components/admin/ecommerce-builder/controls";
import { Card, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { getBuilderStats } from "@/lib/ecommerce-builder/admin-data";
import { BUILDER_PATH, ORDER_STATUS_META, type OrderStatus } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { loadDraftPricebook, pricebookHash } from "@/lib/ecommerce-builder/server";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/utils";
import { BuilderCategory, BuilderFeature, BuilderOrder, BuilderPricebook, BuilderTemplate } from "@/models/builder";

export const metadata: Metadata = { title: "E-commerce Builder" };

export default async function BuilderOverviewPage() {
  const user = await requirePermission("builder:content");
  const catalog = can(user.role, "builder:catalog");
  const orders = can(user.role, "builder:orders");

  const header = (
    <PageHeader
      title="E-commerce Builder"
      description="Templates, features and pricing for the e-commerce website builder — plus the quotes and orders it brings in."
      crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "E-commerce Builder" }]}
      actions={
        <ButtonLink href={BUILDER_PATH} target="_blank" variant="outline" size="sm">
          View page <ExternalLink className="size-3.5" aria-hidden />
        </ButtonLink>
      }
    />
  );
  if (!isDbConfigured) {
    return (
      <>
        {header}
        <EmptyState title="Connect a database" description="Set MONGODB_URI and run `npm run db:seed:builder` to manage the builder. The public page currently shows the built-in sample catalog." />
      </>
    );
  }

  await connectDB();
  const [history, counts, draft, stats, recent] = await Promise.all([
    BuilderPricebook.find().sort({ version: -1 }).limit(8).select("version hash note publishedByName createdAt").lean(),
    Promise.all([BuilderTemplate.countDocuments({ published: true }), BuilderCategory.countDocuments({ published: true }), BuilderFeature.countDocuments({ published: true })]),
    catalog ? loadDraftPricebook() : null,
    orders ? getBuilderStats() : null,
    orders ? BuilderOrder.find().sort({ createdAt: -1 }).limit(6).select("number customer.name customer.businessName templateName total currency status createdAt").lean() : [],
  ]);
  const live = history[0];
  const draftHash = draft ? pricebookHash(draft.pricebook) : null;
  const changed = draft ? !live || live.hash !== draftHash : false;
  const errors = draft?.issues.filter((i) => i.level === "error") ?? [];
  const warnings = draft?.issues.filter((i) => i.level === "warning") ?? [];

  return (
    <>
      {header}

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Quotations" value={formatNumber(stats.quotes)} hint={`${stats.quotes30} in the last 30 days`} icon={<FileText className="size-4" />} href="/admin/ecommerce-builder/quotes" />
          <StatCard label="Orders" value={formatNumber(stats.orders)} hint={`${stats.orders30} in the last 30 days`} icon={<ShoppingCart className="size-4" />} href="/admin/ecommerce-builder/orders" />
          <StatCard label="Estimated order value" value={formatMoney(stats.estimatedValue)} hint="All orders except cancelled" />
          <StatCard label="Confirmed order value" value={formatMoney(stats.confirmedValue)} hint={`${formatMoney(stats.paidValue)} payments recorded`} tone="brand" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {catalog && draft && (
            <Card title="Pricing publication" action={live ? <Badge tone="success" dot>Live: v{live.version}</Badge> : <Badge tone="warning" dot>Not published</Badge>}>
              <p className="text-sm text-mist-600">
                Edits to templates, features and pricing rules are drafts. Customers see them — and new quotes use them — only after you publish. Existing quotes and orders keep the prices they were issued with.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {changed ? (
                  <>
                    <AlertTriangle className="size-4 text-amber-600" aria-hidden />
                    <span className="text-ink-900">{live ? "There are unpublished changes." : "Publish the catalog to make it live."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 text-green-600" aria-hidden />
                    <span className="text-ink-900">Live pricing matches the catalog.</span>
                  </>
                )}
              </div>
              {(errors.length > 0 || warnings.length > 0) && (
                <ul className="mt-4 space-y-1.5 rounded-xl bg-mist-50 p-4 text-sm">
                  {errors.map((i) => (
                    <li key={i.message} className="flex gap-2 text-red-700">
                      <span aria-hidden>●</span> {i.message}
                    </li>
                  ))}
                  {warnings.slice(0, 8).map((i) => (
                    <li key={i.message} className="flex gap-2 text-amber-800">
                      <span aria-hidden>●</span> {i.message}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5">
                <PublishPricing disabled={!changed || errors.length > 0} />
              </div>
              <p className="mt-3 text-xs text-mist-500">
                Draft: {draft.pricebook.templates.length} templates · {draft.pricebook.features.length} features · {draft.pricebook.rules.discounts.length} active discounts · tax {draft.pricebook.rules.tax.enabled ? `${draft.pricebook.rules.tax.ratePercent}%` : "off"}
              </p>
            </Card>
          )}

          {orders && (
            <Card title="Recent orders" action={<Link href="/admin/ecommerce-builder/orders" className="text-sm text-brand-700 hover:underline">All orders</Link>} padded={false}>
              {recent.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-mist-500">No orders yet. They appear here when customers submit the builder’s order form.</p>
              ) : (
                <ul className="divide-y divide-mist-100">
                  {recent.map((o) => (
                    <li key={String(o._id)}>
                      <Link href={`/admin/ecommerce-builder/orders/${o._id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-mist-25">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink-900">
                            {o.number} · {o.customer?.businessName || o.customer?.name}
                          </span>
                          <span className="text-xs text-mist-500">
                            {o.templateName} · {timeAgo(o.createdAt)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="text-sm tabular-nums text-ink-900">{formatMoney(o.total, o.currency ?? "USD")}</span>
                          <Badge tone={ORDER_STATUS_META[o.status as OrderStatus]?.tone ?? "neutral"} dot>
                            {ORDER_STATUS_META[o.status as OrderStatus]?.label ?? o.status}
                          </Badge>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {catalog && (
            <Card title="Catalog">
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/admin/ecommerce-templates", label: "Website templates", n: counts[0], Icon: LayoutTemplate },
                  { href: "/admin/ecommerce-categories", label: "Feature categories", n: counts[1], Icon: Layers },
                  { href: "/admin/ecommerce-features", label: "Features", n: counts[2], Icon: Puzzle },
                ].map(({ href, label, n, Icon }) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center justify-between rounded-xl border border-mist-200 px-4 py-3 hover:border-mist-300">
                      <span className="flex items-center gap-2.5 text-ink-900">
                        <Icon className="size-4 text-brand-700" aria-hidden /> {label}
                      </span>
                      <span className="tabular-nums text-mist-500">{n} published</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Version history" padded={false}>
            {history.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-mist-500">No pricing published yet — the page shows the built-in sample catalog until you publish.</p>
            ) : (
              <ol className="divide-y divide-mist-100">
                {history.map((h) => (
                  <li key={h.version} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium text-ink-900">v{h.version}</span>
                      {h.note && <span className="block text-xs text-mist-500">{h.note}</span>}
                    </span>
                    <span className="shrink-0 text-right text-xs text-mist-600">
                      {formatDateTime(h.createdAt)}
                      {h.publishedByName && <span className="block">by {h.publishedByName}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
