/**
 * CMS content models: services, projects, industries, team, testimonials,
 * FAQs, blog posts, taxonomy and free-form pages.
 */
import { Schema, type InferSchemaType, type Types } from "mongoose";
import { FaqItemSchema, ImageSchema, SeoSchema, StatSchema, TitledItemSchema, defineModel } from "./shared";

const slug = { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 };

/* ---------------------------------- Taxonomy --------------------------------- */

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug,
    description: { type: String, trim: true, maxlength: 400 },
    kind: { type: String, enum: ["post", "service"], default: "post", index: true },
  },
  { timestamps: true },
);
export type CategoryDoc = InferSchemaType<typeof CategorySchema> & { _id: Types.ObjectId };
export const Category = defineModel<CategoryDoc>("Category", CategorySchema);

const TagSchema = new Schema(
  { name: { type: String, required: true, trim: true, maxlength: 60 }, slug },
  { timestamps: true },
);
export type TagDoc = InferSchemaType<typeof TagSchema> & { _id: Types.ObjectId };
export const Tag = defineModel<TagDoc>("Tag", TagSchema);

/* ---------------------------------- Services --------------------------------- */

const PlanSchema = new Schema(
  {
    name: String,
    audience: String,
    price: String,
    period: String,
    description: String,
    features: [String],
    highlighted: { type: Boolean, default: false },
  },
  { _id: false },
);

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    shortTitle: { type: String, trim: true, maxlength: 60 },
    slug,
    icon: { type: String, default: "sparkles" },
    tagline: { type: String, trim: true, maxlength: 160 },
    summary: { type: String, trim: true, maxlength: 600 },
    heroTitle: { type: String, trim: true, maxlength: 160 },
    heroSubtitle: { type: String, trim: true, maxlength: 600 },
    overview: { type: String, default: "" },
    image: ImageSchema,
    problems: [TitledItemSchema],
    included: [{ title: String, description: String, items: [String], _id: false }],
    benefits: [String],
    process: [TitledItemSchema],
    capabilities: [String],
    plans: [PlanSchema],
    planNote: String,
    startingPrice: String,
    faqs: [FaqItemSchema],
    related: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);
ServiceSchema.index({ published: 1, order: 1 });
ServiceSchema.index({ title: "text", summary: "text", tagline: "text" });
export type ServiceDoc = InferSchemaType<typeof ServiceSchema> & { _id: Types.ObjectId };
export const Service = defineModel<ServiceDoc>("Service", ServiceSchema);

/* --------------------------------- Industries -------------------------------- */

const IndustrySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug,
    headline: { type: String, trim: true, maxlength: 160 },
    icon: { type: String, default: "building-2" },
    intro: { type: String, trim: true, maxlength: 800 },
    challenges: [TitledItemSchema],
    solutions: [TitledItemSchema],
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
    needsReview: { type: Boolean, default: false },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);
IndustrySchema.index({ published: 1, order: 1 });
IndustrySchema.index({ name: "text", intro: "text" });
export type IndustryDoc = InferSchemaType<typeof IndustrySchema> & { _id: Types.ObjectId };
export const Industry = defineModel<IndustryDoc>("Industry", IndustrySchema);

/* ---------------------------------- Projects --------------------------------- */

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug,
    client: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120 },
    industry: { type: Schema.Types.ObjectId, ref: "Industry", index: true },
    services: [{ type: Schema.Types.ObjectId, ref: "Service", index: true }],
    categories: [{ type: String, index: true }],
    summary: { type: String, trim: true, maxlength: 600 },
    description: { type: String, default: "" },
    coverImage: { type: ImageSchema, required: true },
    gallery: [ImageSchema],
    beforeAfter: ImageSchema,
    technologies: [String],
    results: [StatSchema],
    websiteUrl: String,
    year: Number,
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
    needsReview: { type: Boolean, default: false },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);
ProjectSchema.index({ published: 1, featured: -1, order: 1 });
ProjectSchema.index({ title: "text", client: "text", summary: "text" });
export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & { _id: Types.ObjectId };
export const Project = defineModel<ProjectDoc>("Project", ProjectSchema);

/* ------------------------------------ Team ----------------------------------- */

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug,
    role: { type: String, trim: true, maxlength: 120 },
    region: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1200 },
    highlights: [String],
    photo: ImageSchema,
    socials: { linkedin: String, twitter: String, website: String },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);
export type TeamMemberDoc = InferSchemaType<typeof TeamMemberSchema> & { _id: Types.ObjectId };
export const TeamMember = defineModel<TeamMemberDoc>("TeamMember", TeamMemberSchema);

/* -------------------------------- Testimonials ------------------------------- */

const TestimonialSchema = new Schema(
  {
    author: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    quote: { type: String, required: true, trim: true, maxlength: 1200 },
    rating: { type: Number, min: 1, max: 5 },
    avatar: ImageSchema,
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);
export type TestimonialDoc = InferSchemaType<typeof TestimonialSchema> & { _id: Types.ObjectId };
export const Testimonial = defineModel<TestimonialDoc>("Testimonial", TestimonialSchema);

/* ------------------------------------ FAQs ----------------------------------- */

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
    group: { type: String, default: "general", index: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);
export type FaqDoc = InferSchemaType<typeof FaqSchema> & { _id: Types.ObjectId };
export const Faq = defineModel<FaqDoc>("Faq", FaqSchema);

/* ------------------------------------ Blog ----------------------------------- */

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug,
    excerpt: { type: String, trim: true, maxlength: 500 },
    content: { type: String, default: "" },
    coverImage: ImageSchema,
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, trim: true, default: "Jarz Digital Team" },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, index: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    legacyUrl: String,
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ title: "text", excerpt: "text" });
export type PostDoc = InferSchemaType<typeof PostSchema> & { _id: Types.ObjectId };
export const Post = defineModel<PostDoc>("Post", PostSchema);

/* ------------------------------------ Pages ---------------------------------- */

const PageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug,
    intro: { type: String, trim: true, maxlength: 600 },
    content: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    needsReview: { type: Boolean, default: false },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);
export type PageDoc = InferSchemaType<typeof PageSchema> & { _id: Types.ObjectId };
export const Page = defineModel<PageDoc>("Page", PageSchema);
