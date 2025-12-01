// app/(protected)/profile/page.tsx
import { getCurrentUser } from "@/lib/user";
import { logout } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
        <h1>Overview</h1>
        <p>Welcome, {user?.email}</p>
        <p>Your role: {user?.role}</p>
        <form action={logout}>
            <button type="submit">Log Out</button>
        </form>
    </div>
  );
}
