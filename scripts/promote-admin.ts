// scripts/promote-admin.ts
// Usage: npm run promote-admin -- someone@example.com

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv[2];

  if (!emailArg) {
    console.error("Usage: npm run promote-admin -- someone@example.com");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();

  // 1️⃣ Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  // 2️⃣ Find the ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { key: "ADMIN" },
  });

  if (!adminRole) {
    console.error("❌ ADMIN role does not exist. Did you run prisma db seed?");
    process.exit(1);
  }

  // 3️⃣ Assign ADMIN role (idempotent)
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ User ${email} has been granted ADMIN role`);
}

main()
  .catch((err) => {
    console.error("❌ Failed to promote admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
