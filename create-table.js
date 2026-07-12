const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.pifaowosfqnigxkudrcp:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log("Creating ArsipLaporan table...");
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "ArsipLaporan" (
                "id" TEXT NOT NULL,
                "templateId" TEXT,
                "templateName" TEXT NOT NULL,
                "kategori" TEXT NOT NULL,
                "generatedByUserId" TEXT NOT NULL,
                "generatedByName" TEXT NOT NULL,
                "fileUrl" TEXT,
                "formData" TEXT,
                "tenantId" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "ArsipLaporan_pkey" PRIMARY KEY ("id")
            );
        `);
        
        console.log("Creating foreign keys and indexes...");
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArsipLaporan_generatedByUserId_fkey') THEN
                    ALTER TABLE "ArsipLaporan" ADD CONSTRAINT "ArsipLaporan_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArsipLaporan_tenantId_fkey') THEN
                    ALTER TABLE "ArsipLaporan" ADD CONSTRAINT "ArsipLaporan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ArsipLaporan_tenantId_idx" ON "ArsipLaporan"("tenantId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ArsipLaporan_kategori_idx" ON "ArsipLaporan"("kategori");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ArsipLaporan_generatedByUserId_idx" ON "ArsipLaporan"("generatedByUserId");`);
        
        console.log("Done!");
    } catch (e) {
        console.error("Error creating table:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
