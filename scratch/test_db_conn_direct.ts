import { Client } from "pg";

async function test() {
  const connectionStrings = [
    // Direct
    "postgresql://postgres:Aldyansyah_14@db.yupabeqtuqiajxgnvkup.supabase.co:5432/postgres",
    // Pooler aws-1
    "postgresql://postgres.yupabeqtuqiajxgnvkup:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
    // Pooler aws-0
    "postgresql://postgres.yupabeqtuqiajxgnvkup:Aldyansyah_14@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    // Old pooler
    "postgresql://postgres.pifaowosfqnigxkudrcp:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
  ];

  for (const conn of connectionStrings) {
    console.log("Testing:", conn.replace(/:[^:@]+@/, ":****@"));
    const client = new Client({ connectionString: conn, connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      console.log("-> SUCCESS!");
      const res = await client.query("SELECT NOW()");
      console.log("-> Query result:", res.rows[0]);
      await client.end();
      break;
    } catch (err: any) {
      console.log("-> FAILED:", err.message || err);
      try { await client.end(); } catch (e) {}
    }
  }
}

test();
