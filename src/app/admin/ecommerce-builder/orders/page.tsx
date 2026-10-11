import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState, PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/session";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { ORDER_STATUSES, ORDER_STATUS_META, PAYMENT_STATUS_META, paymentStatus, type OrderStatus } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { escapeRegex, formatDateTime } from "@/lib/utils";
import { BuilderOrder } from "@/models/builder";

export const metadata: Metadata = { title: "E-commerce orders" };

export default async function BuilderOrdersPage({ searchParams }: PageProps<"/admin/ecommerce-builder/orders">) {
  await requirePermission("builder:orders");
  const crumbs = [{ label: "Dashboard", href: "/admin" }, { label: "E-commerce Builder", href: "/admin/ecommerce-builder" }, { label: "Orders" }];
  if (!isDbConfigured) {
    return (
      <>
        <PageHeader title="Customer orders" crumbs={crumbs} />
        <EmptyState title="Connect a database" description="Set MONGODB_URI to receive builder orders." />
      </>
    );
  }
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" && (ORDER_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 25;

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ number: re }, { quoteNumber: re }, { "customer.name": re }, { "customer.email": re }, { "customer.phone": re }, { "customer.businessName": re }, { templateName: re }];
  }
  const [rows, total, counts] = await Promise.all([
    BuilderOrder.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).select("number customer templateName total amountPaid currency status createdAt").lean(),
    BuilderOrder.countDocuments(filter),
    BuilderOrder.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const countOf = (s: string) => counts.find((c) => c._id === s)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pill = (active: boolean) => `shrink-0 rounded-xl border px-4 py-2 text-sm ${active ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-600"}`;

  return (
    <>
      <PageHeader title="Customer orders" description="Project requests submitted from the e-commerce website builder, with their saved price snapshots." crumbs={crumbs} />

      <nav aria-label="Order status" className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        <Link href="/admin/ecommerce-builder/orders" className={pill(!status)}>
          All <span className="ml-1 opacity-60">{counts.reduce((a, c) => a + c.n, 0)}</span>
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/ecommerce-builder/orders?status=${s}`} className={pill(status === s)}>
            {ORDER_STATUS_META[s].label} <span className="ml-1 opacity-60">{countOf(s)}</span>
          </Link>
        ))}
      </nav>

      <Suspense>
        <ListToolbar placeholder="Search order no., customer, phone, email, business or template…" />
      </Suspense>

      {rows.length === 0 ? (
        <EmptyState title={q || status ? "No matching orders" : "No orders yet"} description="Orders appear here when customers submit the builder’s order form." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th scope="col" className={th}>Order</th>
                <th scope="col" className={th}>Customer</th>
                <th scope="col" className={th}>Business</th>
                <th scope="col" className={th}>Template</th>
                <th scope="col" className={`${th} text-right`}>Total</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Date</th>
                <th scope="col" className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const pay = paymentStatus(o.total, o.amountPaid ?? 0);
                return (
                  <tr key={String(o._id)} className="hover:bg-mist-25">
                    <td className={`${td} whitespace-nowrap font-medium text-ink-900`}>
                      <Link href={`/admin/ecommerce-builder/orders/${o._id}`} className="hover:text-brand-700">
                        {o.number}
                      </Link>
                    </td>
                    <td className={td}>
                      <span className="block text-ink-900">{o.customer?.name}</span>
                      <span className="text-xs text-mist-500">{o.customer?.phone}</span>
                    </td>
                    <td className={`${td} text-mist-700`}>
                      {o.customer?.businessName || "—"}
                      {o.customer?.businessCategory && <span className="block text-xs text-mist-500">{o.customer.businessCategory}</span>}
                    </td>
                    <td className={`${td} text-mist-700`}>{o.templateName}</td>
                    <td className={`${td} whitespace-nowrap text-right tabular-nums`}>
                      <span className="text-ink-900">{formatMoney(o.total, o.currency ?? "USD")}</span>
                      {pay !== "unpaid" && <span className="block text-xs text-mist-500">{PAYMENT_STATUS_META[pay].label}</span>}
                    </td>
                    <td className={td}>
                      <Badge tone={ORDER_STATUS_META[o.status as OrderStatus]?.tone ?? "neutral"} dot>
                        {ORDER_STATUS_META[o.status as OrderStatus]?.label ?? o.status}
                      </Badge>
                    </td>
                    <td className={`${td} whitespace-nowrap text-mist-600`}>{formatDateTime(o.createdAt)}</td>
                    <td className={`${td} text-right`}>
                      <Link href={`/admin/ecommerce-builder/orders/${o._id}`} className="text-sm font-medium text-brand-700 hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination page={page} pages={pages} total={total} makeHref={(p) => `/admin/ecommerce-builder/orders?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(p) })}`} />
        </>
      )}
    </>
  );
}
