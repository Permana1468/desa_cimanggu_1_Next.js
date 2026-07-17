import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Adding columns...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'MENUNGGU_VERIFIKASI'`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "createdById" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT`);
    
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

    return NextResponse.json({ success: true, message: 'Migration successful' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
