"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { logActivity } from "@/lib/activity";
import { AuthError, assertPermission, getRequestMeta } from "@/lib/auth/session";
import { MODELS, RESOURCE_TAGS, buildSchema, normalizeForSave, publicUrl, unflatten } from "@/lib/cms/server";
import { RESOURCES, isResourceKey } from "@/lib/cms/resources";
import { connectDB } from "@/lib/db/connect";
import type { ActionResult } from "./types";

type Intent = "save" | "draft" | "publish";

/** Refreshes cached public pages that depend on this resource. */
function refreshPublic(key: keyof typeof RESOURCE_TAGS) {
  for (const tag of RESOURCE_TAGS[key]) revalidateTag(tag, { expire: 0 });
  revalidatePath("/", "layout");
}

function zodErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = i.path.map(String).join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

export async function saveResourceAction(
  key: string,
  id: string | null,
  values: Record<string, unknown>,
  intent: Intent = "save",
): Promise<ActionResult<{ id: string; slug?: string }>> {
  try {
    if (!isResourceKey(key)) return { ok: false, error: "Unknown content type." };
    if (id && !/^[a-f0-9]{24}$/.test(id)) return { ok: false, error: "Invalid id." };
    const user = await assertPermission("content:manage");
    const def = RESOURCES[key];
    const model = MODELS[key];

    const parsed = buildSchema(def).safeParse(values);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: zodErrors(parsed.error.issues) };
    const data = normalizeForSave(def, parsed.data as Record<string, unknown>);

    if (def.publish && intent !== "save") {
      data[def.publish.field] = intent === "publish" ? def.publish.live : def.publish.draft;
    }
    if (key === "posts" && data.status === "published" && !data.publishedAt) data.publishedAt = new Date();

    await connectDB();
    if (typeof data.slug === "string") {
      if (!data.slug) return { ok: false, error: "A slug is required.", fieldErrors: { slug: "Enter a slug or a title to generate one." } };
      const clash = await model.exists({ slug: data.slug, ...(id ? { _id: { $ne: id } } : {}) });
      if (clash) return { ok: false, error: "That slug is already in use.", fieldErrors: { slug: "Choose a unique slug." } };
    }

    let docId = id;
    let previousSlug: string | undefined;
    if (id) {
      const existing = await model.findById(id).select("slug content").lean<{ slug?: string; content?: string }>();
      if (!existing) return { ok: false, error: "This item no longer exists." };
      previousSlug = existing.slug;
      // "Updated" dates and sitemap lastmod follow real edits to the article, not metadata tweaks.
      if (key === "posts" && typeof data.content === "string" && data.content.trim() !== (existing.content ?? "").trim()) data.contentUpdatedAt = new Date();
      await model.updateOne({ _id: id }, { $set: data }, { runValidators: true });
    } else {
      const created = await model.create({ ...unflatten(data), ...(key === "posts" ? { author: user.id } : {}) });
      docId = String(created._id);
    }

    const label = String(data[def.titleField] ?? data.slug ?? def.singular);
    const verb = intent === "publish" ? "published" : intent === "draft" && id ? "unpublished" : id ? "updated" : "created";
    const { ip } = await getRequestMeta();
    await logActivity({ actor: user, action: `${def.singular.toLowerCase().replace(/\s+/g, "-")}.${verb}`, entityType: key, entityId: docId!, entityLabel: label, ip });

    refreshPublic(key);
    if (previousSlug && previousSlug !== data.slug) {
      const oldUrl = publicUrl(def, { slug: previousSlug });
      if (oldUrl) revalidatePath(oldUrl);
    }

    return { ok: true, message: `${def.singular} ${verb}.`, data: { id: docId!, slug: data.slug as string | undefined } };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error("[cms] save failed", err);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function deleteResourceAction(key: string, id: string): Promise<ActionResult> {
  try {
    if (!isResourceKey(key) || !/^[a-f0-9]{24}$/.test(id)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("content:manage");
    const def = RESOURCES[key];
    await connectDB();
    const doc = await MODELS[key].findByIdAndDelete(id).lean<Record<string, unknown>>();
    if (!doc) return { ok: false, error: "Already deleted." };
    await logActivity({ actor: user, action: `${def.singular.toLowerCase().replace(/\s+/g, "-")}.deleted`, entityType: key, entityId: id, entityLabel: String(doc[def.titleField] ?? "") });
    refreshPublic(key);
    return { ok: true, message: `${def.singular} deleted.` };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error("[cms] delete failed", err);
    return { ok: false, error: "Could not delete. Please try again." };
  }
}

export async function togglePublishAction(key: string, id: string): Promise<ActionResult> {
  try {
    if (!isResourceKey(key) || !/^[a-f0-9]{24}$/.test(id)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("content:manage");
    const def = RESOURCES[key];
    if (!def.publish) return { ok: false, error: "This content type has no publishing workflow." };
    await connectDB();
    const doc = await MODELS[key].findById(id);
    if (!doc) return { ok: false, error: "Not found." };
    const live = doc.get(def.publish.field) === def.publish.live;
    doc.set(def.publish.field, live ? def.publish.draft : def.publish.live);
    if (key === "posts" && !live && !doc.get("publishedAt")) doc.set("publishedAt", new Date());
    await doc.save();
    await logActivity({ actor: user, action: `${def.singular.toLowerCase().replace(/\s+/g, "-")}.${live ? "unpublished" : "published"}`, entityType: key, entityId: id, entityLabel: String(doc.get(def.titleField) ?? "") });
    refreshPublic(key);
    return { ok: true, message: live ? "Moved to draft." : "Published." };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    return { ok: false, error: "Could not update status." };
  }
}
