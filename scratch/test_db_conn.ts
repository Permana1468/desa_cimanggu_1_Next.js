import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = "postgresql://postgres.yupabeqtuqiajxgnvkup:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("SUCCESS:", user);
  } catch (error) {
    console.error("ERROR CONNECTING TO DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
