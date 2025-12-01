// app/(admin)/users/actions.ts
"use server";

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";

const ALL_ROLES: Role[] = [
  "CUSTOMER",
  "EMPLOYEE",
  "NOVICE",
  "DRUID",
  "ARCHDRUID",
  "ADMIN",
];

export async function updateUserRole(formData: FormData) {
  const currentUser = await getCurrentUser();

  // Only admins can change roles
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const userIdRaw = formData.get("id");
  const roleRaw = formData.get("role") as string | null;

  const userId = Number(userIdRaw);
  console.log(userId, roleRaw);
  if (!userId || Number.isNaN(userId) || !roleRaw) {
    throw new Error("Invalid input");
  }

  const newRole = roleRaw as Role;
  if (!ALL_ROLES.includes(newRole)) {
    throw new Error("Invalid role");
  }

  // Optional safety: don't accidentally remove your own admin
  if (userId === currentUser.id && newRole !== "ADMIN") {
    throw new Error("Cannot change your own role here");
    }

  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Refresh the page so the new role is visible
  revalidatePath("/admin/users");
}
