import type { Metadata } from "next";
import { PasswordForm, PreferencesForm, SignOutOthersButton } from "@/components/dashboard/forms";
import { DashHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { formatDateTime } from "@/lib/utils";
import { Session } from "@/models/Session";
import { User } from "@/models/User";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");
  await connectDB();
  const [doc, sessions] = await Promise.all([
    User.findById(user.id).select("preferences passwordChangedAt").lean(),
    Session.find({ user: user.id, expiresAt: { $gt: new Date() } }).sort({ lastSeenAt: -1 }).select("userAgent lastSeenAt createdAt").lean(),
  ]);
  const prefs = { emailNotifications: doc?.preferences?.emailNotifications ?? true, productUpdates: doc?.preferences?.productUpdates ?? false };

  return (
    <>
      <DashHeader eyebrow="Settings" title="Account settings." />
      <div className="space-y-6">
        <Panel title="Password">
          {doc?.passwordChangedAt && <p className="-mt-2 mb-5 text-sm text-mist-500">Last changed {formatDateTime(doc.passwordChangedAt)}</p>}
          <PasswordForm />
        </Panel>
        <Panel title="Email notifications">
          <PreferencesForm initial={prefs} />
        </Panel>
        <Panel title="Signed-in devices" action={sessions.length > 1 ? <SignOutOthersButton /> : undefined}>
          <ul className="divide-y divide-mist-100 text-sm">
            {sessions.map((s) => (
              <li key={String(s._id)} className="flex justify-between gap-4 py-3">
                <span className="truncate text-mist-700">{s.userAgent?.replace(/\(.*?\)/g, "").slice(0, 80) || "Unknown device"}</span>
                <span className="shrink-0 text-mist-500">Active {formatDateTime(s.lastSeenAt ?? s.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Delete account">
          <p className="text-sm text-mist-600">
            To delete your account and associated data, email <a href="mailto:info@jarzdigital.com" className="font-medium text-brand-700 underline">info@jarzdigital.com</a> from your account address. We’ll confirm within 2 business days.
          </p>
        </Panel>
      </div>
    </>
  );
}
