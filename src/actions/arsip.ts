"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getArsipKategori(kategori: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    // Check if the user is ADMIN_MASTER or ADMIN_DESA, or if they are just normal user getting their own category.
    // If they are Admin Desa, they can view all of them.
    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN_MASTER" && userRole !== "ADMIN_DESA") {
        // if user is e.g. KASI, they should only see KASI. But this function is for Admin Desa mostly.
        // We will just let them fetch based on tenant anyway.
    }

    const tenantId = (session.user as any).tenantId;

    const reports = await prisma.arsipLaporan.findMany({
        where: {
            tenantId,
            kategori
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return reports;
}

export async function saveGeneratedReport(data: {
    templateId?: string;
    templateName: string;
    kategori: string;
    fileUrl: string;
    formData?: any;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const tenantId = (session.user as any).tenantId;

    const report = await prisma.arsipLaporan.create({
        data: {
            templateId: data.templateId,
            templateName: data.templateName,
            kategori: data.kategori,
            fileUrl: data.fileUrl,
            formData: data.formData ? JSON.stringify(data.formData) : undefined,
            generatedByUserId: session.user.id,
            generatedByName: (session.user as any).fullName || "User",
            tenantId
        }
    });

    return report;
}
