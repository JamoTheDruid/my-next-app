import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 1️⃣ Seed roles
  const roles = [
    { key: "ADMIN", name: "Admin", system: true },
    { key: "MANAGER", name: "Manager", system: true },
    { key: "EMPLOYEE", name: "Employee", system: true },
    { key: "CUSTOMER", name: "Customer", system: true },
    { key: "GUEST", name: "Guest", system: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, system: role.system },
      create: role,
    });
  }

  console.log("✅ Roles seeded");

  // 2️⃣ Seed initial admin (optional but recommended)
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("ℹ️ No INITIAL_ADMIN_* env vars set — skipping admin seed");
    return;
  }

  // Normalize email
  const email = adminEmail.trim().toLowerCase();

  const passwordHash = await argon2.hash(adminPassword);

  // Create or find user
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {}, // ⚠️ do NOT overwrite password on re-seed
    create: {
      email,
      passwordHash,
    },
  });

  // Get ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { key: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("ADMIN role missing — seed roles first");
  }

  // Assign ADMIN role (idempotent)
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Initial admin ensured: ${email}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
