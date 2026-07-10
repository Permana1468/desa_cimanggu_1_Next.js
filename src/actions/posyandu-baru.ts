"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function verifyPosyanduAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rwString = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "POSYANDU" && role !== "RW" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "ADMIN_MASTER") {
        throw new Error("Akses ditolak.");
    }

    const rws = rwString ? rwString.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [];

    return { tenantId, rws, user: session.user, role };
}

// =======================
// NEW POSYANDU MODULES
// =======================

export async function getPosyanduRegisters(formatNumber: number) {
    const { tenantId } = await verifyPosyanduAccess();
    return await prisma.posyanduRegisterFormat.findMany({
        where: { tenantId, formatNumber },
        orderBy: { recordedDate: "desc" }
    });
}

export async function addPosyanduRegister(data: { formatNumber: number, posyanduName: string, dataString: string }) {
    const { tenantId } = await verifyPosyanduAccess();
    const res = await prisma.posyanduRegisterFormat.create({
        data: {
            ...data,
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

export async function getPosyanduInventaris() {
    const { tenantId } = await verifyPosyanduAccess();
    return await prisma.posyanduInventory.findMany({
        where: { tenantId },
        orderBy: { tanggalMasuk: "desc" }
    });
}

export async function addPosyanduInventaris(data: any) {
    const { tenantId } = await verifyPosyanduAccess();
    const res = await prisma.posyanduInventory.create({
        data: {
            posyanduName: data.posyanduName,
            namaBarang: data.namaBarang,
            kategori: data.kategori,
            jumlah: parseInt(data.jumlah),
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
    await verifyPosyanduAccess();
    const res = await prisma.posyanduInventory.update({
        where: { id },
        data: {
            posyanduName: data.posyanduName,
            namaBarang: data.namaBarang,
            kategori: data.kategori,
            jumlah: parseInt(data.jumlah),
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

export async function getPosyanduAbsensi() {
    const { tenantId } = await verifyPosyanduAccess();
    return await prisma.posyanduAbsensi.findMany({
        where: { tenantId },
        orderBy: { tanggal: "desc" }
    });
}

export async function addPosyanduAbsensi(data: any) {
    const { tenantId } = await verifyPosyanduAccess();
    const res = await prisma.posyanduAbsensi.create({
        data: {
            posyanduName: data.posyanduName,
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
// ANGGARAN
// =======================

export async function getPosyanduAnggarans() {
    const { tenantId } = await verifyPosyanduAccess();
    return await prisma.posyanduAnggaran.findMany({
        where: { tenantId },
        orderBy: { tanggal: "desc" }
    });
}

export async function addPosyanduAnggaran(data: any) {
    const { tenantId } = await verifyPosyanduAccess();
    const res = await prisma.posyanduAnggaran.create({
        data: {
            posyanduName: data.posyanduName,
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
