import { z } from "zod";
import { COUPON_CODE_PATTERN, normalizeCouponCode } from "@/lib/ecommerce-builder/coupons";
import { BUDGET_OPTIONS, PROJECT_TYPE_OPTIONS, TIMELINE_OPTIONS } from "@/config/forms";

/**
 * Centralised validation schemas. Imported by client forms for instant
 * feedback and re-run on the server — the server result is authoritative.
 */

const trimmed = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`);
const optionalText = (max: number) => trimmed(max).optional().or(z.literal("").transform(() => undefined));

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(254));

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Use 128 characters or fewer")
  .refine((v) => /[a-z]/i.test(v) && /\d/.test(v), "Include at least one letter and one number");

const phoneSchema = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === "" || /^[+()\d\s.-]{6,}$/.test(v), "Enter a valid phone number")
  .optional();

/* --------------------------------- Auth --------------------------------- */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
  next: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: trimmed(120).min(2, "Enter your full name"),
    email: emailSchema,
    company: optionalText(120),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.literal("on", { error: "Please accept the terms to continue" }),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const forgotPasswordSchema = z.object({ email: emailSchema });

/** 6-digit email code; spaces are ignored so pasted "123 456" works. */
export const otpCodeSchema = z
  .string()
  .transform((v) => v.replace(/\s/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"));

export const verifyEmailSchema = z.object({ email: emailSchema, code: otpCodeSchema });

export const resendCodeSchema = z.object({ email: emailSchema, purpose: z.enum(["register", "reset"]) });

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    code: otpCodeSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const profileSchema = z.object({
  name: trimmed(120).min(2, "Enter your full name"),
  company: optionalText(120),
  phone: phoneSchema,
  title: optionalText(120),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  productUpdates: z.boolean(),
});

/* ------------------------------- Leads ---------------------------------- */

export const contactSchema = z.object({
  name: trimmed(120).min(2, "Enter your name"),
  email: emailSchema,
  phone: phoneSchema,
  company: optionalText(160),
  service: optionalText(80),
  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal("").transform(() => undefined)),
  projectType: z.enum(PROJECT_TYPE_OPTIONS).optional().or(z.literal("").transform(() => undefined)),
  timeline: z.enum(TIMELINE_OPTIONS).optional().or(z.literal("").transform(() => undefined)),
  message: trimmed(5000).min(10, "Tell us a little more (at least 10 characters)"),
  source: optionalText(60),
  pagePath: optionalText(300),
  // Spam protection: honeypot must stay empty; form must not be submitted instantly.
  website: z.string().max(0, "Spam detected").optional(),
  startedAt: z.coerce.number().optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** "Analyze your business in detail" request from the calculator video guide. */
export const businessAnalysisSchema = z.object({
  name: trimmed(120).min(2, "Enter your name"),
  businessName: trimmed(160).min(2, "Enter your business name"),
  phone: z.string().trim().max(40).refine((v) => /^[+()\d\s.-]{6,}$/.test(v), "Enter a valid phone number"),
  address: optionalText(300),
  websiteUrl: optionalText(300).refine((v) => !v || /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i.test(v), "Enter a web address like yourbusiness.com"),
  pagePath: optionalText(300),
  website: z.string().max(0, "Spam detected").optional(),
  startedAt: z.coerce.number().optional(),
});
export type BusinessAnalysisInput = z.infer<typeof businessAnalysisSchema>;

/**
 * E-commerce builder order request. Business category and contact method
 * are checked against the admin-managed lists on the server.
 */
export const builderOrderSchema = z.object({
  name: trimmed(120).min(2, "Enter your full name"),
  phone: z.string().trim().max(40).refine((v) => /^[+()\d\s.-]{6,}$/.test(v), "Enter a valid phone or WhatsApp number"),
  email: emailSchema,
  businessName: optionalText(160),
  businessCategory: z.string({ error: "Choose your business category" }).trim().min(1, "Choose your business category").max(80),
  domain: optionalText(160),
  requirements: optionalText(5000),
  contactMethod: z.string({ error: "Choose how we should contact you" }).trim().min(1, "Choose how we should contact you").max(40),
  terms: z.literal("on", { error: "Please accept the terms to continue" }),
  selection: z.string().max(20_000),
  quoteToken: z.string().max(128).optional(),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9-]{16,80}$/, "Please refresh the page and try again"),
  website: z.string().max(0, "Spam detected").optional(),
  startedAt: z.coerce.number().optional(),
});
export type BuilderOrderInput = z.infer<typeof builderOrderSchema>;

/** A selection posted by the builder. Only ids and quantities — never prices. */
export const builderSelectionSchema = z.object({
  templateId: z.string().max(80).nullable(),
  couponCode: z.string().trim().max(40).transform(normalizeCouponCode).refine((v) => !v || COUPON_CODE_PATTERN.test(v), "Enter a valid coupon code").optional(),
  features: z.record(z.string().max(80), z.number().int().min(0).max(1000)).refine((r) => Object.keys(r).length <= 200, "Too many features"),
  omitted: z.array(z.string().max(80)).max(200).default([]),
  customDesign: z.object({ storeType: z.string().max(80), referenceUrl: z.string().max(300).optional() }).optional(),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  website: z.string().max(0).optional(),
});

/* --------------------------- Client dashboard --------------------------- */

export const projectRequestSchema = z.object({
  title: trimmed(160).min(4, "Give your project a short title"),
  service: optionalText(80),
  description: trimmed(5000).min(20, "Describe the project in at least 20 characters"),
  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal("").transform(() => undefined)),
  timeline: z.enum(TIMELINE_OPTIONS).optional().or(z.literal("").transform(() => undefined)),
  website: optionalText(300),
});

export const messageSchema = z.object({
  requestId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid request"),
  body: trimmed(4000).min(1, "Write a message"),
});

/* ------------------------------ Utilities ------------------------------- */

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");
