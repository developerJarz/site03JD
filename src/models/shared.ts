import { Schema, model, models, type Model } from "mongoose";

export const ImageSchema = new Schema(
  {
    src: { type: String, required: true, trim: true },
    alt: { type: String, default: "", trim: true },
    width: Number,
    height: Number,
  },
  { _id: false },
);

export const SeoSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 320 },
    canonical: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    noindex: { type: Boolean, default: false },
  },
  { _id: false },
);

export const TitledItemSchema = new Schema(
  { title: { type: String, required: true }, description: { type: String, default: "" } },
  { _id: false },
);

export const StatSchema = new Schema({ value: String, label: String }, { _id: false });

export const FaqItemSchema = new Schema({ question: String, answer: String }, { _id: false });

/** Registers a model once (safe across hot reloads). */
// The cast keeps TypeScript from inferring through Mongoose's deep model generics,
// which otherwise exhausts the compiler's memory.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineModel<T>(name: string, schema: Schema<any>): Model<T> {
  return (models[name] ?? model(name, schema)) as unknown as Model<T>;
}

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const ROLES = ["ADMIN", "EDITOR", "USER"] as const;
export type Role = (typeof ROLES)[number];
