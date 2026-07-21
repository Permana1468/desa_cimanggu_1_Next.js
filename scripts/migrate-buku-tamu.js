const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB');
  
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS "PuskesosBukuTamu" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "namaLengkap" TEXT NOT NULL,
        "nik" TEXT,
        "alamat" TEXT NOT NULL,
        "noHp" TEXT,
        "keperluan" TEXT NOT NULL,
        "tandaTangan" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "PuskesosBukuTamu_pkey" PRIMARY KEY ("id")
      );
    `;
    await client.query(query);

    const fkeyQuery = `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PuskesosBukuTamu_tenantId_fkey') THEN
          ALTER TABLE "PuskesosBukuTamu" ADD CONSTRAINT "PuskesosBukuTamu_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `;
    await client.query(fkeyQuery);

    const indexQuery = `
      CREATE INDEX IF NOT EXISTS "PuskesosBukuTamu_tenantId_idx" ON "PuskesosBukuTamu"("tenantId");
    `;
    await client.query(indexQuery);

    console.log('Table PuskesosBukuTamu created successfully');
  } catch (e) {
    console.error('Error creating table:', e);
  }
  
  await client.end();
}

run();
