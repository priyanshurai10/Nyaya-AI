import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("[Prisma] DATABASE_URL environment variable is not set.");
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  try {
    const pool = new Pool({
      connectionString,
      max: 5,                 // Limit pool size for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "warn", "error"]
          : ["error"],
    });
  } catch (error) {
    console.error("[Prisma] Failed to initialize Prisma client:", error);
    throw error;
  }
}

const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
export default prisma;