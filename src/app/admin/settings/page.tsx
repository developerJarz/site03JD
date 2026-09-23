import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/public";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader title="Settings" description="Site-wide configuration. Changes publish immediately." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]} />
      <SettingsForm
        settings={settings}
        tabs={[
          { key: "general", label: "General", sections: ["general"] },
          { key: "branding", label: "Branding", sections: ["branding"] },
          { key: "contact", label: "Contact", sections: ["contact"] },
          { key: "social", label: "Social links", sections: ["socials"] },
          { key: "homepage", label: "Homepage stats", sections: ["stats", "trust"] },
          { key: "email", label: "Email", sections: ["email"] },
          { key: "security", label: "Security", sections: ["security"] },
        ]}
      />
    </>
  );
}
