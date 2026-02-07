import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const client = new OAuth2Client(process.env.GOOGLE_IOS_CLIENT_ID);
const secret = process.env.JWT_SECRET as string;

if (!secret) {
  throw new Error("JWT_SECRET is not set");
}
if (!process.env.GOOGLE_IOS_CLIENT_ID) {
  throw new Error("GOOGLE_IOS_CLIENT_ID is not set");
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_IOS_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json(
        { error: "No email in Google token" },
        { status: 400 }
      );
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name ?? null;

    const user = await db.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        role: "CUSTOMER", // or decide based on domain, etc.
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Google mobile login error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
