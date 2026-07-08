"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifyPosyanduAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rwString = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "POSYANDU" && role !== "RW" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "ADMIN_MASTER") {
        throw new Error("Akses ditolak. Fitur ini khusus untuk Kader Posyandu.");
    }

    // Support for multiple RWs separated by comma e.g. "001,002"
    const rws = rwString ? rwString.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [];

    return { tenantId, rws, user: session.user, role };
}

// =======================
// POSYANDU BALITA
// =======================

export async function getPosyanduBalita() {
    const { tenantId, rws, role } = await verifyPosyanduAccess();

    if (rws.length === 0 && role === "POSYANDU") return [];

    const whereClause: any = { tenantId };
    if (role === "POSYANDU" || role === "RW") {
        if (rws.length === 1) {
            whereClause.rw = rws[0];
        } else if (rws.length > 1) {
            whereClause.rw = { in: rws };
        }
    }

    return await prisma.posyanduBalita.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addPosyanduBalita(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const balita = await prisma.posyanduBalita.create({
        data: {
            ...data,
            nik: data.nik || null,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, balita };
}

export async function updatePosyanduBalitaStatus(id: string, statusStunting: boolean) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduBalita.updateMany({
        where: { id, tenantId },
        data: { statusStunting }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduBalita(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduBalita.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU IBU HAMIL
// =======================

export async function getPosyanduIbuHamil() {
    const { tenantId, rws, role } = await verifyPosyanduAccess();

    if (rws.length === 0 && role === "POSYANDU") return [];

    const whereClause: any = { tenantId };
    if (role === "POSYANDU" || role === "RW") {
        if (rws.length === 1) {
            whereClause.rw = rws[0];
        } else if (rws.length > 1) {
            whereClause.rw = { in: rws };
        }
    }

    return await prisma.posyanduIbuHamil.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addPosyanduIbuHamil(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const ibu = await prisma.posyanduIbuHamil.create({
        data: {
            ...data,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, ibu };
}

export async function updatePosyanduIbuHamilStatus(id: string, risikoTinggi: boolean) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduIbuHamil.updateMany({
        where: { id, tenantId },
        data: { risikoTinggi }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduIbuHamil(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduIbuHamil.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU LANSIA
// =======================

export async function getPosyanduLansia() {
    const { tenantId, rws, role } = await verifyPosyanduAccess();

    if (rws.length === 0 && role === "POSYANDU") return [];

    const whereClause: any = { tenantId };
    if (role === "POSYANDU" || role === "RW") {
        if (rws.length === 1) {
            whereClause.rw = rws[0];
        } else if (rws.length > 1) {
            whereClause.rw = { in: rws };
        }
    }

    return await prisma.posyanduLansia.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addPosyanduLansia(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const lansia = await prisma.posyanduLansia.create({
        data: {
            ...data,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, lansia };
}

export async function deletePosyanduLansia(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduLansia.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU DASHBOARD
// =======================

export async function getPosyanduDashboardStats() {
    const { tenantId, rws, role } = await verifyPosyanduAccess();

    const whereClause: any = { tenantId };
    if (role === "POSYANDU" || role === "RW") {
        if (rws.length === 1) {
            whereClause.rw = rws[0];
        } else if (rws.length > 1) {
            whereClause.rw = { in: rws };
        }
    }

    const [
        totalBalita,
        totalIbuHamil,
        totalLansia,
        stuntingBalita,
        recentRecords,
        giziNormal,
        giziKurang,
        giziLebih,
        totalJadwal,
        activeJadwals,
        kehadiranList,
        layananBalitaCount,
        layananIbuHamilCount,
        layananLansiaCount
    ] = await Promise.all([
        prisma.posyanduBalita.count({ where: whereClause }),
        prisma.posyanduIbuHamil.count({ where: whereClause }),
        prisma.posyanduLansia.count({ where: whereClause }),
        prisma.posyanduBalita.count({ where: { ...whereClause, statusStunting: true } }),
        prisma.posyanduRecord.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'desc' },
            take: 10,
            include: {
                balita: true,
                ibuHamil: true,
                lansia: true
            }
        }),
        // Status gizi counts from records
        prisma.posyanduRecord.count({ where: { tenantId, statusGizi: "Normal" } }),
        prisma.posyanduRecord.count({ where: { tenantId, statusGizi: "Gizi Kurang" } }),
        prisma.posyanduRecord.count({ where: { tenantId, statusGizi: "Gizi Lebih" } }),
        // Jadwal & Kehadiran stats
        prisma.posyanduJadwal.count({ where: { tenantId } }),
        prisma.posyanduJadwal.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'asc' },
            take: 5
        }),
        prisma.posyanduKehadiran.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'desc' }
        }),
        prisma.posyanduRecord.count({ where: { tenantId, balitaId: { not: null } } }),
        prisma.posyanduRecord.count({ where: { tenantId, ibuHamilId: { not: null } } }),
        prisma.posyanduRecord.count({ where: { tenantId, lansiaId: { not: null } } })
    ]);

    // Simple chart data from records
    const recordsThisYear = await prisma.posyanduRecord.findMany({
        where: {
            tenantId,
            tanggal: {
                gte: new Date(new Date().getFullYear(), 0, 1)
            },
            balitaId: { not: null }
        },
        select: {
            tanggal: true,
            beratBadan: true,
            tinggiBadan: true
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const chartMap: any = {};
    monthNames.forEach(m => chartMap[m] = { name: m, bb: 0, tb: 0, count: 0 });

    recordsThisYear.forEach(r => {
        const m = monthNames[new Date(r.tanggal).getMonth()];
        if (r.beratBadan) chartMap[m].bb += r.beratBadan;
        if (r.tinggiBadan) chartMap[m].tb += r.tinggiBadan;
        chartMap[m].count += 1;
    });

    const chartData = monthNames.map(m => {
        const item = chartMap[m];
        return {
            name: m,
            beratRataRata: item.count > 0 ? parseFloat((item.bb / item.count).toFixed(2)) : 0,
            tinggiRataRata: item.count > 0 ? parseFloat((item.tb / item.count).toFixed(2)) : 0
        };
    });

    return {
        totalBalita,
        totalIbuHamil,
        totalLansia,
        stuntingBalita,
        recentRecords,
        chartData,
        giziStats: {
            normal: giziNormal,
            kurang: giziKurang,
            stunting: stuntingBalita,
            lebih: giziLebih
        },
        totalJadwal,
        activeJadwals,
        kehadiranList,
        layananBalitaCount,
        layananIbuHamilCount,
        layananLansiaCount
    };
}

export async function exportPosyanduReport() {
    const { tenantId, rws, role } = await verifyPosyanduAccess();

    const whereClause: any = { tenantId };
    if (role === "POSYANDU" || role === "RW") {
        if (rws.length === 1) {
            whereClause.rw = rws[0];
        } else if (rws.length > 1) {
            whereClause.rw = { in: rws };
        }
    }

    const balitas = await prisma.posyanduBalita.findMany({
        where: whereClause,
        include: {
            records: {
                orderBy: { tanggal: 'desc' },
                take: 1
            }
        },
        orderBy: { namaLengkap: "asc" }
    });

    const header = ["Nama Balita", "NIK", "Umur Bulan", "Nama Ortu", "RT", "RW", "Status Stunting", "BB Terakhir", "TB Terakhir", "Tgl Kunjungan Terakhir"];
    const rows = balitas.map(b => {
        const r = b.records[0];
        
        // Calculate age in months
        const birthDate = new Date(b.tanggalLahir);
        const today = new Date();
        const diffMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        
        return [
            `"${b.namaLengkap || ''}"`,
            `"${b.nik || ''}"`,
            diffMonths,
            `"${b.namaOrangTua || ''}"`,
            `"${b.rt || ''}"`,
            `"${b.rw || ''}"`,
            b.statusStunting ? "Ya" : "Tidak",
            r?.beratBadan || '',
            r?.tinggiBadan || '',
            r?.tanggal ? r.tanggal.toISOString().split('T')[0] : ''
        ].join(",");
    });

    return [header.join(","), ...rows].join("\n");
}

// =======================
// POSYANDU RECORDS (LAYANAN KESEHATAN)
// =======================

export async function getPosyanduRecords(kategori: "BALITA" | "IBU_HAMIL" | "LANSIA") {
    const { tenantId } = await verifyPosyanduAccess();
    
    const whereClause: any = { tenantId };
    if (kategori === "BALITA") {
        whereClause.balitaId = { not: null };
    } else if (kategori === "IBU_HAMIL") {
        whereClause.ibuHamilId = { not: null };
    } else if (kategori === "LANSIA") {
        whereClause.lansiaId = { not: null };
    }

    return await prisma.posyanduRecord.findMany({
        where: whereClause,
        include: {
            balita: true,
            ibuHamil: true,
            lansia: true
        },
        orderBy: { tanggal: "desc" }
    });
}

export async function addPosyanduRecord(data: any) {
    const { tenantId } = await verifyPosyanduAccess();
    
    const record = await prisma.posyanduRecord.create({
        data: {
            ...data,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, record };
}

export async function deletePosyanduRecord(id: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduRecord.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU JADWAL
// =======================

export async function getPosyanduJadwals() {
    const { tenantId } = await verifyPosyanduAccess();

    return await prisma.posyanduJadwal.findMany({
        where: { tenantId },
        orderBy: { tanggal: "asc" }
    });
}

export async function addPosyanduJadwal(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const jadwal = await prisma.posyanduJadwal.create({
        data: {
            namaKegiatan: data.namaKegiatan,
            tanggal: new Date(data.tanggal),
            waktu: data.waktu,
            lokasi: data.lokasi,
            petugas: data.petugas,
            status: data.status || "Terjadwal",
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, jadwal };
}

export async function updatePosyanduJadwalStatus(id: string, status: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduJadwal.updateMany({
        where: { id, tenantId },
        data: { status }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduJadwal(id: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduJadwal.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU KEHADIRAN
// =======================

export async function getPosyanduKehadirans() {
    const { tenantId } = await verifyPosyanduAccess();

    return await prisma.posyanduKehadiran.findMany({
        where: { tenantId },
        orderBy: { tanggal: "desc" }
    });
}

export async function addPosyanduKehadiran(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const kehadiran = await prisma.posyanduKehadiran.create({
        data: {
            tanggal: new Date(data.tanggal),
            nama: data.nama,
            kategori: data.kategori,
            hadir: data.hadir,
            keterangan: data.keterangan || null,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, kehadiran };
}

export async function deletePosyanduKehadiran(id: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduKehadiran.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}
