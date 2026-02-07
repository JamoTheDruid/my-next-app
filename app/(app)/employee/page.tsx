// app/customer/account/page.tsx
import { getCurrentUser } from "@/lib/user";
import { logout } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div style={{ padding: "1rem" }}>
        <h1>Account</h1>
        <p>Welcome, {user?.email}</p>
        <p>Your role: {user?.roleKeys}</p>
        <form action={logout}>
            <button type="submit">Log Out</button>
        </form>
    </div>
  );
}
