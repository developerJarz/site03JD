import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";

/**
 * Server environment, validated once at startup.
 * Never import this module from client components.
 *
 * Only MONGODB_URI is needed to run in production. Every other variable is
 * optional: empty or invalid values fall back to a safe default and log a
 * warning instead of failing the build.
 */

/** Treats "", whitespace and accidentally quoted values as unset. */
function clean(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
  return v === "" ? undefined : v;
}

function resolveSiteUrl(): string {
  const candidates = [clean(process.env.SITE_URL), clean(process.env.VERCEL_PROJECT_PRODUCTION_URL), clean(process.env.VERCEL_URL)];
  for (const c of candidates) {
    if (!c) continue;
    const withProtocol = /^https?:\/\//i.test(c) ? c : `https://${c}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      console.warn(`[env] Ignoring invalid SITE_URL value "${c}".`);
    }
  }
  return "http://localhost:3000";
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).catch("production").default("development"),

  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().default("jarzdigital"),

  AUTH_SECRET: z.string().optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().catch(30).default(30),

  EMAIL_PROVIDER: z.enum(["console", "smtp", "resend", "brevo"]).catch("console").default("console"),
  EMAIL_FROM: z.string().default("Jarz Digital <no-reply@jarzdigital.com>"),
  ADMIN_NOTIFICATION_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().catch(undefined),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional().catch(undefined),
  RESEND_API_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),

  STORAGE_DRIVER: z.enum(["local", "s3", "cloudinary"]).catch("local").default("local"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_MB: z.coerce.number().positive().catch(8).default(8),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  ALLOW_REGISTRATION: z.enum(["true", "false"]).catch("true").default("true"),
});

const raw = Object.fromEntries(Object.keys(schema.shape).map((k) => [k, clean(process.env[k])]));
// Invalid optional values fall back via `.catch()`, so this never throws.
const parsed = schema.parse(raw);

export const env = { ...parsed, SITE_URL: resolveSiteUrl() };

export const isProduction = env.NODE_ENV === "production";

const mongoLooksValid = Boolean(env.MONGODB_URI && /^mongodb(\+srv)?:\/\//.test(env.MONGODB_URI));
if (env.MONGODB_URI && !mongoLooksValid) {
  console.warn("[env] MONGODB_URI must start with mongodb:// or mongodb+srv:// — the database is disabled until it is fixed.");
}
export const isDbConfigured = mongoLooksValid;

/**
 * Pepper for token hashing. Prefer AUTH_SECRET; when it is not set yet, derive
 * a stable secret from the database URI (which is itself secret) so sessions
 * keep working across deployments.
 */
export const authSecret =
  env.AUTH_SECRET ??
  (env.MONGODB_URI ? createHash("sha256").update(`jarz-auth:${env.MONGODB_URI}`).digest("base64url") : "jarz-dev-secret-change-me");

if (isProduction && !env.AUTH_SECRET && process.env.NEXT_PHASE !== "phase-production-build") {
  console.warn("[env] AUTH_SECRET is not set — using a secret derived from MONGODB_URI. Set AUTH_SECRET when convenient.");
}
