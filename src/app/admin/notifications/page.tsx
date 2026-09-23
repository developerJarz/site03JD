import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { MarkAllRead } from "@/components/admin/ops-controls";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { NotificationList } from "@/components/dashboard/notification-list";
import { requireStaff } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { serialize } from "@/lib/utils";
import { Notification } from "@/models/operations";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireStaff();
  await connectDB();
  const items = await Notification.find({ $or: [{ audience: "staff" }, { recipient: user.id }] }).sort({ createdAt: -1 }).limit(100).lean();
  const list = serialize<{ _id: string; type: string; title: string; body?: string; href?: string; createdAt: string; readBy: string[] }[]>(items).map((n) => ({
    ...n,
    read: n.readBy.includes(user.id),
  }));
  const unread = list.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader title="Notifications" description={`${unread} unread`} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Notifications" }]} actions={unread > 0 ? <MarkAllRead /> : undefined} />
      {list.length === 0 ? (
        <EmptyState title="You’re all caught up" description="New leads, users, project requests and messages will notify you here." icon={<Bell className="size-5" aria-hidden />} />
      ) : (
        <NotificationList items={list} />
      )}
    </>
  );
}
