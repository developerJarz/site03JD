import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Lead, Notification, ProjectRequest } from "@/models/operations";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Jarz Digital" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  let counts = { leads: 0, requests: 0, notifications: 0 };
  if (isDbConfigured) {
    await connectDB();
    const [leads, requests, notifications] = await Promise.all([
      can(user.role, "leads:manage") ? Lead.countDocuments({ status: "NEW" }) : 0,
      can(user.role, "requests:manage") ? ProjectRequest.countDocuments({ status: "NEW" }) : 0,
      Notification.countDocuments({ audience: "staff", readBy: { $ne: user.id } }),
    ]);
    counts = { leads, requests, notifications };
  }
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} counts={counts} dbReady={isDbConfigured}>
      {children}
    </AdminShell>
  );
}
