import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
console.log("Checking DB connection...");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const userCount = await prisma.user.count();
    console.log("Total users in DB:", userCount);
    
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    });
    console.log("User list:", users);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
