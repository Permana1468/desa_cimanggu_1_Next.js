"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifyKesraAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;
    const email = session.user.email || "";

    let resolvedRole = role;
    if (role === "KASI") {
        if (email.includes("kesejahteraan")) {
            resolvedRole = "KASI_KESEJAHTERAAN";
        }
    }

    if (
        resolvedRole !== "KASI_KESEJAHTERAAN" && 
        role !== "ADMIN_DESA" && 
        role !== "ADMIN_MASTER" && 
        role !== "PUSKESOS" &&
        role !== "KADES" &&
        role !== "SEKDES"
    ) {
        throw new Error("Akses ditolak. Fitur ini khusus untuk Kasi Kesejahteraan / Puskesos.");
    }

    return { tenantId, user: session.user, role: resolvedRole };
}

// =======================
// DTKS CLEANSING
// =======================

export async function getKesraDtksList() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.kesraDtks.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" }
    });
}

export async function addKesraDtks(data: any) {
    const { tenantId } = await verifyKesraAccess();
    const dtks = await prisma.kesraDtks.create({
        data: {
            nik: data.nik,
            namaKepalaKeluarga: data.namaKepalaKeluarga,
            jumlahTanggungan: parseInt(data.jumlahTanggungan) || 0,
            penghasilan: parseFloat(data.penghasilan) || 0,
            jenisBantuan: data.jenisBantuan,
            statusKelayakan: data.statusKelayakan || "LAYAK",
            isFlagged: data.isFlagged || false,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return { success: true, dtks };
}

export async function deleteKesraDtks(id: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraDtks.deleteMany({
        where: { id, tenantId }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function toggleKesraDtksFlag(id: string, currentFlag: boolean) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraDtks.updateMany({
        where: { id, tenantId },
        data: { isFlagged: !currentFlag }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function importKesraDtks(records: any[]) {
    const { tenantId } = await verifyKesraAccess();
    
    // Simple bulk create loop
    let imported = 0;
    for (const r of records) {
        try {
            await prisma.kesraDtks.upsert({
                where: { nik: r.nik },
                update: {
                    namaKepalaKeluarga: r.namaKepalaKeluarga,
                    jumlahTanggungan: parseInt(r.jumlahTanggungan) || 0,
                    penghasilan: parseFloat(r.penghasilan) || 0,
                    jenisBantuan: r.jenisBantuan,
                    statusKelayakan: r.statusKelayakan || "LAYAK",
                    isFlagged: r.isFlagged || false
                },
                create: {
                    nik: r.nik,
                    namaKepalaKeluarga: r.namaKepalaKeluarga,
                    jumlahTanggungan: parseInt(r.jumlahTanggungan) || 0,
                    penghasilan: parseFloat(r.penghasilan) || 0,
                    jenisBantuan: r.jenisBantuan,
                    statusKelayakan: r.statusKelayakan || "LAYAK",
                    isFlagged: r.isFlagged || false,
                    tenantId
                }
            });
            imported++;
        } catch (e) {
            console.error("Failed to import NIK:", r.nik, e);
        }
    }
    
    revalidatePath("/dashboard");
    return { success: true, imported };
}

// =======================
// GIS KEMISKINAN
// =======================

export async function getKesraGisList() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.kesraGisWarga.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" }
    });
}

export async function getKesraStuntingList() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.posyanduBalita.findMany({
        where: { tenantId },
        include: { records: { orderBy: { tanggal: "asc" } } },
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addKesraGis(data: any) {
    const { tenantId } = await verifyKesraAccess();
    const gis = await prisma.kesraGisWarga.create({
        data: {
            nik: data.nik,
            nama: data.nama,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            fotoRumah: data.fotoRumah || null,
            kategoriKerentanan: data.kategoriKerentanan,
            kontak: data.kontak || null,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return { success: true, gis };
}

export async function deleteKesraGis(id: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraGisWarga.deleteMany({
        where: { id, tenantId }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// HEALTH & PMT LOGISTIK
// =======================

export async function getKesraPmtLogistik() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.kesraPmtLogistik.findMany({
        where: { tenantId },
        orderBy: { namaItem: "asc" }
    });
}

export async function addKesraPmtLogistik(data: any) {
    const { tenantId } = await verifyKesraAccess();
    const logistik = await prisma.kesraPmtLogistik.upsert({
        where: { namaItem: data.namaItem },
        update: {
            stok: { increment: parseInt(data.stok) || 0 },
            anggaran: parseFloat(data.anggaran) || 0
        },
        create: {
            namaItem: data.namaItem,
            stok: parseInt(data.stok) || 0,
            anggaran: parseFloat(data.anggaran) || 0,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return { success: true, logistik };
}

export async function deleteKesraPmtLogistik(id: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraPmtLogistik.deleteMany({
        where: { id, tenantId }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function getKesraPmtDistribusi() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.kesraPmtDistribusi.findMany({
        where: { tenantId },
        orderBy: { tanggalDistribusi: "desc" }
    });
}

export async function addKesraPmtDistribusi(data: any) {
    const { tenantId } = await verifyKesraAccess();
    
    // Check if stock is available
    const item = await prisma.kesraPmtLogistik.findFirst({
        where: { namaItem: data.namaItem, tenantId }
    });

    if (!item || item.stok < parseInt(data.jumlah)) {
        return { success: false, error: "Stok logistik PMT tidak mencukupi." };
    }

    // Deduct stock
    await prisma.kesraPmtLogistik.update({
        where: { id: item.id },
        data: { stok: { decrement: parseInt(data.jumlah) } }
    });

    const distribusi = await prisma.kesraPmtDistribusi.create({
        data: {
            namaItem: data.namaItem,
            jumlah: parseInt(data.jumlah),
            posyanduPenerima: data.posyanduPenerima,
            tanggalDistribusi: data.tanggalDistribusi ? new Date(data.tanggalDistribusi) : new Date(),
            status: "BELUM_DIKIRIM",
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, distribusi };
}

export async function updateKesraPmtDistribusiStatus(id: string, status: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraPmtDistribusi.updateMany({
        where: { id, tenantId },
        data: { status }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// EDUCATION & ATS (ANAK PUTUS SEKOLAH)
// =======================

export async function getKesraAtsList() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.kesraAts.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" }
    });
}

export async function addKesraAts(data: any) {
    const { tenantId } = await verifyKesraAccess();
    const ats = await prisma.kesraAts.create({
        data: {
            nik: data.nik,
            nama: data.nama,
            usia: parseInt(data.usia) || 12,
            pendidikanTerakhir: data.pendidikanTerakhir,
            alasanPutusSekolah: data.alasanPutusSekolah,
            minatKejarPaket: data.minatKejarPaket === "true" || data.minatKejarPaket === true,
            statusBantuan: data.statusBantuan || "PENDING",
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return { success: true, ats };
}

export async function deleteKesraAts(id: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraAts.deleteMany({
        where: { id, tenantId }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateKesraAtsStatusBantuan(id: string, statusBantuan: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraAts.updateMany({
        where: { id, tenantId },
        data: { statusBantuan }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function recordKesraAtsVisit(id: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraAts.update({
        where: { id },
        data: { terakhirDikunjungi: new Date() }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// INSENTIF KEAGAMAAN
// =======================

export async function getKesraInsentifList() {
    const { tenantId } = await verifyKesraAccess();
    return await prisma.kesraInsentif.findMany({
        where: { tenantId },
        include: { payments: true },
        orderBy: { namaPetugas: "asc" }
    });
}

export async function addKesraInsentif(data: any) {
    const { tenantId } = await verifyKesraAccess();
    const insentif = await prisma.kesraInsentif.create({
        data: {
            namaPetugas: data.namaPetugas,
            jenisPetugas: data.jenisPetugas,
            tempatIbadah: data.tempatIbadah,
            noRekening: data.noRekening,
            namaBank: data.namaBank,
            statusKeaktifan: data.statusKeaktifan || "AKTIF",
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return { success: true, insentif };
}

export async function deleteKesraInsentif(id: string) {
    const { tenantId } = await verifyKesraAccess();
    await prisma.kesraInsentif.deleteMany({
        where: { id, tenantId }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function payInsentifBulk(ids: string[], bulan: string, tahun: string, jumlah: number) {
    const { tenantId } = await verifyKesraAccess();
    
    let paid = 0;
    for (const insentifId of ids) {
        try {
            await prisma.kesraInsentifPayment.create({
                data: {
                    insentifId,
                    bulan,
                    tahun,
                    jumlah,
                    status: "SUKSES",
                    tenantId
                }
            });
            paid++;
        } catch (e) {
            console.error("Failed bulk payment for ID:", insentifId, e);
        }
    }

    revalidatePath("/dashboard");
    return { success: true, paid };
}

// =======================
// EXPORT & REPORT LPJ
// =======================

export async function getKesraReportData(filterType: string, dateRange: { start: string, end: string }) {
    const { tenantId } = await verifyKesraAccess();
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    let summary: any = {};
    if (filterType === "STUNTING") {
        const balitas = await prisma.posyanduBalita.findMany({
            where: { tenantId },
            include: { records: { orderBy: { tanggal: "desc" } } }
        });
        summary = { balitas };
    } else if (filterType === "BANSOS") {
        const dtks = await prisma.kesraDtks.findMany({
            where: { tenantId, createdAt: { gte: start, lte: end } }
        });
        summary = { dtks };
    } else {
        const insentifs = await prisma.kesraInsentif.findMany({
            where: { tenantId },
            include: { payments: { where: { createdAt: { gte: start, lte: end } } } }
        });
        summary = { insentifs };
    }

    return summary;
}
