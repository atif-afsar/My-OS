import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (typeof window === "undefined") {
    console.warn(
      "[Prisma Warning] DATABASE_URL is missing. PrismaClient will initialize without an adapter."
    );
  }
  prismaInstance = new PrismaClient();
} else {
  if (process.env.NODE_ENV === "production") {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  } else {
    if (!globalForPrisma.prisma) {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prismaInstance = globalForPrisma.prisma;
  }
}

export const prisma = prismaInstance;
