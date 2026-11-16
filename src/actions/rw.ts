"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getWilayahVariants } from "@/lib/wilayahUtils";

async function verifyRwAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rw = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "RW" && role !== "ADMIN_DESA" && role !== "ADMIN_MASTER" && role !== "KADES" && role !== "SEKDES") {
        throw new Error("Akses ditolak. Fitur ini hanya untuk pengurus RW.");
    }

    return { tenantId, rw, user: session.user };
}

// =======================
// SECURITY LOGS
// =======================

export async function getRwSecurityLogs(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwSecurityLog.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        orderBy: { date: "desc" }
    });
}

export async function addRwSecurityLog(data: { type: string, reporter: string, title: string, description: string, date: Date, rw?: string }) {
    const { tenantId, rw: userRw } = await verifyRwAccess();
    const targetRw = data.rw || userRw || "009";

    const log = await prisma.rwSecurityLog.create({
        data: {
            type: data.type,
            reporter: data.reporter,
            title: data.title,
            description: data.description,
            date: data.date,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, log };
}

export async function updateRwSecurityLogStatus(id: string, status: string) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwSecurityLog.updateMany({
        where: { id, tenantId },
        data: { status }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwSecurityLog(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwSecurityLog.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// PATROL SCHEDULES
// =======================

export async function getRwPatrolSchedules(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwPatrolSchedule.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        orderBy: { date: "desc" }
    });
}

export async function addRwPatrolSchedule(data: { rt: string, date: Date, personnel: string, notes?: string, rw?: string }) {
    const { tenantId, rw: userRw } = await verifyRwAccess();
    const targetRw = data.rw || userRw || "009";

    const schedule = await prisma.rwPatrolSchedule.create({
        data: {
            rt: data.rt,
            date: data.date,
            personnel: data.personnel,
            notes: data.notes,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, schedule };
}

export async function updateRwPatrolSchedule(id: string, data: { rt: string, date: Date, personnel: string, notes?: string }) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwPatrolSchedule.updateMany({
        where: { id, tenantId },
        data: {
            rt: data.rt,
            date: data.date,
            personnel: data.personnel,
            notes: data.notes
        }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwPatrolSchedule(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwPatrolSchedule.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// HEALTH DATA
// =======================

export async function getRwHealthData(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwHealthData.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        orderBy: [{ year: "desc" }, { month: "desc" }]
    });
}

export async function addRwHealthData(data: { 
    month: number, year: number, posyanduName?: string,
    balitaTotal: number, balitaStunting: number,
    ibuHamil: number, lansia: number, imunisasiPercentage: number, notes?: string,
    rw?: string
}) {
    // Health data can also be updated by POSYANDU role
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const userRw = (session.user as any).rw;
    const targetRw = data.rw || userRw || "009";
    const tenantId = (session.user as any).tenantId;

    if (role !== "RW" && role !== "POSYANDU" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "SEKDES") {
        throw new Error("Akses ditolak. Fitur ini untuk pengurus RW atau Kader Posyandu.");
    }

    const { rw: _discard, ...restData } = data;
    const healthData = await prisma.rwHealthData.create({
        data: {
            ...restData,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, healthData };
}

export async function updateRwHealthData(id: string, data: {
    month: number, year: number, posyanduName?: string,
    balitaTotal: number, balitaStunting: number,
    ibuHamil: number, lansia: number, imunisasiPercentage: number, notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as any).tenantId;

    await prisma.rwHealthData.updateMany({
        where: { id, tenantId },
        data
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwHealthData(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as any).tenantId;
    
    await prisma.rwHealthData.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Real-time demographic calculation directly from DataKependudukan for this RW.
 * Provides the RW Chairman with actual live figures for Balita (0-5 y.o.), Lansia (60+ y.o.), and total population.
 */
export async function getRwHealthRealtimeSummary(rwParam?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as any).tenantId;
        const rw = rwParam || (session.user as any).rw;

        if (!tenantId || !rw) return null;

        const residents = await prisma.dataKependudukan.findMany({
            where: {
                tenantId,
                rw: { in: getWilayahVariants(rw) },
                statusKependudukan: { notIn: ["MENINGGAL", "PINDAH"] }
            },
            select: {
                tanggalLahir: true,
                jenisKelamin: true,
                noKK: true
            }
        });

        const today = new Date();
        let totalBalita = 0;
        let totalLansia = 0;
        const uniqueKK = new Set<string>();

        residents.forEach(r => {
            if (r.noKK) uniqueKK.add(r.noKK);
            if (r.tanggalLahir) {
                const birth = new Date(r.tanggalLahir);
                const ageYears = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
                if (ageYears >= 0 && ageYears <= 5) {
                    totalBalita++;
                } else if (ageYears >= 60) {
                    totalLansia++;
                }
            }
        });

        return {
            totalWarga: residents.length,
            totalKK: uniqueKK.size,
            totalBalita,
            totalLansia
        };
    } catch {
        return null;
    }
}

// =======================
// INSTITUTIONS & MEMBERS
// =======================

export async function getRwInstitutions(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwInstitution.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        include: { 
            members: {
                orderBy: { position: "asc" }
            } 
        },
        orderBy: { name: "asc" }
    });
}

export async function addRwInstitution(data: { name: string, description?: string, rw?: string }) {
    const { tenantId, rw: userRw } = await verifyRwAccess();
    const targetRw = data.rw || userRw || "009";

    const institution = await prisma.rwInstitution.create({
        data: {
            name: data.name,
            description: data.description,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, institution };
}

export async function updateRwInstitution(id: string, data: { name: string, description?: string }) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwInstitution.updateMany({
        where: { id, tenantId },
        data: {
            name: data.name,
            description: data.description
        }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwInstitution(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    // Explicitly delete members first to ensure no constraint violations
    await prisma.rwInstitutionMember.deleteMany({
        where: { rwInstitutionId: id, tenantId }
    });
    
    await prisma.rwInstitution.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function addRwInstitutionMember(institutionId: string, data: { name: string, position: string, phoneNumber?: string }) {
    const { tenantId } = await verifyRwAccess();

    const member = await prisma.rwInstitutionMember.create({
        data: {
            ...data,
            rwInstitutionId: institutionId,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, member };
}

export async function updateRwInstitutionMember(id: string, data: { name: string, position: string, phoneNumber?: string }) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwInstitutionMember.updateMany({
        where: { id, tenantId },
        data: {
            name: data.name,
            position: data.position,
            phoneNumber: data.phoneNumber
        }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function removeRwInstitutionMember(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwInstitutionMember.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}
