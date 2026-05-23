"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function exportWargaExcel(filter?: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        let filterScope: any = {};
        if (role === "RT") {
            filterScope.rt = userRt;
            filterScope.rw = userRw;
        } else if (role === "RW") {
            filterScope.rw = userRw;
        }

        const warga = await prisma.dataKependudukan.findMany({
            where: {
                tenantId,
                ...filterScope,
                ...filter
            },
            orderBy: { namaLengkap: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Data Kependudukan");

        worksheet.columns = [
            { header: "NO", key: "no", width: 5 },
            { header: "NIK", key: "nik", width: 20 },
            { header: "NAMA LENGKAP", key: "namaLengkap", width: 30 },
            { header: "JENIS KELAMIN", key: "jenisKelamin", width: 15 },
            { header: "TEMPAT LAHIR", key: "tempatLahir", width: 20 },
            { header: "TANGGAL LAHIR", key: "tanggalLahir", width: 15 },
            { header: "ALAMAT", key: "alamat", width: 40 },
            { header: "RT", key: "rt", width: 5 },
            { header: "RW", key: "rw", width: 5 },
            { header: "DUSUN", key: "dusun", width: 15 },
            { header: "AGAMA", key: "agama", width: 12 },
            { header: "STATUS KAWIN", key: "statusKawin", width: 15 },
            { header: "PEKERJAAN", key: "pekerjaan", width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        warga.forEach((w, index) => {
            worksheet.addRow({
                no: index + 1,
                nik: w.nik,
                namaLengkap: w.namaLengkap,
                jenisKelamin: w.jenisKelamin,
                tempatLahir: w.tempatLahir,
                tanggalLahir: w.tanggalLahir.toLocaleDateString('id-ID'),
                alamat: w.alamat,
                rt: w.rt,
                rw: w.rw,
                dusun: w.dusun,
                agama: w.agama,
                statusKawin: w.statusKawin,
                pekerjaan: w.pekerjaan,
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        
        return {
            success: true,
            filename: `Data_Warga_${new Date().getTime()}.xlsx`,
            data: Buffer.from(buffer).toString('base64')
        };
    } catch (error) {
        return { success: false, error: "Gagal mengekspor data" };
    }
}

export async function generateSurat(templateCode: string, wargaId: string, customData: Record<string, any> = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        const warga = await prisma.dataKependudukan.findUnique({
            where: { id: wargaId }
        });
        if (!warga) throw new Error("Warga tidak ditemukan");

        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        if (role === "RT" && (warga.rt !== userRt || warga.rw !== userRw)) {
            throw new Error("Unauthorized: data isolation violation");
        }
        if (role === "RW" && warga.rw !== userRw) {
            throw new Error("Unauthorized: data isolation violation");
        }

        const template = await prisma.letterTemplate.findFirst({
            where: { code: templateCode, tenantId, isActive: true }
        });
        if (!template) throw new Error("Template tidak ditemukan");

        const templatePath = path.join(process.cwd(), "public", "templates", `${templateCode}.docx`);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`File template ${templateCode}.docx tidak ditemukan di server.`);
        }

        const content = fs.readFileSync(templatePath, "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render({
            nama: warga.namaLengkap,
            nik: warga.nik,
            tempat_lahir: warga.tempatLahir,
            tgl_lahir: warga.tanggalLahir.toLocaleDateString('id-ID'),
            kelamin: warga.jenisKelamin,
            pekerjaan: warga.pekerjaan,
            alamat: warga.alamat,
            rt: warga.rt,
            rw: warga.rw,
            dusun: warga.dusun,
            tgl_surat: new Date().toLocaleDateString('id-ID'),
            tahun: new Date().getFullYear(),
            ...customData
        });

        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        return {
            success: true,
            filename: `${templateCode}_${warga.namaLengkap.replace(/\s+/g, '_')}.docx`,
            data: Buffer.from(buffer).toString('base64')
        };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal membuat surat" };
    }
}

export async function getLetterTemplates() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.letterTemplate.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function createLetterTemplate(data: { name: string, code: string, fileUrl: string, variables?: any }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.letterTemplate.create({
            data: {
                ...data,
                tenantId
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function uploadTemplateFile(code: string, base64Data: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const buffer = Buffer.from(base64Data, "base64");
        const dirPath = path.join(process.cwd(), "public", "templates");

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${code}.docx`);
        fs.writeFileSync(filePath, buffer);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal mengunggah file template." };
    }
}
