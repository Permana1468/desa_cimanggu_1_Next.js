"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function verifyWargaUser(userId: string, isActive: boolean) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const role = (session.user as any).role;
        // Hanya Admin Desa atau Admin Master yang bisa memverifikasi
        if (role !== "ADMIN_DESA" && role !== "KADES" && role !== "ADMIN_MASTER") {
            throw new Error("Hanya Admin Desa yang dapat memverifikasi warga");
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== "WARGA") {
            throw new Error("Pengguna tidak ditemukan atau bukan Warga");
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: isActive ? "VERIFY_WARGA" : "UNVERIFY_WARGA",
                entity: "User",
                entityId: userId,
                details: { status: isActive },
                userId: (session.user as any).id,
                tenantId: (session.user as any).tenantId
            }
        });

        revalidatePath("/dashboard/verifikasi-warga");
        revalidatePath("/master-admin/warga-users");
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
