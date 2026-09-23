import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { assertPermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { isSameOrigin } from "@/lib/security/origin";
import { getStorageByName } from "@/lib/storage";
import { serialize } from "@/lib/utils";
import { Media } from "@/models/operations";

const idOk = (id: string) => /^[a-f0-9]{24}$/.test(id);
const patchSchema = z.object({ alt: z.string().trim().max(300).optional(), folder: z.string().trim().max(40).regex(/^[a-z0-9-]*$/).optional() });

/** PATCH — update alt text / folder. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/media/[id]">) {
  const { id } = await ctx.params;
  if (!isSameOrigin(request) || !idOk(id)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    await assertPermission("media:manage");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  await connectDB();
  const item = await Media.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "after" }).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: serialize(item) });
}

/** DELETE — remove from storage and the library. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/media/[id]">) {
  const { id } = await ctx.params;
  if (!isSameOrigin(request) || !idOk(id)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  let user;
  try {
    user = await assertPermission("media:manage");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const item = await Media.findByIdAndDelete(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await getStorageByName(item.storage ?? "local").remove(item.key);
  await logActivity({ actor: user, action: "media.deleted", entityType: "media", entityId: id, entityLabel: item.originalName ?? item.filename });
  return NextResponse.json({ ok: true });
}
