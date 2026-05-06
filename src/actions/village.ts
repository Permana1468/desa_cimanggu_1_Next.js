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

export async function updateWarga(id: string, data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.dataKependudukan.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error("Update Warga Error:", error);
        throw error;
    }
}

export async function deleteWarga(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.dataKependudukan.delete({
            where: { id }
        });
    } catch (error) {
        console.error("Delete Warga Error:", error);
        throw error;
    }
}
export async function getVillageProfile() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        let profile = await prisma.villageProfile.findUnique({
            where: { tenantId }
        });

        if (!profile) {
            // Create default profile if not exists
            profile = await prisma.villageProfile.create({
                data: {
                    tenantId,
                    visi: "Terwujudnya Desa yang Mandiri dan Sejahtera",
                    misi: ["Meningkatkan pelayanan publik", "Mengoptimalkan ekonomi desa"],
                    sejarah: "Sejarah desa belum diisi.",
                    luasWilayah: "0 Ha",
                    batasUtara: "-",
                    batasSelatan: "-",
                    batasTimur: "-",
                    batasBarat: "-"
                }
            });
        }

        return profile;
    } catch (error) {
        console.error("Get Profile Error:", error);
        return null;
    }
}

export async function updateVillageProfile(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.villageProfile.update({
            where: { tenantId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        throw error;
    }
}

export async function getAparatur() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.user.findMany({
            where: { 
                tenantId,
                role: { not: "WARGA" }
            },
            orderBy: { role: 'asc' }
        });
    } catch (error) {
        console.error("Get Aparatur Error:", error);
        return [];
    }
}

export async function addAparatur(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        const passwordHash = await bcrypt.hash(data.password || "desa123", 10);

        return await prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                position: data.position,
                phoneNumber: data.phoneNumber,
                passwordHash,
                tenantId,
                isActive: true,
                isFirstLogin: true
            }
        });
    } catch (error) {
        console.error("Add Aparatur Error:", error);
        throw error;
    }
}

export async function getLembagas() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.lembaga.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Get Lembagas Error:", error);
        return [];
    }
}

export async function addLembaga(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.lembaga.create({
            data: {
                ...data,
                tenantId
            }
        });
    } catch (error) {
        console.error("Add Lembaga Error:", error);
        throw error;
    }
}

export async function getBumdesFinances() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.bumdesFinancial.findMany({
            where: { tenantId },
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        console.error("Get BUMDes Finances Error:", error);
        return [];
    }
}

export async function addBumdesTransaction(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.bumdesFinancial.create({
            data: {
                ...data,
                amount: Number(data.amount),
                tenantId
            }
        });
    } catch (error) {
        console.error("Add BUMDes Transaction Error:", error);
        throw error;
    }
}

export async function getAparaturHierarchy() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.aparaturDesa.findMany({
            where: { tenantId, isActive: true },
            orderBy: [{ level: 'asc' }, { order: 'asc' }],
            include: { children: true }
        });
    } catch (error) {
        console.error("Get Hierarchy Error:", error);
        return [];
    }
}

export async function updateAparaturSK(id: string, data: { skNumber?: string, skUrl?: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.aparaturDesa.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
    } catch (error) {
        console.error("Update SK Error:", error);
        throw error;
    }
}

