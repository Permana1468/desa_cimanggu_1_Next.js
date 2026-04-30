"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RoleType } from "@prisma/client";

// Security check for Master Admin
async function checkMaster() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN_MASTER") {
        throw new Error("Unauthorized: Master Admin only");
    }
    return session;
}

// 1. User Management
export async function getAllUsers() {
    await checkMaster();
    try {
        return await prisma.user.findMany({
            include: { tenant: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Master: GetUsers Error:", error);
        return [];
    }
}

export async function toggleUserStatus(userId: string, status: boolean) {
    await checkMaster();
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: { isActive: status }
        });
    } catch (error) {
        console.error("Master: ToggleUser Error:", error);
        throw error;
    }
}

// 2. Tenant Management
export async function getAllTenants() {
    await checkMaster();
    try {
        return await prisma.tenant.findMany({
            include: { 
                _count: {
                    select: { users: true, dataKependudukan: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Master: GetTenants Error:", error);
        return [];
    }
}

export async function createTenant(data: { name: string; domain?: string }) {
    await checkMaster();
    try {
        return await prisma.tenant.create({
            data: {
                name: data.name,
                domain: data.domain
            }
        });
    } catch (error) {
        console.error("Master: CreateTenant Error:", error);
        throw error;
    }
}

// 3. Global Statistics
export async function getSystemStats() {
    await checkMaster();
    try {
        const [totalUsers, totalTenants, totalWarga, totalSurat] = await Promise.all([
            prisma.user.count(),
            prisma.tenant.count(),
            prisma.dataKependudukan.count(),
            prisma.surat.count()
        ]);

        return { totalUsers, totalTenants, totalWarga, totalSurat };
    } catch (error) {
        console.error("Master: Stats Error:", error);
        return { totalUsers: 0, totalTenants: 0, totalWarga: 0, totalSurat: 0 };
    }
}

// 4. Detailed Audit Logs
export async function getAuditLogs(page: number = 1, limit: number = 20) {
    await checkMaster();
    try {
        return await prisma.auditLog.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { fullName: true, role: true } },
                tenant: { select: { name: true } }
            }
        });
    } catch (error) {
        console.error("Master: AuditLogs Error:", error);
        return [];
    }
}
