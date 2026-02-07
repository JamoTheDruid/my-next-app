// app/api/mobile/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMobile";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Return a safe subset of user fields
  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  });
}
