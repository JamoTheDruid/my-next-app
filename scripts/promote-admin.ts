// scripts/promote-admin.ts
// Usage = npm run promote-admin -- someone@example.com

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Usage: npm run promote-admin -- someone@example.com");
        process.exit(1);
    }

    const user = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
    });

    console.log(`User ${user.email} is now ADMIN`);

}

main()
  .catch((err) => {
    console.error("❌ Failed to promote admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});