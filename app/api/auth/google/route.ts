import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
    const scope = [
        "openid",
        "email",
        "profile"
    ].join(" ");

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope,
        access_type: "offline",
        prompt: "consent",
    });

    const url = `${GOOGLE_AUTH_URL}?${params.toString()}`;

    return NextResponse.redirect(url);
}