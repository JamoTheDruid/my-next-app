// app/settings/page.tsx
import { getCurrentUser } from "@/lib/user";
import db from "@/lib/db";
import { updateUserRole } from "./actions";
import type { RoleKey } from "@prisma/client";
import styles from "./page.module.css"

export default async function SettingsPage() {
  const [user, currentUser] = await Promise.all([
    db.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          roles: {
            include: {
              role: {
                select: { key: true },
              }
            }
          }
        }
    }),
    getCurrentUser()
  ]);
/*
  Bonus: performance note (important)
  If this page ever grows to:
  -thousands of users
  -lots of relations
  -heavy UI logic
  You’ll want:
  -pagination
  -role aggregation
  -maybe role caching
  But for now?
  This is 100% the right call.
*/



  const ALL_ROLES: RoleKey[] = ["GUEST", "CUSTOMER", "EMPLOYEE", "MANAGER", "ADMIN"];

  return (
    <>
    <div style={{ padding: "1rem" }}>
      <h1>Settings</h1>
      <p>Welcome, {currentUser?.email}</p>
      <p>Your role: {currentUser?.roleKeys}</p>
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
          {user.map((user) => {
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
                  {user.roles.map((r) => r.role.key).join(", ")}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                  <form
                    action={updateUserRole}
                    style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
                  >
                    <input type="hidden" name="id" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.roles.find(r => r.isPrimary)?.role.key}
                      // Optional: prevent changing your own role from here
                      disabled={isSelf}
                    >
                      {ALL_ROLES.map((roles: RoleKey) => (
                        <option key={roles} value={roles}>
                          {roles}
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
