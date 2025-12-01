import argon2 from "argon2";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ok } from "assert";

const ARGON_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
};

export async function registerUser(email: string, password: string) {
    
    const hashed = await argon2.hash(password, ARGON_OPTIONS);
    try {
        const user = await db.user.create({
        data: {
            email,
            password: hashed,
            role: "CUSTOMER",
        },
        });

        return { ok: true as const, user };
    } catch (err) {
        // Handle unique constraint violation (race-condition safe)
        if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        Array.isArray(err.meta?.target) &&
        err.meta?.target.includes("email")
        ) {
        return {
            ok: false as const,
            fieldErrors: { email: "Email is already in use" },
        };
        }

        // Unexpected error → rethrow or log + throw generic
        return {
            ok: false as const,
            formError: "An unexpected error occurred",
        };
    }
}


export async function authenticateUser(email: string, password: string) {
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user || !user.password) return null;

    const isValid = await argon2.verify(user.password, password);
    
    if (!isValid) return null;
    return  user;
}