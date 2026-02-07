// app/(protected)/profile/page.tsx
import { getCurrentUser } from "@/lib/user";
import { logout } from "@/lib/session";

export async function generateMetadata() {
  const user = await getCurrentUser();
  return {
    title: `Profile · ${user?.email}`,
    description: "Your profile overview and settings.",
  };
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
        <h1>Overview</h1>
        <p>{user?.email}</p>
        <p>{user?.roleKeys}</p>
        <form action={logout}>
            <button type="submit">Log Out</button>
        </form>
    </div>
  );
}
