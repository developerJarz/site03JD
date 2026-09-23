import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/admin/ui";
import { DashHeader, Panel, ProgressBar } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { formatDate } from "@/lib/utils";
import { ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "My projects" };

/** Projects = requests the team has accepted (in progress) or delivered. */
export default async function ProjectsPage() {
  const user = await requireUser("/dashboard/projects");
  await connectDB();
  const projects = await ProjectRequest.find({ user: user.id, status: { $in: ["IN_PROGRESS", "COMPLETED"] } }).sort({ updatedAt: -1 }).lean();
  const active = projects.filter((p) => p.status === "IN_PROGRESS");
  const done = projects.filter((p) => p.status === "COMPLETED");

  const Card = ({ p }: { p: (typeof projects)[number] }) => (
    <Link href={`/dashboard/requests/${p._id}`} className="block rounded-[24px] border border-mist-200 bg-white p-6 transition-colors hover:border-ink-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-ink-900">{p.title}</p>
          <p className="mt-1 text-sm text-mist-500">
            {p.serviceName ?? "Custom project"} · started {formatDate(p.createdAt)}
          </p>
        </div>
        <LeadStatusBadge status={p.status} />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <ProgressBar value={p.progress ?? 0} className="flex-1" />
        <span className="text-sm tabular-nums text-ink-900">{p.progress ?? 0}%</span>
      </div>
    </Link>
  );

  return (
    <>
      <DashHeader eyebrow="My projects" title="Projects in motion." description="Requests our team has accepted appear here with live progress." />
      {projects.length === 0 ? (
        <Panel>
          <div className="py-10 text-center">
            <p className="font-display text-xl font-semibold text-ink-900">No active projects yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-mist-600">Once the team accepts one of your requests and work begins, you’ll see progress here.</p>
            <ButtonLink href="/dashboard/requests/new" variant="dark" size="sm" className="mt-6">
              Submit a request
            </ButtonLink>
          </div>
        </Panel>
      ) : (
        <div className="space-y-10">
          {active.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-medium text-mist-600">In progress ({active.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {active.map((p) => (
                  <Card key={String(p._id)} p={p} />
                ))}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-medium text-mist-600">Completed ({done.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {done.map((p) => (
                  <Card key={String(p._id)} p={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
