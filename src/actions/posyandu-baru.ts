"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectUserPosyanduUnit, getPosyanduUnit } from "@/lib/posyandu";

async function verifyPosyanduAccess(posyanduFilter?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rwString = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "POSYANDU" && role !== "RW" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "ADMIN_MASTER" && role !== "KASI_KESEJAHTERAAN") {
        throw new Error("Akses ditolak.");
    }

    const rws = rwString ? rwString.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [];
    const userUnit = detectUserPosyanduUnit(session.user);
    const resolvedUnit = getPosyanduUnit(posyanduFilter) || userUnit;

    return { tenantId, rws, user: session.user, role, resolvedUnit };
}

// =======================
// NEW POSYANDU MODULES
// =======================

export async function getPosyanduRegisters(formatNumber: number, posyanduFilter?: string) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess(posyanduFilter);
    const whereClause: any = { tenantId, formatNumber };

    if (resolvedUnit) {
        whereClause.OR = [
            { posyanduName: { contains: resolvedUnit.name, mode: "insensitive" } },
            { posyanduName: { contains: resolvedUnit.id, mode: "insensitive" } },
            { posyanduName: { equals: "Posyandu Utama" } }
        ];
    }

    return await prisma.posyanduRegisterFormat.findMany({
        where: whereClause,
        orderBy: { recordedDate: "desc" }
    });
}

export async function addPosyanduRegister(data: { formatNumber: number, posyanduName?: string, dataString: string }) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess();
    const resolvedName = data.posyanduName?.trim() || resolvedUnit?.name || "Posyandu";

    const res = await prisma.posyanduRegisterFormat.create({
        data: {
            formatNumber: data.formatNumber,
            posyanduName: resolvedName,
            dataString: data.dataString,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return res;
}

export async function deletePosyanduRegister(id: string) {
    await verifyPosyanduAccess();
    await prisma.posyanduRegisterFormat.delete({ where: { id } });
    revalidatePath("/dashboard");
}

export async function getPosyanduInventaris(posyanduFilter?: string) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess(posyanduFilter);
    const whereClause: any = { tenantId };

    if (resolvedUnit) {
        whereClause.OR = [
            { posyanduName: { contains: resolvedUnit.name, mode: "insensitive" } },
            { posyanduName: { contains: resolvedUnit.id, mode: "insensitive" } },
            { posyanduName: { equals: "Posyandu Induk" } }
        ];
    }

    return await prisma.posyanduInventory.findMany({
        where: whereClause,
        orderBy: { tanggalMasuk: "desc" }
    });
}

export async function addPosyanduInventaris(data: any) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess();
    const resolvedName = data.posyanduName?.trim() || resolvedUnit?.name || "Posyandu";

    const res = await prisma.posyanduInventory.create({
        data: {
            posyanduName: resolvedName,
            namaBarang: data.namaBarang,
            kategori: data.kategori,
            jumlah: parseInt(data.jumlah) || 1,
            kondisi: data.kondisi,
            tanggalMasuk: new Date(data.tanggalMasuk),
            sumberDana: data.sumberDana,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return res;
}

export async function updatePosyanduInventaris(id: string, data: any) {
    const { resolvedUnit } = await verifyPosyanduAccess();
    const resolvedName = data.posyanduName?.trim() || resolvedUnit?.name || "Posyandu";

    const res = await prisma.posyanduInventory.update({
        where: { id },
        data: {
            posyanduName: resolvedName,
            namaBarang: data.namaBarang,
            kategori: data.kategori,
            jumlah: parseInt(data.jumlah) || 1,
            kondisi: data.kondisi,
            tanggalMasuk: new Date(data.tanggalMasuk),
            sumberDana: data.sumberDana,
        }
    });
    revalidatePath("/dashboard");
    return res;
}

export async function deletePosyanduInventaris(id: string) {
    await verifyPosyanduAccess();
    await prisma.posyanduInventory.delete({ where: { id } });
    revalidatePath("/dashboard");
}

export async function getPosyanduAbsensi(posyanduFilter?: string) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess(posyanduFilter);
    const whereClause: any = { tenantId };

    if (resolvedUnit) {
        whereClause.OR = [
            { posyanduName: { contains: resolvedUnit.name, mode: "insensitive" } },
            { posyanduName: { contains: resolvedUnit.id, mode: "insensitive" } },
            { posyanduName: { equals: "Posyandu Induk" } }
        ];
    }

    return await prisma.posyanduAbsensi.findMany({
        where: whereClause,
        orderBy: { tanggal: "desc" }
    });
}

export async function addPosyanduAbsensi(data: any) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess();
    const resolvedName = data.posyanduName?.trim() || resolvedUnit?.name || "Posyandu";

    const res = await prisma.posyanduAbsensi.create({
        data: {
            posyanduName: resolvedName,
            namaKader: data.namaKader,
            peran: data.peran,
            tanggal: new Date(data.tanggal),
            status: data.status,
            keterangan: data.keterangan,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return res;
}

export async function deletePosyanduAbsensi(id: string) {
    await verifyPosyanduAccess();
    await prisma.posyanduAbsensi.delete({ where: { id } });
    revalidatePath("/dashboard");
}

// =======================
// ANGGARAN & PMT
// =======================

export async function getPosyanduAnggarans(posyanduFilter?: string) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess(posyanduFilter);
    const whereClause: any = { tenantId };

    if (resolvedUnit) {
        whereClause.OR = [
            { posyanduName: { contains: resolvedUnit.name, mode: "insensitive" } },
            { posyanduName: { contains: resolvedUnit.id, mode: "insensitive" } },
            { posyanduName: { equals: "Posyandu Induk" } }
        ];
    }

    return await prisma.posyanduAnggaran.findMany({
        where: whereClause,
        orderBy: { tanggal: "desc" }
    });
}

export async function addPosyanduAnggaran(data: any) {
    const { tenantId, resolvedUnit } = await verifyPosyanduAccess();
    const resolvedName = data.posyanduName?.trim() || resolvedUnit?.name || "Posyandu";

    const res = await prisma.posyanduAnggaran.create({
        data: {
            posyanduName: resolvedName,
            jenisDana: data.jenisDana,
            tipe: data.tipe,
            jumlah: parseFloat(data.jumlah),
            tanggal: new Date(data.tanggal),
            keterangan: data.keterangan,
            tenantId
        }
    });
    revalidatePath("/dashboard");
    return res;
}

export async function deletePosyanduAnggaran(id: string) {
    await verifyPosyanduAccess();
    await prisma.posyanduAnggaran.delete({ where: { id } });
    revalidatePath("/dashboard");
}
