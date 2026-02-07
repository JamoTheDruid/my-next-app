// app/(marketing)/design/page.tsx
import { getCurrentUser } from "@/lib/user";

export default async function DesignPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Design</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  );
}
