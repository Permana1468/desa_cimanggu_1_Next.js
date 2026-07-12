const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const res = await client.query("SELECT settings FROM \"SystemSetting\" WHERE id = 'global_config'");
  if (res.rows.length > 0) {
    const settings = res.rows[0].settings;
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
    const key = parsed.aiIntegration.apiKey;
    console.log("Key:", key.substring(0, 10) + "...");
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
    const json = await r.json();
    if (json.models) {
       console.log("Models:", json.models.map(m=>m.name));
    } else {
       console.log("Error:", json);
    }
  }
  await client.end();
}
run();
