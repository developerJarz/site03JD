import { cn, formatDateTime, initials } from "@/lib/utils";

export interface ThreadMessage {
  _id: string;
  senderName?: string;
  fromStaff: boolean;
  body: string;
  createdAt: string;
}

/** Conversation between a client and the Jarz Digital team on a project request. */
export function MessageThread({ messages, viewer }: { messages: ThreadMessage[]; viewer: "staff" | "client" }) {
  if (!messages.length) {
    return <p className="py-8 text-center text-sm text-mist-500">No messages yet. Start the conversation below.</p>;
  }
  return (
    <ol className="space-y-4" aria-label="Messages">
      {messages.map((m) => {
        const mine = viewer === "staff" ? m.fromStaff : !m.fromStaff;
        return (
          <li key={m._id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", m.fromStaff ? "bg-ink-900 text-brand-300" : "bg-mist-100 text-mist-700")} aria-hidden>
              {m.fromStaff ? "JD" : initials(m.senderName ?? "?")}
            </span>
            <div className={cn("max-w-[80%]", mine && "text-right")}>
              <p className="text-xs text-mist-500">
                {m.fromStaff ? `${m.senderName ?? "Jarz Digital"} · Jarz Digital` : (m.senderName ?? "Client")} · {formatDateTime(m.createdAt)}
              </p>
              <p className={cn("mt-1 inline-block whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed", mine ? "bg-ink-900 text-white" : "bg-mist-100 text-ink-900")}>{m.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
