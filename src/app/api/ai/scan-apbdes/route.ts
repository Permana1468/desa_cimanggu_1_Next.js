import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import * as xlsx from 'xlsx';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
        }

        // Ambil konfigurasi API Key dari Database
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        const currentSettings = (configRecord?.settings as any) || {};
        const apiKey = currentSettings.aiIntegration?.apiKey;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key Gemini belum diatur di menu Master Admin.' }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type;
        const isImage = mimeType.startsWith('image/');

        let responseText = "";

        const systemInstruction = `
Anda adalah AI asisten untuk mengurai dokumen APBDes (Anggaran Pendapatan dan Belanja Desa).
Tugas Anda:
1. Baca teks atau gambar yang diberikan.
2. Cari rincian mengenai PENDAPATAN, BELANJA, atau PEMBIAYAAN.
3. Ekstrak data tersebut ke dalam array of JSON objects. Format persis:
[
  {
    "kategori": "PENDAPATAN" | "BELANJA" | "PEMBIAYAAN",
    "sumberDana": "string",
    "anggaranTotal": number,
    "realisasi": number,
    "keterangan": "string (opsional)"
  }
]
- Jangan sertakan teks penjelasan apapun selain JSON. 
- Jika nilai realisasi tidak ditemukan, atur ke 0.
- Pastikan anggaranTotal dan realisasi berupa angka utuh (bukan string).
- HANYA output array JSON murni, tanpa blok markdown (tanpa \`\`\`json).
`;

        if (isImage) {
            // Gunakan vision capability
            const base64Image = buffer.toString('base64');
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: systemInstruction },
                            { inlineData: { mimeType, data: base64Image } }
                        ]
                    }
                ]
            });
            responseText = response.text || "";
        } else {
            // Ekstrak teks dari dokumen (Excel/Word)
            let extractedText = "";

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const workbook = xlsx.read(buffer, { type: 'buffer' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                extractedText = xlsx.utils.sheet_to_csv(worksheet);
            } else if (file.name.endsWith('.docx')) {
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
            } else {
                return NextResponse.json({ error: 'Format file tidak didukung.' }, { status: 400 });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: systemInstruction + "\n\nIsi Dokumen:\n" + extractedText }
                        ]
                    }
                ]
            });
            responseText = response.text || "";
        }

        // Parsing JSON output
        try {
            // Bersihkan markdown blok jika AI membandel
            const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const apbdesData = JSON.parse(cleanText);
            
            // Hitung persentase untuk keamanan
            const processedData = apbdesData.map((item: any) => ({
                ...item,
                anggaranTotal: Number(item.anggaranTotal) || 0,
                realisasi: Number(item.realisasi) || 0,
                persentase: (Number(item.anggaranTotal) > 0) ? (Number(item.realisasi) / Number(item.anggaranTotal)) * 100 : 0
            }));

            return NextResponse.json(processedData);
        } catch (parseError) {
            console.error("AI Output:", responseText);
            return NextResponse.json({ error: 'Gagal mengurai respons AI. Format tidak sesuai.' }, { status: 500 });
        }

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}
