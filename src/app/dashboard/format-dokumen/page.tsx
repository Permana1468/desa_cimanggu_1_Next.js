import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { FormatDokumenClient } from "@/components/dashboard/format-dokumen/FormatDokumenClient";

export default async function FormatDokumenPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const tenantId = (session.user as any).tenantId;
    const rawRole = (session.user as any).role || "";
    
    // Convert specific roles to categories
    let category = rawRole;
    if (rawRole.startsWith("KASI_")) category = "KASI";
    if (rawRole.startsWith("KAUR_")) category = "KAUR";
    if (rawRole.includes("KADUS")) category = "KADUS";

    // Fetch official templates from global_config
    const config = await prisma.systemSetting.findUnique({
        where: { id: "global_config" }
    });

    let allTemplates: any[] = [];
    if (config?.settings && typeof config.settings === 'object' && 'officialTemplates' in config.settings) {
        allTemplates = (config.settings as any).officialTemplates || [];
    }

    // Filter by role (UMUM + matching category)
    // ADMIN_DESA / MASTER can see all
    let availableTemplates = allTemplates;
    if (rawRole !== "ADMIN_DESA" && rawRole !== "ADMIN_MASTER" && rawRole !== "KADES") {
        availableTemplates = allTemplates.filter(t => t.category === "UMUM" || t.category === category);
    }

    return <FormatDokumenClient templates={availableTemplates} userCategory={category} />;
}
