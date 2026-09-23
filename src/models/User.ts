import { Schema, type InferSchemaType, type Types } from "mongoose";
import { ROLES, defineModel } from "./shared";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "USER", index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    phone: { type: String, trim: true, maxlength: 40 },
    company: { type: String, trim: true, maxlength: 120 },
    avatar: { type: String, trim: true },
    title: { type: String, trim: true, maxlength: 120 },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: false },
    },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

UserSchema.index({ createdAt: -1 });
UserSchema.index({ name: "text", email: "text", company: "text" });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };
export const User = defineModel<UserDoc>("User", UserSchema);
