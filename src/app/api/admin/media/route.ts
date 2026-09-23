import { NextResponse, type NextRequest } from "next/server";
import { logActivity } from "@/lib/activity";
import { AuthError, assertPermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { env } from "@/lib/env";
import { clientIp, isSameOrigin } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";
import { ALLOWED_IMAGE_TYPES, buildStorageKey, getStorage, imageDimensions, sniffImageType } from "@/lib/storage";
import { escapeRegex, serialize } from "@/lib/utils";
import { Media } from "@/models/operations";

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** GET /api/admin/media?q=&folder=&page=&limit= — list the media library. */
export async function GET(request: NextRequest) {
  try {
    await assertPermission("media:manage");
  } catch {
    return fail("Unauthorized", 401);
  }
  await connectDB();
  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").slice(0, 80);
  const folder = sp.get("folder");
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 40)));
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ originalName: new RegExp(escapeRegex(q), "i") }, { alt: new RegExp(escapeRegex(q), "i") }];
  if (folder) filter.folder = folder;
  const [items, total] = await Promise.all([Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Media.countDocuments(filter)]);
  return NextResponse.json({ items: serialize(items), total, page, pages: Math.ceil(total / limit) }, { headers: { "Cache-Control": "private, no-store" } });
}

/** POST /api/admin/media — multipart upload (field "file"). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail("Invalid origin", 403);
  let user;
  try {
    user = await assertPermission("media:manage");
  } catch (err) {
    return fail(err instanceof AuthError ? err.message : "Unauthorized", 401);
  }
  if (!(await rateLimit("upload", user.id)).ok) return fail("Upload limit reached. Try again later.", 429);

  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes + 64_000) return fail(`Files must be under ${env.MAX_UPLOAD_MB} MB.`, 413);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("No file received.", 400);
  if (file.size === 0) return fail("The file is empty.", 400);
  if (file.size > maxBytes) return fail(`Files must be under ${env.MAX_UPLOAD_MB} MB.`, 413);

  // Serverless hosts (e.g. Vercel) have a read-only filesystem: local storage cannot persist uploads.
  if (env.STORAGE_DRIVER === "local" && process.env.VERCEL) {
    return fail("Uploads need cloud storage on this host. Set STORAGE_DRIVER=cloudinary and the CLOUDINARY_* variables.", 503);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = sniffImageType(buffer);
  if (!type) return fail("Only PNG, JPEG, WebP, GIF and AVIF images are allowed.", 415);

  const folder = String(form?.get("folder") ?? "general").slice(0, 40);
  const key = buildStorageKey(folder, ALLOWED_IMAGE_TYPES[type]);
  const stored = await getStorage().put({ buffer, key, contentType: type });
  const { width, height } = imageDimensions(buffer);
  const originalName = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 200) || "upload";

  await connectDB();
  const item = await Media.create({
    filename: key.split("/").pop(),
    originalName,
    url: stored.url,
    key: stored.key,
    storage: stored.storage,
    mimeType: type,
    size: file.size,
    width,
    height,
    alt: originalName.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
    folder,
    uploadedBy: user.id,
  });
  await logActivity({ actor: user, action: "media.uploaded", entityType: "media", entityId: String(item._id), entityLabel: originalName, ip: clientIp(request) });
  return NextResponse.json({ item: serialize(item.toObject()) }, { status: 201 });
}
