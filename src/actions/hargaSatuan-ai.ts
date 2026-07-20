"use server";

import { getAiIntegration } from "@/actions/ai";
import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import mammoth from "mammoth";

export async function importHargaSatuanWithAI(tenantId: string, base64Data: string, mimeType: string) {
  try {
    const aiConfig = await getAiIntegration();
    if (!aiConfig?.isConnected || !aiConfig?.apiKey) {
      return { success: false, error: "AI Belum Terhubung. Silakan hubungi Admin Master untuk mengatur integrasi AI." };
    }

    const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
    
    const prompt = `Ekstrak data Standar Harga Satuan (SSH) dari dokumen/gambar terlampir.
Keluarkan HANYA dalam format JSON array. Setiap objek harus memiliki properti:
- kategori (string): contoh "PENGHASILAN TETAP", "TUNJANGAN KINERJA", dll (huruf besar semua jika dari header).
- uraian (string): contoh "Kepala Desa", "Sekretaris Desa", dll.
- satuan (string): contoh "Bulan", "Tahun", dll.
- harga (number): nilai numerik nominal uang dalam rupiah (tanpa titik/koma, misal 4750000).
- keterangan (string): keterangan tambahan, atau string kosong "" jika tidak ada.
- noUrut (number): nomor urut kategori (1 untuk kategori pertama, 2 untuk kedua, dst).

Pastikan kamu mengelompokkan item ke dalam kategori yang tepat sesuai dokumen.
Pastikan format JSON valid tanpa markdown \`\`\`json atau karakter lain di luar array. Jangan tambahkan teks apa pun selain JSON array.`;

    const cleanBase64 = base64Data.split(",")[1] || base64Data;
    let contents: any[] = [prompt];

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType.includes("word")) {
      const buffer = Buffer.from(cleanBase64, "base64");
      const { value: text } = await mammoth.extractRawText({ buffer });
      contents.push(text);
    } else {
      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: contents
    });

    const rawText = response.text || "";
    // Clean up potential markdown formatting
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
    if (cleanText.startsWith("```")) cleanText = cleanText.substring(3);
    if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();

    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(cleanText);
    } catch (parseError: any) {
      console.warn("JSON Parse failed, attempting to fix truncated JSON...", parseError.message);
      // Cari kurung kurawal tutup terakhir yang menandakan akhir dari sebuah objek
      const lastBracket = cleanText.lastIndexOf('}');
      if (lastBracket !== -1) {
        let fixedText = cleanText.substring(0, lastBracket + 1);
        if (!fixedText.startsWith('[')) fixedText = '[' + fixedText;
        if (!fixedText.endsWith(']')) fixedText = fixedText + ']';
        try {
          parsedData = JSON.parse(fixedText);
        } catch (e2) {
          throw new Error("Gagal mem-parsing data AI karena dokumen terlalu besar dan format terpotong. Coba gunakan dokumen dengan jumlah data yang lebih sedikit.");
        }
      } else {
        throw new Error("Format respons AI tidak valid atau terpotong.");
      }
    }

    if (!Array.isArray(parsedData)) {
      throw new Error("Output dari AI bukan array.");
    }

    const dataToInsert = parsedData.map((item: any) => ({
      tenantId,
      kategori: item.kategori,
      uraian: item.uraian,
      satuan: item.satuan,
      harga: Number(item.harga) || 0,
      keterangan: item.keterangan || "",
      noUrut: Number(item.noUrut) || 0,
    }));

    // Bulk insert
    await prisma.hargaSatuan.createMany({
      data: dataToInsert,
    });

    revalidatePath("/dashboard");
    return { success: true, count: dataToInsert.length };

  } catch (error: any) {
    console.error("AI Import Error:", error);
    return { success: false, error: error.message || "Gagal mengekstrak data dari AI." };
  }
}
