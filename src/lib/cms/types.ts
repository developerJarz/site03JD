/**
 * Schema-driven CMS definitions. These are plain, serialisable objects so the
 * same definition powers the admin list, the editor form (client) and
 * validation/persistence (server).
 */

export type ResourceKey = "posts" | "pages" | "categories" | "tags" | "services" | "projects" | "industries" | "team" | "testimonials" | "faqs";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "slug"
  | "url"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "icon"
  | "relation"
  | "image"
  | "gallery"
  | "list"
  | "repeater"
  | "seo";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  max?: number;
  min?: number;
  rows?: number;
  /** slug: field to generate the slug from */
  from?: string;
  options?: { value: string; label: string }[];
  /** relation target */
  resource?: ResourceKey;
  multiple?: boolean;
  /** relation: restrict options, e.g. { kind: "post" } for categories */
  where?: Record<string, string>;
  /** repeater item fields */
  fields?: FieldDef[];
  itemLabel?: string;
  width?: "full" | "half";
}

export interface SectionDef {
  title: string;
  description?: string;
  /** Render in the editor's right-hand column */
  aside?: boolean;
  fields: FieldDef[];
}

export type ColumnType = "title" | "text" | "status" | "date" | "image" | "relation" | "boolean" | "number" | "tags";

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
}

export interface ResourceDef {
  key: ResourceKey;
  label: string;
  singular: string;
  group: string;
  description: string;
  titleField: string;
  sections: SectionDef[];
  columns: ColumnDef[];
  searchFields: string[];
  defaultSort: Record<string, 1 | -1>;
  /** Draft / publish workflow */
  publish?: { field: "status" | "published"; draft: string | boolean; live: string | boolean };
  /** Public URL pattern, e.g. "/blog/:slug" */
  publicPath?: string;
  /** Filters shown above the list */
  filters?: { field: string; label: string; options: { value: string; label: string }[] }[];
}
