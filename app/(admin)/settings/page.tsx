// app/settings/page.tsx
import { getCurrentUser } from "@/lib/user";
import db from "@/lib/db";
import { updateUserRole } from "./actions";
import type { Role } from "@prisma/client";

const ALL_ROLES: Role[] = [
  "CUSTOMER",
  "EMPLOYEE",
  "NOVICE",
  "DRUID",
  "ARCHDRUID",
  "ADMIN",
];

export default async function SettingsPage() {
  const [users, currentUser] = await Promise.all([
    db.user.findMany({
        orderBy: { createdAt: "desc" },
    }),
    getCurrentUser()
  ]);

  return (
    <>
    <div style={{ padding: "1rem" }}>
      <h1>Settings</h1>
      <p>Welcome, {currentUser?.email}</p>
      <p>Your role: {currentUser?.role}</p>
    </div>

    <div style={{ padding: "1rem" }}>
      <h1>User Management</h1>
      <p>Change user roles. Only admins can access this page.</p>

      <table style={{ borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>ID</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Email</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Role</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = currentUser?.id === user.id;

            return (
              <tr key={user.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {user.id}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {user.email} {isSelf && <strong>(you)</strong>}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  {user.role}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  <form
                    action={updateUserRole}
                    style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
                  >
                    <input type="hidden" name="id" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      // Optional: prevent changing your own role from here
                      disabled={isSelf}
                    >
                      {ALL_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button type="submit" disabled={isSelf}>
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
