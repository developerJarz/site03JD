/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import type { Model } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { TAGS } from "@/lib/data/cache-tags";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { escapeRegex, readingTime, serialize, slugify } from "@/lib/utils";
import { Category, Faq, Industry, Page, Post, Project, Service, Tag, TeamMember, Testimonial } from "@/models/content";
import { RESOURCES, allFields } from "./resources";
import type { FieldDef, ResourceDef, ResourceKey } from "./types";

type AnyModel = Model<any>;

export const MODELS: Record<ResourceKey, AnyModel> = {
  posts: Post as AnyModel,
  pages: Page as AnyModel,
  categories: Category as AnyModel,
  tags: Tag as AnyModel,
  services: Service as AnyModel,
  projects: Project as AnyModel,
  industries: Industry as AnyModel,
  team: TeamMember as AnyModel,
  testimonials: Testimonial as AnyModel,
  faqs: Faq as AnyModel,
};

/** Public cache tags to refresh when a resource changes. */
export const RESOURCE_TAGS: Record<ResourceKey, string[]> = {
  posts: [TAGS.posts],
  pages: [TAGS.pages],
  categories: [TAGS.taxonomy, TAGS.posts, TAGS.services],
  tags: [TAGS.taxonomy, TAGS.posts],
  services: [TAGS.services, TAGS.industries, TAGS.projects],
  projects: [TAGS.projects],
  industries: [TAGS.industries, TAGS.projects],
  team: [TAGS.team],
  testimonials: [TAGS.testimonials],
  faqs: [TAGS.faqs],
};

/* ------------------------------- Path helpers ------------------------------ */

export function getPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

export function unflatten(values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(values)) {
    const parts = key.split(".");
    let cur = out;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) cur[p] = value;
      else cur = cur[p] ??= {};
    });
  }
  return out;
}

/* ------------------------------ Schema builder ----------------------------- */

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid reference");
const optionalString = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().default("");

const imageSchema = z
  .object({
    src: z.string().trim().min(1, "Choose an image").max(1000),
    alt: z.string().trim().max(300).optional().default(""),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .nullable();

const seoSchema = z
  .object({
    title: optionalString(120),
    description: optionalString(320),
    canonical: z
      .string()
      .trim()
      .max(500)
      .optional()
      .default("")
      .refine((v) => v === "" || /^https?:\/\//.test(v), "Canonical URL must be absolute (https://…)"),
    ogImage: optionalString(1000),
    noindex: z.boolean().optional().default(false),
  })
  .partial()
  .default({});

function fieldSchema(f: FieldDef): z.ZodTypeAny {
  const req = (s: z.ZodString) => (f.required ? s.min(1, `${f.label} is required`) : s);
  switch (f.type) {
    case "text":
    case "textarea":
    case "icon":
      return req(z.string().trim().max(f.max ?? 20000, `Must be ${f.max} characters or fewer`)).optional().default("");
    case "richtext":
      return z.string().max(600_000, "Content is too long").optional().default("");
    case "slug":
      return z
        .string()
        .trim()
        .max(120)
        .optional()
        .default("")
        .refine((v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), "Use lowercase letters, numbers and hyphens only");
    case "url":
      return z
        .string()
        .trim()
        .max(500)
        .optional()
        .default("")
        .refine((v) => v === "" || /^https?:\/\/[^\s]+$/.test(v), "Enter a full URL starting with https://");
    case "number":
      return z.preprocess(
        (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
        z
          .number({ error: `${f.label} must be a number` })
          .min(f.min ?? -Infinity, `Minimum is ${f.min}`)
          .max(f.max ?? Infinity, `Maximum is ${f.max}`)
          .nullable(),
      );
    case "boolean":
      return z.boolean().optional().default(false);
    case "date":
      return z.preprocess(
        (v) => (v ? new Date(v as string) : null),
        z.date({ error: "Enter a valid date" }).nullable().refine((d) => d === null || !Number.isNaN(d.getTime()), "Enter a valid date"),
      );
    case "select": {
      const values = (f.options ?? []).map((o) => o.value) as [string, ...string[]];
      if (f.multiple) return z.array(z.enum(values)).optional().default([]);
      return f.required ? z.enum(values, { error: `Choose a ${f.label.toLowerCase()}` }) : z.union([z.enum(values), z.literal("")]).optional().default("");
    }
    case "relation":
      return f.multiple ? z.array(objectId).max(100).optional().default([]) : z.union([objectId, z.literal(""), z.null()]).optional().default(null);
    case "image":
      return f.required ? imageSchema.refine((v) => v !== null, `${f.label} is required`) : imageSchema.optional().default(null);
    case "gallery":
      return z.array(imageSchema.unwrap()).max(60).optional().default([]);
    case "list":
      return z
        .array(z.string().trim().max(600))
        .max(100)
        .optional()
        .default([])
        .transform((a) => a.filter(Boolean));
    case "repeater":
      return z.array(z.object(Object.fromEntries((f.fields ?? []).map((sf) => [sf.name, fieldSchema(sf)])))).max(50).optional().default([]);
    case "seo":
      return seoSchema;
  }
}

export function buildSchema(def: ResourceDef) {
  return z.object(Object.fromEntries(allFields(def).map((f) => [f.name, fieldSchema(f)])));
}

/* ------------------------------- Normalising ------------------------------- */

/** Converts validated editor values into what gets persisted. */
export function normalizeForSave(def: ResourceDef, values: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = { ...values };
  for (const f of allFields(def)) {
    const v = out[f.name];
    if (f.type === "relation" && !f.multiple) out[f.name] = v || null;
    if (f.type === "richtext") out[f.name] = sanitizeRichText(v ?? "");
    if (f.type === "slug") {
      out[f.name] = v || slugify(String(values[f.from ?? def.titleField] ?? ""));
    }
    if (f.type === "select" && !f.multiple && v === "") out[f.name] = undefined;
  }
  if (def.key === "posts") {
    out.readingTime = readingTime(out.content ?? "");
  }
  return out;
}

/** Converts a stored document into flat editor values (ids → strings, dates → ISO). */
export function toEditorValues(def: ResourceDef, doc: any): Record<string, unknown> {
  const plain = serialize<Record<string, any>>(doc ?? {});
  const values: Record<string, unknown> = {};
  for (const f of allFields(def)) {
    let v = getPath(plain, f.name);
    if (f.type === "relation") v = f.multiple ? (v ?? []).map(String) : v ? String(v) : "";
    if (f.type === "date") v = v ? String(v).slice(0, 16) : "";
    if (f.type === "boolean") v = Boolean(v);
    if (f.type === "list" || f.type === "gallery" || f.type === "repeater" || (f.type === "select" && f.multiple)) v = v ?? [];
    if (f.type === "image") v = v && v.src ? v : null;
    if (f.type === "seo") v = v ?? {};
    if (v === undefined || v === null) v = f.type === "number" ? "" : f.type === "image" ? null : "";
    values[f.name] = v;
  }
  return values;
}

export function emptyValues(def: ResourceDef): Record<string, unknown> {
  const values = toEditorValues(def, {});
  if (def.key === "faqs") values.group = "general";
  if (def.key === "categories") values.kind = "post";
  if (def.key === "posts") values.authorName = "Jarz Digital Team";
  return values;
}

/* --------------------------------- Listing --------------------------------- */

export interface ListParams {
  q?: string;
  page?: number;
  perPage?: number;
  filters?: Record<string, string>;
}

export async function listResource(key: ResourceKey, { q, page = 1, perPage = 20, filters = {} }: ListParams) {
  await connectDB();
  const def = RESOURCES[key];
  const model = MODELS[key];
  const query: Record<string, any> = {};
  if (q) {
    const re = new RegExp(escapeRegex(q.slice(0, 80)), "i");
    query.$or = def.searchFields.map((f) => ({ [f]: re }));
  }
  for (const filter of def.filters ?? []) {
    const value = filters[filter.field];
    if (value && filter.options.some((o) => o.value === value)) query[filter.field] = value;
  }
  if (def.publish && filters.state) {
    if (filters.state === "live") query[def.publish.field] = def.publish.live;
    if (filters.state === "draft") query[def.publish.field] = def.publish.draft;
  }

  const relationCols = def.columns.filter((c) => c.type === "relation").map((c) => c.key);
  let cursor = model.find(query).sort(def.defaultSort).skip((page - 1) * perPage).limit(perPage);
  for (const rel of relationCols) cursor = cursor.populate(rel, "name title slug");
  const [rows, total] = await Promise.all([cursor.lean(), model.countDocuments(query)]);
  return { rows: serialize<Record<string, any>[]>(rows), total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Options for every relation field in a resource form. */
export async function relationOptions(def: ResourceDef): Promise<Record<string, { value: string; label: string }[]>> {
  await connectDB();
  const out: Record<string, { value: string; label: string }[]> = {};
  const relFields = allFields(def).filter((f) => f.type === "relation" && f.resource);
  await Promise.all(
    relFields.map(async (f) => {
      const target = RESOURCES[f.resource!];
      const docs = await MODELS[f.resource!]
        .find(f.where ?? {})
        .select(`${target.titleField} slug`)
        .sort({ [target.titleField]: 1 })
        .limit(500)
        .lean();
      out[f.name] = docs.map((d: any) => ({ value: String(d._id), label: String(d[target.titleField] ?? d.slug) }));
    }),
  );
  return out;
}

export function publicUrl(def: ResourceDef, doc: { slug?: string }): string | null {
  if (!def.publicPath || !doc.slug) return null;
  return def.publicPath.replace(":slug", doc.slug);
}
