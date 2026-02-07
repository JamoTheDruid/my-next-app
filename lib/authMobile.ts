// lib/authMobile.ts
import { NextRequest } from "next/server";
import db from "@/lib/db";

export type MobileAuthContext = {
  userId: string;
  email: string;
  roleKeys: string[];
  sessionId: string;
};

/**
 * Mobile-friendly session id extraction.
 * Option 4 rule: the credential is ONLY a session id (not a JWT, not role claims).
 *
 * Accepts:
 *  - Cookie: session=<sessionId>
 *  - Authorization: Bearer <sessionId>
 *  - X-Session-Id: <sessionId>   (optional fallback)
 */
export function getSessionIdFromRequest(req: NextRequest): string | null {
  // 1) Cookie (works for browsers + mobile clients that persist cookies)
  const cookieSid = req.cookies.get("session")?.value;
  if (cookieSid) return cookieSid;

  // 2) Authorization header (mobile-friendly)
  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, value] = auth.split(" ");
    if (scheme?.toLowerCase() === "bearer" && value) return value.trim();
  }

  // 3) Optional custom header fallback
  const xSid = req.headers.get("x-session-id");
  if (xSid) return xSid.trim();

  return null;
}

/**
 * Resolve mobile caller identity using Option 4 flow:
 * cookie/header → session → user → roles
 */
export async function getMobileAuthContext(
  req: NextRequest
): Promise<MobileAuthContext | null> {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) return null;

  // Lookup session (must exist, not revoked, not expired)
  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;

  // Load user + roles (server-resolvable)
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      roles: {
        select: {
          role: {
            select: { key: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Optional: touch lastSeenAt (throttle in higher-traffic systems)
  // Fire-and-forget; don't block auth on it.
  void db.session
    .update({
      where: { id: sessionId },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {});

  return {
    userId: user.id,
    email: user.email,
    roleKeys: user.roles.map((r) => r.role.key),
    sessionId,
  };
}

/**
 * Convenience helper for routes that want a hard failure.
 * (Caller decides whether to return 401/redirect/etc.)
 */
export async function requireMobileAuthContext(
  req: NextRequest
): Promise<MobileAuthContext> {
  const ctx = await getMobileAuthContext(req);
  if (!ctx) {
    throw new Error("UNAUTHENTICATED");
  }
  return ctx;
}
