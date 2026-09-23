import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isStaff } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { Message, Notification, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Client portal · Jarz Digital" }, robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  await connectDB();
  const requestIds = await ProjectRequest.find({ user: user.id }).distinct("_id");
  const [messages, notifications] = await Promise.all([
    Message.countDocuments({ request: { $in: requestIds }, fromStaff: true, readByClient: false }),
    Notification.countDocuments({ recipient: user.id, readBy: { $ne: user.id } }),
  ]);
  return (
    <DashboardShell user={{ name: user.name, email: user.email, staff: isStaff(user.role) }} counts={{ messages, notifications }}>
      {children}
    </DashboardShell>
  );
}
