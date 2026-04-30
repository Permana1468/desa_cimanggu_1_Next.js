"use server";

import prisma from "@/lib/prisma";
import { RoleType, StatusSurat } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 1. Get Dashboard Statistics
export async function getVillageDashboardStats() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const tenantId = (session.user as { tenantId: string }).tenantId;

    const [suratPending, laporanVerified, totalAparatur] = await Promise.all([
        prisma.surat.count({ where: { tenantId, status: StatusSurat.TERTUNDA } }),
        prisma.surat.count({ where: { tenantId, status: StatusSurat.TERVERIFIKASI } }),
        prisma.user.count({ 
            where: { 
                tenantId, 
                role: { in: [RoleType.RT, RoleType.RW, RoleType.SEKDES, RoleType.KADES] } 
            } 
        })
    ]);

    return { suratPending, laporanVerified, totalAparatur };
}

// 2. Persuratan Logic
export async function getSuratList() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as { tenantId: string }).tenantId;

    return await prisma.surat.findMany({
        where: { tenantId },
        include: { warga: true, admin: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateSuratStatus(id: string, status: StatusSurat) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.surat.update({
        where: { id },
        data: { status }
    });
}

// 3. Warga Management (Search & Filter)
export async function searchWarga(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as { tenantId: string }).tenantId;

    return await prisma.dataKependudukan.findMany({
        where: {
            tenantId,
            OR: [
                { nik: { contains: query, mode: 'insensitive' } },
                { namaLengkap: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 10
    });
}

// 4. Account Management (RT/RW)
export async function createVillageAccount(data: { 
    email: string; 
    fullName: string; 
    role: RoleType; 
    password: string 
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as { tenantId: string }).tenantId;

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
        data: {
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            passwordHash: hashedPassword,
            tenantId: tenantId,
            isActive: true
        }
    });
}
