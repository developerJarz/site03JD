import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState, LeadStatusBadge, PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { LEAD_STATUS_META } from "@/config/forms";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { escapeRegex, formatDate, timeAgo } from "@/lib/utils";
import { LEAD_STATUSES } from "@/models/shared";
import { ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "Project requests" };

export default async function RequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  await requirePermission("requests:manage");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 25;
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) filter.title = new RegExp(escapeRegex(q), "i");
  const [rows, total] = await Promise.all([
    ProjectRequest.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * perPage).limit(perPage).populate<{ user: { name: string; email: string } | null }>("user", "name email").lean(),
    ProjectRequest.countDocuments(filter),
  ]);

  return (
    <>
      <PageHeader title="Project requests" description="Requests submitted by clients from their dashboard." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Project requests" }]} />
      <Suspense>
        <ListToolbar placeholder="Search by title…" filters={[{ param: "status", label: "Statuses", options: LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_META[s].label })) }]} />
      </Suspense>
      {rows.length === 0 ? (
        <EmptyState title="No project requests" description="When clients submit requests from their dashboard, they appear here." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th scope="col" className={th}>Request</th>
                <th scope="col" className={th}>Client</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Progress</th>
                <th scope="col" className={th}>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r._id)} className="hover:bg-mist-25">
                  <td className={td}>
                    <Link href={`/admin/requests/${r._id}`} className="font-medium text-ink-900 hover:text-brand-700">
                      {r.title}
                    </Link>
                    <span className="block text-xs text-mist-500">
                      {r.serviceName ?? "General"} · {formatDate(r.createdAt)}
                    </span>
                  </td>
                  <td className={`${td} text-mist-700`}>
                    {r.user?.name ?? "Deleted user"}
                    <span className="block text-xs text-mist-500">{r.user?.email}</span>
                  </td>
                  <td className={td}>
                    <LeadStatusBadge status={r.status} />
                  </td>
                  <td className={td}>
                    <span className="flex items-center gap-2">
                      <span className="block h-1.5 w-20 overflow-hidden rounded-full bg-mist-100">
                        <span className="block h-full rounded-full bg-brand-600" style={{ width: `${r.progress ?? 0}%` }} />
                      </span>
                      <span className="text-xs tabular-nums text-mist-600">{r.progress ?? 0}%</span>
                    </span>
                  </td>
                  <td className={`${td} text-mist-600`}>{timeAgo(r.lastMessageAt ?? r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} pages={Math.max(1, Math.ceil(total / perPage))} total={total} makeHref={(p) => `/admin/requests?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(p) })}`} />
        </>
      )}
    </>
  );
}
