// app/(admin)/users/actions.ts
"use server";

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import type { RoleKey } from "@prisma/client";

const ALL_ROLES: RoleKey[] = ["GUEST", "CUSTOMER", "EMPLOYEE", "MANAGER", "ADMIN"];

export async function updateUserRole(formData: FormData) {
  const currentUser = await getCurrentUser();

  // Only admins can change roles
  if (!currentUser || !currentUser.roleKeys.includes("ADMIN")) {
    throw new Error("Unauthorized");
  }

  const userIdRaw = formData.get("id");
  const roleRaw = formData.get("role");

  const userId = typeof userIdRaw === "string" ? userIdRaw : "";
  const roleKey = typeof roleRaw === "string" ? (roleRaw as RoleKey) : null;

  if (!userId || !roleKey) throw new Error("Invalid input");
  if (!ALL_ROLES.includes(roleKey)) throw new Error("Invalid role");

  // Optional safety: don't accidentally change your own primary away from ADMIN via this UI
  if (userId === currentUser.id && roleKey !== "ADMIN") {
    throw new Error("Cannot change your own primary role here");
  }

  await db.$transaction(async (tx) => {
    // 1) Find the Role row by key
    const role = await tx.role.findUnique({
      where: { key: roleKey },
      select: { id: true, key: true },
    });

    if (!role) {
      throw new Error(`Role not found: ${roleKey}`);
    }

    // 2) Ensure the user has that role in the join table.
    //    If already exists -> no-op, else create.
    await tx.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id }, // requires @@id or @@unique on (userId, roleId)
      },
      update: {}, // keep existing
      create: {
        userId,
        roleId: role.id,
        isPrimary: false, // set true in the next step after clearing others
      },
    });

    // 3) Clear any existing primary roles for that user
    await tx.userRole.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // 4) Set this role as primary
    await tx.userRole.update({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
      data: { isPrimary: true },
    });
  });
  revalidatePath("/admin/users");
}