"use server";

import PizZip from "pizzip";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Define output schema for Gemini
const schema = {
  type: "OBJECT",
  properties: {
    templateName: {
      type: "STRING",
      description: "A formal name for the letter template (e.g. Surat Keterangan Usaha, Surat Pengantar Domisili)"
    },
    templateCode: {
      type: "STRING",
      description: "A short uppercase code for the template (e.g. SKU, SKD, SP-NIK)"
    },
    variables: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of variables identified in the document (e.g. ['nama', 'nik', 'alamat', 'keperluan'])"
    },
    modifiedXml: {
      type: "STRING",
      description: "The complete, modified word/document.xml with {{placeholders}} injected where blanks (............) or dummy data were found. MUST BE EXACTLY VALID XML WITHOUT MARKDOWN FORMATTING."
    }
  },
  required: ["templateName", "templateCode", "variables", "modifiedXml"]
};

export async function generateTemplateWithAI(base64Docx: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Decode base64 and load into PizZip
        const buffer = Buffer.from(base64Docx, "base64");
        const zip = new PizZip(buffer);
        
        // Extract document.xml
        const originalXml = zip.file("word/document.xml")?.asText();
        if (!originalXml) {
            throw new Error("Invalid DOCX format: word/document.xml not found");
        }

        // Prepare the prompt
        const prompt = `You are a highly capable AI assistant that analyzes official village letter templates (usually in Indonesian).
I will provide you with the raw XML content of a Microsoft Word document (word/document.xml).
Your task is to:
1. Figure out what kind of letter this is and generate a suitable 'templateName' and 'templateCode'.
2. Identify all the places where data needs to be filled. These are usually indicated by long dots (e.g., .....................) or underlines (e.g., _________), or sometimes placeholder dummy text like [Nama Lengkap].
3. Replace those dots/lines/dummy text directly inside the XML <w:t> tags with docxtemplater variables like {{nama}}, {{nik}}, {{alamat}}, {{tempat_lahir}}, {{tgl_lahir}}, {{pekerjaan}}, {{keperluan}}, dll.
4. Return the list of variables you used.
5. Return the full modified XML. Make sure the XML remains 100% valid.

IMPORTANT RULES for XML modification:
- Do NOT alter any XML tags (<w:t>, <w:p>, etc). Only change the text inside <w:t> tags.
- If a dotted line is split across multiple <w:t> tags (e.g., <w:t>.......</w:t><w:t>.....</w:t>), replace the content of one of them with the placeholder (e.g., <w:t>{{nama}}</w:t>) and empty the others (<w:t></w:t>) so it parses correctly.
- Return the EXACT SAME full XML structure, just with the text modified.

Here is the original XML:
${originalXml}`;

        // Call Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema as any,
                temperature: 0.1
            }
        });

        const textResponse = response.text;
        if (!textResponse) throw new Error("AI returned empty response");

        const result = JSON.parse(textResponse);

        // Update the zip with the modified XML
        zip.file("word/document.xml", result.modifiedXml);
        
        // Generate the new docx buffer
        const newDocxBuffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
        const newBase64 = Buffer.from(newDocxBuffer).toString("base64");

        return {
            success: true,
            data: {
                name: result.templateName,
                code: result.templateCode,
                variables: result.variables.join(", "),
                modifiedBase64: newBase64
            }
        };

    } catch (error: any) {
        console.error("AI Template Error:", error);
        return { success: false, error: error.message || "Failed to generate template with AI" };
    }
}
