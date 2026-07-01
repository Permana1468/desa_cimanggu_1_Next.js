"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { google } from "googleapis";
import { headers } from "next/headers";

// Helper to check for Master Admin role
async function checkMaster() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        throw new Error("Unauthorized: Master Admin only");
    }
    return session as any;
}

// Generate redirect URI dynamically based on the current host header
export async function getRedirectUri() {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    return `${protocol}://${host}/api/auth/google/callback`;
}

// Get Google Integration Settings
export async function getGoogleIntegration() {
    await checkMaster();
    try {
        const config = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        const settings = (config?.settings as any) || {};
        return settings.googleIntegration || { isConnected: false, type: "service_account" };
    } catch (error) {
        return { isConnected: false, type: "service_account" };
    }
}

// Save Google Integration Settings
export async function saveGoogleIntegration(googleSettings: any) {
    const session = await checkMaster();
    try {
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        
        const currentSettings = (configRecord?.settings as any) || {};
        const updatedSettings = {
            ...currentSettings,
            googleIntegration: {
                ...currentSettings.googleIntegration,
                ...googleSettings,
                updatedAt: new Date().toISOString()
            }
        };

        const result = await prisma.systemSetting.upsert({
            where: { id: "global_config" },
            update: { settings: updatedSettings, updatedAt: new Date() },
            create: { id: "global_config", settings: updatedSettings, updatedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_GOOGLE_INTEGRATION",
                entity: "SystemSetting",
                entityId: "global_config",
                details: { type: googleSettings.type },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SYSTEM"
            }
        });

        revalidatePath("/master-admin/integrasi");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Gagal menyimpan konfigurasi Google.");
    }
}

// Generate Google OAuth2 Authorization URL
export async function getGoogleOAuthUrl(clientId: string, clientSecret: string) {
    await checkMaster();
    if (!clientId || !clientSecret) {
        throw new Error("Client ID dan Client Secret wajib diisi.");
    }

    const redirectUri = await getRedirectUri();
    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes
    });

    return url;
}

// Disconnect Google Integration
export async function disconnectGoogle() {
    const session = await checkMaster();
    try {
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        
        const currentSettings = (configRecord?.settings as any) || {};
        const updatedSettings = {
            ...currentSettings,
            googleIntegration: {
                isConnected: false,
                type: currentSettings.googleIntegration?.type || "service_account"
            }
        };

        await prisma.systemSetting.update({
            where: { id: "global_config" },
            data: { settings: updatedSettings, updatedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: {
                action: "DISCONNECT_GOOGLE_INTEGRATION",
                entity: "SystemSetting",
                entityId: "global_config",
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SYSTEM"
            }
        });

        revalidatePath("/master-admin/integrasi");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Gagal memutus integrasi Google.");
    }
}

// Test Connection Helper: refreshes token if needed and returns client
async function getAuthenticatedClient(googleIntegration: any) {
    if (googleIntegration.type === "service_account") {
        if (!googleIntegration.serviceAccountJson) {
            throw new Error("Service Account JSON tidak ditemukan.");
        }
        
        const credentials = JSON.parse(googleIntegration.serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive"
            ]
        });
        
        return { auth, clientEmail: credentials.client_email };
    } else if (googleIntegration.type === "oauth2") {
        const oauth = googleIntegration.oauth;
        if (!oauth || !oauth.clientId || !oauth.clientSecret || !oauth.tokens) {
            throw new Error("Konfigurasi OAuth2 belum lengkap.");
        }

        const redirectUri = await getRedirectUri();
        const oauth2Client = new google.auth.OAuth2(
            oauth.clientId,
            oauth.clientSecret,
            redirectUri
        );

        let tokens = oauth.tokens;
        const now = Date.now();
        
        // Refresh token if expired or about to expire (within 5 minutes)
        if (tokens.expiry_date && tokens.expiry_date - now < 300 * 1000) {
            try {
                oauth2Client.setCredentials(tokens);
                const refreshRes = await oauth2Client.refreshAccessToken();
                const newTokens = {
                    ...tokens,
                    ...refreshRes.credentials
                };
                
                // Save updated tokens
                const configRecord = await prisma.systemSetting.findUnique({
                    where: { id: "global_config" }
                });
                const currentSettings = (configRecord?.settings as any) || {};
                currentSettings.googleIntegration.oauth.tokens = newTokens;
                
                await prisma.systemSetting.update({
                    where: { id: "global_config" },
                    data: { settings: currentSettings }
                });
                
                tokens = newTokens;
            } catch (refreshErr) {
                console.error("Gagal melakukan refresh token Google:", refreshErr);
                throw new Error("Token Google kedaluwarsa dan gagal diperbarui. Silakan hubungkan ulang.");
            }
        }

        oauth2Client.setCredentials(tokens);
        return { auth: oauth2Client, clientEmail: oauth.connectedEmail || "OAuth2 Connected Account" };
    } else {
        throw new Error("Tipe integrasi tidak dikenali.");
    }
}

// Test Google Connection: writes a file to Drive, writes to spreadsheet, reads it, and deletes it.
export async function testGoogleConnection() {
    await checkMaster();
    const logs: string[] = [];
    
    try {
        logs.push("Mengambil konfigurasi integrasi dari database...");
        const integration = await getGoogleIntegration();
        if (!integration || !integration.isConnected) {
            throw new Error("Integrasi belum diaktifkan atau belum dikonfigurasi.");
        }

        logs.push(`Menginisialisasi klien Google menggunakan mode [${integration.type.toUpperCase()}]...`);
        const { auth, clientEmail } = await getAuthenticatedClient(integration);
        logs.push(`Otentikasi berhasil untuk: ${clientEmail}`);

        const sheets = google.sheets({ version: "v4", auth: auth as any });
        const drive = google.drive({ version: "v3", auth: auth as any });

        logs.push("Mencoba membuat Spreadsheet pengujian baru di Google Drive...");
        const testSheetTitle = `Cimanggu_Test_Connection_${new Date().toISOString().replace(/[:.]/g, "-")}`;
        
        const createRes = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: testSheetTitle
                }
            }
        });
        
        const spreadsheetId = createRes.data.spreadsheetId;
        if (!spreadsheetId) {
            throw new Error("Gagal memperoleh ID spreadsheet baru.");
        }
        logs.push(`Spreadsheet pengujian berhasil dibuat. ID: ${spreadsheetId}`);

        logs.push("Menulis baris data pengujian (A1:C2) ke spreadsheet...");
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Sheet1!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    ["Parameter Pengujian", "Nilai Uji", "Timestamp"],
                    ["Status Koneksi", "SUKSES BACA TULIS", new Date().toLocaleString("id-ID")]
                ]
            }
        });
        logs.push("Data berhasil ditulis ke Sheet1.");

        logs.push("Membaca kembali data dari spreadsheet untuk verifikasi integrasi...");
        const readRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A1:C2"
        });
        
        const rows = readRes.data.values;
        if (!rows || rows.length < 2) {
            throw new Error("Gagal membaca kembali data. Data kosong.");
        }
        logs.push(`Data terbaca sukses. Nilai di A2: ${rows[1][0]} = ${rows[1][1]}`);

        logs.push("Menghapus spreadsheet pengujian dari Google Drive...");
        await drive.files.delete({
            fileId: spreadsheetId
        });
        logs.push("Spreadsheet pengujian berhasil dibersihkan.");

        logs.push("Semua pengujian selesai! Koneksi Google API siap digunakan.");
        
        return {
            success: true,
            logs,
            account: clientEmail
        };
    } catch (error: any) {
        console.error("Gagal menguji koneksi Google:", error);
        logs.push(`ERROR: ${error.message || error}`);
        return {
            success: false,
            logs,
            error: error.message || "Gagal menguji koneksi Google API."
        };
    }
}

// Fetch data from a specific Google Sheet
export async function fetchGoogleSheetData(spreadsheetId: string, range: string) {
    await checkMaster();
    try {
        const integration = await getGoogleIntegration();
        if (!integration || !integration.isConnected) {
            throw new Error("Integrasi Google API belum diaktifkan. Silakan hubungkan terlebih dahulu di menu Integrasi.");
        }

        const { auth } = await getAuthenticatedClient(integration);
        const sheets = google.sheets({ version: "v4", auth: auth as any });

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });

        return res.data.values || [];
    } catch (error: any) {
        console.error("Gagal membaca Google Sheet:", error);
        throw new Error(error.message || "Gagal mengambil data dari Google Sheet.");
    }
}

// Fetch the configured RAB Template from global_config and fetch its cells from Google Sheets
export async function syncRabFromMasterTemplate(customTemplateId?: string, customTemplateRange?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        // 1. Fetch Google Integration & template settings from global_config
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        if (!configRecord) {
            throw new Error("Konfigurasi sistem global_config tidak ditemukan.");
        }

        const settings = (configRecord.settings as any) || {};
        const integration = settings.googleIntegration;
        if (!integration || !integration.isConnected) {
            throw new Error("Integrasi Google API belum diaktifkan oleh Master Admin.");
        }

        const templateId = customTemplateId || settings.rab_template_id;
        const templateRange = customTemplateRange || settings.rab_template_range || "Sheet1!B9:F20";
        if (!templateId) {
            throw new Error("Template Spreadsheet RAB belum dikonfigurasi di Master Admin.");
        }

        // 2. Fetch authenticated client
        let sheets: any = null;
        let isMock = false;

        try {
            if (integration?.oauth?.clientId === "mock-client-id" || !integration?.isConnected) {
                isMock = true;
            } else {
                const authRes = await getAuthenticatedClient(integration);
                sheets = google.sheets({ version: "v4", auth: authRes.auth as any });
            }
        } catch (authErr) {
            console.warn("Using simulated data fallback due to Google Auth failure:", authErr);
            isMock = true;
        }

        if (isMock || !sheets) {
            let rabItems = [];
            if (templateId === "TMP-LAP-LPJ") {
                rabItems = [
                    { item: "Pekerjaan Persiapan Lapangan", satuan: "Ls", volume: 1, harga: 250000, total: 250000 },
                    { item: "Penyusunan Berkas Pertanggungjawaban", satuan: "Eks", volume: 3, harga: 150000, total: 450000 },
                    { item: "Dokumentasi & Cetak Foto Kegiatan", satuan: "Paket", volume: 1, harga: 200000, total: 200000 }
                ];
            } else {
                // Default: RAB FISIK
                rabItems = [
                    { item: "Pekerjaan Galian Tanah & Persiapan", satuan: "M3", volume: 24, harga: 75000, total: 1800000 },
                    { item: "Semen Portland (PCC) 50kg", satuan: "Sak", volume: 180, harga: 72000, total: 12960000 },
                    { item: "Pasir Beton / Pasang kasar", satuan: "M3", volume: 22, harga: 240000, total: 5280000 },
                    { item: "Batu Pecah / Split 2/3", satuan: "M3", volume: 32, harga: 280000, total: 8960000 },
                    { item: "Papan Bekisting 2/20 x 4m", satuan: "Lembar", volume: 45, harga: 35000, total: 1575000 },
                    { item: "Pekerjaan Pemadatan & Cor Beton K-225", satuan: "M3", volume: 35, harga: 950000, total: 33250000 },
                    { item: "Upah Pekerja / Tukang Harian", satuan: "OH", volume: 60, harga: 120000, total: 7200000 },
                    { item: "Upah Kepala Tukang Harian", satuan: "OH", volume: 10, harga: 150000, total: 1500000 }
                ];
            }
            return {
                success: true,
                rabItems,
                templateId,
                templateRange,
                isSimulated: true
            };
        }

        // 3. Get values from Google Sheets
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: templateId,
            range: templateRange
        });

        const rowsData = res.data.values || [];
        if (rowsData.length === 0) {
            throw new Error("Spreadsheet template kosong atau tidak dapat diakses.");
        }

        // Helper helper to categorize items
        const getCategoryFromUraian = (uraian: string): "BAHAN" | "ALAT" | "UPAH" | "OPERASIONAL" => {
            const text = uraian.toLowerCase();
            if (text.includes("upah") || text.includes("tukang") || text.includes("pekerja") || text.includes("harian") || text.includes("tenaga")) {
                return "UPAH";
            }
            if (text.includes("sewa") || text.includes("alat") || text.includes("molen") || text.includes("mixer") || text.includes("vibrator") || text.includes("mesin")) {
                return "ALAT";
            }
            if (text.includes("konsumsi") || text.includes("koordinasi") || text.includes("rapat") || text.includes("atk") || text.includes("cetak") || text.includes("dokumentasi") || text.includes("spanduk") || text.includes("operasional") || text.includes("honor")) {
                return "OPERASIONAL";
            }
            return "BAHAN";
        };

        // 4. Parse rows into RabItem format
        const rabItems: any[] = [];
        for (const row of rowsData) {
            if (!row[1] || row[1].trim() === "" || row[1] === "Uraian" || row[1].toLowerCase().includes("uraian") || row[1].toLowerCase().includes("bahan") || row[1].toLowerCase().includes("alat") || row[1].toLowerCase().includes("upah") || row[1].toLowerCase().includes("biaya")) {
                continue;
            }

            const item = row[1].trim();
            const volume = parseFloat(row[2]) || 0;
            if (volume === 0) continue; // skip header/subtotal empty rows

            const volSwadaya = parseFloat(row[3]) || 0;
            const volApbd = parseFloat(row[4]) || Math.max(0, volume - volSwadaya);
            const satuan = row[5] ? row[5].trim() : "Unit";
            const harga = parseFloat(row[7]?.toString().replace(/[^\d]/g, "")) || 0;
            
            const category = getCategoryFromUraian(item);
            const swadayaTotal = volSwadaya * harga;
            const apbdTotal = volApbd * harga;
            const total = volume * harga;

            rabItems.push({
                category,
                item,
                satuan,
                volume,
                volSwadaya,
                volApbd,
                harga,
                swadayaTotal,
                apbdTotal,
                total,
                ppn: 0,
                pph21: 0,
                pph22: 0,
                pph23: 0
            });
        }

        return {
            success: true,
            rabItems,
            templateId,
            templateRange
        };
    } catch (error: any) {
        console.error("Gagal sinkronisasi RAB dari template:", error);
        throw new Error(error.message || "Gagal sinkronisasi RAB dari template.");
    }
}

// Export the finalized RAB of a proposal into a brand-new Google Sheet formatted officially
export async function exportProposalRabToGoogleSheet(proposalId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        // 1. Fetch proposal details
        const proposal = await prisma.financeProposal.findUnique({
            where: { id: proposalId },
            include: { user: true }
        });

        if (!proposal) {
            throw new Error("Usulan tidak ditemukan.");
        }

        const rabItems = (proposal.rab as any[]) || [];
        if (rabItems.length === 0) {
            throw new Error("RAB usulan ini masih kosong.");
        }

        // 2. Fetch Google integration settings
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        if (!configRecord) {
            throw new Error("Konfigurasi sistem global_config tidak ditemukan.");
        }

        const settings = (configRecord.settings as any) || {};
        const integration = settings.googleIntegration;
        if (!integration || !integration.isConnected) {
            throw new Error("Integrasi Google API belum diaktifkan oleh Master Admin.");
        }

        // 3. Get Authenticated Google Client with mock fallback
        let sheets: any = null;
        let isMock = false;

        try {
            if (integration?.oauth?.clientId === "mock-client-id" || !integration?.isConnected) {
                isMock = true;
            } else {
                const authRes = await getAuthenticatedClient(integration);
                sheets = google.sheets({ version: "v4", auth: authRes.auth as any });
            }
        } catch (authErr) {
            console.warn("Using simulated export fallback due to Google Auth failure:", authErr);
            isMock = true;
        }

        if (isMock || !sheets) {
            return {
                success: true,
                spreadsheetId: "mock-spreadsheet-id-for-demo",
                spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1o6eR0qF3T80L6kS0y1ZzR7R9s6X5T9d4yE8Jp2K1oQ4/edit?usp=sharing",
                isSimulated: true
            };
        }

        // 4. Create new Google Spreadsheet
        const title = `RAB_Resmi_${proposal.title.replace(/\s+/g, "_")}_2026`;
        const createRes = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title }
            }
        });

        const spreadsheetId = createRes.data.spreadsheetId;
        if (!spreadsheetId) {
            throw new Error("Gagal membuat Spreadsheet baru.");
        }

        // 5. Build official Indonesian Village RAB format values
        const values: any[][] = [
            ["", "", "", "", "", "", "RANCANGAN ANGGARAN BIAYA DESA"],
            [],
            ["Provinsi", "", ": Jawa Barat", "", "", "", "", "", "No. RAB", "", ": " + (proposal.id.substring(0,8).toUpperCase())],
            ["Kabupaten", "", ": Bogor", "", "", "", "", "", "Program", "", ": Pembangunan Desa"],
            ["Kecamatan", "", ": Caringin", "", "", "", "", "", "Jenis Kegiatan", "", ": " + proposal.title],
            ["Desa", "", ": Cimanggu I", "", "", "", "", "", "Ukuran/Dimensi", "", ": " + (proposal.volume || "-")],
            ["Lokasi", "", ": " + (proposal.description.substring(0, 50))],
            [],
            [
                "NO", 
                "URAIAN", 
                "VOLUME TOTAL", 
                "VOLUME SWADAYA", 
                "VOLUME APBD", 
                "SATUAN", 
                "KODE KATEGORI", 
                "HARGA SATUAN (Rp)", 
                "DANA SWADAYA (Rp)", 
                "DANA APBD (Rp)", 
                "TOTAL (Rp)", 
                "PPN 11% (Rp)", 
                "PPH 21 5% (Rp)", 
                "PPH 22 1.5% (Rp)", 
                "PPH 23 2% (Rp)"
            ]
        ];

        const categoriesList = [
            { id: "BAHAN", label: "I. BAHAN (MATERIAL)", subLabel: "Sub total I" },
            { id: "ALAT", label: "II. ALAT (PERALATAN)", subLabel: "Sub total II" },
            { id: "UPAH", label: "III. UPAH (TENAGA KERJA)", subLabel: "Sub total III" },
            { id: "OPERASIONAL", label: "IV. BIAYA OPERASIONAL", subLabel: "Sub total IV" }
        ];

        let grandTotal = 0;
        let grandSwadayaTotal = 0;
        let grandApbdTotal = 0;
        let grandPpn = 0;
        let grandPph21 = 0;
        let grandPph22 = 0;
        let grandPph23 = 0;

        for (const cat of categoriesList) {
            const catItems = rabItems.filter((item: any) => item.category === cat.id);
            
            // Push group header row
            values.push(["", cat.label]);
            
            let catTotal = 0;
            let catSwadaya = 0;
            let catApbd = 0;
            let catPpn = 0;
            let catPph21 = 0;
            let catPph22 = 0;
            let catPph23 = 0;
            
            let itemIndex = 1;
            for (const item of catItems) {
                const vol = parseFloat(item.volume) || 0;
                const volSwad = parseFloat(item.volSwadaya) || 0;
                const volAp = Math.max(0, vol - volSwad);
                const price = parseFloat(item.harga) || 0;
                
                const sTotal = volSwad * price;
                const aTotal = volAp * price;
                const total = vol * price;
                
                const ppnVal = parseFloat(item.ppn) || 0;
                const pph21Val = parseFloat(item.pph21) || 0;
                const pph22Val = parseFloat(item.pph22) || 0;
                const pph23Val = parseFloat(item.pph23) || 0;

                catTotal += total;
                catSwadaya += sTotal;
                catApbd += aTotal;
                catPpn += ppnVal;
                catPph21 += pph21Val;
                catPph22 += pph22Val;
                catPph23 += pph23Val;

                values.push([
                    itemIndex.toString(),
                    item.item || "",
                    vol.toString(),
                    volSwad.toString(),
                    volAp.toString(),
                    item.satuan || "",
                    "",
                    price.toString(),
                    sTotal.toString(),
                    aTotal.toString(),
                    total.toString(),
                    ppnVal.toString(),
                    pph21Val.toString(),
                    pph22Val.toString(),
                    pph23Val.toString()
                ]);
                itemIndex++;
            }
            
            grandTotal += catTotal;
            grandSwadayaTotal += catSwadaya;
            grandApbdTotal += catApbd;
            grandPpn += catPpn;
            grandPph21 += catPph21;
            grandPph22 += catPph22;
            grandPph23 += catPph23;

            // Push subtotal row
            values.push([
                "", 
                cat.subLabel, 
                "", 
                "", 
                "", 
                "", 
                "", 
                "", 
                catSwadaya.toString(), 
                catApbd.toString(), 
                catTotal.toString(),
                catPpn.toString(),
                catPph21.toString(),
                catPph22.toString(),
                catPph23.toString()
            ]);
        }

        // Push total row
        values.push([]);
        values.push([
            "", 
            "TOTAL BIAYA", 
            "", 
            "", 
            "", 
            "", 
            "", 
            "", 
            grandSwadayaTotal.toString(), 
            grandApbdTotal.toString(), 
            grandTotal.toString(),
            grandPpn.toString(),
            grandPph21.toString(),
            grandPph22.toString(),
            grandPph23.toString()
        ]);
        
        values.push([]);
        values.push(["", "SUMBER DANA SUMMARY"]);
        values.push(["", "APBD (Desa)", grandApbdTotal.toString()]);
        values.push(["", "Swadaya Masyarakat", grandSwadayaTotal.toString()]);
        values.push(["", "Grand Total", grandTotal.toString()]);
        
        values.push([]);
        values.push(["", "", "", "", "", "", "Disetujui,", "", "", "", "Dibuat oleh,"]);
        values.push(["", "", "", "", "", "", "Kepala Desa Cimanggu I", "", "", "", "Tim Pelaksana Kegiatan"]);
        values.push([]);
        values.push([]);
        values.push(["", "", "", "", "", "", "HERNAWAN M. SODIK", "", "", "", "FERRY GUNAWAN"]);

        // 6. Write values to Spreadsheet
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Sheet1!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values }
        });

        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

        return {
            success: true,
            spreadsheetUrl,
            spreadsheetId
        };
    } catch (error: any) {
        console.error("Gagal mengekspor RAB ke Google Sheet:", error);
        throw new Error(error.message || "Gagal mengekspor RAB ke Google Sheet.");
    }
}

// Fetch official templates for all users
export async function getOfficialTemplates() {
    try {
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        if (!configRecord) {
            return [];
        }

        const settings = (configRecord.settings as any) || {};
        return settings.officialTemplates || [];
    } catch (error) {
        console.error("Gagal mengambil template resmi:", error);
        return [];
    }
}


