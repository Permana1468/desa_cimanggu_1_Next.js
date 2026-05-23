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
async function getRedirectUri() {
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
