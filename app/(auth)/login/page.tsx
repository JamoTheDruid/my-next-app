import { authenticateUser } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    async function login(formData: FormData) {
        "use server";

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const user = await authenticateUser(email, password);

        if (!user) {
            // In a real app, you'd return an error instead of throwing
            throw new Error("Invalid credentials");
        }

        await createSessionToken({ id: user.id, role: user.role });
        
        redirect("/dashboard");
    }

    return (
        <form action={login} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 320 }}>
            <h1>Login</h1>
            <label>
                Email<br />
                <input type="email" name="email" required />
            </label>
            <label>
                Password<br />
                <input type="password" name="password" required />
            </label>
            <button type="submit">Log In</button>

            <hr style={{ margin: "1rem 0" }} />

            <p style={{ marginTop: "1rem" }}>
                Don&apos;t have an account?{" "}
                <Link href="/register">Create one</Link>
            </p>
            
            <a href="/api/auth/google" style={{ textAlign: "center", display: "block", padding: "0.5rem", backgroundColor: "#4285F4", color: "white", textDecoration: "none", borderRadius: 4 }}>
                Log in with Google
            </a>
        </form>
    );
}