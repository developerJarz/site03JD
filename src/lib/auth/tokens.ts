import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { authSecret } from "@/lib/env";

/** 256-bit random token, URL-safe. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Tokens are stored only as keyed hashes. A leaked database therefore cannot
 * be used to forge sessions or reset links without also knowing AUTH_SECRET.
 */
export function hashToken(token: string): string {
  return createHmac("sha256", authSecret).update(token).digest("hex");
}
