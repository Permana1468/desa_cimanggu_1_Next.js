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
        console.log("Trying gemini-2.5-flash...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Test',
            config: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });
        console.log("Success:", response.text);
    } catch(e) {
        console.log("Error generated:", e.message);
    }
  }
  await client.end();
}
run();
