import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/admin/ui";
import { DashHeader, Panel } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { formatDate, timeAgo, truncate } from "@/lib/utils";
import { Lead, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "My requests" };

export default async function RequestsPage() {
  const user = await requireUser("/dashboard/requests");
  await connectDB();
  const [requests, inquiries] = await Promise.all([
    ProjectRequest.find({ user: user.id }).sort({ createdAt: -1 }).lean(),
    Lead.find({ $or: [{ user: user.id }, { email: user.email }] }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  return (
    <>
      <DashHeader
        eyebrow="My requests"
        title="Requests & inquiries."
        description="Project requests you’ve submitted from your dashboard, plus inquiries sent through the website contact form."
        action={
          <ButtonLink href="/dashboard/requests/new" arrow>
            New request
          </ButtonLink>
        }
      />

      <Panel title="Project requests">
        {requests.length === 0 ? (
          <p className="py-6 text-sm text-mist-500">You haven’t submitted a project request yet.</p>
        ) : (
          <ul className="divide-y divide-mist-100">
            {requests.map((r) => (
              <li key={String(r._id)}>
                <Link href={`/dashboard/requests/${r._id}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="block font-medium text-ink-900 hover:text-brand-700">{r.title}</span>
                    <span className="block text-sm text-mist-500">
                      {r.serviceName ?? "General"} · submitted {formatDate(r.createdAt)}
                    </span>
                  </span>
                  <LeadStatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div id="inquiries" className="mt-6 scroll-mt-24">
        <Panel title="Website inquiries">
          {inquiries.length === 0 ? (
            <p className="py-6 text-sm text-mist-500">No contact-form inquiries linked to {user.email}.</p>
          ) : (
            <ul className="divide-y divide-mist-100">
              {inquiries.map((l) => (
                <li key={String(l._id)} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="block font-medium text-ink-900">{l.serviceName ?? l.projectType ?? "General inquiry"}</span>
                    <span className="block text-sm text-mist-500">
                      {truncate(l.message, 90)} · {timeAgo(l.createdAt)}
                    </span>
                  </span>
                  <LeadStatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
