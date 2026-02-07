// app/users/[id]/actions.ts
"use server";

import { z } from "zod";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/user"; // adjust to your auth

const UpdateFieldSchema = z.object({
  userId: z.string().min(1),
  field: z.enum(["name", "email", "telephone", "addressRaw"]), //addressRaw could be an issue
  value: z.string().max(500),
});

export async function updateUserField(input: unknown) {
  const parsed = UpdateFieldSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input." };
  }

  const { userId, field, value } = parsed.data;

  const currentUser = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "Unauthorized." };

  // IMPORTANT: enforce authorization rules:
  // - either userId === currentUser.id
  // - or currentUser has ADMIN/MANAGER, etc.
  const canEdit = currentUser.id === userId || currentUser.roleKeys?.includes("ADMIN");
  if (!canEdit) return { ok: false as const, error: "Forbidden." };

  // Field-specific validation/normalization (examples)
  let cleaned = value.trim();

  if (field === "email") {
    const emailCheck = z.string().email().safeParse(cleaned.toLowerCase());
    if (!emailCheck.success) return { ok: false as const, error: "Email is not valid." };
    cleaned = emailCheck.data;
  }

  if (field === "telephone") {
    // Keep it simple here; you can plug in libphonenumber-js like you already do.
    cleaned = cleaned.replace(/\s+/g, " ");
  }

  try {
    await db.customer.update({
      where: { id: userId },
      data: { [field]: cleaned },
    });

    // Revalidate the dynamic route page so server-rendered data stays in sync.
    revalidatePath(`/users/${userId}`);
    return { ok: true as const };
  } catch (e: unknown) {
    // Example: Prisma unique constraint on email
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { ok: false as const, error: "That value is already in use." };
    }
    console.log(userId, [field]);
    return { ok: false as const, error: "Save failed." };
  }
}
