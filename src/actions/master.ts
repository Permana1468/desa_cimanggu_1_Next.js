"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { cache } from "react";

// Security check for Master Admin - cached per-request to prevent redundant DB/crypto operations
const checkMaster = cache(async () => {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return { user: { id: "build", role: "ADMIN_MASTER", tenantId: "build" } } as any;
    }
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        throw new Error("Unauthorized: Master Admin only");
    }
    return session as any;
});

// 1. User Management
export async function getAllUsers() {
    await checkMaster();
    try {
        return await prisma.user.findMany({
            include: { tenant: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function toggleUserStatus(userId: string, status: boolean) {
    const session = await checkMaster();
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive: status }
        });

        await prisma.auditLog.create({
            data: {
                action: "TOGGLE_USER_STATUS",
                entity: "User",
                entityId: userId,
                details: { status },
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/users");
        return user;
    } catch (error) {
        throw error;
    }
}

export async function upsertMasterUser(data: {
    id?: string;
    email: string;
    fullName: string;
    role: RoleType;
    tenantId: string;
    password?: string;
    isActive?: boolean;
    rt?: string;
    rw?: string;
}) {
    const session = await checkMaster();
    try {
        const { id, password, ...rest } = data;
        
        let passwordHash: string | undefined;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const userData = {
            ...rest,
            rt: rest.rt === "" ? undefined : rest.rt,
            rw: rest.rw === "" ? undefined : rest.rw,
            ...(passwordHash && { passwordHash }),
        };

        let result;
        if (id) {
            result = await prisma.user.update({
                where: { id },
                data: userData
            });
        } else {
            if (!password) throw new Error("Password is required for new users");
            result = await prisma.user.create({
                data: {
                    ...userData,
                    passwordHash: passwordHash!,
                }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: id ? "UPDATE_USER" : "CREATE_USER",
                entity: "User",
                entityId: result.id,
                details: { email: data.email, role: data.role },
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/users");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteMasterUser(userId: string) {
    const session = await checkMaster();
    try {
        const result = await prisma.user.delete({
            where: { id: userId }
        });

        await prisma.auditLog.create({
            data: {
                action: "DELETE_USER",
                entity: "User",
                entityId: userId,
                details: { email: result.email },
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/users");
        return result;
    } catch (error) {
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
        return [];
    }
}

export async function createTenant(data: { name: string; domain?: string; description?: string }) {
    const session = await checkMaster();
    try {
        const result = await prisma.tenant.create({
            data: {
                name: data.name,
                domain: data.domain,
                isActive: true
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "CREATE_TENANT",
                entity: "Tenant",
                entityId: result.id,
                details: data,
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/tenants");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateTenant(id: string, data: any) {
    const session = await checkMaster();
    try {
        const result = await prisma.tenant.update({
            where: { id },
            data
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_TENANT",
                entity: "Tenant",
                entityId: id,
                details: data,
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/tenants");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function toggleTenantStatus(id: string, status: boolean) {
    const session = await checkMaster();
    try {
        const result = await prisma.tenant.update({
            where: { id },
            data: { isActive: status }
        });

        await prisma.auditLog.create({
            data: {
                action: "TOGGLE_TENANT_STATUS",
                entity: "Tenant",
                entityId: id,
                details: { status },
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/tenants");
        return result;
    } catch (error) {
        throw error;
    }
}


export async function getAllTenantsMinimal() {
    await checkMaster();
    try {
        return await prisma.tenant.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

// 3. Global Statistics
export async function getSystemStats(tenantId?: string) {
    await checkMaster();
    try {
        const filter = tenantId ? { tenantId } : {};

        const [totalUsers, totalTenants, totalWarga, totalSurat] = await Promise.all([
            prisma.user.count({ where: filter }),
            tenantId ? 1 : prisma.tenant.count(),
            prisma.dataKependudukan.count({ where: filter }),
            prisma.surat.count({ where: filter })
        ]);

        // Demographic breakdown (Gender)
        const genderStats = await prisma.dataKependudukan.groupBy({
            by: ['jenisKelamin'],
            where: filter,
            _count: true
        });

        // Growth data (Last 6 months registrations)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const growthData = await prisma.dataKependudukan.findMany({
            where: {
                ...filter,
                createdAt: { gte: sixMonthsAgo }
            },
            select: { createdAt: true }
        });

        // Simple aggregation by month for growth chart
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const growthByMonth = growthData.reduce((acc: any, curr) => {
            const month = months[curr.createdAt.getMonth()];
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});

        const formattedGrowth = months.map(m => ({
            name: m,
            value: growthByMonth[m] || 0
        })).filter(m => m.value > 0 || months.indexOf(m.name) <= new Date().getMonth());

        return { 
            totalUsers, 
            totalTenants, 
            totalWarga, 
            totalSurat,
            demographics: genderStats.map(g => ({ name: g.jenisKelamin, value: g._count })),
            growth: formattedGrowth
        };
    } catch (error) {
        return { totalUsers: 0, totalTenants: 0, totalWarga: 0, totalSurat: 0, demographics: [], growth: [] };
    }
}

// 4. Detailed Audit Logs
export async function getAuditLogs(page: number = 1, limit: number = 20, category?: string, tenantId?: string) {
    await checkMaster();
    try {
        const where: any = {};
        if (category) where.category = category;
        if (tenantId) where.tenantId = tenantId;

        return await prisma.auditLog.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { fullName: true, role: true } },
                tenant: { select: { name: true } }
            }
        });
    } catch (error) {
        return [];
    }
}

// 5. RBAC Configuration
export async function getRolePermissions() {
    await checkMaster();
    try {
        return await prisma.rolePermission.findMany({
            orderBy: [{ role: 'asc' }, { module: 'asc' }]
        });
    } catch (error) {
        return [];
    }
}

// 7. Global Resident Data Management
export async function getGlobalResidents(tenantId?: string) {
    await checkMaster();
    try {
        const where = tenantId ? { tenantId } : {};
        return await prisma.dataKependudukan.findMany({
            where,
            include: { tenant: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

function cleanDigits(val: string): string {
    return val ? val.toString().replace(/\D/g, '').replace(/^0+/, '') || '0' : '';
}

function resolveDusunForRw(rwVal: string, structure: any): string {
    if (!rwVal) return "";
    const cleanRw = cleanDigits(rwVal);
    let matchedDusun = "";
    structure.dusun?.forEach((d: any) => {
        d.rw?.forEach((rw: any) => {
            if (cleanDigits(rw.name) === cleanRw) {
                matchedDusun = d.name;
            }
        });
    });
    return matchedDusun;
}

export async function upsertResident(data: any) {
    const session = await checkMaster();
    try {
        const { id, ...rest } = data;
        
        // Ensure date is properly formatted
        if (rest.tanggalLahir) {
            rest.tanggalLahir = new Date(rest.tanggalLahir);
        }

        // Fetch structure to resolve/validate dusun automatically
        const structureConfig = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (structureConfig?.settings as any) || { dusun: [] };
        
        if (rest.rw) {
            rest.rw = rest.rw.toString().replace(/\D/g, '').padStart(3, '0');
            const resolvedDusun = resolveDusunForRw(rest.rw, structure);
            if (resolvedDusun) {
                rest.dusun = resolvedDusun;
            }
        }
        if (rest.rt) {
            rest.rt = rest.rt.toString().replace(/\D/g, '').padStart(3, '0');
        }

        let result;
        if (id) {
            result = await prisma.dataKependudukan.update({
                where: { id },
                data: rest
            });
        } else {
            result = await prisma.dataKependudukan.create({
                data: rest
            });
        }

        await prisma.auditLog.create({
            data: {
                action: id ? "UPDATE_RESIDENT" : "CREATE_RESIDENT",
                entity: "DataKependudukan",
                entityId: result.id,
                details: { 
                    nik: data.nik, 
                    nama: data.namaLengkap,
                    noKK: data.noKK 
                },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "DATA"
            }
        });

        revalidatePath("/master-admin/data");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function bulkImportResidents(residents: any[], tenantId: string) {
    const session = await checkMaster();
    try {
        // Fetch structure to resolve/validate dusun automatically
        const structureConfig = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (structureConfig?.settings as any) || { dusun: [] };

        // Bulk create with transaction
        const result = await prisma.$transaction(
            residents.map(r => {
                const { tanggalLahir, ...rest } = r;

                let rw = rest.rw ? rest.rw.toString().replace(/\D/g, '').padStart(3, '0') : "";
                let rt = rest.rt ? rest.rt.toString().replace(/\D/g, '').padStart(3, '0') : "";
                let dusun = rest.dusun || "";

                if (rw) {
                    const resolvedDusun = resolveDusunForRw(rw, structure);
                    if (resolvedDusun) {
                        dusun = resolvedDusun;
                    }
                }

                const updatedData = {
                    ...rest,
                    rw,
                    rt,
                    dusun,
                    tanggalLahir: new Date(tanggalLahir),
                    tenantId
                };

                return prisma.dataKependudukan.upsert({
                    where: { nik: r.nik },
                    update: updatedData,
                    create: updatedData
                });
            }),
            {
                maxWait: 15000,
                timeout: 90000
            }
        );

        await prisma.auditLog.create({
            data: {
                action: "BULK_IMPORT_RESIDENTS",
                entity: "DataKependudukan",
                details: { count: residents.length, tenantId },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "DATA"
            }
        });

        revalidatePath("/master-admin/data");
        return { count: result.length };
    } catch (error) {
        throw error;
    }
}


export async function deleteResident(id: string) {
    const session = await checkMaster();
    try {
        await prisma.dataKependudukan.delete({ where: { id } });
        revalidatePath("/master-admin/data");
        return { success: true };
    } catch (error) {
        throw error;
    }
}


export async function updateRolePermission(id: string, data: Partial<{
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}>) {
    const session = await checkMaster();
    try {
        const result = await prisma.rolePermission.update({
            where: { id },
            data
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_PERMISSION",
                entity: "RolePermission",
                entityId: id,
                details: data,
                userId: session.user.id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/master-admin/config");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function logSecurityEvent(data: {
    action: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
    tenantId: string;
}) {
    try {
        return await prisma.auditLog.create({
            data: {
                ...data,
                entity: "Security",
                category: "SECURITY"
            }
        });
    } catch (error) {
    }
}

// 6. System Global Settings
export async function getSystemSettings() {
    await checkMaster();
    try {
        const config = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        return (config?.settings as any) || {};
    } catch (error) {
        return {};
    }
}

export async function updateSystemSettings(settings: any) {
    const session = await checkMaster();
    try {
        const result = await prisma.systemSetting.upsert({
            where: { id: "global_config" },
            update: { settings, updatedAt: new Date() },
            create: { id: "global_config", settings, updatedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_SYSTEM_SETTINGS",
                entity: "SystemSetting",
                entityId: "global_config",
                details: settings,
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SYSTEM"
            }
        });

        revalidatePath("/master-admin/config");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function backupDatabase() {
    await checkMaster();
    // Implementation placeholder
    // Implementation placeholder
    return { success: true, timestamp: new Date().toISOString() };
}

export async function testWhatsAppConnection() {
    await checkMaster();
    // Implementation placeholder
    // Implementation placeholder
    return { success: true, status: "Connected" };
}

// 8. Village Structure (Dusun, RW, RT)
export async function getVillageStructure() {
    await checkMaster();
    try {
        const config = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        return (config?.settings as any) || { dusun: [] };
    } catch (error) {
        return { dusun: [] };
    }
}

export async function updateVillageStructure(structure: any) {
    const session = await checkMaster();
    try {
        const result = await prisma.systemSetting.upsert({
            where: { id: "village_structure" },
            update: { settings: structure, updatedAt: new Date() },
            create: { id: "village_structure", settings: structure, updatedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_VILLAGE_STRUCTURE",
                entity: "SystemSetting",
                entityId: "village_structure",
                details: structure,
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SYSTEM"
            }
        });

        revalidatePath("/master-admin/wilayah");
        return result;
    } catch (error) {
        throw error;
    }
}

// 9. Advanced Security (2FA & Biometric)
export async function registerMasterDevice(deviceId: string) {
    const session = await checkMaster();
    try {
        const result = await prisma.user.update({
            where: { id: session.user.id },
            data: { 
                isTwoFactorEnabled: true,
                twoFactorSecret: deviceId // Simplified for concept: Storing WebAuthn Credential ID
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "REGISTER_MASTER_BIOMETRIC",
                entity: "User",
                entityId: session.user.id,
                details: { deviceId },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SECURITY"
            }
        });

        return { success: true };
    } catch (error) {
        throw error;
    }
}

export async function toggleUserSecurity(userId: string, data: { force2FA?: boolean; requestBiometric?: boolean }) {
    const session = await checkMaster();
    try {
        const result = await prisma.user.update({
            where: { id: userId },
            data: {
                isTwoFactorEnabled: data.force2FA ?? undefined,
                // We mark it so that on next login they are asked to register
                isFirstLogin: data.requestBiometric ? true : undefined 
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "TOGGLE_USER_SECURITY",
                entity: "User",
                entityId: userId,
                details: data,
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SECURITY"
            }
        });

        revalidatePath("/master-admin/pengguna-sistem");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteAllResidents(tenantId?: string) {
    const session = await checkMaster();
    try {
        let deletedCount = 0;
        if (tenantId && tenantId !== "all") {
            const result = await prisma.dataKependudukan.deleteMany({
                where: { tenantId }
            });
            deletedCount = result.count;
        } else {
            const result = await prisma.dataKependudukan.deleteMany({});
            deletedCount = result.count;
        }

        await prisma.auditLog.create({
            data: {
                action: "DELETE_ALL_RESIDENTS",
                entity: "DataKependudukan",
                details: { tenantId, count: deletedCount },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "DATA"
            }
        });

        revalidatePath("/master-admin/data");
        return { success: true, count: deletedCount };
    } catch (error) {
        throw error;
    }
}

export async function bulkDeleteResidents(ids: string[]) {
    const session = await checkMaster();
    try {
        const result = await prisma.dataKependudukan.deleteMany({
            where: { id: { in: ids } }
        });

        await prisma.auditLog.create({
            data: {
                action: "BULK_DELETE_RESIDENTS",
                entity: "DataKependudukan",
                details: { count: result.count, ids },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "DATA"
            }
        });

        revalidatePath("/master-admin/data");
        return { success: true, count: result.count };
    } catch (error) {
        throw error;
    }
}

export async function saveOfficialTemplates(templates: any[]) {
    const session = await checkMaster();
    try {
        const configRecord = await prisma.systemSetting.findUnique({
            where: { id: "global_config" }
        });
        const settings = configRecord ? (configRecord.settings as any) || {} : {};
        settings.officialTemplates = templates;

        await prisma.systemSetting.upsert({
            where: { id: "global_config" },
            update: { settings, updatedAt: new Date() },
            create: { id: "global_config", settings, updatedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_OFFICIAL_TEMPLATES",
                entity: "SystemSetting",
                entityId: "global_config",
                details: { count: templates.length },
                userId: session.user.id,
                tenantId: session.user.tenantId,
                category: "SYSTEM"
            }
        });

        revalidatePath("/master-admin/templates");
        revalidatePath("/dashboard/templates");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Gagal menyimpan template resmi.");
    }
}
