"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdminDesa() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session?.user || role === "WARGA") {
        throw new Error("Unauthorized");
    }
    return session as any;
}

// ==============================
// 1. INFRASTRUKTUR PROJECTS
// ==============================
export async function getInfrastrukturProjects(tenantId: string) {
    await checkAdminDesa();
    try {
        return await prisma.infrastrukturProject.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { fullName: true } } }
        });
    } catch (error) {
        console.error("Failed to get projects:", error);
        return [];
    }
}

export async function upsertInfrastrukturProject(data: any) {
    const session = await checkAdminDesa();
    try {
        const { id, ...rest } = data;
        
        let result;
        if (id) {
            result = await prisma.infrastrukturProject.update({
                where: { id },
                data: rest
            });
        } else {
            result = await prisma.infrastrukturProject.create({
                data: {
                    ...rest,
                    userId: session.user.id
                }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: id ? "UPDATE_INFRASTRUKTUR" : "CREATE_INFRASTRUKTUR",
                entity: "InfrastrukturProject",
                entityId: result.id,
                details: { namaProyek: data.namaProyek },
                userId: session.user.id,
                tenantId: data.tenantId,
                category: "SYSTEM"
            }
        });

        revalidatePath("/dashboard/infrastruktur");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function saveProjectRab(projectId: string, rabItems: any[]) {
    const session = await checkAdminDesa();
    try {
        const result = await prisma.infrastrukturProject.update({
            where: { id: projectId },
            data: {
                rab: JSON.parse(JSON.stringify(rabItems))
            }
        });
        revalidatePath("/dashboard/infrastruktur");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteInfrastrukturProject(id: string) {
    const session = await checkAdminDesa();
    try {
        const project = await prisma.infrastrukturProject.delete({ where: { id } });
        await prisma.auditLog.create({
            data: {
                action: "DELETE_INFRASTRUKTUR",
                entity: "InfrastrukturProject",
                entityId: id,
                details: { namaProyek: project.namaProyek },
                userId: session.user.id,
                tenantId: project.tenantId,
                category: "SYSTEM"
            }
        });
        revalidatePath("/dashboard/infrastruktur");
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ==============================
// 2. APBDES FINANCE
// ==============================
export async function getApbdesFinances(tenantId: string, tahunAnggaran: number) {
    await checkAdminDesa();
    try {
        return await prisma.apbdesFinance.findMany({
            where: { tenantId, tahunAnggaran },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertApbdesFinance(data: any) {
    const session = await checkAdminDesa();
    try {
        const { id, ...rest } = data;
        let result;
        if (id) {
            result = await prisma.apbdesFinance.update({
                where: { id },
                data: rest
            });
        } else {
            result = await prisma.apbdesFinance.create({
                data: {
                    ...rest,
                    userId: session.user.id
                }
            });
        }
        revalidatePath("/dashboard/finance");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteApbdesFinance(id: string) {
    await checkAdminDesa();
    try {
        await prisma.apbdesFinance.delete({ where: { id } });
        revalidatePath("/dashboard/finance");
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ==============================
// 3. VILLAGE DOCUMENTS (REGULASI)
// ==============================
export async function getVillageDocuments(tenantId: string) {
    await checkAdminDesa();
    try {
        return await prisma.villageDocument.findMany({
            where: { tenantId },
            orderBy: { tanggalDitetapkan: 'desc' },
            include: { user: { select: { fullName: true } } }
        });
    } catch (error) {
        return [];
    }
}

export async function upsertVillageDocument(data: any) {
    const session = await checkAdminDesa();
    try {
        const { id, ...rest } = data;
        let result;
        if (id) {
            result = await prisma.villageDocument.update({
                where: { id },
                data: rest
            });
        } else {
            result = await prisma.villageDocument.create({
                data: {
                    ...rest,
                    userId: session.user.id
                }
            });
        }
        revalidatePath("/dashboard/arsip");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteVillageDocument(id: string) {
    await checkAdminDesa();
    try {
        await prisma.villageDocument.delete({ where: { id } });
        revalidatePath("/dashboard/arsip");
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ==============================
// 4. ANALITICS (Realtime Stats)
// ==============================
export async function getDashboardRealtimeStats() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized");
    }
    const tenantId = (session.user as any).tenantId;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [suratHariIni, totalAntrean, suratSelesai] = await Promise.all([
            prisma.surat.count({
                where: { tenantId, createdAt: { gte: today } }
            }),
            prisma.surat.count({
                where: { tenantId, status: "TERTUNDA" }
            }),
            prisma.surat.count({
                where: { tenantId, status: "DISETUJUI", createdAt: { gte: today } }
            })
        ]);

        return {
            suratHariIni,
            totalAntrean,
            suratSelesai
        };
    } catch (error) {
        return {
            suratHariIni: 0,
            totalAntrean: 0,
            suratSelesai: 0
        };
    }
}

export async function saveApbdesBatch(dataArray: any[], tenantId: string) {
    const session = await checkAdminDesa();
    try {
        const createData = dataArray.map((item) => ({
            ...item,
            tenantId,
            userId: session.user.id
        }));

        await prisma.apbdesFinance.createMany({
            data: createData
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
}
