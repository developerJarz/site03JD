/**
 * E-commerce website builder models.
 *
 * Catalog (editable drafts): templates, feature categories, features, settings.
 * Published pricing: immutable, versioned pricebooks.
 * Customer records: quotes, orders and invoices — each stores a full price
 * snapshot, so later catalog or pricing edits never change them.
 *
 * Money fields are integer minor units (cents) of `currency`.
 */
import { Schema, type InferSchemaType, type Types } from "mongoose";
import { ORDER_STATUSES } from "@/lib/ecommerce-builder/constants";
import { FEATURE_PRICING } from "@/lib/ecommerce-builder/types";
import { ImageSchema, defineModel } from "./shared";

const key = { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 };
const cents = { type: Number, min: 0, max: 100_000_000, validate: { validator: (v: unknown) => v == null || Number.isInteger(v), message: "Amounts must be whole cents" } };

/* --------------------------------- Catalog --------------------------------- */

const TemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: key,
    tagline: { type: String, trim: true, maxlength: 160, default: "" },
    description: { type: String, trim: true, maxlength: 600, default: "" },
    categories: [{ type: String, trim: true, maxlength: 60 }],
    demoUrl: { type: String, trim: true, maxlength: 500, default: "" },
    referenceUrl: { type: String, trim: true, maxlength: 500, default: "" },
    desktopImage: ImageSchema,
    mobileImage: ImageSchema,
    price: { ...cents, required: true, default: 10000 },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "builder_templates" },
);
export type BuilderTemplateDoc = InferSchemaType<typeof TemplateSchema> & { _id: Types.ObjectId };
export const BuilderTemplate = defineModel<BuilderTemplateDoc>("BuilderTemplate", TemplateSchema);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: key,
    description: { type: String, trim: true, maxlength: 300, default: "" },
    icon: { type: String, default: "sparkles" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "builder_feature_categories" },
);
export type BuilderCategoryDoc = InferSchemaType<typeof CategorySchema> & { _id: Types.ObjectId };
export const BuilderCategory = defineModel<BuilderCategoryDoc>("BuilderCategory", CategorySchema);

const FeatureSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    /** Stable feature id used by quotes, orders and discount rules. */
    slug: key,
    category: { type: Schema.Types.ObjectId, ref: "BuilderCategory", index: true },
    summary: { type: String, trim: true, maxlength: 400, default: "" },
    details: { type: String, trim: true, maxlength: 3000, default: "" },
    icon: { type: String, default: "sparkles" },
    image: ImageSchema,
    pricing: { type: String, enum: FEATURE_PRICING, required: true, default: "fixed" },
    mandatory: { type: Boolean, default: false },
    price: { ...cents, default: 0 },
    unitLabel: { type: String, trim: true, maxlength: 40, default: "" },
    minQty: { type: Number, min: 0, max: 1000, default: 1 },
    maxQty: { type: Number, min: 1, max: 1000, default: 1 },
    requires: [{ type: Schema.Types.ObjectId, ref: "BuilderFeature" }],
    recurringAmount: { ...cents, default: null },
    recurringInterval: { type: String, enum: ["month", "year"], default: "month" },
    recurringNote: { type: String, trim: true, maxlength: 300, default: "" },
    popular: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "builder_features" },
);
FeatureSchema.index({ category: 1, order: 1 });
export type BuilderFeatureDoc = InferSchemaType<typeof FeatureSchema> & { _id: Types.ObjectId };
export const BuilderFeature = defineModel<BuilderFeatureDoc>("BuilderFeature", FeatureSchema);

/** Builder content, SEO, form, general settings and draft pricing rules. */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: "ecommerce", unique: true },
    data: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true, minimize: false, collection: "builder_settings" },
);
export type BuilderSettingsDoc = InferSchemaType<typeof SettingsSchema> & { _id: Types.ObjectId };
export const BuilderSettingsModel = defineModel<BuilderSettingsDoc>("BuilderSettings", SettingsSchema);

/* --------------------------------- Pricebooks -------------------------------- */

const PricebookSchema = new Schema(
  {
    version: { type: Number, required: true, unique: true },
    /** The full Pricebook object (templates, categories, features, rules). */
    data: { type: Schema.Types.Mixed, required: true },
    hash: { type: String, required: true },
    note: { type: String, maxlength: 300 },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedByName: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false, collection: "builder_pricebooks" },
);
export type BuilderPricebookDoc = InferSchemaType<typeof PricebookSchema> & { _id: Types.ObjectId; createdAt: Date };
export const BuilderPricebook = defineModel<BuilderPricebookDoc>("BuilderPricebook", PricebookSchema);

/* ---------------------------------- Counters --------------------------------- */

const CounterSchema = new Schema({ _id: { type: String, required: true }, seq: { type: Number, default: 0 } }, { collection: "builder_counters", versionKey: false });
export const BuilderCounter = defineModel<{ _id: string; seq: number }>("BuilderCounter", CounterSchema);

/* ----------------------------------- Quotes ---------------------------------- */

const CustomerSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 40 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    businessName: { type: String, trim: true, maxlength: 160 },
    businessCategory: { type: String, trim: true, maxlength: 80 },
    domain: { type: String, trim: true, maxlength: 160 },
    requirements: { type: String, trim: true, maxlength: 5000 },
    contactMethod: { type: String, trim: true, maxlength: 40 },
  },
  { _id: false },
);

const QuoteSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    /** HMAC of the customer's link token; the token itself is never stored. */
    tokenHash: { type: String, required: true, unique: true },
    pricebookVersion: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    selection: { type: Schema.Types.Mixed, required: true },
    selectionKey: { type: String, required: true, index: true },
    /** Immutable QuoteBreakdown snapshot. */
    breakdown: { type: Schema.Types.Mixed, required: true },
    /** Payment terms and disclaimer as they were when the quote was issued. */
    terms: { paymentTerms: String, disclaimer: String },
    total: { ...cents, required: true },
    templateId: { type: String, index: true },
    validUntil: { type: Date, required: true },
    customer: CustomerSchema,
    order: { type: Schema.Types.ObjectId, ref: "BuilderOrder", default: null, index: true },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 400 },
  },
  { timestamps: true, minimize: false, collection: "builder_quotes" },
);
QuoteSchema.index({ createdAt: -1 });
export type BuilderQuoteDoc = InferSchemaType<typeof QuoteSchema> & { _id: Types.ObjectId; createdAt: Date };
export const BuilderQuote = defineModel<BuilderQuoteDoc>("BuilderQuote", QuoteSchema);

/* ----------------------------------- Orders ---------------------------------- */

const NoteSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: String,
    body: { type: String, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const PaymentSchema = new Schema(
  {
    amount: { ...cents, required: true },
    method: { type: String, maxlength: 40 },
    reference: { type: String, maxlength: 120 },
    note: { type: String, maxlength: 300 },
    receivedAt: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
    recordedByName: String,
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

const OrderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    quote: { type: Schema.Types.ObjectId, ref: "BuilderQuote", required: true, unique: true },
    quoteNumber: { type: String, required: true },
    /** Client-generated key: a retried submission returns the original order. */
    idempotencyKey: { type: String, required: true, unique: true, maxlength: 80 },
    customer: { type: CustomerSchema, required: true },
    pricebookVersion: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    breakdown: { type: Schema.Types.Mixed, required: true },
    templateId: { type: String, index: true },
    templateName: String,
    featureIds: [{ type: String }],
    total: { ...cents, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "new", index: true },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, byName: String, _id: false }],
    notes: [NoteSchema],
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    payments: [PaymentSchema],
    amountPaid: { ...cents, default: 0 },
    termsAcceptedAt: { type: Date, required: true },
    source: { type: String, default: "ecommerce-builder" },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 400 },
  },
  { timestamps: true, minimize: false, collection: "builder_orders" },
);
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ featureIds: 1 });
export type BuilderOrderDoc = InferSchemaType<typeof OrderSchema> & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };
export const BuilderOrder = defineModel<BuilderOrderDoc>("BuilderOrder", OrderSchema);

/* ---------------------------------- Invoices --------------------------------- */

const InvoiceSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: "BuilderOrder", required: true, index: true },
    orderNumber: String,
    tokenHash: { type: String, required: true, unique: true },
    customer: CustomerSchema,
    currency: { type: String, default: "USD" },
    breakdown: { type: Schema.Types.Mixed, required: true },
    total: { ...cents, required: true },
    issuedAt: { type: Date, default: Date.now },
    dueAt: Date,
    paymentTerms: String,
    status: { type: String, enum: ["issued", "void"], default: "issued", index: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
    issuedByName: String,
  },
  { timestamps: true, minimize: false, collection: "builder_invoices" },
);
export type BuilderInvoiceDoc = InferSchemaType<typeof InvoiceSchema> & { _id: Types.ObjectId; createdAt: Date };
export const BuilderInvoice = defineModel<BuilderInvoiceDoc>("BuilderInvoice", InvoiceSchema);
