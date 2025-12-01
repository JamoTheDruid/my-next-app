// lib/user.ts
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

interface SessionPayload {
    id: number;
    iat: number;
    exp: number;
}

const secret = process.env.JWT_SECRET!;

export async function getCurrentUser(): Promise<User | null> {
    
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session");
    if (!cookie) return null;

    try {
        const decoded = jwt.verify(cookie.value, secret) as SessionPayload;

        const user = await db.user.findUnique({
            where: { id: decoded.id },
        });
        console.log("Current user:", user);
        return user
    } catch {
        return null;
    }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/app");
  return user;
}

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect("/dashboard");
  return user;
}