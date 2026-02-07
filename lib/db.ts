import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaAdapter: PrismaPg | undefined;
  // eslint-disable-next-line no-var
  var prismaCount: number | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

globalThis.prismaCount = (globalThis.prismaCount ?? 0) + 1;
console.log("Prisma instances:", globalThis.prismaCount);

// ✅ Adapter singleton
const adapter =
  globalThis.prismaAdapter ??
  new PrismaPg({
    connectionString,
  });

// ✅ Client singleton
const db =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaAdapter = adapter;
  globalThis.prisma = db;
}

export default db;
