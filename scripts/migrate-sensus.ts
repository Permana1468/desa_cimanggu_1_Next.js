import { config } from 'dotenv';
config();
import prisma from '../src/lib/prisma';

async function main() {
  try {
    // Add columns directly via SQL bypassing Prisma's strict validation
    console.log('Adding columns...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'MENUNGGU_VERIFIKASI'`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "createdById" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT`);
    
    // Create foreign keys if they don't exist
    // Using a safe block in postgres
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SensusPoint_createdById_fkey') THEN
          ALTER TABLE "SensusPoint" ADD CONSTRAINT "SensusPoint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SensusPoint_verifiedById_fkey') THEN
          ALTER TABLE "SensusPoint" ADD CONSTRAINT "SensusPoint_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

main().finally(() => process.exit(0));
