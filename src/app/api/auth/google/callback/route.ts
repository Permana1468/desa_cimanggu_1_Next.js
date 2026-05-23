import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const baseUrl = new URL(req.url).origin;

    if (error) {
        return NextResponse.redirect(
            new URL(`/master-admin/integrasi?status=error&message=${encodeURIComponent(error)}`, baseUrl)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL(`/master-admin/integrasi?status=error&message=Authorization+code+missing`, baseUrl)
        );
    }

    try {
        // Fetch current settings to get Client ID & Secret
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        const currentSettings = (configRecord?.settings as any) || {};
        const googleConfig = currentSettings.googleIntegration;

        if (!googleConfig || googleConfig.type !== "oauth2" || !googleConfig.oauth?.clientId || !googleConfig.oauth?.clientSecret) {
            return NextResponse.redirect(
                new URL(`/master-admin/integrasi?status=error&message=Google+OAuth2+credentials+not+configured+in+database`, baseUrl)
            );
        }

        const clientId = googleConfig.oauth.clientId;
        const clientSecret = googleConfig.oauth.clientSecret;

        // Build redirect URI matching the one generated during auth initiation
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
        const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri
        );

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get connected user's email
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const connectedEmail = userInfo.data.email || "OAuth2 Connected Account";

        // Save updated googleIntegration config in SystemSetting
        const updatedSettings = {
            ...currentSettings,
            googleIntegration: {
                ...googleConfig,
                isConnected: true,
                oauth: {
                    clientId,
                    clientSecret,
                    tokens,
                    connectedEmail
                },
                updatedAt: new Date().toISOString()
            }
        };

        await prisma.systemSetting.upsert({
            where: { id: "global_config" },
            update: { settings: updatedSettings, updatedAt: new Date() },
            create: { id: "global_config", settings: updatedSettings, updatedAt: new Date() }
        });

        // Audit Log entry
        // We do not have direct session here, but we can log that oauth connected successfully
        await prisma.auditLog.create({
            data: {
                action: "CONNECT_GOOGLE_OAUTH2_SUCCESS",
                entity: "SystemSetting",
                entityId: "global_config",
                details: { connectedEmail },
                category: "SYSTEM",
                // fallback to first tenant found as it is system-wide master configuration
                tenantId: currentSettings.defaultTenantId || (await prisma.tenant.findFirst())?.id || ""
            }
        });

        return NextResponse.redirect(new URL("/master-admin/integrasi?status=success", baseUrl));
    } catch (err: any) {
        console.error("Error in Google OAuth Callback:", err);
        return NextResponse.redirect(
            new URL(`/master-admin/integrasi?status=error&message=${encodeURIComponent(err.message || "OAuth exchange failed")}`, baseUrl)
        );
    }
}
