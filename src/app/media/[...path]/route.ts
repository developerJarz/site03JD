import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

/**
 * Serves files uploaded with the local storage driver. Paths are resolved
 * inside UPLOAD_DIR only (no traversal) and only image types are served.
 */
const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif" };

export async function GET(_request: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: parts } = await ctx.params;
  if (!parts.every((p) => /^[a-z0-9._-]+$/i.test(p) && p !== ".." && p !== ".")) return new Response("Not found", { status: 404 });
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.UPLOAD_DIR);
  const file = path.resolve(/*turbopackIgnore: true*/ root, ...parts);
  if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(file);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
