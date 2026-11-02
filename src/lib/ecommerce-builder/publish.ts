import "server-only";
import { logActivity } from "@/lib/activity";
import type { SessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { BuilderPricebook } from "@/models/builder";
import { loadDraftPricebook, pricebookHash } from "./server";

export type PublishOutcome =
  | { status: "published"; version: number }
  | { status: "unchanged" }
  | { status: "blocked"; error: string };

type Actor = Pick<SessionUser, "id" | "name" | "role">;

const isDuplicateKey = (err: unknown) => typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;

/**
 * Freezes the current catalog + pricing rules into a new pricebook version.
 * Callers check permissions, pass the request IP and revalidate the builder page.
 */
export async function publishDraftPricebook(actor: Actor, note: string, ip?: string, attempt = 0): Promise<PublishOutcome> {
  await connectDB();
  const { pricebook, issues } = await loadDraftPricebook();
  const errors = issues.filter((i) => i.level === "error");
  if (errors.length) return { status: "blocked", error: `Fix ${errors.length} issue${errors.length > 1 ? "s" : ""} before publishing: ${errors[0].message}` };

  const hash = pricebookHash(pricebook);
  const latest = await BuilderPricebook.findOne().sort({ version: -1 }).select("version hash").lean();
  if (latest?.hash === hash) return { status: "unchanged" };

  const version = (latest?.version ?? 0) + 1;
  try {
    await BuilderPricebook.create({ version, data: { ...pricebook, version }, hash, note: note.trim().slice(0, 300) || undefined, publishedBy: actor.id, publishedByName: actor.name });
  } catch (err) {
    // Another save published the same version number at the same moment — rebuild and try once more.
    if (isDuplicateKey(err) && attempt === 0) return publishDraftPricebook(actor, note, ip, 1);
    throw err;
  }
  await logActivity({ actor: { id: actor.id, name: actor.name, role: actor.role }, action: "ecommerce-pricing.published", entityType: "ecommerce-pricebook", entityId: String(version), entityLabel: `Pricebook v${version}`, meta: { templates: pricebook.templates.length, features: pricebook.features.length }, ip });
  return { status: "published", version };
}
