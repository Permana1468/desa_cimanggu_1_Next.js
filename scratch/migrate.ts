import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is not defined in .env");
        return;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Starting master migration...");

        // 1. Create Default Tenant if none exists
        let defaultTenant = await prisma.tenant.findFirst();
        if (!defaultTenant) {
            console.log("Creating default tenant...");
            defaultTenant = await prisma.tenant.create({
                data: {
                    name: "Desa Cimanggu I",
                    domain: "cimanggu1.desa.id"
                }
            });
            console.log("Default tenant created with ID:", defaultTenant.id);
        } else {
            console.log("Existing tenant found:", defaultTenant.name);
        }

        // 2. Add columns to DataKependudukan
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "DataKependudukan" ADD COLUMN IF NOT EXISTS "tenantId" TEXT`);
            console.log("Added tenantId to DataKependudukan");
            
            // Set default tenant for existing data
            await prisma.$executeRawUnsafe(`UPDATE "DataKependudukan" SET "tenantId" = '${defaultTenant.id}' WHERE "tenantId" IS NULL`);
            console.log("Updated existing DataKependudukan with default tenantId");

            // Make it NOT NULL if desired, but let's keep it safe for now
        } catch (e) {
            console.error("DataKependudukan Migration Error:", (e as Error).message);
        }

        // 3. Add columns to AuditLog
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT`);
            console.log("Added tenantId to AuditLog");
            
            await prisma.$executeRawUnsafe(`UPDATE "AuditLog" SET "tenantId" = '${defaultTenant.id}' WHERE "tenantId" IS NULL`);
        } catch (e) {
            console.error("AuditLog Migration Error:", (e as Error).message);
        }

        // 4. Update RoleType Enum (Retry for safety)
        const roles = ['WARGA', 'PKK', 'POSYANDU', 'LPM', 'BPD'];
        for (const role of roles) {
            try {
                await prisma.$executeRawUnsafe(`ALTER TYPE "RoleType" ADD VALUE '${role}'`);
                console.log(`Added role ${role} to RoleType`);
            } catch (e) {
                // Ignore if already exists
            }
        }

        // 5. Update User table
        const userColumns = [
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nik" TEXT',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsappVerified" BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isFirstLogin" BOOLEAN DEFAULT TRUE',
            'ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL'
        ];

        for (const sql of userColumns) {
            try {
                await prisma.$executeRawUnsafe(sql);
                console.log(`Executed: ${sql}`);
            } catch (e) {
                console.error(`Failed: ${sql}`, (e as Error).message);
            }
        }

        console.log("Master migration finished.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
        await prisma.$disconnect();
    }
}

main();
