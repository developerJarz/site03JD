import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";
import { LeadStatusBadge } from "@/components/admin/ui";
import { DashHeader, Metric, Panel, ProgressBar } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { timeAgo } from "@/lib/utils";
import { Lead, Message, Notification, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardHome({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  const { welcome } = await searchParams;
  await connectDB();
  const [requests, inquiries, notifications] = await Promise.all([
    ProjectRequest.find({ user: user.id }).sort({ updatedAt: -1 }).lean(),
    Lead.find({ $or: [{ user: user.id }, { email: user.email }], status: { $nin: ["COMPLETED", "CLOSED"] } }).countDocuments(),
    Notification.find({ recipient: user.id }).sort({ createdAt: -1 }).limit(6).lean(),
  ]);
  const unread = await Message.countDocuments({ request: { $in: requests.map((r) => r._id) }, fromStaff: true, readByClient: false });
  const active = requests.filter((r) => !["COMPLETED", "CLOSED"].includes(r.status));
  const completed = requests.filter((r) => r.status === "COMPLETED");

  return (
    <>
      {welcome && (
        <div className="mb-8 flex items-center gap-4 rounded-[24px] bg-gradient-to-r from-brand-500 to-azure-500 p-6 text-ink-950">
          <PartyPopper className="size-8 shrink-0" aria-hidden />
          <div>
            <p className="font-display text-xl font-semibold">Welcome to Jarz Digital, {user.name.split(" ")[0]}!</p>
            <p className="text-sm opacity-80">Submit your first project request and our team will reply within 24 hours.</p>
          </div>
        </div>
      )}
      <DashHeader
        eyebrow="Overview"
        title={`Hello, ${user.name.split(" ")[0]}.`}
        description="Track your projects, follow up on requests and talk to the Jarz Digital team."
        action={
          <ButtonLink href="/dashboard/requests/new" arrow>
            New project request
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric dark label="Active requests" value={active.length} href="/dashboard/requests" />
        <Metric label="Completed projects" value={completed.length} href="/dashboard/projects" />
        <Metric label="Pending inquiries" value={inquiries} href="/dashboard/requests#inquiries" />
        <Metric label="Unread messages" value={unread} href="/dashboard/messages" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="Your projects"
          action={
            <Link href="/dashboard/requests" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          }
        >
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-mist-300 px-6 py-12 text-center">
              <p className="font-display text-xl font-semibold text-ink-900">No projects yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-mist-600">Tell us what you want to build or grow. You’ll be able to follow progress and message the team right here.</p>
              <ButtonLink href="/dashboard/requests/new" variant="dark" size="sm" className="mt-6">
                Start a request
              </ButtonLink>
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.slice(0, 5).map((r) => (
                <li key={String(r._id)}>
                  <Link href={`/dashboard/requests/${r._id}`} className="group block rounded-2xl border border-mist-200 p-5 transition-colors hover:border-ink-900">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">{r.title}</p>
                        <p className="text-sm text-mist-500">
                          {r.serviceName ?? "General request"} · updated {timeAgo(r.updatedAt)}
                        </p>
                      </div>
                      <LeadStatusBadge status={r.status} />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <ProgressBar value={r.progress ?? 0} className="flex-1" />
                      <span className="text-xs tabular-nums text-mist-600">{r.progress ?? 0}%</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          {notifications.length === 0 ? (
            <p className="py-6 text-sm text-mist-500">Updates about your requests will show up here.</p>
          ) : (
            <ol className="space-y-4">
              {notifications.map((n) => (
                <li key={String(n._id)} className="flex gap-3">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0">
                    {n.href ? (
                      <Link href={n.href} className="text-sm text-ink-900 hover:text-brand-700">
                        {n.title}
                      </Link>
                    ) : (
                      <p className="text-sm text-ink-900">{n.title}</p>
                    )}
                    <p className="text-xs text-mist-500">{timeAgo(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <Link href="/services" className="mt-6 flex items-center justify-between rounded-2xl bg-mist-50 p-4 text-sm font-medium text-ink-900 hover:bg-mist-100">
            Explore more services <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Panel>
      </div>
    </>
  );
}
