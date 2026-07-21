const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB');
  
  try {
    await client.query(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'MENUNGGU_VERIFIKASI'`);
    await client.query(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "createdById" TEXT`);
    await client.query(`ALTER TABLE "SensusPoint" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT`);
    console.log('Columns added successfully');
  } catch (e) {
    console.error('Error adding columns:', e);
  }
  
  await client.end();
}

run();
