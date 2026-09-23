import type { Metadata } from "next";
import { Suspense } from "react";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState, PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { describeAction } from "@/lib/activity";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { escapeRegex, formatDateTime } from "@/lib/utils";
import { ActivityLog } from "@/models/operations";

export const metadata: Metadata = { title: "Activity log" };

const TYPES = ["posts", "pages", "services", "projects", "industries", "team", "testimonials", "faqs", "categories", "tags", "lead", "request", "user", "media", "settings"];

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  await requirePermission("activity:view");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const type = typeof sp.type === "string" && TYPES.includes(sp.type) ? sp.type : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 40;
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (type) filter.entityType = type;
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ actorName: re }, { entityLabel: re }, { action: re }];
  }
  const [rows, total] = await Promise.all([ActivityLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(), ActivityLog.countDocuments(filter)]);

  return (
    <>
      <PageHeader title="Activity log" description="An audit trail of important actions by staff, clients and the system." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Activity" }]} />
      <Suspense>
        <ListToolbar placeholder="Search by person, item or action…" filters={[{ param: "type", label: "Types", options: TYPES.map((t) => ({ value: t, label: t })) }]} />
      </Suspense>
      {rows.length === 0 ? (
        <EmptyState title="No activity recorded" />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th scope="col" className={th}>When</th>
                <th scope="col" className={th}>Who</th>
                <th scope="col" className={th}>Action</th>
                <th scope="col" className={th}>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={String(a._id)}>
                  <td className={`${td} whitespace-nowrap text-mist-600`}>{formatDateTime(a.createdAt)}</td>
                  <td className={td}>
                    <span className="font-medium text-ink-900">{a.actorName}</span>
                    {a.actorRole && (
                      <Badge tone="neutral" className="ml-2">
                        {a.actorRole}
                      </Badge>
                    )}
                  </td>
                  <td className={`${td} text-mist-700`}>
                    {describeAction(a.action)} {a.entityLabel && <span className="text-ink-900">“{a.entityLabel}”</span>}
                  </td>
                  <td className={`${td} font-mono text-xs text-mist-500`}>{a.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={page}
            pages={Math.max(1, Math.ceil(total / perPage))}
            total={total}
            makeHref={(p) => `/admin/activity?${new URLSearchParams({ ...(q ? { q } : {}), ...(type ? { type } : {}), page: String(p) })}`}
          />
        </>
      )}
    </>
  );
}
