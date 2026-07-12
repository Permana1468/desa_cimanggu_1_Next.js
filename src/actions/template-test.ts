"use server";

import prisma from "@/lib/prisma";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function generateTestTemplate(templateId: string, testData: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const template = await prisma.letterTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) throw new Error("Template tidak ditemukan");

        const publicDir = path.join(process.cwd(), "public");
        const filePath = path.join(publicDir, template.fileUrl);
        
        const content = await fs.readFile(filePath, "binary");
        
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Mapping Data Warga default testing info + custom variables
        const data = {
            nama: "BUDI SANTOSO",
            nik: "3201010101010101",
            no_kk: "3201010101010102",
            tempat_lahir: "JAKARTA",
            tgl_lahir: "01 Januari 1990",
            jenis_kelamin: "LAKI-LAKI",
            agama: "ISLAM",
            pendidikan: "SMA",
            pekerjaan: "WIRASWASTA",
            alamat: "JL. CONTOH NO. 123",
            rt: "01",
            rw: "02",
            dusun: "DUSUN I",
            keperluan: "PENGURUSAN ADMINISTRASI",
            nomor_surat: "140/001/DS/2026",
            tanggal_surat: new Date().toLocaleDateString("id-ID"),
            ...testData
        };

        doc.render(data);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        return {
            success: true,
            base64: buf.toString("base64"),
            filename: `TEST - ${template.name}.docx`
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
