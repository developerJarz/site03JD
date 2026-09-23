import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once at startup.
 * Never import this module from client components.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.string().url().default("http://localhost:3000"),

  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().default("jarzdigital"),

  AUTH_SECRET: z.string().optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),

  EMAIL_PROVIDER: z.enum(["console", "smtp", "resend", "brevo"]).default("console"),
  EMAIL_FROM: z.string().default("Jarz Digital <no-reply@jarzdigital.com>"),
  ADMIN_NOTIFICATION_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  RESEND_API_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),

  STORAGE_DRIVER: z.enum(["local", "s3", "cloudinary"]).default("local"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(8),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  ALLOW_REGISTRATION: z.enum(["true", "false"]).default("true"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isDbConfigured = Boolean(env.MONGODB_URI);

if (isProduction && !env.AUTH_SECRET && process.env.NEXT_PHASE !== "phase-production-build") {
  console.warn("[env] AUTH_SECRET is not set. Set a long random value in production.");
}

/** Pepper for token hashing. Falls back to a fixed dev value outside production. */
export const authSecret = env.AUTH_SECRET ?? "jarz-dev-secret-change-me";
