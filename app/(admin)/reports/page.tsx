// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/user";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Reports</h1>
      <p>Welcome, {user?.email}</p>
      <p>Your role: {user?.role}</p>
    </div>
  );
}
