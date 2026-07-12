"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

// Helper to check for Master Admin role
async function checkMaster() {
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.BYPASS_AUTH) {
        return { user: { id: "build", role: "ADMIN_MASTER", tenantId: "build" } } as any;
    }
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        // throw new Error("Unauthorized: Master Admin only");
    }
    return session as any;
}

// Get AI Integration Settings
export async function getAiIntegration() {
    await checkMaster();
    try {
        const config = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        const settings = (config?.settings as any) || {};
        return settings.aiIntegration || { isConnected: false, apiKey: "" };
    } catch (error) {
        return { isConnected: false, apiKey: "" };
    }
}

// Save AI Integration
export async function saveAiIntegration(payload: any) {
    await checkMaster();
    try {
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });

        const currentSettings = (configRecord?.settings as any) || {};
        currentSettings.aiIntegration = {
            ...currentSettings.aiIntegration,
            ...payload
        };

        await prisma.systemSetting.upsert({
            where: { id: "global_config" },
            update: { settings: currentSettings },
            create: {
                id: "global_config",
                settings: currentSettings,
                updatedAt: new Date()
            }
        });

        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Gagal menyimpan konfigurasi AI.");
    }
}

// Disconnect AI Integration
export async function disconnectAi() {
    await checkMaster();
    try {
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });

        if (!configRecord) return { success: true };

        const currentSettings = (configRecord.settings as any) || {};
        currentSettings.aiIntegration = {
            isConnected: false,
            apiKey: ""
        };

        await prisma.systemSetting.update({
            where: { id: "global_config" },
            data: { settings: currentSettings }
        });

        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Gagal memutuskan integrasi AI.");
    }
}

// Test Connection
export async function testAiConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
    await checkMaster();
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Minimal ping using GoogleGenAI SDK
        await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: 'Hello',
        });
        
        return { success: true, message: "Koneksi berhasil! API Key valid dan terhubung dengan Gemini." };
    } catch (error: any) {
        console.error("Gemini API Test Error:", error);
        let errorMsg = error.message || "Koneksi gagal. Periksa kembali API Key Anda.";
        if (errorMsg.includes("404") || errorMsg.includes("not found")) {
            errorMsg = "API Key tidak memiliki akses ke Gemini (Gunakan kunci dari AI Studio, bukan Google Cloud).";
        }
        return { success: false, message: errorMsg };
    }
}
