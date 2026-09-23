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

const PasswordResetSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: Date,
  },
  { timestamps: true },
);
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetDoc = InferSchemaType<typeof PasswordResetSchema> & { _id: Types.ObjectId };
export const PasswordReset = defineModel<PasswordResetDoc>("PasswordReset", PasswordResetSchema);
