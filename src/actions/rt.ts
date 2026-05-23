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
    if (role !== "RT" && role !== "RW" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "SEKDES" && role !== "ADMIN_MASTER") {
        throw new Error("Unauthorized");
    }
    const tenantId = (session.user as { tenantId: string }).tenantId;
    const rt = (session.user as any).rt || "";
    const rw = (session.user as any).rw || "";
    return { session, tenantId, rt, rw, role };
}

// 1. STATS OVERVIEW
export async function getRtDashboardStats() {
    try {
        const { tenantId, rt, rw, role } = await getRtSession();
        
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let letterFilterScope: any = { tenantId, status: "TERTUNDA" };
        if (role === "RT") {
            letterFilterScope.warga = { rt, rw };
        } else if (role === "RW") {
            letterFilterScope.warga = { rw };
        }
        const pendingLetters = await prisma.surat.count({
            where: letterFilterScope
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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

        return await prisma.rtActivity.findMany({
            where: filterScope,
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtActivity(data: { title: string, description: string, date: Date, budget?: number, status: string, imageUrl?: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const activity = await prisma.rtActivity.create({
            data: {
                rt,
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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

        return await prisma.rtInventory.findMany({
            where: filterScope,
            include: { loans: true },
            orderBy: { itemName: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addRtInventory(data: { itemName: string, quantity: number, condition: string }) {
    const { tenantId, rt, rw } = await getRtSession();
    try {
        const item = await prisma.rtInventory.create({
            data: {
                rt,
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
        if (role === "RT" || role === "RW") {
            filterScope.inventory = {
                rt: role === "RT" ? rt : undefined,
                rw: rw
            };
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
        let filterScope: any = { tenantId };
        if (role === "RT") {
            filterScope.rt = rt;
            filterScope.rw = rw;
        } else if (role === "RW") {
            filterScope.rw = rw;
        }

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
