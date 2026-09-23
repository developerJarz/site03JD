import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { DashHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { timeAgo, truncate } from "@/lib/utils";
import { Message, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireUser("/dashboard/messages");
  await connectDB();
  const requests = await ProjectRequest.find({ user: user.id }).select("title lastMessageAt updatedAt").lean();
  const ids = requests.map((r) => r._id);
  const [latest, unread] = await Promise.all([
    Message.aggregate<{ _id: string; body: string; createdAt: Date; fromStaff: boolean; senderName: string }>([
      { $match: { request: { $in: ids } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$request", body: { $first: "$body" }, createdAt: { $first: "$createdAt" }, fromStaff: { $first: "$fromStaff" }, senderName: { $first: "$senderName" } } },
    ]),
    Message.aggregate<{ _id: string; n: number }>([{ $match: { request: { $in: ids }, fromStaff: true, readByClient: false } }, { $group: { _id: "$request", n: { $sum: 1 } } }]),
  ]);
  const threads = requests
    .map((r) => ({ r, last: latest.find((l) => String(l._id) === String(r._id)), unread: unread.find((u) => String(u._id) === String(r._id))?.n ?? 0 }))
    .sort((a, b) => new Date(b.last?.createdAt ?? b.r.updatedAt).getTime() - new Date(a.last?.createdAt ?? a.r.updatedAt).getTime());

  return (
    <>
      <DashHeader eyebrow="Messages" title="Conversations." description="Every project request has its own thread with the team." />
      <Panel>
        {threads.length === 0 ? (
          <div className="py-10 text-center">
            <MessageSquare className="mx-auto size-8 text-mist-300" aria-hidden />
            <p className="mt-3 text-sm text-mist-500">No conversations yet. Submit a project request to start one.</p>
          </div>
        ) : (
          <ul className="divide-y divide-mist-100">
            {threads.map(({ r, last, unread: n }) => (
              <li key={String(r._id)}>
                <Link href={`/dashboard/requests/${r._id}`} className="flex items-start gap-4 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-brand-300">JD</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={n ? "font-semibold text-ink-900" : "font-medium text-ink-900"}>{r.title}</span>
                      {n > 0 && <span className="rounded-full bg-brand-500 px-1.5 text-[0.7rem] font-semibold text-ink-950">{n} new</span>}
                    </span>
                    <span className="block truncate text-sm text-mist-500">{last ? `${last.fromStaff ? "Jarz Digital" : "You"}: ${truncate(last.body, 100)}` : "No messages yet"}</span>
                  </span>
                  <span className="shrink-0 text-xs text-mist-500">{timeAgo(last?.createdAt ?? r.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
