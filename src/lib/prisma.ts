import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma_v7: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma_v7 ?? prismaClientSingleton();

export default prisma;

// Re-evaluated at 2026-10-01
globalThis.prisma_v7 = prisma;

