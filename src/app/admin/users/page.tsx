import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState, PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { escapeRegex, formatDate, initials, timeAgo } from "@/lib/utils";
import { ROLES } from "@/models/shared";
import { User } from "@/models/User";

export const metadata: Metadata = { title: "Users" };

const ROLE_TONE = { ADMIN: "violet", EDITOR: "brand", USER: "neutral" } as const;

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  await requirePermission("users:manage");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const role = typeof sp.role === "string" && (ROLES as readonly string[]).includes(sp.role) ? sp.role : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 25;
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: re }, { email: re }, { company: re }];
  }
  const [rows, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(), User.countDocuments(filter)]);
  const title = role === "ADMIN" ? "Admins" : role === "EDITOR" ? "Editors" : role === "USER" ? "Clients" : "All users";

  return (
    <>
      <PageHeader
        title={title}
        description="Manage roles and account status. New staff accounts can be created with `npm run create-admin`, or promote an existing user here."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users" }]}
      />
      <Suspense>
        <ListToolbar placeholder="Search name, email or company…" filters={[{ param: "role", label: "Roles", options: ROLES.map((r) => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() })) }]} />
      </Suspense>
      {rows.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th scope="col" className={th}>User</th>
                <th scope="col" className={th}>Role</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Last sign-in</th>
                <th scope="col" className={th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={String(u._id)} className="hover:bg-mist-25">
                  <td className={td}>
                    <Link href={`/admin/users/${u._id}`} className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-mist-100 text-xs font-semibold text-mist-700">{initials(u.name)}</span>
                      <span>
                        <span className="block font-medium text-ink-900 hover:text-brand-700">{u.name}</span>
                        <span className="block text-xs text-mist-500">{u.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={td}>
                    <Badge tone={ROLE_TONE[u.role as keyof typeof ROLE_TONE] ?? "neutral"}>{u.role}</Badge>
                  </td>
                  <td className={td}>
                    <Badge tone={u.status === "active" ? "success" : "danger"} dot>
                      {u.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className={`${td} text-mist-600`}>{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</td>
                  <td className={`${td} text-mist-600`}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} pages={Math.max(1, Math.ceil(total / perPage))} total={total} makeHref={(p) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(role ? { role } : {}), page: String(p) })}`} />
        </>
      )}
    </>
  );
}
