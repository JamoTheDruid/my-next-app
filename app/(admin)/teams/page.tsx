// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/user";

export default async function TeamsPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Teams</h1>
      <p>Welcome, {user?.email}</p>
      <p>Your role: {user?.role}</p>
    </div>
  );
}
