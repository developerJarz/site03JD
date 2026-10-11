import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuilderSettingsEditor } from "@/components/admin/ecommerce-builder/settings-editor";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { toEditorValues } from "@/lib/cms/server";
import type { ResourceDef } from "@/lib/cms/types";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { readBuilderSettings } from "@/lib/ecommerce-builder/server";
import { SETTINGS_SECTIONS, type SettingsSection } from "@/lib/ecommerce-builder/settings";
import { settingsPageDef } from "@/lib/ecommerce-builder/settings-def";
import { BuilderFeature } from "@/models/builder";

const isSection = (s: string): s is SettingsSection => (SETTINGS_SECTIONS as readonly string[]).includes(s);

export async function generateMetadata({ params }: PageProps<"/admin/ecommerce-builder/[section]">): Promise<Metadata> {
  const { section } = await params;
  return { title: isSection(section) ? settingsPageDef(section, []).title : "Not found" };
}

export default async function BuilderSettingsPage({ params }: PageProps<"/admin/ecommerce-builder/[section]">) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  const shell = settingsPageDef(section, []);
  await requirePermission(shell.permission);

  const header = <PageHeader title={shell.title} description={shell.description} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "E-commerce Builder", href: "/admin/ecommerce-builder" }, { label: shell.title }]} />;
  if (!isDbConfigured) {
    return (
      <>
        {header}
        <EmptyState title="Connect a database" description="Set MONGODB_URI to edit builder settings." />
      </>
    );
  }

  await connectDB();
  const featureOptions = section === "pricing" ? (await BuilderFeature.find({ pricing: { $in: ["fixed", "quantity"] } }).select("slug name").sort({ order: 1 }).lean()).map((f) => ({ value: f.slug, label: f.name })) : [];
  const def = settingsPageDef(section, featureOptions);
  const settings = await readBuilderSettings();
  // Reuse the CMS value mapper (dotted paths, empty defaults) with a pseudo resource definition.
  const initial = toEditorValues({ sections: def.sections } as unknown as ResourceDef, settings[section]);

  return (
    <>
      {header}
      <BuilderSettingsEditor key={section} section={section} sections={def.sections} initial={initial} draft={def.draft} />
    </>
  );
}
