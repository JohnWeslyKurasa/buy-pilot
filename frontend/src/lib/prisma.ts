import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In Prisma 7, we don't pass the URL in the schema.
// We pass it to the constructor.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
