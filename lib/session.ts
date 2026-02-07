"use server";

// lib/session.ts (server-side sessions)
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type SessionMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type CurrentSession = {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  lastSeenAt: Date | null;
};

const SESSION_COOKIE_NAME = "session";

// Tune deliberately (later: sliding vs fixed, rotation strategy)
const SESSION_TTL_DAYS = 7;

function computeExpiresAt(now = new Date()): Date {
  const ms = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ms);
}

/**
 * Sets the cookie to the *session id only* (no JWT, no roles).
 */
export async function setSessionCookie(sessionId: string, expiresAt: Date) {
  const cookieStore = await cookies();
  const maxAgeSeconds = Math.max(
    0,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000)
  );

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Create a server-side session record and set cookie.
 * Returns the session id.
 */
export async function createSession(userId: string, meta?: SessionMeta) {
  const now = new Date();
  const expiresAt = computeExpiresAt(now);

  const session = await db.session.create({
    data: {
      userId,
      createdAt: now,
      expiresAt,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: meta?.userAgent ?? null,
      lastSeenAt: now,
    },
    select: { id: true, expiresAt: true },
  });

  await setSessionCookie(session.id, session.expiresAt);
  return session.id;
}

/**
 * Read session id from cookie.
 */
export async function getSessionIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE_NAME);
  return c?.value ?? null;
}

/**
 * Loads a session from DB and enforces: exists, not revoked, not expired.
 * Returns null if invalid.
 */
export async function getSession(sessionId: string): Promise<CurrentSession | null> {
  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      lastSeenAt: true,
    },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;

  return session;
}

/**
 * The "real" current session helper:
 * cookie(sessionId) -> getSession(sessionId)
 */
export async function getCurrentSession(): Promise<CurrentSession | null> {
  const sessionId = await getSessionIdFromCookie();
  if (!sessionId) return null;
  return getSession(sessionId);
}

/**
 * Optional: throttled activity update (safe to call on every request later with throttle).
 */
export async function touchSession(sessionId: string) {
  await db.session.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  });
}

export async function revokeSession(sessionId: string) {
  await db.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessionsForUser(userId: string) {
  await db.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Logout = revoke current session in DB + clear cookie + redirect
 * (matches Option 4 behavior)
 */
export async function logout(_formData: FormData) {
  const sessionId = await getSessionIdFromCookie();
  if (sessionId) {
    // Best-effort revoke (don’t fail logout if session missing)
    try {
      await revokeSession(sessionId);
    } catch {}
  }
  await clearSessionCookie();
  redirect("/");
}
