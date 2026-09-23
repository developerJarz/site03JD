import { NextResponse } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { clientIp, isSameOrigin } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";
import { newsletterSchema } from "@/lib/validations";
import { Subscriber } from "@/models/operations";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const limited = await rateLimit("newsletter", clientIp(request));
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  // Honeypot filled → pretend success so bots learn nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  if (!isDbConfigured) return NextResponse.json({ error: "Subscriptions are temporarily unavailable." }, { status: 503 });
  await connectDB();
  await Subscriber.updateOne({ email: parsed.data.email }, { $set: { status: "subscribed" }, $setOnInsert: { source: "footer" } }, { upsert: true });
  return NextResponse.json({ ok: true });
}
