import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceEditor } from "@/components/admin/editor/resource-editor";
import { requirePermission } from "@/lib/auth/session";
import { RESOURCES, isResourceKey } from "@/lib/cms/resources";
import { emptyValues, relationOptions } from "@/lib/cms/server";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/new">): Promise<Metadata> {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? `New ${RESOURCES[resource].singular.toLowerCase()}` : "Not found" };
}

export default async function NewResourcePage({ params }: PageProps<"/admin/[resource]/new">) {
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();
  await requirePermission("content:manage");
  const def = RESOURCES[resource];
  return <ResourceEditor def={def} id={null} initial={emptyValues(def)} relations={await relationOptions(def)} liveUrl={null} />;
}
