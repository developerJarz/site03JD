import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceEditor } from "@/components/admin/editor/resource-editor";
import { requirePermission } from "@/lib/auth/session";
import { RESOURCES, isResourceKey } from "@/lib/cms/resources";
import { MODELS, publicUrl, relationOptions, toEditorValues } from "@/lib/cms/server";
import { connectDB } from "@/lib/db/connect";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/[id]">): Promise<Metadata> {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? `Edit ${RESOURCES[resource].singular.toLowerCase()}` : "Not found" };
}

export default async function EditResourcePage({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource, id } = await params;
  if (!isResourceKey(resource) || !/^[a-f0-9]{24}$/.test(id)) notFound();
  await requirePermission("content:manage");
  const def = RESOURCES[resource];
  await connectDB();
  const doc = await MODELS[resource].findById(id).lean<Record<string, unknown>>();
  if (!doc) notFound();
  const values = toEditorValues(def, doc);
  if (def.publish) values[def.publish.field] = doc[def.publish.field];
  return <ResourceEditor key={id} def={def} id={id} initial={values} relations={await relationOptions(def)} liveUrl={publicUrl(def, doc as { slug?: string })} />;
}
