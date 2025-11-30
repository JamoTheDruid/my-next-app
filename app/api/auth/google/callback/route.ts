// app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export async function GET(req: NextRequest) {
    const jwtSecret = process.env.JWT_SECRET;
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

    if (!jwtSecret) {
        console.error("JWT_SECRET is not set in the environment");
        return NextResponse.redirect(new URL("/login?error=server_config", req.url));
    }

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
        return NextResponse.redirect(new URL("/login?error=oauth_no_code", req.url));
    }

    // 1. Exchange code for tokens

    const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    const tokenRes = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("Google token exchange failed:", tokenRes.status, errorText);
        return NextResponse.redirect(new URL("/login?error=oauth_token_error", req.url));
    }

    const tokenData = await tokenRes.json() as {
        access_token: string;
        id_token?: string;
    }

    // 2. Fetch user info
    const userRes = await fetch(USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });

    if (!userRes.ok) {
        return NextResponse.redirect(new URL("/login?error=oauth_userinfo_error", req.url));
    }
    
    const profile = await userRes.json() as {
        sub: string;
        email: string;
        name?: string;
    };

    // 3. Find or create user in DB
    let user = await db.user.findUnique({
        where: { email: profile.email },
    });

    if (!user) {
        user = await db.user.create({
            data: {
                email: profile.email,
                name: profile.name ?? null,
                provider: "google",
                providerId: profile.sub,
                // role defaults to USER from Prisma enum
            },
        });
    } else if (!user.provider) {
        // Optional: associate existing account with Google if not already
        user = await db.user.update({
            where: { id: user.id },
            data: {
                provider: user.provider ?? "google",
                providerId: user.providerId ?? profile.sub,
            },
        });
    }

    // 4. Create your usual JWT session cookie
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });

    const res = NextResponse.redirect(new URL("/dashboard", req.url));;
    res.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    // 5. Redirect to dashboard or wherever
    return NextResponse.redirect(new URL("/dashboard", req.url));
}