// app/(auth)/login/page.tsx
import { authenticateUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import FloatingField from "@/components/FloatingField";
import { RoleKey } from "@prisma/client";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";

    //validate during input?
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await authenticateUser(email, password);

    if (!user) {
      // In a real app, you'd return a structured error instead
      throw new Error("Invalid credentials");
    }

    // Option 4: create a server-side session (cookie is just opaque id)
    const headersList = await headers();

    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;

    const userAgent = headersList.get("user-agent");

    await createSession(String(user.id), {
      ipAddress: ip,
      userAgent,
    });

    const roleRedirects: Record<string, string> = {
      GUEST: "/app",
      CUSTOMER: "/customer",
      EMPLOYEE: "/employee",
      MANAGER: "/manager",
      ADMIN: "/admin/overview",
    };

    redirect(roleRedirects[user.roleKeys[0]] ?? "/");
  }

  return (
    <form
      action={login}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "420px",
        margin: "2rem auto",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Login</h1>

      <FloatingField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
      />

      <FloatingField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
      />

      <button type="submit" style={{ marginTop: "0.5rem" }}>
        Log In
      </button>

      <hr style={{ margin: "1rem 0" }} />

      <p style={{ marginTop: "0.5rem" }}>
        Don&apos;t have an account? <Link href="/register">Create one</Link>
      </p>

      <a
        href="/api/auth/google"
        style={{
          textAlign: "center",
          display: "block",
          padding: "0.5rem",
          backgroundColor: "#4285F4",
          color: "white",
          textDecoration: "none",
          borderRadius: 4,
          marginTop: "0.5rem",
        }}
      >
        Log in with Google
      </a>
    </form>
  );
}
