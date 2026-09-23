import Link from "next/link";
import { Bell, Inbox, KanbanSquare, MessageSquare, UserPlus } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

const ICONS = { lead: Inbox, user: UserPlus, request: KanbanSquare, message: MessageSquare, system: Bell, admin: Bell } as const;

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

/** Shared notification inbox (admin and client dashboard). */
export function NotificationList({ items }: { items: NotificationItem[] }) {
  return (
    <ul className="divide-y divide-mist-100 overflow-hidden rounded-2xl border border-mist-200 bg-white">
      {items.map((n) => {
        const I = ICONS[n.type as keyof typeof ICONS] ?? Bell;
        const body = (
          <div className={cn("flex items-start gap-4 px-5 py-4", !n.read && "bg-brand-50/40")}>
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", n.read ? "bg-mist-100 text-mist-500" : "bg-ink-900 text-brand-300")}>
              <I className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", n.read ? "text-mist-700" : "font-medium text-ink-900")}>
                {!n.read && <span className="sr-only">Unread: </span>}
                {n.title}
              </p>
              {n.body && <p className="mt-0.5 truncate text-sm text-mist-500">{n.body}</p>}
            </div>
            <span className="shrink-0 text-xs text-mist-500">{timeAgo(n.createdAt)}</span>
          </div>
        );
        return (
          <li key={n._id}>
            {n.href ? (
              <Link href={n.href} className="block hover:bg-mist-25">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
