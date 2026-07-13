import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function createPrismaClient() {
  // Prisma v7 requires a driver adapter at runtime.
  // Without this, new PrismaClient() crashes silently because no URL is embedded in the schema.
  const dbPath = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "./dev.db";
  const absoluteDbPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.join(process.cwd(), dbPath);

  const adapter = new PrismaLibSql({ url: `file:${absoluteDbPath}` });
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
