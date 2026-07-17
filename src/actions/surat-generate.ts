"use server";

import prisma from "@/lib/prisma";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function generateSuratDocx(suratId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const surat = await prisma.surat.findUnique({
            where: { id: suratId },
            include: { warga: true }
        });

        if (!surat) throw new Error("Surat tidak ditemukan");
        if (surat.status !== "DISETUJUI") throw new Error("Surat belum disetujui");

        // Cari template
        const template = await prisma.letterTemplate.findFirst({
            where: { 
                OR: [
                    { code: surat.jenisSurat },
                    { name: surat.jenisSurat }
                ]
            }
        });
        
        if (!template) {
            throw new Error(`Template untuk '${surat.jenisSurat}' tidak ditemukan.`);
        }

        // Baca file template dari sistem lokal (public/templates/...)
        // get file path dari fileUrl
        const publicDir = path.join(process.cwd(), "public");
        const filePath = path.join(publicDir, template.fileUrl); // misal: /templates/SKU.docx
        
        const content = await fs.readFile(filePath, "binary");
        
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Mapping Data Warga
        const data = {
            nama: surat.warga.namaLengkap,
            nik: surat.warga.nik,
            no_kk: surat.warga.noKK,
            tempat_lahir: surat.warga.tempatLahir,
            tgl_lahir: surat.warga.tanggalLahir.toLocaleDateString("id-ID"),
            jenis_kelamin: surat.warga.jenisKelamin,
            agama: surat.warga.agama,
            pendidikan: surat.warga.pendidikan || "-",
            pekerjaan: surat.warga.pekerjaan || "-",
            alamat: surat.warga.alamat,
            rt: surat.warga.rt,
            rw: surat.warga.rw,
            dusun: surat.warga.dusun,
            keperluan: surat.keperluan || "-",
            nomor_surat: surat.nomorSurat || "...../...../.....",
            tanggal_surat: new Date().toLocaleDateString("id-ID")
        };

        doc.render(data);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        return {
            success: true,
            base64: buf.toString("base64"),
            filename: `${surat.jenisSurat} - ${surat.warga.namaLengkap}.docx`
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
