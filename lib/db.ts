import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaCount: number | undefined;
};

globalForPrisma.prismaCount = (globalForPrisma.prismaCount ?? 0) + 1;
console.log("Prisma instances:", globalForPrisma.prismaCount);

export const db =
  globalForPrisma.prisma ?? new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
