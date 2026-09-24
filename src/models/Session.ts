import { Schema, type InferSchemaType, type Types } from "mongoose";
import { defineModel } from "./shared";

const SessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    userAgent: { type: String, maxlength: 400 },
    ip: { type: String, maxlength: 64 },
  },
  { timestamps: true },
);

// MongoDB removes expired sessions automatically.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDoc = InferSchemaType<typeof SessionSchema> & { _id: Types.ObjectId };
export const Session = defineModel<SessionDoc>("Session", SessionSchema);

export const OTP_PURPOSES = ["register", "reset"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

/**
 * One-time email codes for sign-up verification and password resets.
 * One active code per (email, purpose); only a keyed hash of the code is stored.
 * For sign-ups, the account details wait here until the email is verified.
 */
const EmailOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },
    codeHash: { type: String, required: true },
    codeExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, required: true },
    pending: {
      name: { type: String, maxlength: 120 },
      company: { type: String, maxlength: 120 },
      passwordHash: String,
    },
    // The whole record (including pending sign-up details) is removed after this.
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
EmailOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailOtpDoc = InferSchemaType<typeof EmailOtpSchema> & { _id: Types.ObjectId };
export const EmailOtp = defineModel<EmailOtpDoc>("EmailOtp", EmailOtpSchema);
