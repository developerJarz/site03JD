import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState, LeadStatusBadge, PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { LEAD_STATUS_META } from "@/config/forms";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { escapeRegex, formatDateTime } from "@/lib/utils";
import { LEAD_STATUSES } from "@/models/shared";
import { Lead } from "@/models/operations";

export const metadata: Metadata = { title: "Contact requests" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requirePermission("leads:manage");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 25;

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: re }, { email: re }, { company: re }, { message: re }];
  }
  const [rows, total, counts] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
    Lead.countDocuments(filter),
    Lead.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const countOf = (s: string) => counts.find((c) => c._id === s)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <PageHeader title="Contact requests" description="Leads from the contact and quote forms. Move each through the pipeline as you follow up." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Leads" }]} />

      <nav aria-label="Pipeline" className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        <Link href="/admin/leads" className={`shrink-0 rounded-xl border px-4 py-2 text-sm ${!status ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-600"}`}>
          All <span className="ml-1 opacity-60">{counts.reduce((a, c) => a + c.n, 0)}</span>
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link key={s} href={`/admin/leads?status=${s}`} className={`shrink-0 rounded-xl border px-4 py-2 text-sm ${status === s ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-600"}`}>
            {LEAD_STATUS_META[s].label} <span className="ml-1 opacity-60">{countOf(s)}</span>
          </Link>
        ))}
      </nav>

      <Suspense>
        <ListToolbar placeholder="Search name, email, company or message…" />
      </Suspense>

      {rows.length === 0 ? (
        <EmptyState title={q || status ? "No matching leads" : "No leads yet"} description="Submissions from the website’s contact form will appear here." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th scope="col" className={th}>Contact</th>
                <th scope="col" className={th}>Service</th>
                <th scope="col" className={th}>Budget</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={String(l._id)} className="hover:bg-mist-25">
                  <td className={td}>
                    <Link href={`/admin/leads/${l._id}`} className="font-medium text-ink-900 hover:text-brand-700">
                      {l.name}
                    </Link>
                    <span className="block text-xs text-mist-500">
                      {l.email}
                      {l.company ? ` · ${l.company}` : ""}
                    </span>
                  </td>
                  <td className={`${td} text-mist-700`}>{l.serviceName ?? l.projectType ?? "—"}</td>
                  <td className={`${td} text-mist-700`}>{l.budget ?? "—"}</td>
                  <td className={td}>
                    <LeadStatusBadge status={l.status} />
                  </td>
                  <td className={`${td} whitespace-nowrap text-mist-600`}>{formatDateTime(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} pages={pages} total={total} makeHref={(p) => `/admin/leads?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(p) })}`} />
        </>
      )}
    </>
  );
}
