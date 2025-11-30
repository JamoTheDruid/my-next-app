// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const secret = process.env.JWT_SECRET!;

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const session = request.cookies.get("session")?.value;

    // Paths that do not require auth:
    const publicPaths = ["/login", "/register"]; 
    
    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { id, role } = jwt.verify(session, secret) as { 
            id: number;
            role: "ADMIN" | "USER";
        };

        // For protected route, allow access
        if (pathname.startsWith("/dashboard") ) {
            return NextResponse.next();
        }

        // Admin-only route
        if (pathname.startsWith("/admin")) {
            if (role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
            return NextResponse.next();
        }
        
        return NextResponse.next();
    }   catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

// Middleware applies only to routes matched here:
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};