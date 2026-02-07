// lib/auth.ts
import argon2 from "argon2";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { RoleKey } from "@prisma/client";

const ARGON_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
  //saltLength: 16,
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  roleKeys: RoleKey[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function ensureRoleByKey(roleKey: RoleKey) {
  // Ensures Role exists (idempotent). Good for fresh DBs / migrations.
  return db.role.upsert({
    where: { key: roleKey },
    update: {},
    create: {
      key: roleKey,
      name: roleKey,
      system: true,
    },
    select: { id: true, key: true },
  });
}

/**
 * Register a new local-credentials user.
 * - Stores password hash in User.passwordHash
 * - Assigns default role via UserRole -> Role.key ("CUSTOMER" by default)
 *
 * NOTE: Does NOT create a session. Option 4 session creation belongs in your route handler.
 */
export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const roleKey: RoleKey = "CUSTOMER";
  const passwordHash = await argon2.hash(password, ARGON_OPTIONS);

  try {
    const result = await db.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { key: roleKey },
        update: {},
        create: { key: roleKey, name: name, system: true },
        select: { id: true, key: true },
      });

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          // provider/providerId remain null for email+password users
        },
        select: { id: true, email: true, name: true },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
          isPrimary: true,
        },
      });

      return { user, roleKey: role.key };
    });

    return { ok: true as const, user: result.user, roleKey: result.roleKey };
  } catch (err) {
    // Unique constraint violation (race-condition safe)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false as const, error: "EMAIL_TAKEN" as const };
    }
    throw err;
  }
}

/**
 * Authenticate a user with email + password.
 * - Verifies against User.passwordHash
 * - Returns the user (no roles, no session)
 *
 * NOTE: Option 4 session creation belongs in the login route handler.
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const normalizedEmail = normalizeEmail(email);

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      roles: {
        include: {
          role: { select: { key: true } },
        },
      },
    },
  });

  if (!user || !user.passwordHash) return null;

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) return null;

  const roleKeys = user.roles.map(r => r.role.key);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleKeys,
  };
}

