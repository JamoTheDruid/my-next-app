// app/admin/layout.tsx
import { ReactNode } from "react";
import { requireRole } from "@/lib/user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("ADMIN");

  return (
    <div style={{ padding: "1rem" }}>
      <header style={{ marginBottom: "1rem" }}>
        <h1>Admin Panel</h1>
        <p>
          Signed in as {user.email} ({user.role})
        </p>
      </header>
      <section>{children}</section>
    </div> 
  );       
}          
