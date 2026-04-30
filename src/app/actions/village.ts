"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusSurat } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function getVillageDashboardStats() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        const [suratPending, laporanVerified, totalAparatur] = await Promise.all([
            prisma.surat.count({ where: { tenantId, status: StatusSurat.TERTUNDA } }),
            prisma.surat.count({ where: { tenantId, status: StatusSurat.TERVERIFIKASI } }),
            prisma.user.count({ where: { tenantId, isActive: true } })
        ]);

        return { suratPending, laporanVerified, totalAparatur };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return { suratPending: 0, laporanVerified: 0, totalAparatur: 0 };
    }
}

export async function getSuratList() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.surat.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: { warga: true },
            take: 20
        });
    } catch (error) {
        console.error("Surat List Error:", error);
        return [];
    }
}

export async function updateSuratStatus(id: string, status: StatusSurat) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.surat.update({
            where: { id },
            data: { status }
        });
    } catch (error) {
        console.error("Update Surat Error:", error);
        throw error;
    }
}

export async function getWargaList(query?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.dataKependudukan.findMany({
            where: {
                tenantId,
                OR: query ? [
                    { namaLengkap: { contains: query, mode: 'insensitive' } },
                    { nik: { contains: query } }
                ] : undefined
            },
            take: 20
        });
    } catch (error) {
        console.error("Warga List Error:", error);
        return [];
    }
}

export async function searchWarga(query: string) {
    return await getWargaList(query);
}

export async function createVillageAccount(data: { email: string; fullName: string; role: any; password: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as { tenantId: string }).tenantId;

    // Hash the temporary password
    const passwordHash = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
        data: {
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            passwordHash: passwordHash, 
            tenantId,
            isFirstLogin: true, // Mandatory setup on first login
            isActive: true
        }
    });
}
export async function addWarga(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.dataKependudukan.create({
            data: {
                ...data,
                tenantId
            }
        });
    } catch (error) {
        console.error("Add Warga Error:", error);
        throw error;
    }
}
