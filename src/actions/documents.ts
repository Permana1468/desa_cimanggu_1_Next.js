"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

function cleanDigits(val: string): string {
    return val ? val.toString().replace(/\D/g, '').replace(/^0+/, '') || '0' : '';
}

export async function exportWargaExcel(filter?: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        const filterScope: any = {};
        if (role === "RT") {
            const rtClean = cleanDigits(userRt || "");
            const rwClean = cleanDigits(userRw || "");
            filterScope.rt = { in: [userRt, rtClean, rtClean.padStart(3, '0')] };
            filterScope.rw = { in: [userRw, rwClean, rwClean.padStart(3, '0')] };
        } else if (role === "RW") {
            const rwClean = cleanDigits(userRw || "");
            filterScope.rw = { in: [userRw, rwClean, rwClean.padStart(3, '0')] };
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

        const cleanWargaRt = cleanDigits(warga.rt || "");
        const cleanWargaRw = cleanDigits(warga.rw || "");
        const cleanUserRt = cleanDigits(userRt || "");
        const cleanUserRw = cleanDigits(userRw || "");

        if (role === "RT" && (cleanWargaRt !== cleanUserRt || cleanWargaRw !== cleanUserRw)) {
            throw new Error("Unauthorized: data isolation violation");
        }
        if (role === "RW" && cleanWargaRw !== cleanUserRw) {
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

const SKKM_DEFAULT_FORM_SCHEMA = [
    { label: "1. Nomor Register (Sebelum - Kesra)", name: "no_register", type: "text", placeholder: "Contoh: 012", required: true },
    { label: "2. Pilih Warga (Integrasi Data Kependudukan)", name: "warga_id", type: "warga_select", required: true },
    { label: "3. Nama Lengkap", name: "nama", type: "text", required: true },
    { label: "4. NIK (Otomatis & Dikunci)", name: "nik", type: "text", required: true, readonly: true },
    { label: "5. Jenis Kelamin", name: "jenis_kelamin", type: "select", options: "LAKI-LAKI, PEREMPUAN", required: true },
    { label: "6. Tempat Lahir", name: "tempat_lahir", type: "text", required: true },
    { label: "7. Tanggal Lahir", name: "tgl_lahir", type: "date", required: true },
    { label: "8. Kewarganegaraan", name: "kewarganegaraan", type: "select", options: "Indonesia, Asing (WNA)", default: "Indonesia", required: true },
    { label: "9. Agama", name: "agama", type: "select", options: "Islam, Kristen, Katholik, Hindu, Buddha, Khonghucu", required: true },
    { label: "10. Alamat (Cukup Kp. RT/RW, Suffix Desa & Kec. Otomatis)", name: "alamat", type: "text", placeholder: "Contoh: Kp. Ciaruteun RT.002 RW.002", required: true },
    { label: "11. Nama Ayah Kandung", name: "nama_ayah", type: "text", required: true },
    { label: "12. Nama Ibu Kandung", name: "nama_ibu", type: "text", required: true },
    { label: "13. Nomor KK", name: "no_kk", type: "text", required: true },
    { label: "14. Surat Pengantar RT & RW", name: "rt_rw_pengantar", type: "text", placeholder: "RT.002 RW.002", required: true },
    { label: "15. Nomor / Tanggal Surat Pengantar", name: "no_tgl_pengantar", type: "text", placeholder: " /05/06/2026", required: true },
    { label: "16. Keperluan Administrasi Pendidikan Di (Nama Sekolah)", name: "pendidikan_di", type: "text", placeholder: "Contoh: SMA NEGERI 1 CIBUNGBULANG", required: true },
    { label: "17. Penandatangan (DIKUNCI)", name: "nama_penandatangan", type: "text", default: "FAJAR TRI APRIANA", readonly: true, required: true }
];

export async function ensureDefaultSKKMTemplate(targetTenantId?: string) {
    try {
        const firstTenant = await prisma.tenant.findFirst();
        let validTenantId = targetTenantId;
        if (!validTenantId || validTenantId === "default") {
            validTenantId = firstTenant?.id;
        }
        
        if (!validTenantId) {
            const createdTenant = await prisma.tenant.upsert({
                where: { domain: "desa-cimanggu-i" },
                update: {},
                create: { name: "Desa Cimanggu I", domain: "desa-cimanggu-i" }
            });
            validTenantId = createdTenant.id;
        }

        const existing = await prisma.letterTemplate.findFirst({
            where: { code: "SKKM" }
        });

        const safeVars = JSON.parse(JSON.stringify([
            "no_register", "nama", "nik", "tempat_lahir", "tgl_lahir",
            "jenis_kelamin", "kewarganegaraan", "agama", "alamat",
            "nama_ayah", "nama_ibu", "no_kk", "rt_rw_pengantar",
            "no_tgl_pengantar", "pendidikan_di", "tanggal_surat", "nama_penandatangan"
        ]));
        const safeSchema = JSON.parse(JSON.stringify(SKKM_DEFAULT_FORM_SCHEMA));

        if (!existing) {
            await prisma.letterTemplate.create({
                data: {
                    tenantId: validTenantId,
                    name: "SURAT KETERANGAN KELUARGA MISKIN",
                    code: "SKKM",
                    fileUrl: "/templates/SKKM.docx",
                    variables: safeVars,
                    formSchema: safeSchema
                } as any
            });
            console.log("Successfully seeded SKKM template for tenant:", validTenantId);
        } else {
            // Update form schema to guarantee latest 17 fields match exact prompt specs
            await prisma.letterTemplate.update({
                where: { id: existing.id },
                data: {
                    name: "SURAT KETERANGAN KELUARGA MISKIN",
                    variables: safeVars,
                    formSchema: safeSchema
                } as any
            });
        }
    } catch (e) {
        console.error("Error seeding default SKKM template:", e);
    }
}

export async function getWargaListForSurat() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return [];
        const tenantId = (session.user as any).tenantId;

        const whereClause = tenantId ? { tenantId } : {};

        return await prisma.dataKependudukan.findMany({
            where: whereClause,
            select: {
                id: true,
                nik: true,
                noKK: true,
                namaLengkap: true,
                jenisKelamin: true,
                tempatLahir: true,
                tanggalLahir: true,
                agama: true,
                alamat: true,
                rt: true,
                rw: true,
                namaAyah: true,
                namaIbu: true
            },
            orderBy: { namaLengkap: 'asc' },
            take: 200
        });
    } catch (error) {
        console.error("Error fetching warga list for surat:", error);
        return [];
    }
}

export async function getLetterTemplates() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        let tenantId = (session.user as any).tenantId;

        const firstTenant = await prisma.tenant.findFirst();
        if (!tenantId) {
            tenantId = firstTenant?.id;
        }

        await ensureDefaultSKKMTemplate(tenantId);

        return await prisma.letterTemplate.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error: any) {
        console.error("Error in getLetterTemplates:", error);
        return [];
    }
}

export async function createLetterTemplate(data: { name: string, code?: string, fileUrl?: string, variables?: any, formSchema?: any }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        let tenantId = (session.user as any).tenantId;
        if (!tenantId) {
            const systemTenant = await prisma.tenant.findFirst();
            tenantId = systemTenant?.id || "default";
        }

        const name = (data.name || "Template Surat Baru").trim();
        let rawCode = (data.code || name).trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
        if (!rawCode) rawCode = `SURAT_${Date.now().toString().slice(-4)}`;

        // Ensure unique code
        let cleanCode = rawCode;
        const existing = await prisma.letterTemplate.findFirst({
            where: { code: cleanCode }
        });
        if (existing) {
            cleanCode = `${rawCode}_${Date.now().toString().slice(-4)}`;
        }

        const fileUrl = data.fileUrl || `/templates/${cleanCode}.docx`;

        // Format variables
        let safeVariables: any = undefined;
        if (Array.isArray(data.variables)) {
            safeVariables = data.variables;
        } else if (typeof data.variables === "string" && data.variables.trim()) {
            safeVariables = data.variables.split(",").map((v: string) => v.trim()).filter(Boolean);
        }

        // Format formSchema
        let safeFormSchema: any = undefined;
        if (data.formSchema && Array.isArray(data.formSchema) && data.formSchema.length > 0) {
            safeFormSchema = JSON.parse(JSON.stringify(data.formSchema));
        }

        const createData: any = {
            name,
            code: cleanCode,
            fileUrl,
            tenantId
        };

        if (safeVariables !== undefined) {
            createData.variables = safeVariables;
        }
        if (safeFormSchema !== undefined) {
            createData.formSchema = safeFormSchema;
        }

        return await prisma.letterTemplate.create({
            data: createData
        });
    } catch (error: any) {
        console.error("Error creating letter template:", error);
        throw new Error(error?.message || "Gagal membuat template surat.");
    }
}

export async function updateLetterTemplate(id: string, data: { name?: string, code?: string, fileUrl?: string, variables?: any, formSchema?: any }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const updateData: any = {};
        if (data.name) updateData.name = data.name.trim();
        if (data.code) updateData.code = data.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
        if (data.fileUrl) updateData.fileUrl = data.fileUrl;

        if (data.variables !== undefined) {
            let safeVars: any[] = [];
            if (Array.isArray(data.variables)) safeVars = data.variables;
            else if (typeof data.variables === "string" && data.variables.trim()) {
                safeVars = data.variables.split(",").map((v: string) => v.trim()).filter(Boolean);
            }
            updateData.variables = JSON.parse(JSON.stringify(safeVars));
        }

        if (data.formSchema !== undefined) {
            let safeFields: any[] = [];
            if (Array.isArray(data.formSchema)) safeFields = data.formSchema;
            updateData.formSchema = JSON.parse(JSON.stringify(safeFields));
        }

        return await prisma.letterTemplate.update({
            where: { id },
            data: updateData
        });
    } catch (error: any) {
        console.error("Error updating letter template:", error);
        throw new Error(error?.message || "Gagal mengupdate template surat.");
    }
}

export async function autoGenerateFormFields(templateId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const template = await prisma.letterTemplate.findUnique({
            where: { id: templateId }
        });
        if (!template) throw new Error("Template tidak ditemukan.");

        let vars: string[] = [];
        if (Array.isArray(template.variables) && (template.variables as any[]).length > 0) {
            vars = (template.variables as any[]).map(v => String(v));
        } else {
            // Read docx file from public directory safely
            const relativePath = template.fileUrl.startsWith("/") ? template.fileUrl.slice(1) : template.fileUrl;
            const filePath = path.join(process.cwd(), "public", relativePath);
            
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, "binary");
                const zip = new PizZip(content);
                const xml = zip.file("word/document.xml")?.asText() || "";
                // Match docxtemplater variables like {{nama}}, {nik}, etc.
                const matches = xml.match(/\{{1,2}\s*([a-zA-Z0-9_]+)\s*\}}{1,2}/g) || [];
                vars = Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, "").trim())));
            }
        }

        if (vars.length === 0) {
            vars = ["nama", "nik", "tempat_lahir", "tgl_lahir", "jenis_kelamin", "pekerjaan", "alamat", "rt", "rw", "keperluan"];
        }

        // Map variables to intelligent form fields
        const fields = vars.map(v => {
            const clean = String(v).toLowerCase();
            const label = clean.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let type: "text" | "textarea" | "date" | "number" | "select" = "text";
            let options = "";

            if (clean.includes("tgl") || clean.includes("tanggal")) {
                type = "date";
            } else if (clean.includes("alamat") || clean.includes("keterangan") || clean.includes("keperluan") || clean.includes("alasan")) {
                type = "textarea";
            } else if (clean.includes("rt") || clean.includes("rw") || clean.includes("jumlah") || clean.includes("penghasilan") || clean.includes("umur") || clean.includes("usia")) {
                type = "number";
            } else if (clean.includes("kelamin") || clean.includes("jk")) {
                type = "select";
                options = "LAKI-LAKI, PEREMPUAN";
            } else if (clean.includes("agama")) {
                type = "select";
                options = "ISLAM, KRISTEN, KATHOLIK, HINDU, BUDDHA, KHONGHUCU";
            } else if (clean.includes("status_kawin") || clean.includes("perkawinan")) {
                type = "select";
                options = "BELUM KAWIN, KAWIN, CERAI HIDUP, CERAI MATI";
            } else if (clean.includes("status_usaha") || clean.includes("milik")) {
                type = "select";
                options = "Milik Sendiri, Sewa, Warisan";
            }

            return {
                label,
                name: String(v),
                type,
                options,
                required: true
            };
        });

        const safeFields = JSON.parse(JSON.stringify(fields));
        const safeVars = JSON.parse(JSON.stringify(vars));

        // Save generated fields to database template
        try {
            await prisma.letterTemplate.update({
                where: { id: templateId },
                data: { 
                    formSchema: safeFields, 
                    variables: safeVars 
                } as any
            });
        } catch (dbErr) {
            console.error("DB update error in autoGenerateFormFields:", dbErr);
        }

        return { success: true, fields: safeFields, variables: safeVars };
    } catch (error: any) {
        console.error("Error auto-generating form fields:", error);
        return { success: false, error: error.message || "Gagal membuat form otomatis." };
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

export async function deleteLetterTemplate(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        await prisma.letterTemplate.delete({
            where: {
                id,
                tenantId
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal menghapus template." };
    }
}
