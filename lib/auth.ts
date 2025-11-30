import argon2 from "argon2";
import { db } from "@/lib/db";

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

    return db.user.create({
        data: { email, password: hashed },
    });
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