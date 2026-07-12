import { NextResponse } from 'next/server';
import { getAiIntegration } from '@/actions/ai';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const aiConfig = await getAiIntegration();
        if (!aiConfig.isConnected || !aiConfig.apiKey) {
            return NextResponse.json({ error: "API Key Gemini belum diatur di Master Admin" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let textContent = "";

        // Extract Text based on file type
        if (file.name.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            textContent = result.value;
        } else if (file.name.endsWith('.xlsx')) {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            textContent = workbook.SheetNames.map(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                return xlsx.utils.sheet_to_csv(sheet);
            }).join("\n\n");
        } else {
            return NextResponse.json({ error: "Format file tidak didukung. Harap gunakan DOCX atau XLSX." }, { status: 400 });
        }

        if (!textContent.trim()) {
            return NextResponse.json({ error: "File tampak kosong atau teks tidak dapat diekstrak." }, { status: 400 });
        }

        const promptText = `
        Anda adalah asisten AI ahli dalam membedah format dokumen resmi (Word/Excel).
        Tugas Anda adalah membaca teks acak dari file di bawah ini, dan mendeteksi kolom (field) apa saja yang BUKAN teks statis, melainkan KOLOM ISIAN (seperti titik-titik, tempat kosong, atau variabel yang harus diisi oleh pengguna).

        Contoh bagian isian: "Nama Kegiatan : ................." (Ini berarti field 'Nama Kegiatan').
        "Tanggal : " (Ini berarti field 'Tanggal').
        "Nominal Anggaran : Rp " (Ini berarti field 'Nominal Anggaran').

        Kembalikan HANYA format JSON murni berbentuk Array of Objects. DILARANG menambahkan teks markdown seperti \`\`\`json.
        Format Wajib:
        [
          { "name": "nama_kegiatan", "label": "Nama Kegiatan", "type": "text", "description": "Judul atau nama dari kegiatan" },
          { "name": "tanggal", "label": "Tanggal", "type": "date", "description": "Tanggal pelaksanaan kegiatan" }
        ]

        Teks Dokumen:
        """
        ${textContent.substring(0, 15000)}
        """
        `;

        // Menggunakan SDK Resmi Google Gen AI yang menangani resolusi endpoint secara otomatis
        const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: promptText,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        const rawText = response.text || "[]";
        
        let schema = [];
        try {
            const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            schema = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", rawText);
            throw new Error("Format balasan AI tidak sesuai standar JSON");
        }

        return NextResponse.json({ schema });
    } catch (error: any) {
        console.error("AI Scan Error:", error);
        return NextResponse.json({ error: `[RAW SDK ERROR] ${error.message}` }, { status: 500 });
    }
}
