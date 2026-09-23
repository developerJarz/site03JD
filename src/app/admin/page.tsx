import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, FileText, Inbox, Sparkles, UserPlus, Users } from "lucide-react";
import { BarList, ColumnChart, LineChart } from "@/components/admin/charts";
import { Card, EmptyState, LeadStatusBadge, PageHeader, StatCard } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { describeAction } from "@/lib/activity";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/admin";
import { isDbConfigured } from "@/lib/db/connect";
import { formatNumber, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const user = await requireStaff();
  if (!isDbConfigured) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState title="Connect a database" description="Set MONGODB_URI and run `npm run db:seed` to enable the dashboard." />
      </>
    );
  }
  const data = await getDashboardData({ includeLeads: can(user.role, "leads:manage"), includeUsers: can(user.role, "users:manage") });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(" ")[0]}.`}
        description="Here’s what’s happening across Jarz Digital."
        actions={
          <>
            <ButtonLink href="/admin/posts/new" variant="outline" size="sm">
              New post
            </ButtonLink>
            <ButtonLink href="/admin/projects/new" variant="dark" size="sm">
              New project
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.leads && <StatCard tone="brand" label="New leads (30 days)" value={formatNumber(data.leads.newThisMonth)} hint={`${data.leads.pending} pending follow-up`} icon={<Inbox className="size-4" />} href="/admin/leads" />}
        {data.users && <StatCard label="Total users" value={formatNumber(data.users.total)} hint={`${data.users.newThisMonth} new in 30 days`} icon={<Users className="size-4" />} href="/admin/users" />}
        <StatCard label="Blog posts" value={formatNumber(data.content.posts)} hint={`${data.content.publishedPosts} published`} icon={<FileText className="size-4" />} href="/admin/posts" />
        <StatCard label="Portfolio projects" value={formatNumber(data.content.projects)} hint={`${data.content.services} live services`} icon={<BriefcaseBusiness className="size-4" />} href="/admin/projects" />
        {data.leads && (
          <>
            <StatCard label="Open project requests" value={formatNumber(data.leads.openRequests)} icon={<Sparkles className="size-4" />} href="/admin/requests" />
            <StatCard label="Completed projects" value={formatNumber(data.leads.completedProjects)} hint="Client requests marked completed" icon={<CheckCircle2 className="size-4" />} href="/admin/requests?status=COMPLETED" />
          </>
        )}
        {data.users && <StatCard label="New users (30 days)" value={formatNumber(data.users.newThisMonth)} icon={<UserPlus className="size-4" />} href="/admin/users" />}
      </div>

      {(data.leads || data.users) && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {data.leads && (
            <Card title="Leads over time" action={<span className="text-xs text-mist-500">Last 12 weeks</span>}>
              <ColumnChart data={data.leads.weekly} valueLabel="Leads" title="Leads received per week, last 12 weeks" />
            </Card>
          )}
          {data.users && (
            <Card title="New users over time" action={<span className="text-xs text-mist-500">Last 12 weeks</span>}>
              <LineChart data={data.users.weekly} valueLabel="New users" title="New user registrations per week, last 12 weeks" />
            </Card>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {data.leads && (
          <Card title="Service inquiries" action={<span className="text-xs text-mist-500">12 weeks</span>}>
            <BarList data={data.leads.byService} valueLabel="Leads by service" empty="No inquiries in the last 12 weeks." />
          </Card>
        )}
        <Card title="Blog views" action={<span className="text-xs text-mist-500">All time</span>}>
          <BarList data={data.engagement.posts} valueLabel="Views per post" empty="No views recorded yet. Views are counted by the site’s built-in tracker." />
        </Card>
        <Card title="Portfolio engagement" action={<span className="text-xs text-mist-500">All time</span>}>
          <BarList data={data.engagement.projects} valueLabel="Views per project" empty="No project views recorded yet." />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {data.leads && (
          <Card
            title="Recent leads"
            padded={false}
            action={
              <Link href="/admin/leads" className="text-xs font-medium text-brand-700 hover:underline">
                View all
              </Link>
            }
          >
            {data.leads.recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-mist-500">No leads yet. Submissions from the contact form appear here.</p>
            ) : (
              <ul className="divide-y divide-mist-100">
                {data.leads.recent.map((l) => (
                  <li key={String(l._id)}>
                    <Link href={`/admin/leads/${l._id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-mist-25">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{l.name}</span>
                        <span className="block truncate text-xs text-mist-500">{l.serviceName ?? l.email}</span>
                      </span>
                      <LeadStatusBadge status={l.status} />
                      <span className="w-20 text-right text-xs text-mist-500">{timeAgo(l.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        <Card
          title="Recent activity"
          padded={false}
          action={
            can(user.role, "activity:view") ? (
              <Link href="/admin/activity" className="text-xs font-medium text-brand-700 hover:underline">
                Full log
              </Link>
            ) : undefined
          }
        >
          {data.activity.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-mist-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-mist-100">
              {data.activity.map((a) => (
                <li key={String(a._id)} className="flex items-start gap-3 px-5 py-3 text-sm">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
                  <span className="min-w-0 flex-1 text-mist-700">
                    <span className="font-medium text-ink-900">{a.actorName}</span> {describeAction(a.action)}
                    {a.entityLabel && <span className="text-ink-900"> “{a.entityLabel}”</span>}
                  </span>
                  <span className="shrink-0 text-xs text-mist-500">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
