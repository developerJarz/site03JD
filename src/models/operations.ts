/**
 * Operational models: leads, project requests, messages, media,
 * notifications, activity logs, newsletter subscribers and site settings.
 */
import { Schema, type InferSchemaType, type Types } from "mongoose";
import { LEAD_STATUSES, defineModel } from "./shared";

/* ------------------------------------ Leads ---------------------------------- */

const NoteSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: String,
    body: { type: String, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const LeadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40 },
    company: { type: String, trim: true, maxlength: 160 },
    service: { type: Schema.Types.ObjectId, ref: "Service", index: true },
    serviceName: { type: String, trim: true, maxlength: 120 },
    budget: { type: String, trim: true, maxlength: 60 },
    projectType: { type: String, trim: true, maxlength: 120 },
    timeline: { type: String, trim: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    source: { type: String, default: "contact-form", maxlength: 60 },
    pagePath: { type: String, maxlength: 300 },
    status: { type: String, enum: LEAD_STATUSES, default: "NEW", index: true },
    notes: [NoteSchema],
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 400 },
  },
  { timestamps: true },
);
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ email: 1, createdAt: -1 });
LeadSchema.index({ name: "text", email: "text", company: "text", message: "text" });
export type LeadDoc = InferSchemaType<typeof LeadSchema> & { _id: Types.ObjectId };
export const Lead = defineModel<LeadDoc>("Lead", LeadSchema);

/* ------------------------------ Project requests ----------------------------- */

const ProjectRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    serviceName: String,
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    budget: { type: String, trim: true, maxlength: 60 },
    timeline: { type: String, trim: true, maxlength: 60 },
    website: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: LEAD_STATUSES, default: "NEW", index: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    notes: [NoteSchema],
    lastMessageAt: Date,
  },
  { timestamps: true },
);
ProjectRequestSchema.index({ createdAt: -1 });
export type ProjectRequestDoc = InferSchemaType<typeof ProjectRequestSchema> & { _id: Types.ObjectId };
export const ProjectRequest = defineModel<ProjectRequestDoc>("ProjectRequest", ProjectRequestSchema);

const MessageSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "ProjectRequest", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: String,
    fromStaff: { type: Boolean, default: false },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    readByClient: { type: Boolean, default: false },
    readByStaff: { type: Boolean, default: false },
  },
  { timestamps: true },
);
MessageSchema.index({ request: 1, createdAt: 1 });
export type MessageDoc = InferSchemaType<typeof MessageSchema> & { _id: Types.ObjectId };
export const Message = defineModel<MessageDoc>("Message", MessageSchema);

/* ------------------------------------ Media ---------------------------------- */

const MediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, maxlength: 255 },
    url: { type: String, required: true },
    key: { type: String, required: true },
    storage: { type: String, enum: ["local", "s3", "cloudinary"], default: "local" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    alt: { type: String, default: "", maxlength: 300 },
    folder: { type: String, default: "general", index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ originalName: "text", alt: "text" });
export type MediaDoc = InferSchemaType<typeof MediaSchema> & { _id: Types.ObjectId };
export const Media = defineModel<MediaDoc>("Media", MediaSchema);

/* -------------------------------- Notifications ------------------------------ */

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["lead", "user", "request", "message", "system", "admin"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, maxlength: 600 },
    href: String,
    /** "staff" notifications are shared by all admins/editors; otherwise targeted. */
    audience: { type: String, enum: ["staff", "user"], default: "staff", index: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", index: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);
NotificationSchema.index({ createdAt: -1 });
// Keep the inbox bounded: notifications expire after 180 days.
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
export type NotificationDoc = InferSchemaType<typeof NotificationSchema> & { _id: Types.ObjectId };
export const Notification = defineModel<NotificationDoc>("Notification", NotificationSchema);

/* -------------------------------- Activity log ------------------------------- */

const ActivityLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorName: String,
    actorRole: String,
    action: { type: String, required: true, index: true },
    entityType: { type: String, index: true },
    entityId: String,
    entityLabel: String,
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
ActivityLogSchema.index({ createdAt: -1 });
export type ActivityLogDoc = InferSchemaType<typeof ActivityLogSchema> & { _id: Types.ObjectId };
export const ActivityLog = defineModel<ActivityLogDoc>("ActivityLog", ActivityLogSchema);

/* ---------------------------------- Newsletter ------------------------------- */

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    status: { type: String, enum: ["subscribed", "unsubscribed"], default: "subscribed" },
  },
  { timestamps: true },
);
export type SubscriberDoc = InferSchemaType<typeof SubscriberSchema> & { _id: Types.ObjectId };
export const Subscriber = defineModel<SubscriberDoc>("Subscriber", SubscriberSchema);

/* --------------------------------- Site settings ----------------------------- */

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);
export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema> & { _id: Types.ObjectId };
export const SiteSettingsModel = defineModel<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
