import type { Metadata } from "next";
import { MarkAllRead } from "@/components/admin/ops-controls";
import { NotificationList } from "@/components/dashboard/notification-list";
import { DashHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { serialize } from "@/lib/utils";
import { Notification } from "@/models/operations";

export const metadata: Metadata = { title: "Notifications" };

export default async function ClientNotificationsPage() {
  const user = await requireUser("/dashboard/notifications");
  await connectDB();
  const raw = serialize<{ _id: string; type: string; title: string; body?: string; href?: string; createdAt: string; readBy: string[] }[]>(
    await Notification.find({ recipient: user.id }).sort({ createdAt: -1 }).limit(100).lean(),
  );
  const items = raw.map((n) => ({ ...n, read: n.readBy.includes(user.id) }));
  const unread = items.filter((n) => !n.read).length;
  return (
    <>
      <DashHeader eyebrow="Notifications" title="Updates." description={`${unread} unread`} action={unread > 0 ? <MarkAllRead /> : undefined} />
      {items.length === 0 ? (
        <Panel>
          <p className="py-8 text-center text-sm text-mist-500">No notifications yet.</p>
        </Panel>
      ) : (
        <NotificationList items={items} />
      )}
    </>
  );
}
