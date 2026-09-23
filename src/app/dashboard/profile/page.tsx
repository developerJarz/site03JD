import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/forms";
import { DashHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/dashboard/profile");
  return (
    <>
      <DashHeader eyebrow="Profile" title="Your details." description="We use these to contact you about your projects." />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Panel>
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-ink-900 font-display text-2xl font-semibold text-brand-300">{initials(user.name)}</span>
            <p className="mt-4 font-display text-xl font-semibold text-ink-900">{user.name}</p>
            <p className="text-sm text-mist-500">{user.email}</p>
            {user.company && <p className="mt-1 text-sm text-mist-600">{user.company}</p>}
          </div>
        </Panel>
        <Panel title="Edit profile">
          <ProfileForm user={user} />
        </Panel>
      </div>
    </>
  );
}
