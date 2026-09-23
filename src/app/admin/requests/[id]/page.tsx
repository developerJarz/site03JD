import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageComposer, ProgressControl, StatusPicker } from "@/components/admin/ops-controls";
import { Card, PageHeader } from "@/components/admin/ui";
import { MessageThread, type ThreadMessage } from "@/components/dashboard/message-thread";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { formatDateTime, serialize } from "@/lib/utils";
import { Message, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "Project request" };

export default async function AdminRequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  await requirePermission("requests:manage");
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  await connectDB();
  const req = await ProjectRequest.findById(id).populate<{ user: { _id: string; name: string; email: string; company?: string } | null }>("user", "name email company").lean();
  if (!req) notFound();
  const messages = serialize<ThreadMessage[]>(await Message.find({ request: id }).sort({ createdAt: 1 }).lean());
  await Message.updateMany({ request: id, fromStaff: false, readByStaff: false }, { readByStaff: true });

  return (
    <>
      <PageHeader title={req.title} description={`Submitted ${formatDateTime(req.createdAt)}`} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Project requests", href: "/admin/requests" }, { label: req.title }]} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card title="Brief">
            <p className="whitespace-pre-wrap leading-relaxed text-ink-800">{req.description}</p>
          </Card>
          <Card title="Conversation with client">
            <MessageThread messages={messages} viewer="staff" />
            <div className="mt-6 border-t border-mist-100 pt-5">
              <MessageComposer requestId={id} placeholder="Reply to the client (they’ll be notified)…" />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Status">
            <StatusPicker id={id} value={req.status} kind="request" />
            <div className="mt-5">
              <p className="mb-2 text-xs text-mist-500">Progress</p>
              <ProgressControl id={id} value={req.progress ?? 0} />
            </div>
          </Card>
          <Card title="Details">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-mist-500">Client</dt>
                <dd className="text-ink-900">
                  {req.user ? (
                    <Link href={`/admin/users/${req.user._id}`} className="text-brand-700 hover:underline">
                      {req.user.name}
                    </Link>
                  ) : (
                    "Deleted user"
                  )}
                  {req.user?.company && <span className="text-mist-500"> · {req.user.company}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-mist-500">Service</dt>
                <dd className="text-ink-900">{req.serviceName ?? "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist-500">Budget</dt>
                <dd className="text-ink-900">{req.budget ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist-500">Timeline</dt>
                <dd className="text-ink-900">{req.timeline ?? "—"}</dd>
              </div>
              {req.website && (
                <div>
                  <dt className="text-xs text-mist-500">Current website</dt>
                  <dd className="break-all text-ink-900">{req.website}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
