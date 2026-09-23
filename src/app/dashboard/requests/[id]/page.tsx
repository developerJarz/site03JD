import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { MessageComposer } from "@/components/admin/ops-controls";
import { LeadStatusBadge } from "@/components/admin/ui";
import { MessageThread, type ThreadMessage } from "@/components/dashboard/message-thread";
import { Panel, ProgressBar } from "@/components/dashboard/ui";
import { LEAD_STATUS_META } from "@/config/forms";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { cn, formatDate, serialize } from "@/lib/utils";
import { LEAD_STATUSES } from "@/models/shared";
import { Message, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "Project request" };

const TRACK = LEAD_STATUSES.filter((s) => s !== "CLOSED");

export default async function ClientRequestPage({ params, searchParams }: PageProps<"/dashboard/requests/[id]">) {
  const user = await requireUser("/dashboard/requests");
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  await connectDB();
  // Ownership check: users can only ever load their own requests.
  const req = await ProjectRequest.findOne({ _id: id, user: user.id }).lean();
  if (!req) notFound();
  const messages = serialize<ThreadMessage[]>(await Message.find({ request: id }).sort({ createdAt: 1 }).lean());
  await Message.updateMany({ request: id, fromStaff: true, readByClient: false }, { readByClient: true });
  const stage = TRACK.indexOf(req.status as (typeof TRACK)[number]);

  return (
    <>
      <Link href="/dashboard/requests" className="mb-6 inline-flex items-center gap-2 text-sm text-mist-600 hover:text-ink-900">
        <ArrowLeft className="size-4" aria-hidden /> All requests
      </Link>
      {created && (
        <p role="status" className="mb-6 flex items-center gap-3 rounded-2xl bg-success-50 px-5 py-4 text-sm text-green-800">
          <CheckCircle2 className="size-5" aria-hidden /> Request submitted — the team has been notified and will reply here.
        </p>
      )}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-brand-700">{req.serviceName ?? "Project request"}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-display text-ink-900">{req.title}</h1>
          <p className="mt-2 text-sm text-mist-500">Submitted {formatDate(req.createdAt)}</p>
        </div>
        <LeadStatusBadge status={req.status} />
      </div>

      <Panel className="mb-6">
        <ol className="grid grid-cols-5 gap-2" aria-label="Request progress">
          {TRACK.map((s, i) => (
            <li key={s} className="text-center">
              <span className={cn("mx-auto block h-1.5 rounded-full", req.status === "CLOSED" ? "bg-mist-200" : i <= stage ? "bg-brand-500" : "bg-mist-200")} />
              <span className={cn("mt-2 block text-[0.7rem] sm:text-xs", i === stage ? "font-medium text-ink-900" : "text-mist-500")}>{LEAD_STATUS_META[s].label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-mist-600">Progress</span>
          <ProgressBar value={req.progress ?? 0} className="flex-1" />
          <span className="text-sm tabular-nums text-ink-900">{req.progress ?? 0}%</span>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Conversation">
          <MessageThread messages={messages} viewer="client" />
          <div className="mt-6 border-t border-mist-100 pt-5">
            <MessageComposer requestId={id} placeholder="Message the Jarz Digital team…" />
          </div>
        </Panel>
        <Panel title="Your brief">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-700">{req.description}</p>
          <dl className="mt-6 space-y-3 border-t border-mist-100 pt-5 text-sm">
            {[
              ["Budget", req.budget],
              ["Timeline", req.timeline],
              ["Website", req.website],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-mist-500">{k}</dt>
                <dd className="break-all text-right text-ink-900">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
