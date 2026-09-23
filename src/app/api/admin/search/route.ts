import { NextResponse, type NextRequest } from "next/server";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { RESOURCES } from "@/lib/cms/resources";
import { MODELS } from "@/lib/cms/server";
import { connectDB } from "@/lib/db/connect";
import { escapeRegex } from "@/lib/utils";
import { Lead } from "@/models/operations";
import { User } from "@/models/User";

/** Admin command-palette search across content, leads and users (role-aware). */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "dashboard:view")) return NextResponse.json({ results: [] }, { status: 401 });
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ results: [] });
  await connectDB();
  const re = new RegExp(escapeRegex(q), "i");
  const results: { id: string; label: string; hint: string; href: string; kind: "content" }[] = [];

  if (can(user.role, "content:manage")) {
    const keys = ["posts", "services", "projects", "industries", "pages", "team"] as const;
    const found = await Promise.all(
      keys.map((k) =>
        MODELS[k]
          .find({ [RESOURCES[k].titleField]: re })
          .select(RESOURCES[k].titleField)
          .limit(4)
          .lean<Record<string, unknown>[]>()
          .then((docs) => docs.map((d) => ({ id: `${k}-${d._id}`, label: String(d[RESOURCES[k].titleField]), hint: RESOURCES[k].singular, href: `/admin/${k}/${d._id}`, kind: "content" as const }))),
      ),
    );
    results.push(...found.flat());
  }
  if (can(user.role, "leads:manage")) {
    const leads = await Lead.find({ $or: [{ name: re }, { email: re }, { company: re }] }).select("name email").limit(5).lean();
    results.push(...leads.map((l) => ({ id: `lead-${l._id}`, label: `${l.name} <${l.email}>`, hint: "Lead", href: `/admin/leads/${l._id}`, kind: "content" as const })));
  }
  if (can(user.role, "users:manage")) {
    const users = await User.find({ $or: [{ name: re }, { email: re }] }).select("name email").limit(5).lean();
    results.push(...users.map((u) => ({ id: `user-${u._id}`, label: `${u.name} <${u.email}>`, hint: "User", href: `/admin/users/${u._id}`, kind: "content" as const })));
  }
  return NextResponse.json({ results: results.slice(0, 20) }, { headers: { "Cache-Control": "private, no-store" } });
}
