import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/permissions";

/** Lightweight session probe used by the static marketing navbar. */
export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  return NextResponse.json(
    { user: user ? { name: user.name, role: user.role, staff: isStaff(user.role) } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
