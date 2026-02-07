import { getCurrentUser } from "@/lib/user";
import { logout } from "@/lib/session";

export default async function InvoicesPage() {
  const user = await getCurrentUser();

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