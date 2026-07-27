"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { getAuthenticatedClient } from "@/actions/google";
import * as fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

async function verifyKesraAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;
    const email = session.user.email || "";

    let resolvedRole = role;
    if (role === "KASI" && email.includes("kesejahteraan")) {
        resolvedRole = "KASI_KESEJAHTERAAN";
    }

    if (
        resolvedRole !== "KASI_KESEJAHTERAAN" && 
        role !== "ADMIN_DESA" && 
        role !== "ADMIN_MASTER" && 
        role !== "PUSKESOS" &&
        role !== "KADES" &&
        role !== "SEKDES"
    ) {
        throw new Error("Akses ditolak. Fitur ini khusus untuk Kasi Kesejahteraan / Puskesos.");
    }

    return { tenantId, user: session.user };
}

import { ServerCetakBundle } from '@/components/dashboard/kesra/ServerCetakBundle';
import React from 'react';

async function generateHtmlDocument(record: any, sptjmData: any, uploadDir: string) {
    const getBase64Img = async (photoData: string | null) => {
        if (!photoData) return "";
        if (photoData.startsWith("data:image/")) return photoData;
        try {
            const localPath = path.join(uploadDir, photoData);
            const ext = path.extname(localPath).toLowerCase();
            const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
            const fileData = await require('fs').promises.readFile(localPath);
            const base64 = fileData.toString('base64');
            return `data:${mime};base64,${base64}`;
        } catch (e) {
            return "";
        }
    };

    // Prepare full data with base64 images
    const dataWithImages = { ...record };
    dataWithImages.fotoDepan = await getBase64Img(record.fotoDepan);
    dataWithImages.fotoSamping = await getBase64Img(record.fotoSamping);
    dataWithImages.fotoDalam = await getBase64Img(record.fotoDalam);
    dataWithImages.fotoKamarMandi = await getBase64Img(record.fotoKamarMandi);

    // Get Logo Base64
    let kopSuratBase64 = "";
    try {
        const logoPath = path.join(uploadDir, 'images', 'logo-bogor.png');
        const logoData = await require('fs').promises.readFile(logoPath);
        kopSuratBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
    } catch(e) {}
    dataWithImages.kopSuratBase64 = kopSuratBase64;

    // Dynamically import react-dom/server to avoid Next.js client boundary build errors
    const ReactDOMServer = await import('react-dom/server');
    const renderToStaticMarkup = ReactDOMServer.renderToStaticMarkup || (ReactDOMServer as any).default.renderToStaticMarkup;

    // Render the React component to string
    const componentMarkup = renderToStaticMarkup(
        React.createElement(ServerCetakBundle, { 
            data: dataWithImages, 
            sptjmData: sptjmData 
        })
    );

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Arsip UHC - ${record.namaPasien || record.nik}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Base styles so it matches print */
        body { font-family: 'Times New Roman', Times, serif; background: #fff; }
        .bundle-toolbar { display: none !important; }
        .bundle-container { background: #fff !important; min-height: 0 !important; py-8: 0 !important; }
        
        /* Force page breaks for PDF printing */
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    ${componentMarkup}
</body>
</html>`;
}

export async function backupUhcToDrive(folderId: string) {
    if (!folderId) throw new Error("Folder ID wajib diisi.");
    const { tenantId } = await verifyKesraAccess();

    // 1. Get Google Integration directly to avoid Master Check
    const config = await prisma.systemSetting.findUnique({
        where: { id: "global_config" }
    });
    const settings = (config?.settings as any) || {};
    const googleIntegration = settings.googleIntegration;
    
    if (!googleIntegration || !googleIntegration.isConnected) {
        throw new Error("Google API belum dikonfigurasi atau belum terhubung di pengaturan Admin Master.");
    }

    // 2. Initialize Drive Client
    const { auth } = await getAuthenticatedClient(googleIntegration);
    const drive = google.drive({ version: 'v3', auth });

    // 3. Get Data
    const records = await prisma.kesraUsulanUhc.findMany({
        where: { tenantId }
    });

    if (records.length === 0) {
        throw new Error("Tidak ada data UHC untuk dibackup.");
    }

    const kependudukan = await prisma.dataKependudukan.findMany({
        where: { tenantId }
    });

    // 4. Create Subfolder in Drive with Timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const folderMetadata = {
        name: `Arsip_UHC_${timestamp}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId]
    };

    let targetFolderId = folderId;
    try {
        const folderRes = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id'
        });
        targetFolderId = folderRes.data.id || folderId;
    } catch (e: any) {
        throw new Error("Gagal membuat folder di Google Drive. Pastikan Folder ID benar dan kredensial memiliki akses tulis. Detail: " + e.message);
    }

    // 5. Generate and Upload HTML Document for each record
    const uploadDir = path.join(process.cwd(), 'public');
    let uploadedDocs = 0;
    let failedDocs = 0;

    for (const record of records) {
        try {
            const sptjmData = kependudukan.find(k => k.nik === record.nik) || null;
            const htmlContent = await generateHtmlDocument(record, sptjmData, uploadDir);
            const buffer = Buffer.from(htmlContent, 'utf-8');
            const stream = require('stream').Readable.from(buffer);
            
            // Format name: Arsip_UHC_320114..._NAMA_PASIEN.html
            const safeName = (record.namaPasien || "Tanpa_Nama").replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Arsip_UHC_${record.nik}_${safeName}.html`;

            await drive.files.create({
                requestBody: {
                    name: fileName,
                    parents: [targetFolderId]
                },
                media: {
                    mimeType: 'text/html',
                    body: stream
                }
            });
            uploadedDocs++;
        } catch (e) {
            console.error("Gagal mengupload dokumen UHC:", record.nik, e);
            failedDocs++;
        }
    }

    return { 
        success: true, 
        message: `Backup berhasil! ${uploadedDocs} dokumen Arsip HTML terupload ke Google Drive. (${failedDocs} dokumen gagal)`
    };
}

export async function wipeUhcData() {
    const { tenantId } = await verifyKesraAccess();

    const records = await prisma.kesraUsulanUhc.findMany({
        where: { tenantId }
    });

    const uploadDir = path.join(process.cwd(), 'public');
    let deletedPhotos = 0;

    for (const record of records) {
        const photos = [record.fotoDepan, record.fotoSamping, record.fotoDalam, record.fotoKamarMandi];
        for (const photoData of photos) {
            if (!photoData || photoData.startsWith("data:image/")) continue;
            
            const localPath = path.join(uploadDir, photoData);
            try {
                await fs.unlink(localPath);
                deletedPhotos++;
            } catch (e) {
                // Ignore missing files
            }
        }
    }

    const result = await prisma.kesraUsulanUhc.deleteMany({
        where: { tenantId }
    });

    revalidatePath("/dashboard");
    return { 
        success: true, 
        message: `Berhasil menghapus ${result.count} data UHC dan ${deletedPhotos} file foto dari server internal.`
    };
}
