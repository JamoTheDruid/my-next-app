// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaAdapter: PrismaPg | undefined;
}

function getConnectionString() {
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("DATABASE_URL is not set");
  return cs;
}

const isProd = process.env.NODE_ENV === "production";

const adapter =
  globalThis.prismaAdapter ??
  new PrismaPg({ connectionString: getConnectionString() });

const db =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (!isProd) {
  globalThis.prismaAdapter = adapter;
  globalThis.prisma = db;
}

export default db;
