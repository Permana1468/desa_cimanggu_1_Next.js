"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as turf from '@turf/turf';

async function getRtSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    if (role !== "RT" && role !== "RW" && role !== "KADUS" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "SEKDES" && role !== "ADMIN_MASTER") {
        throw new Error("Unauthorized");
    }
    const tenantId = (session.user as { tenantId: string }).tenantId;
    const rt = (session.user as any).rt || "";
    const rw = (session.user as any).rw || "";
    return { session, tenantId, rt, rw, role };
}

function cleanDigits(val: string): string {
    return val.toString().replace(/\D/g, '').replace(/^0+/, '') || '0';
}

function cleanName(val: string): string {
    return val.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function buildWilayahFilterScope(role: string, userRt: string, userRw: string, tenantId: string) {
    let filterScope: any = { tenantId };
    
    const rtClean = cleanDigits(userRt || "");
    const rwClean = cleanDigits(userRw || "");
    
    if (role === "RT") {
        filterScope.rt = { in: [userRt, rtClean, rtClean.padStart(3, '0')] };
        filterScope.rw = { in: [userRw, rwClean, rwClean.padStart(3, '0')] };
        return filterScope;
    }
    
    const config = await prisma.systemSetting.findUnique({
        where: { id: "village_structure" }
    });
    const structure = (config?.settings as any) || { dusun: [] };
    
    if (role === "RW") {
        const targetRwClean = cleanDigits(userRw || "");
        let rtScopeList: string[] = [];
        
        structure.dusun?.forEach((d: any) => {
            d.rw?.forEach((rw: any) => {
                if (cleanDigits(rw.name) === targetRwClean) {
                    rw.rt?.forEach((rt: any) => {
                        rtScopeList.push(rt);
                    });
                }
            });
        });
        
        const matchedRts = rtScopeList.flatMap(rt => {
            const clean = cleanDigits(rt);
            return [clean, clean.padStart(3, '0'), rt];
        });
        
        filterScope.rw = { in: [userRw, targetRwClean, targetRwClean.padStart(3, '0')] };
        if (matchedRts.length > 0) {
            filterScope.rt = { in: matchedRts };
        }
    } else if (role === "KADUS") {
        let allowedRts: string[] = [];
        let allowedRws: string[] = [];
        let dusunName = "";
        
        const targetDusunClean = cleanName(userRw || "");
        const matchedDusun = structure.dusun?.find((d: any) => cleanName(d.name) === targetDusunClean);
        
        if (matchedDusun) {
            dusunName = matchedDusun.name;
            matchedDusun.rw?.forEach((rw: any) => {
                allowedRws.push(rw.name);
                rw.rt?.forEach((rt: any) => {
                    allowedRts.push(rt);
                });
            });
        }
        
        const matchedRws = allowedRws.flatMap(rw => {
            const clean = cleanDigits(rw);
            return [clean, clean.padStart(3, '0'), rw];
        });
        const matchedRts = allowedRts.flatMap(rt => {
            const clean = cleanDigits(rt);
            return [clean, clean.padStart(3, '0'), rt];
        });
        
        filterScope.OR = [];
        if (dusunName) {
            filterScope.OR.push({ dusun: { equals: dusunName, mode: 'insensitive' } });
        }
        if (matchedRws.length > 0 && matchedRts.length > 0) {
            filterScope.OR.push({
                rw: { in: matchedRws },
                rt: { in: matchedRts }
            });
        }
        if (filterScope.OR.length === 0) {
            filterScope.id = "none";
        }
    }
    
    return filterScope;
}

export async function getWilayahStrukturOptions() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const role = (session.user as any).role;
        const userRw = (session.user as any).rw || "";
        const userRt = (session.user as any).rt || "";
        
        const config = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (config?.settings as any) || { dusun: [] };
        
        if (role === "RT") {
            const targetRwClean = cleanDigits(userRw);
            let matchedDusunName = "";
            let rtOptions: string[] = [];
            
            structure.dusun?.forEach((d: any) => {
                d.rw?.forEach((rw: any) => {
                    if (cleanDigits(rw.name) === targetRwClean) {
                        matchedDusunName = d.name;
                        rw.rt?.forEach((rt: any) => {
                            rtOptions.push(rt);
                        });
                    }
                });
            });
            
            return {
                dusunName: matchedDusunName,
                rtList: Array.from(new Set(rtOptions)).sort()
            };
        } else if (role === "RW") {
            const targetRwClean = cleanDigits(userRw);
            let rtOptions: string[] = [];
            let matchedDusunName = "";
            
            structure.dusun?.forEach((d: any) => {
                d.rw?.forEach((rw: any) => {
                    if (cleanDigits(rw.name) === targetRwClean) {
                        matchedDusunName = d.name;
                        rw.rt?.forEach((rt: any) => {
                            rtOptions.push(rt);
                        });
                    }
                });
            });
            
            return {
                dusunName: matchedDusunName,
                rtList: Array.from(new Set(rtOptions)).sort()
            };
        } else if (role === "KADUS") {
            const targetDusunClean = cleanName(userRw);
            const matchedDusun = structure.dusun?.find((d: any) => cleanName(d.name) === targetDusunClean);
            
            let rwOptions: { name: string, rt: string[] }[] = [];
            if (matchedDusun) {
                matchedDusun.rw?.forEach((rw: any) => {
                    rwOptions.push({
                        name: rw.name,
                        rt: rw.rt || []
                    });
                });
            }
            
            return {
                dusunName: matchedDusun?.name || userRw,
                rwList: rwOptions
            };
        }
        return {};
    } catch (error) {
        return {};
    }
}

/**
 * Returns the full village structure (all dusun > rw > rt)
 * Used to populate cascading dropdowns in citizen forms.
 */
export async function getFullVillageStructure() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const config = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        return (config?.settings as any) || { dusun: [] };
    } catch (error) {
        return { dusun: [] };
    }
}


// 1. STATS OVERVIEW
export async function getRtDashboardStats() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        // Total Warga
        const totalWarga = await prisma.dataKependudukan.count({
            where: filterScope
        });

        // Total KK (Unique noKK)
        const familiesCount = await prisma.dataKependudukan.groupBy({
            by: ['noKK'],
            where: filterScope
        });
        const totalKK = familiesCount.length;

        // Total Kas RT (Balance)
        const finances = await prisma.rtFinance.findMany({
            where: filterScope
        });
        let totalKas = 0;
        finances.forEach(f => {
            if (f.type === "INCOME") totalKas += f.amount;
            else if (f.type === "EXPENSE") totalKas -= f.amount;
        });

        // Pending Letters
        const pendingLetters = await prisma.surat.count({
            where: {
                status: "TERTUNDA",
                warga: filterScope
            }
        });

        // LAMPID Counts
        const [births, deaths, moves, incoming] = await Promise.all([
            prisma.rtBirthReport.count({ where: filterScope }),
            prisma.rtDeathReport.count({ where: filterScope }),
            prisma.rtMoveReport.count({ where: filterScope }),
            prisma.rtIncomingReport.count({ where: filterScope })
        ]);

        return {
            totalWarga,
            totalKK,
            totalKas,
            pendingLetters,
            births,
            deaths,
            moves,
            incoming
        };
    } catch (error) {
        console.error("Failed to get RT stats:", error);
        return {
            totalWarga: 0,
            totalKK: 0,
            totalKas: 0,
            pendingLetters: 0,
            births: 0,
            deaths: 0,
            moves: 0,
            incoming: 0
        };
    }
}

// 2. FINANCE (KAS)
export async function getRtFinance() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtFinance.findMany({
            where: filterScope,
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtFinanceTransaction(data: { amount: number, type: string, category: string, date: Date, description?: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const transaction = await prisma.rtFinance.create({
            data: {
                rt,
                rw,
                amount: data.amount,
                type: data.type,
                category: data.category,
                date: new Date(data.date),
                description: data.description,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, transaction };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to add transaction" };
    }
}

export async function deleteRtFinanceTransaction(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtFinance.findUnique({ where: { id } });
            if (!target) throw new Error("Transaction not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtFinance.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 3. ACTIVITIES (KEGIATAN)
export async function getRtActivities() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtActivity.findMany({
            where: filterScope,
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtActivity(data: { title: string, description: string, date: Date, budget?: number, status: string, imageUrl?: string, rt?: string }) {
    const { tenantId, rt: sessionRt, rw, role } = await getRtSession();
    const targetRt = role === "RW" ? (data.rt || "") : sessionRt;
    try {
        const activity = await prisma.rtActivity.create({
            data: {
                rt: targetRt,
                rw,
                title: data.title,
                description: data.description,
                date: new Date(data.date),
                budget: data.budget,
                status: data.status,
                imageUrl: data.imageUrl,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, activity };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtActivity(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtActivity.findUnique({ where: { id } });
            if (!target) throw new Error("Activity not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtActivity.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 4. BIRTH REPORTS (LAHIR)
export async function getRtBirthReports() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtBirthReport.findMany({
            where: filterScope,
            orderBy: { tanggalLahir: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtBirthReport(data: { namaBayi: string, tanggalLahir: Date, jenisKelamin: string, namaAyah?: string, namaIbu?: string, keterangan?: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const report = await prisma.rtBirthReport.create({
            data: {
                rt,
                rw,
                namaBayi: data.namaBayi,
                tanggalLahir: new Date(data.tanggalLahir),
                jenisKelamin: data.jenisKelamin,
                namaAyah: data.namaAyah,
                namaIbu: data.namaIbu,
                keterangan: data.keterangan,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtBirthReport(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtBirthReport.findUnique({ where: { id } });
            if (!target) throw new Error("Report not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtBirthReport.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 5. DEATH REPORTS (MATI)
export async function getRtDeathReports() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtDeathReport.findMany({
            where: filterScope,
            orderBy: { tanggalMeninggal: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtDeathReport(data: { nik: string, namaLengkap: string, tanggalMeninggal: Date, penyebab?: string, keterangan?: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const report = await prisma.rtDeathReport.create({
            data: {
                rt,
                rw,
                nik: data.nik,
                namaLengkap: data.namaLengkap,
                tanggalMeninggal: new Date(data.tanggalMeninggal),
                penyebab: data.penyebab,
                keterangan: data.keterangan,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtDeathReport(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtDeathReport.findUnique({ where: { id } });
            if (!target) throw new Error("Report not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtDeathReport.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 6. MOVE REPORTS (PINDAH)
export async function getRtMoveReports() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtMoveReport.findMany({
            where: filterScope,
            orderBy: { tanggalPindah: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtMoveReport(data: { nik: string, namaLengkap: string, tanggalPindah: Date, alamatTujuan: string, alasan?: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const report = await prisma.rtMoveReport.create({
            data: {
                rt,
                rw,
                nik: data.nik,
                namaLengkap: data.namaLengkap,
                tanggalPindah: new Date(data.tanggalPindah),
                alamatTujuan: data.alamatTujuan,
                alasan: data.alasan,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtMoveReport(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtMoveReport.findUnique({ where: { id } });
            if (!target) throw new Error("Report not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtMoveReport.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 7. INCOMING REPORTS (DATANG)
export async function getRtIncomingReports() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtIncomingReport.findMany({
            where: filterScope,
            orderBy: { tanggalDatang: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtIncomingReport(data: { nik: string, noKK: string, namaLengkap: string, tanggalDatang: Date, alamatAsal: string, keterangan?: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const report = await prisma.rtIncomingReport.create({
            data: {
                rt,
                rw,
                nik: data.nik,
                noKK: data.noKK,
                namaLengkap: data.namaLengkap,
                tanggalDatang: new Date(data.tanggalDatang),
                alamatAsal: data.alamatAsal,
                keterangan: data.keterangan,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtIncomingReport(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtIncomingReport.findUnique({ where: { id } });
            if (!target) throw new Error("Report not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtIncomingReport.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 8. ANNOUNCEMENTS (PENGUMUMAN)
export async function getRtAnnouncements() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtAnnouncement.findMany({
            where: filterScope,
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtAnnouncement(data: { title: string, content: string, category: string, date: Date }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const announcement = await prisma.rtAnnouncement.create({
            data: {
                rt,
                rw,
                title: data.title,
                content: data.content,
                category: data.category,
                date: new Date(data.date),
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, announcement };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtAnnouncement(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtAnnouncement.findUnique({ where: { id } });
            if (!target) throw new Error("Announcement not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtAnnouncement.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 9. COMPLAINTS (ADUAN & ASPIRASI)
export async function getRtComplaints() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtComplaint.findMany({
            where: filterScope,
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtComplaint(data: { reporterName: string, reporterPhone?: string, title: string, content: string, category: string, date: Date }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const complaint = await prisma.rtComplaint.create({
            data: {
                rt,
                rw,
                reporterName: data.reporterName,
                reporterPhone: data.reporterPhone,
                title: data.title,
                content: data.content,
                category: data.category,
                date: new Date(data.date),
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, complaint };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRtComplaintStatus(id: string, status: string, notes?: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtComplaint.findUnique({ where: { id } });
            if (!target) throw new Error("Complaint not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        const complaint = await prisma.rtComplaint.update({
            where: { id },
            data: { status, notes }
        });
        revalidatePath("/dashboard");
        return { success: true, complaint };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtComplaint(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtComplaint.findUnique({ where: { id } });
            if (!target) throw new Error("Complaint not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtComplaint.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 10. INVENTORY (INVENTARIS RT)
export async function getRtInventories() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.rtInventory.findMany({
            where: filterScope,
            include: { loans: true },
            orderBy: { itemName: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtInventory(data: { itemName: string, quantity: number, condition: string, rt?: string }) {
    const { tenantId, rt: sessionRt, rw, role } = await getRtSession();
    const targetRt = role === "RW" ? (data.rt || "") : sessionRt;
    try {
        const item = await prisma.rtInventory.create({
            data: {
                rt: targetRt,
                rw,
                itemName: data.itemName,
                quantity: data.quantity,
                condition: data.condition,
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, item };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRtInventory(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.rtInventory.findUnique({ where: { id } });
            if (!target) throw new Error("Inventory not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.rtInventory.delete({ where: { id } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRtInventoryLoans() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        let filterScope: any = { tenantId };
        const innerScope = await buildWilayahFilterScope(role, rt, rw, tenantId);
        delete innerScope.tenantId;
        filterScope.inventory = innerScope;

        return await prisma.rtInventoryLoan.findMany({
            where: filterScope,
            include: { inventory: true },
            orderBy: { loanDate: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtInventoryLoan(data: { inventoryId: string, borrowerName: string, borrowerPhone?: string, quantity: number, loanDate: Date }) {
    const { tenantId } = await getRtSession();
    try {
        const inventory = await prisma.rtInventory.findUnique({
            where: { id: data.inventoryId },
            include: { loans: true }
        });

        if (!inventory) throw new Error("Inventory not found");

        const activeBorrowed = inventory.loans
            .filter(l => l.status === "DIPINJAM")
            .reduce((acc, curr) => acc + curr.quantity, 0);

        if (inventory.quantity - activeBorrowed < data.quantity) {
            throw new Error(`Stok barang tidak cukup. Tersedia: ${inventory.quantity - activeBorrowed}`);
        }

        const loan = await prisma.rtInventoryLoan.create({
            data: {
                inventoryId: data.inventoryId,
                borrowerName: data.borrowerName,
                borrowerPhone: data.borrowerPhone,
                quantity: data.quantity,
                loanDate: new Date(data.loanDate),
                status: "DIPINJAM",
                tenantId
            }
        });
        revalidatePath("/dashboard");
        return { success: true, loan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function returnRtInventoryLoan(id: string) {
    const { role, rt, rw } = await getRtSession();
    try {
        const target = await prisma.rtInventoryLoan.findUnique({
            where: { id },
            include: { inventory: true }
        });
        if (!target) throw new Error("Loan record not found");
        
        if (role === "RT" && (target.inventory.rt !== rt || target.inventory.rw !== rw)) throw new Error("Unauthorized");
        if (role === "RW" && target.inventory.rw !== rw) throw new Error("Unauthorized");

        const updated = await prisma.rtInventoryLoan.update({
            where: { id },
            data: {
                status: "KEMBALI",
                returnDate: new Date()
            }
        });
        revalidatePath("/dashboard");
        return { success: true, loan: updated };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 11. GeoSENSUS (SENSUS SPASIAL RT)
export async function getResidentKks() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        const residents = await prisma.dataKependudukan.findMany({
            where: {
                ...filterScope,
                hubunganKeluarga: { equals: "KEPALA_KELUARGA", mode: "insensitive" }
            },
            select: {
                noKK: true,
                namaLengkap: true
            },
            orderBy: { namaLengkap: 'asc' }
        });
        return residents;
    } catch (error) {
        return [];
    }
}

export async function getSensusPoints() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        return await prisma.sensusPoint.findMany({
            where: filterScope
        });
    } catch (error) {
        return [];
    }
}

async function updateRtBoundary(tenantId: string, rt: string, rw: string) {
    const points = await prisma.sensusPoint.findMany({
        where: { tenantId, rt, rw, type: "RUMAH_WARGA" } // Kita ambil rumah warga sebagai basis batas, atau semuanya
    });

    if (points.length < 3) {
        // Hapus boundary jika titik kurang dari 3 (tidak bisa membentuk polygon)
        await prisma.mapBoundary.deleteMany({
            where: { tenantId, type: "RT", name: `RT ${rt}` }
        });
        return;
    }

    const featureCollection = turf.featureCollection(
        points.map(p => turf.point([p.longitude, p.latitude]))
    );

    const hull = turf.convex(featureCollection);

    if (hull) {
        const coordinates = hull.geometry;
        await prisma.mapBoundary.upsert({
            where: {
                tenantId_type_name_parentName: {
                    tenantId,
                    type: "RT",
                    name: `RT ${rt}`,
                    parentName: `RW ${rw}`
                }
            },
            update: {
                coordinates: coordinates as any
            },
            create: {
                tenantId,
                name: `RT ${rt}`,
                type: "RT",
                parentName: `RW ${rw}`,
                coordinates: coordinates as any,
                color: "#10b981" // emerald
            }
        });
    }
}

export async function saveSensusPoint(data: {
    id?: string,
    type: string,
    latitude: number,
    longitude: number,
    noKK?: string,
    statusWarga?: string,
    name?: string,
    categoryFasum?: string,
    description?: string,
    nomorUrut?: number
}) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        if (data.id) {
            const updated = await prisma.sensusPoint.update({
                where: { id: data.id },
                data: {
                    type: data.type,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    noKK: data.noKK || null,
                    statusWarga: data.statusWarga || null,
                    name: data.name || null,
                    categoryFasum: data.categoryFasum || null,
                    description: data.description || null,
                    nomorUrut: data.nomorUrut || null
                }
            });
            await updateRtBoundary(tenantId, rt, rw);
            revalidatePath("/dashboard");
            return { success: true, point: updated };
        } else {
            // Auto increment nomorUrut if RUMAH_WARGA
            let nextNomorUrut = null;
            if (data.type === "RUMAH_WARGA" && !data.nomorUrut) {
                const maxUrut = await prisma.sensusPoint.findFirst({
                    where: { tenantId, rt, rw, type: "RUMAH_WARGA" },
                    orderBy: { nomorUrut: 'desc' }
                });
                nextNomorUrut = (maxUrut?.nomorUrut || 0) + 1;
            } else if (data.nomorUrut) {
                nextNomorUrut = data.nomorUrut;
            }

            const created = await prisma.sensusPoint.create({
                data: {
                    rt,
                    rw,
                    type: data.type,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    noKK: data.noKK || null,
                    statusWarga: data.statusWarga || null,
                    name: data.name || null,
                    categoryFasum: data.categoryFasum || null,
                    description: data.description || null,
                    nomorUrut: nextNomorUrut,
                    tenantId
                }
            });
            await updateRtBoundary(tenantId, rt, rw);
            revalidatePath("/dashboard");
            return { success: true, point: created };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSensusPoint(id: string) {
    const { tenantId, rt, rw, role } = await getRtSession();
    try {
        if (role === "RT" || role === "RW") {
            const target = await prisma.sensusPoint.findUnique({ where: { id } });
            if (!target) throw new Error("Sensus point not found");
            if (role === "RT" && (target.rt !== rt || target.rw !== rw)) throw new Error("Unauthorized");
            if (role === "RW" && target.rw !== rw) throw new Error("Unauthorized");
        }
        await prisma.sensusPoint.delete({ where: { id } });
        await updateRtBoundary(tenantId, rt, rw);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRtMapBoundary() {
    try {
        const { tenantId, rt, rw } = await getRtSession();
        const boundary = await prisma.mapBoundary.findFirst({
            where: {
                tenantId,
                type: "RT",
                name: rt,
                parentName: rw
            }
        });
        return { success: true, boundary };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveRtMapBoundary(coordinates: any) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const name = rt;
        const parentName = rw;
        const type = "RT";

        const existing = await prisma.mapBoundary.findFirst({
            where: { tenantId, type, name, parentName }
        });

        let boundary;
        if (existing) {
            boundary = await prisma.mapBoundary.update({
                where: { id: existing.id },
                data: { coordinates }
            });
        } else {
            boundary = await prisma.mapBoundary.create({
                data: {
                    tenantId,
                    type,
                    name,
                    parentName,
                    coordinates,
                    color: "#f43f5e"
                }
            });
        }

        try {
            await triggerRwPolygonAggregation(tenantId, parentName);
        } catch (aggErr) {
            console.error("Aggregation error ignored:", aggErr);
        }

        revalidatePath("/dashboard");
        return { success: true, boundary };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

async function triggerRwPolygonAggregation(tenantId: string, rwName: string) {
    const rtBoundaries = await prisma.mapBoundary.findMany({
        where: {
            tenantId,
            type: "RT",
            parentName: rwName
        }
    });

    if (rtBoundaries.length === 0) return;

    const turf = require("@turf/turf");

    const polygons = rtBoundaries.map(b => {
        let coords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates;
        const turfCoords = coords.map((c: any) => [c[1], c[0]]);
        if (turfCoords[0][0] !== turfCoords[turfCoords.length - 1][0] || turfCoords[0][1] !== turfCoords[turfCoords.length - 1][1]) {
            turfCoords.push(turfCoords[0]);
        }
        return turf.polygon([turfCoords]);
    });

    let unioned = polygons[0];
    for (let i = 1; i < polygons.length; i++) {
        unioned = turf.union(unioned, polygons[i]);
    }

    if (!unioned) return;

    const unionCoords = unioned.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);

    const existingRw = await prisma.mapBoundary.findFirst({
        where: {
            tenantId,
            type: "RW",
            name: rwName
        }
    });

    if (existingRw) {
        await prisma.mapBoundary.update({
            where: { id: existingRw.id },
            data: { coordinates: unionCoords }
        });
    } else {
        await prisma.mapBoundary.create({
            data: {
                tenantId,
                type: "RW",
                name: rwName,
                parentName: null,
                coordinates: unionCoords,
                color: "#f59e0b"
            }
        });
    }
}

export async function getRwDashboardStats() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        if (role !== "RW" && role !== "KADUS" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "SEKDES" && role !== "ADMIN_MASTER") {
            throw new Error("Unauthorized");
        }

        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        const citizens = await prisma.dataKependudukan.findMany({
            where: filterScope
        });

        const rtWargaMap: Record<string, number> = {};
        const rtKkMap: Record<string, Set<string>> = {};
        const rtRwMap: Record<string, { rt: string, rw: string }> = {};
        citizens.forEach(c => {
            const rtKey = c.rt || "000";
            const rwKey = c.rw || "000";
            const compositeKey = `${rwKey}_${rtKey}`;
            
            rtWargaMap[compositeKey] = (rtWargaMap[compositeKey] || 0) + 1;
            if (!rtKkMap[compositeKey]) rtKkMap[compositeKey] = new Set();
            rtKkMap[compositeKey].add(c.noKK);
            rtRwMap[compositeKey] = { rt: rtKey, rw: rwKey };
        });

        const finances = await prisma.rtFinance.findMany({
            where: filterScope
        });
        const rtKasMap: Record<string, number> = {};
        finances.forEach(f => {
            const rtKey = f.rt || "000";
            const rwKey = f.rw || "000";
            const compositeKey = `${rwKey}_${rtKey}`;
            
            if (!rtKasMap[compositeKey]) rtKasMap[compositeKey] = 0;
            if (f.type === "INCOME") rtKasMap[compositeKey] += f.amount;
            else if (f.type === "EXPENSE") rtKasMap[compositeKey] -= f.amount;
            rtRwMap[compositeKey] = { rt: rtKey, rw: rwKey };
        });

        const activities = await prisma.rtActivity.findMany({
            where: filterScope
        });
        const rtActivitiesCount: Record<string, number> = {};
        activities.forEach(a => {
            const rtKey = a.rt || "000";
            const rwKey = a.rw || "000";
            const compositeKey = `${rwKey}_${rtKey}`;
            
            rtActivitiesCount[compositeKey] = (rtActivitiesCount[compositeKey] || 0) + 1;
            rtRwMap[compositeKey] = { rt: rtKey, rw: rwKey };
        });

        const keys = Array.from(new Set([
            ...Object.keys(rtWargaMap),
            ...Object.keys(rtKasMap),
            ...Object.keys(rtActivitiesCount)
        ])).sort();

        const rtBreakdown = keys.map(key => {
            const { rt: rtVal, rw: rwVal } = rtRwMap[key];
            return {
                rt: rtVal,
                rw: rwVal,
                totalWarga: rtWargaMap[key] || 0,
                totalKK: rtKkMap[key]?.size || 0,
                totalKas: rtKasMap[key] || 0,
                totalActivities: rtActivitiesCount[key] || 0
            };
        });

        return {
            success: true,
            rtBreakdown
        };
    } catch (error: any) {
        return { success: false, rtBreakdown: [], error: error.message };
    }
}

export async function getRwMapBoundaries() {
    try {
        const { tenantId, rw, role } = await getRtSession();
        if (role !== "RW" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "SEKDES" && role !== "ADMIN_MASTER") {
            throw new Error("Unauthorized");
        }
        
        const rwBoundary = await prisma.mapBoundary.findFirst({
            where: {
                tenantId,
                type: "RW",
                name: rw
            }
        });

        const rtBoundaries = await prisma.mapBoundary.findMany({
            where: {
                tenantId,
                type: "RT",
                parentName: rw
            }
        });

        return { success: true, rwBoundary, rtBoundaries };
    } catch (error: any) {
        return { success: false, error: error.message, rwBoundary: null, rtBoundaries: [] };
    }
}

export async function getRtDemographicReport(month: number, year: number) {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        const filterScope = await buildWilayahFilterScope(role, rt, rw, tenantId);

        // Fetch all residents
        const residents = await prisma.dataKependudukan.findMany({
            where: filterScope
        });

        // Fetch all death and move reports to filter out inactive ones for the target month
        const deaths = await prisma.rtDeathReport.findMany({ where: filterScope });
        const moves = await prisma.rtMoveReport.findMany({ where: filterScope });

        const deadNiks = new Set(
            deaths.filter(d => {
                const dDate = new Date(d.tanggalMeninggal);
                const dMonths = (year - dDate.getFullYear()) * 12 + (month - (dDate.getMonth() + 1));
                return dMonths >= 0;
            }).map(d => d.nik)
        );

        const movedNiks = new Set(
            moves.filter(m => {
                const mDate = new Date(m.tanggalPindah);
                const mMonths = (year - mDate.getFullYear()) * 12 + (month - (mDate.getMonth() + 1));
                return mMonths >= 0;
            }).map(m => m.nik)
        );

        // Active residents in this target month
        const activeResidents = residents.filter(r => !deadNiks.has(r.nik) && !movedNiks.has(r.nik));

        // Initialize age cohorts (0-11 months, 1 to 74, 75+)
        const ageDistribution: Record<string, { L: number; P: number }> = {};
        ageDistribution["0-11 BLN"] = { L: 0, P: 0 };
        for (let i = 1; i <= 74; i++) {
            ageDistribution[i.toString()] = { L: 0, P: 0 };
        }
        ageDistribution["75+"] = { L: 0, P: 0 };

        let wajibKtpL = 0;
        let wajibKtpP = 0;

        activeResidents.forEach(r => {
            const birthDate = new Date(r.tanggalLahir);
            const birthYear = birthDate.getFullYear();
            const birthMonth = birthDate.getMonth() + 1;

            const totalMonthsDiff = (year - birthYear) * 12 + (month - birthMonth);
            if (totalMonthsDiff < 0) return; // Not born yet

            const ageInYears = Math.floor(totalMonthsDiff / 12);
            const genderKey = r.jenisKelamin === "LAKI_LAKI" ? "L" : "P";

            if (totalMonthsDiff <= 11) {
                ageDistribution["0-11 BLN"][genderKey]++;
            } else if (ageInYears >= 75) {
                ageDistribution["75+"][genderKey]++;
            } else {
                ageDistribution[ageInYears.toString()][genderKey]++;
            }

            if (ageInYears >= 17) {
                if (genderKey === "L") wajibKtpL++;
                else wajibKtpP++;
            }
        });

        // Family Cards (unique noKK)
        const uniqueKk = new Set(activeResidents.map(r => r.noKK));
        const totalKK = uniqueKk.size;

        // Fetch mutasi for the specific month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const [birthsThisMonth, deathsThisMonth, movesThisMonth, incomingThisMonth] = await Promise.all([
            prisma.rtBirthReport.findMany({
                where: {
                    ...filterScope,
                    tanggalLahir: { gte: startDate, lt: endDate }
                }
            }),
            prisma.rtDeathReport.findMany({
                where: {
                    ...filterScope,
                    tanggalMeninggal: { gte: startDate, lt: endDate }
                }
            }),
            prisma.rtMoveReport.findMany({
                where: {
                    ...filterScope,
                    tanggalPindah: { gte: startDate, lt: endDate }
                }
            }),
            prisma.rtIncomingReport.findMany({
                where: {
                    ...filterScope,
                    tanggalDatang: { gte: startDate, lt: endDate }
                }
            })
        ]);

        // Map mutasi by gender
        const mutasi = {
            lahir: {
                L: birthsThisMonth.filter(b => b.jenisKelamin === "LAKI_LAKI").length,
                P: birthsThisMonth.filter(b => b.jenisKelamin === "PEREMPUAN").length,
            },
            mati: {
                L: deathsThisMonth.filter(d => {
                    const res = residents.find(r => r.nik === d.nik);
                    return res?.jenisKelamin === "LAKI_LAKI";
                }).length,
                P: deathsThisMonth.filter(d => {
                    const res = residents.find(r => r.nik === d.nik);
                    return res?.jenisKelamin === "PEREMPUAN";
                }).length,
            },
            pindah: {
                L: movesThisMonth.filter(m => {
                    const res = residents.find(r => r.nik === m.nik);
                    return res?.jenisKelamin === "LAKI_LAKI";
                }).length,
                P: movesThisMonth.filter(m => {
                    const res = residents.find(r => r.nik === m.nik);
                    return res?.jenisKelamin === "PEREMPUAN";
                }).length,
            },
            datang: {
                L: incomingThisMonth.filter(i => {
                    // Check if they are registered as L or we fallback to L if unknown
                    const res = residents.find(r => r.nik === i.nik);
                    return res?.jenisKelamin === "LAKI_LAKI";
                }).length,
                P: incomingThisMonth.filter(i => {
                    const res = residents.find(r => r.nik === i.nik);
                    return res?.jenisKelamin === "PEREMPUAN";
                }).length,
            }
        };

        // Total Warga L and P
        const totalWargaL = activeResidents.filter(r => r.jenisKelamin === "LAKI_LAKI").length;
        const totalWargaP = activeResidents.filter(r => r.jenisKelamin === "PEREMPUAN").length;

        // Build resident change descriptions (Keterangan Perubahan Penduduk)
        const changesDesc: string[] = [];
        if (birthsThisMonth.length > 0) {
            changesDesc.push(`Lahir: ${birthsThisMonth.map(b => `${b.namaBayi} (${b.jenisKelamin === "LAKI_LAKI" ? "L" : "P"})`).join(", ")}`);
        }
        if (deathsThisMonth.length > 0) {
            changesDesc.push(`Mati: ${deathsThisMonth.map(d => `${d.namaLengkap} (${d.penyebab || "sakit"})`).join(", ")}`);
        }
        if (movesThisMonth.length > 0) {
            changesDesc.push(`Pindah: ${movesThisMonth.map(m => `${m.namaLengkap} ke ${m.alamatTujuan}`).join(", ")}`);
        }
        if (incomingThisMonth.length > 0) {
            changesDesc.push(`Datang: ${incomingThisMonth.map(i => `${i.namaLengkap} dari ${i.alamatAsal}`).join(", ")}`);
        }

        return {
            success: true,
            rtInfo: { rt, rw },
            ageDistribution,
            totals: {
                penduduk: { L: totalWargaL, P: totalWargaP },
                wajibKtp: { L: wajibKtpL, P: wajibKtpP },
                totalKK,
                // Assume 0 for temporary residents for now (or calculate from incoming if needed)
                pendudukSementara: { L: 0, P: 0 }
            },
            mutasi,
            changesDesc: changesDesc.join(" | ") || "Tidak ada perubahan data kependudukan bulan ini."
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
