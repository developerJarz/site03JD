import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { clientIp, isSameOrigin } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";
import { Post, Project } from "@/models/content";

const schema = z.object({ type: z.enum(["post", "project"]), slug: z.string().regex(/^[a-z0-9-]{1,120}$/) });

/** Increments view counters used by the admin engagement charts. */
export async function POST(request: Request) {
  if (!isSameOrigin(request) || !isDbConfigured) return new NextResponse(null, { status: 204 });
  const ip = clientIp(request);
  if (!(await rateLimit("view", ip)).ok) return new NextResponse(null, { status: 204 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  await connectDB();
  const filter = { slug: parsed.data.slug };
  if (parsed.data.type === "post") await Post.updateOne(filter, { $inc: { views: 1 } });
  else await Project.updateOne(filter, { $inc: { views: 1 } });
  return new NextResponse(null, { status: 204 });
}
