const { Client } = require('pg');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const res = await client.query("SELECT settings FROM \"SystemSetting\" WHERE id = 'global_config'");
  if (res.rows.length > 0) {
    const settings = res.rows[0].settings;
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
    const key = parsed.aiIntegration.apiKey;
    
    const ai = new GoogleGenAI({ apiKey: key });
    try {
        console.log("Trying gemini-flash-latest...");
        let response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: 'Test'
        });
        console.log("Success gemini-flash-latest:", response.text);
    } catch(e) {
        console.log("Error gemini-flash-latest:", e.message);
    }
    
    try {
        console.log("Trying gemini-3.5-flash...");
        let response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: 'Test'
        });
        console.log("Success gemini-3.5-flash:", response.text);
    } catch(e) {
        console.log("Error gemini-3.5-flash:", e.message);
    }
  }
  await client.end();
}
run();
