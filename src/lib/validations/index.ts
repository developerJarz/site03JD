import { z } from "zod";
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
