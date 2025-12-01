"use server";
// lib/session.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
//import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const secret = process.env.JWT_SECRET!;

export async function createSessionToken(user: { id: number; role: Role }) {
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        secret,
        { expiresIn: "7d" }
    );

    const cookieStore = await cookies();

    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    // return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export async function logout() {
        "use server";

        const cookieStore = await cookies();
        cookieStore.delete("session");
        redirect("/.");
}

// Deprecated
//export async function deleteSessionToken() {
//    const cookiesStore = await cookies();
//    cookiesStore.delete("session");
//    redirect("/login");
//}