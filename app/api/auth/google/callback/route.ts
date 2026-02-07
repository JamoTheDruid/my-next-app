// app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function pickRedirectFromRoles(roleNames: string[]) {
  // prioritize strongest role
  const priority = ["ADMIN", "MANAGER", "EMPLOYEE", "CUSTOMER", "GUEST"];
  const top = priority.find(r => roleNames.includes(r)) ?? "CUSTOMER";

  const roleRedirects: Record<string, string> = {
    GUEST: "/",
    CUSTOMER: "/customer/account",
    EMPLOYEE: "/employee/schedule",
    MANAGER: "/manager/dashboard",
    ADMIN: "/admin/overview",
  };

  return roleRedirects[top] ?? "/login";
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_no_code", req.url));
  }

  // ✅ Strongly recommended: validate `state`
  // const state = req.nextUrl.searchParams.get("state");
  // const expectedState = req.cookies.get("oauth_state")?.value;
  // if (!state || !expectedState || state !== expectedState) {
  //   return NextResponse.redirect(new URL("/login?error=oauth_state_mismatch", req.url));
  // }

  // 1) Exchange code for tokens
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

  const tokenData = (await tokenRes.json()) as { access_token: string };

  // 2) Fetch user info
  const userRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_userinfo_error", req.url));
  }

  const profile = (await userRes.json()) as {
    sub: string;
    email: string;
    name?: string;
  };

  // 3) Find or create user
  let user = await db.user.findUnique({
    where: { email: profile.email },
    include: {
      // adjust to your schema
      roles: { include: { role: true } }, // if UserRole -> Role
    },
  });

if (!user) {
  user = await db.user.create({
    data: {
      email: profile.email,
      name: profile.name ?? null,
      provider: "google",
      providerId: profile.sub,

      roles: {
        create: {
          isPrimary: true,
          role: {
            connect: { key: "CUSTOMER" }, // or { name: "CUSTOMER" }
          },
        },
      },
    },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });
} else {
    // If user exists, ensure provider fields are set reasonably
    if (!user.providerId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { provider: "google", providerId: profile.sub },
        include: { roles: { include: { role: true } } },
      });
    }
  }

  // 4) ✅ Create server-side session row
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  const session = await db.session.create({
    data: {
      userId: user.id,
      expiresAt,
      ipAddress: req.headers.get("x-forwarded-for") ?? null,
      // (optional) userAgent: req.headers.get("user-agent") ?? null,
    },
  });

  // 5) Set opaque cookie (session id), redirect by role
  const roleNames =
    user.roles?.map((ur) => ur.role?.name).filter(Boolean) ?? [];
  const redirectTarget = pickRedirectFromRoles(roleNames);

  const res = NextResponse.redirect(new URL(redirectTarget, req.url));

  res.cookies.set("session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt, // or maxAge
  });

  return res;
}
