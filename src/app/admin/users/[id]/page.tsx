import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RoleSelect, UserStatusButton } from "@/components/admin/ops-controls";
import { Card, LeadStatusBadge, PageHeader } from "@/components/admin/ui";
import { describeAction } from "@/lib/activity";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { Session } from "@/models/Session";
import { ActivityLog, Lead, ProjectRequest } from "@/models/operations";
import { User } from "@/models/User";

export const metadata: Metadata = { title: "User" };

export default async function UserDetailPage({ params }: PageProps<"/admin/users/[id]">) {
  const me = await requirePermission("users:manage");
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  await connectDB();
  const user = await User.findById(id).lean();
  if (!user) notFound();
  const [requests, leads, sessions, activity] = await Promise.all([
    ProjectRequest.find({ user: id }).sort({ createdAt: -1 }).limit(10).lean(),
    Lead.find({ $or: [{ user: id }, { email: user.email }] }).sort({ createdAt: -1 }).limit(10).lean(),
    Session.countDocuments({ user: id, expiresAt: { $gt: new Date() } }),
    ActivityLog.find({ actor: id }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  const self = id === me.id;

  return (
    <>
      <PageHeader title={user.name} description={user.email} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users", href: "/admin/users" }, { label: user.name }]} />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Access">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs text-mist-500">Role</p>
                <RoleSelect id={id} value={user.role} disabled={self} />
                {self && <p className="mt-2 text-xs text-mist-500">You can’t change your own role.</p>}
              </div>
              <div>
                <p className="mb-2 text-xs text-mist-500">Account</p>
                <UserStatusButton id={id} status={user.status} disabled={self} />
              </div>
              <p className="text-xs text-mist-500">
                {sessions} active session{sessions === 1 ? "" : "s"}. Changing role or suspending signs the user out everywhere.
              </p>
            </div>
          </Card>
          <Card title="Profile">
            <dl className="space-y-3 text-sm">
              {[
                ["Company", user.company],
                ["Phone", user.phone],
                ["Title", user.title],
                ["Joined", formatDateTime(user.createdAt)],
                ["Last sign-in", user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-mist-500">{k}</dt>
                  <dd className="text-right text-ink-900">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Project requests" padded={false}>
            {requests.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-mist-500">No project requests.</p>
            ) : (
              <ul className="divide-y divide-mist-100">
                {requests.map((r) => (
                  <li key={String(r._id)}>
                    <Link href={`/admin/requests/${r._id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-mist-25">
                      <span className="text-sm font-medium text-ink-900">{r.title}</span>
                      <LeadStatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Contact inquiries" padded={false}>
            {leads.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-mist-500">No inquiries from this email.</p>
            ) : (
              <ul className="divide-y divide-mist-100">
                {leads.map((l) => (
                  <li key={String(l._id)}>
                    <Link href={`/admin/leads/${l._id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-mist-25">
                      <span className="text-sm text-ink-900">{l.serviceName ?? l.message.slice(0, 60)}</span>
                      <LeadStatusBadge status={l.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Recent activity" padded={false}>
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-mist-500">No recorded activity.</p>
            ) : (
              <ul className="divide-y divide-mist-100 text-sm">
                {activity.map((a) => (
                  <li key={String(a._id)} className="flex justify-between gap-4 px-5 py-3">
                    <span className="text-mist-700">
                      {describeAction(a.action)} {a.entityLabel && <span className="text-ink-900">“{a.entityLabel}”</span>}
                    </span>
                    <span className="shrink-0 text-xs text-mist-500">{timeAgo(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
