"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifyRwAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rw = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "RW" && role !== "ADMIN_DESA" && role !== "ADMIN_MASTER" && role !== "KADES") {
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
        where: { tenantId, rw },
        orderBy: { date: "desc" }
    });
}

export async function addRwSecurityLog(data: { type: string, reporter: string, title: string, description: string, date: Date }) {
    const { tenantId, rw } = await verifyRwAccess();

    const log = await prisma.rwSecurityLog.create({
        data: {
            ...data,
            rw,
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
        where: { tenantId, rw },
        orderBy: { date: "desc" }
    });
}

export async function addRwPatrolSchedule(data: { rt: string, date: Date, personnel: string, notes?: string }) {
    const { tenantId, rw } = await verifyRwAccess();

    const schedule = await prisma.rwPatrolSchedule.create({
        data: {
            ...data,
            rw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, schedule };
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
        where: { tenantId, rw },
        orderBy: [{ year: "desc" }, { month: "desc" }]
    });
}

export async function addRwHealthData(data: { 
    month: number, year: number, posyanduName?: string,
    balitaTotal: number, balitaStunting: number,
    ibuHamil: number, lansia: number, imunisasiPercentage: number, notes?: string
}) {
    // Health data can also be updated by POSYANDU role
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rw = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "RW" && role !== "POSYANDU" && role !== "ADMIN_DESA" && role !== "KADES") {
        throw new Error("Akses ditolak. Fitur ini untuk pengurus RW atau Kader Posyandu.");
    }

    const healthData = await prisma.rwHealthData.create({
        data: {
            ...data,
            rw: rw || "000",
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, healthData };
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

// =======================
// INSTITUTIONS & MEMBERS
// =======================

export async function getRwInstitutions(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwInstitution.findMany({
        where: { tenantId, rw },
        include: { members: true },
        orderBy: { name: "asc" }
    });
}

export async function addRwInstitution(data: { name: string, description?: string }) {
    const { tenantId, rw } = await verifyRwAccess();

    const institution = await prisma.rwInstitution.create({
        data: {
            ...data,
            rw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, institution };
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

export async function removeRwInstitutionMember(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwInstitutionMember.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwInstitution(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwInstitution.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}
