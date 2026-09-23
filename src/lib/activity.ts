import "server-only";
import { connectDB } from "@/lib/db/connect";
import { ActivityLog, Notification } from "@/models/operations";
import type { SessionUser } from "@/lib/auth/session";

export interface ActivityInput {
  actor?: Pick<SessionUser, "id" | "name" | "role"> | null;
  action: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

/**
 * Records an audit-trail entry. Failures are logged but never break the
 * user-facing action that triggered them.
 */
export async function logActivity(input: ActivityInput) {
  try {
    await connectDB();
    await ActivityLog.create({
      actor: input.actor?.id,
      actorName: input.actor?.name ?? "System",
      actorRole: input.actor?.role,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      entityLabel: input.entityLabel,
      meta: input.meta,
      ip: input.ip,
    });
  } catch (err) {
    console.error("[activity] failed to record", input.action, err);
  }
}

export interface NotifyInput {
  type: "lead" | "user" | "request" | "message" | "system" | "admin";
  title: string;
  body?: string;
  href?: string;
  /** Omit to notify all staff. */
  recipient?: string;
}

export async function notify(input: NotifyInput) {
  try {
    await connectDB();
    await Notification.create({
      ...input,
      audience: input.recipient ? "user" : "staff",
    });
  } catch (err) {
    console.error("[notify] failed", input.title, err);
  }
}

/** Human-readable labels for activity actions shown in the admin log. */
export function describeAction(action: string): string {
  const [entity, verb] = action.split(".");
  const verbs: Record<string, string> = {
    created: "created",
    updated: "updated",
    deleted: "deleted",
    published: "published",
    unpublished: "unpublished",
    registered: "registered",
    login: "signed in",
    status: "changed status of",
    role: "changed role of",
    suspended: "suspended",
    activated: "reactivated",
    uploaded: "uploaded",
    replied: "replied to",
    note: "added a note to",
    reset: "reset password for",
  };
  return `${verbs[verb] ?? verb ?? "updated"} ${entity?.replace(/-/g, " ") ?? "item"}`;
}
