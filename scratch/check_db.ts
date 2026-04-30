import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Checking columns for DataKependudukan...");
        const columns = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'DataKependudukan'
        `);
        console.log("Columns in DataKependudukan:", columns);
        
        console.log("\nChecking columns for User...");
        const userColumns = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
        console.log("Columns in User:", userColumns);

    } catch (error) {
        console.error("Check failed:", error);
    } finally {
        await pool.end();
        await prisma.$disconnect();
    }
}

main();
