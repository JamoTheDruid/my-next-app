// lib/user.ts
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import type { RoleKey } from "@prisma/client";

/**
 * Option 4, RoleKey is DB-driven (Role.key).
 * Keep this union for convenience, but the system supports arbitrary keys.
 */

export type CurrentUser = {
  id: string;
  email: string;
  roleKeys: RoleKey[];
  primaryRole?: RoleKey;
  sessionId: string;
};

/**
 * Real getCurrentUser:
 * getCurrentSession() -> User -> roles
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      roles: {
        select: {
          isPrimary: true,
          role: { 
            select: { key: true } },
        },
      },
    },
  });

  if (!user) return null;

  const roleKeys = user.roles.map((r) => r.role.key as RoleKey);

  return {
    id: user.id,
    email: user.email,
    roleKeys: roleKeys,
    primaryRole: user.roles.find((r) => r.isPrimary)?.role.key as RoleKey | undefined,
    sessionId: session.id,
  };
}

/**
 * Require logged-in user
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require a specific role
 */
export async function requireRole(role: RoleKey): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!user.roleKeys.includes(role)) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Helper for "any of these roles"
 */
export async function requireAnyRole(roles: RoleKey[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ok = roles.some((r) => user.roleKeys.includes(r));
  if (!ok) redirect("/dashboard");

  return user;
}
