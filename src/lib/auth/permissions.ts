import type { Role } from "@/models/shared";

/**
 * Role-based permissions. Single source of truth for what each role may do —
 * used by route guards, server actions and the admin navigation.
 *
 * ADMIN  — full access.
 * EDITOR — content (blog, services, portfolio, industries, team, testimonials,
 *          FAQs, pages, taxonomy, media, page-level SEO).
 * USER   — own account and own requests only (enforced by ownership checks).
 */
export const PERMISSIONS = {
  "dashboard:view": ["ADMIN", "EDITOR"],
  "content:manage": ["ADMIN", "EDITOR"],
  "media:manage": ["ADMIN", "EDITOR"],
  "seo:page": ["ADMIN", "EDITOR"],
  "seo:global": ["ADMIN"],
  "leads:manage": ["ADMIN"],
  "requests:manage": ["ADMIN"],
  "users:manage": ["ADMIN"],
  "settings:manage": ["ADMIN"],
  "activity:view": ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const isStaff = (role: Role | undefined | null) => role === "ADMIN" || role === "EDITOR";
