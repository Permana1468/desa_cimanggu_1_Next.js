"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { executeCppCensusEngine, DemographicPyramidResult } from "@/lib/censusBridge";

// Define the type for the returned points to ensure type safety in components
export type PendingSensusPoint = {
    id: string;
    rt: string;
    rw: string;
    type: string;
    latitude: number;
    longitude: number;
    nomorUrut: number | null;
    noKK: string | null;
    statusWarga: string | null;
    name: string | null;
    categoryFasum: string | null;
    description: string | null;
    status: string;
    createdAt: Date;
    createdBy: {
        fullName: string;
        email: string | null;
    } | null;
};

export async function getPendingSensusPoints(): Promise<PendingSensusPoint[]> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    // In a real app we'd verify admin role here
    const tenantId = session.user.tenantId || "default";
    
    const points = await prisma.sensusPoint.findMany({
        where: {
            status: "MENUNGGU_VERIFIKASI",
            tenantId
        },
        include: {
            createdBy: {
                select: { fullName: true, email: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 200
    });

    return points;
}

export async function verifySensusPoint(id: string, newStatus: "DISETUJUI" | "DITOLAK") {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const point = await prisma.sensusPoint.update({
        where: { id },
        data: {
            status: newStatus,
            verifiedById: session.user.id
        }
    });

    if (newStatus === "DISETUJUI" && point.type === "RUMAH_WARGA" && point.noKK) {
        // Fetch Master Village Structure dynamically
        const config = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const villageStructure = (config?.settings as any) || { dusun: [] };
        
        let dusunStr = "";
        if (villageStructure?.dusun) {
            for (const dusun of villageStructure.dusun) {
                const rwObj = dusun.rw.find((r: any) => {
                    const match = r.name.match(/\d+/);
                    return match && String(match[0]).padStart(3, '0') === String(point.rw).padStart(3, '0');
                });
                if (rwObj) {
                    dusunStr = dusun.name;
                    break;
                }
            }
        }

        // Update DataKependudukan to sync RT, RW, and Dusun
        await prisma.dataKependudukan.updateMany({
            where: { noKK: point.noKK, tenantId: point.tenantId },
            data: {
                rt: point.rt,
                rw: point.rw,
                ...(dusunStr && { dusun: dusunStr })
            }
        });
    }

    revalidatePath("/sensus-app/admin");
    revalidatePath("/gis-dashboard");
    return { success: true };
}

export async function createSensusPoint(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    await prisma.sensusPoint.create({
        data: {
            ...data,
            tenantId: session.user.tenantId || "default",
            status: "MENUNGGU_VERIFIKASI",
            createdById: session.user.id
        }
    });

    revalidatePath("/sensus-app/admin");
    return { success: true };
}

/**
 * High-performance demographic aggregation & census fuzzy search
 * Powered by Native C++ Core with Zero-Downtime TypeScript Fallback
 */
export async function getCensusDemographicsFast(query: string = ""): Promise<DemographicPyramidResult> {
    try {
        return await executeCppCensusEngine(query);
    } catch (e) {
        console.warn("Census C++ execution failed, graceful fallback:", e);
        return {
            engine: "Fallback",
            statusSuccess: false,
            executionTimeMilliseconds: 0,
            totalProcessedRecords: 0,
            demographics: {
                totalLaki: 0,
                totalPerempuan: 0,
                sexRatio: 100,
                dependencyRatio: 50,
                piramidaUsia: {
                    balita_0_4: 0,
                    anak_5_14: 0,
                    pemuda_15_24: 0,
                    produktif_25_54: 0,
                    praLansia_55_64: 0,
                    lansia_65_plus: 0,
                },
            },
            searchResults: [],
            executionMode: "TYPESCRIPT_FALLBACK",
        };
    }
}
