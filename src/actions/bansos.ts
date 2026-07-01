"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function cleanDigits(val: string): string {
    return val ? val.toString().replace(/\D/g, '').replace(/^0+/, '') || '0' : '';
}

async function getBansosSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    // Allow RT, RW, KASI, KADES, SEKDES, ADMIN_DESA, ADMIN_MASTER
    if (!["RT", "RW", "KASI", "KADES", "SEKDES", "ADMIN_DESA", "ADMIN_MASTER"].includes(role)) {
        throw new Error("Unauthorized");
    }
    const tenantId = (session.user as { tenantId: string }).tenantId;
    const rt = (session.user as any).rt || "";
    const rw = (session.user as any).rw || "";
    return { session, tenantId, rt, rw, role };
}

export async function getBansosList() {
    try {
        const { tenantId, rt, rw, role } = await getBansosSession();
        let filterScope: any = { tenantId };
        
        // RT/RW can only see their own residents' bansos
        if (role === "RT") {
            const rtClean = cleanDigits(rt || "");
            const rwClean = cleanDigits(rw || "");
            filterScope.rt = { in: [rt, rtClean, rtClean.padStart(3, '0')] };
            filterScope.rw = { in: [rw, rwClean, rwClean.padStart(3, '0')] };
        } else if (role === "RW") {
            const rwClean = cleanDigits(rw || "");
            filterScope.rw = { in: [rw, rwClean, rwClean.padStart(3, '0')] };
        }

        const wargaList = await prisma.dataKependudukan.findMany({
            where: filterScope,
            include: {
                bansosData: true
            },
            orderBy: {
                namaLengkap: 'asc'
            }
        });

        return wargaList;
    } catch (error) {
        console.error("Failed to get bansos list:", error);
        return [];
    }
}

export async function updateBansosData(data: {
    wargaId: string;
    desil?: number | null;
    jenisBantuan?: string[];
    status?: string;
    keterangan?: string;
}) {
    const { tenantId } = await getBansosSession();
    try {
        const bansos = await prisma.bansosData.upsert({
            where: {
                wargaId: data.wargaId
            },
            update: {
                desil: data.desil,
                jenisBantuan: data.jenisBantuan,
                status: data.status,
                keterangan: data.keterangan
            },
            create: {
                wargaId: data.wargaId,
                desil: data.desil,
                jenisBantuan: data.jenisBantuan || [],
                status: data.status || "AKTIF",
                keterangan: data.keterangan || "",
                tenantId
            }
        });

        revalidatePath("/dashboard/bansos");
        return { success: true, bansos };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBansosStats() {
    try {
        const { tenantId, rt, rw, role } = await getBansosSession();
        
        let filterScope: any = { tenantId };
        if (role === "RT") {
            const rtClean = cleanDigits(rt || "");
            const rwClean = cleanDigits(rw || "");
            filterScope.rt = { in: [rt, rtClean, rtClean.padStart(3, '0')] };
            filterScope.rw = { in: [rw, rwClean, rwClean.padStart(3, '0')] };
        } else if (role === "RW") {
            const rwClean = cleanDigits(rw || "");
            filterScope.rw = { in: [rw, rwClean, rwClean.padStart(3, '0')] };
        }

        const totalWarga = await prisma.dataKependudukan.count({ where: filterScope });
        
        const bansosList = await prisma.bansosData.findMany({
            where: {
                tenantId,
                warga: filterScope
            }
        });

        const totalPenerima = bansosList.length;
        let pkhCount = 0;
        let bpntCount = 0;
        let bltCount = 0;

        bansosList.forEach(b => {
            if (b.jenisBantuan && Array.isArray(b.jenisBantuan)) {
                if (b.jenisBantuan.includes("PKH")) pkhCount++;
                if (b.jenisBantuan.includes("BPNT")) bpntCount++;
                if (b.jenisBantuan.includes("BLT-DD")) bltCount++;
            }
        });

        return {
            totalWarga,
            totalPenerima,
            pkhCount,
            bpntCount,
            bltCount
        };
    } catch (error) {
        return {
            totalWarga: 0,
            totalPenerima: 0,
            pkhCount: 0,
            bpntCount: 0,
            bltCount: 0
        };
    }
}
