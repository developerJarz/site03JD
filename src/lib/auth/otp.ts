import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { OTP_LENGTH, OTP_TTL_MINUTES, RESEND_COOLDOWN_SECONDS } from "@/config/otp";
import { authSecret } from "@/lib/env";
import { EmailOtp, type EmailOtpDoc, type OtpPurpose } from "@/models/Session";

/**
 * Email one-time codes (6 digits).
 *
 * - Codes expire after OTP_TTL_MINUTES and lock after MAX_ATTEMPTS wrong tries.
 * - A new code can be requested once per RESEND_COOLDOWN_SECONDS.
 * - Only an HMAC of the code (bound to email + purpose) is stored.
 */
export { OTP_TTL_MINUTES };
const MAX_ATTEMPTS = 5;
const RECORD_TTL_MS = 24 * 60 * 60_000;

type Pending = { name: string; company?: string; passwordHash: string };

function hashCode(purpose: OtpPurpose, email: string, code: string): string {
  return createHmac("sha256", authSecret).update(`otp:${purpose}:${email}:${code}`).digest("hex");
}

export type IssueResult = { ok: true; code: string } | { ok: false; retryAfterSeconds: number };

/**
 * Creates a fresh code for (email, purpose), replacing any earlier one.
 * During the resend cooldown no new code is sent, but updated sign-up
 * details are still saved against the code already sent.
 */
export async function issueOtp(email: string, purpose: OtpPurpose, pending?: Pending): Promise<IssueResult> {
  const existing = await EmailOtp.findOne({ email, purpose }).select("sentAt").lean();
  if (existing) {
    const wait = Math.ceil((existing.sentAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
    if (wait > 0) {
      if (pending) await EmailOtp.updateOne({ email, purpose }, { $set: { pending } });
      return { ok: false, retryAfterSeconds: wait };
    }
  }

  const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
  const now = Date.now();
  await EmailOtp.updateOne(
    { email, purpose },
    {
      $set: {
        codeHash: hashCode(purpose, email, code),
        codeExpiresAt: new Date(now + OTP_TTL_MINUTES * 60_000),
        attempts: 0,
        sentAt: new Date(now),
        expiresAt: new Date(now + RECORD_TTL_MS),
        ...(pending ? { pending } : {}),
      },
    },
    { upsert: true },
  );
  return { ok: true, code };
}

/** True when a record exists for (email, purpose) — e.g. a sign-up waiting for verification. */
export async function hasOtpRecord(email: string, purpose: OtpPurpose): Promise<boolean> {
  return Boolean(await EmailOtp.exists({ email, purpose }));
}

export type VerifyResult = { ok: true; record: EmailOtpDoc } | { ok: false; error: string };

/**
 * Checks a code. Every check counts as an attempt (counted atomically, so
 * parallel guesses can't exceed the limit). The record is kept until
 * `consumeOtp` so the caller can finish its work first.
 */
export async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<VerifyResult> {
  const record = await EmailOtp.findOneAndUpdate(
    { email, purpose, attempts: { $lt: MAX_ATTEMPTS }, codeExpiresAt: { $gt: new Date() } },
    { $inc: { attempts: 1 } },
    { new: true },
  ).lean<EmailOtpDoc>();
  if (!record) return { ok: false, error: "This code has expired or was entered wrong too many times. Request a new code." };

  const expected = Buffer.from(record.codeHash, "hex");
  const actual = Buffer.from(hashCode(purpose, email, code), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    const left = MAX_ATTEMPTS - record.attempts;
    return {
      ok: false,
      error: left > 0 ? `That code isn’t right. ${left} ${left === 1 ? "try" : "tries"} left.` : "That code isn’t right. Request a new code to try again.",
    };
  }
  return { ok: true, record };
}

export async function consumeOtp(email: string, purpose: OtpPurpose): Promise<void> {
  await EmailOtp.deleteOne({ email, purpose });
}
