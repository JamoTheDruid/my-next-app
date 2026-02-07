// app/api/mobile/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;

if (!secret) {
    throw new Error("JWT_SECRET is not set");
}

export async function POST(req: NextRequest) {
    try {
        // Parse the JSON body
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Use your existing auth logic
        const user = await authenticateUser(email, password);
        console.log("Found user:", user)
        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create a JWT for monbile (no cookie, just a token string)
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            secret,
            { expiresIn: "7d" }
        );
        console.log("📥 Incoming request: login")
        console.log("🔍 Request body:", { email, password })
        console.log("Response body:",)

        // Return JSON the iOS app can easily use
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
        console.error("Mobile login error:", err);
        return NextResponse.json(
            {error: "Something went wrong" },
            { status: 500 }
        );
    }
}


