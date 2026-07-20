import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

let prismaInstance: PrismaClient;

if (connectionString) {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
} else {
  prismaInstance = new PrismaClient({
    log: ["error"],
  });
}

export const prisma = global.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}