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
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error("Email atau NIK tersebut sudah digunakan oleh pengguna lain. Silakan gunakan yang berbeda.");
        }
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
            select: {
                id: true,
                nik: true,
                noKK: true,
                namaLengkap: true,
                jenisKelamin: true,
                tempatLahir: true,
                tanggalLahir: true,
                alamat: true,
                kampung: true,
                rt: true,
                rw: true,
                dusun: true,
                pekerjaan: true,
                agama: true,
                pendidikan: true,
                golonganDarah: true,
                statusKawin: true,
                hubunganKeluarga: true,
                kewarganegaraan: true,
                namaAyah: true,
                namaIbu: true,
                tenantId: true,
                tenant: { select: { name: true } }
            },
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
        let tenantId = (session.user as any).tenantId || data.tenantId;
        if (!tenantId) {
            const firstTenant = await prisma.tenant.findFirst();
            tenantId = firstTenant?.id;
        }
        if (!tenantId) {
            const createdTenant = await prisma.tenant.upsert({
                where: { domain: "desa-cimanggu-i" },
                update: {},
                create: { name: "Desa Cimanggu I", domain: "desa-cimanggu-i" }
            });
            tenantId = createdTenant.id;
        }

        const {
            id,
            createdAt: _c,
            updatedAt: _u,
            tenant: _t,
            user: _usr,
            surat: _s,
            bansosData: _b,
            puskesosPengaduans: _p1,
            puskesosRujukans: _p2,
            tenantId: _tid,
            ...rest
        } = data;
        
        if (rest.tanggalLahir) {
            const parsedDate = new Date(rest.tanggalLahir);
            if (!isNaN(parsedDate.getTime())) {
                rest.tanggalLahir = parsedDate;
            } else {
                delete rest.tanggalLahir;
            }
        }

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
                data: {
                    ...rest,
                    updatedAt: new Date()
                }
            });
        } else {
            result = await prisma.dataKependudukan.create({
                data: {
                    ...rest,
                    noKK: rest.noKK || rest.nik || "0000000000000000",
                    namaLengkap: rest.namaLengkap || "TANPA NAMA",
                    tempatLahir: rest.tempatLahir || "BOGOR",
                    tanggalLahir: rest.tanggalLahir || new Date("1995-01-01"),
                    jenisKelamin: rest.jenisKelamin || "LAKI_LAKI",
                    agama: rest.agama || "ISLAM",
                    statusKawin: rest.statusKawin || "BELUM_KAWIN",
                    hubunganKeluarga: rest.hubunganKeluarga || "KEPALA_KELUARGA",
                    alamat: rest.alamat || "Desa Cimanggu I",
                    rt: rest.rt || "001",
                    rw: rest.rw || "001",
                    dusun: rest.dusun || "Dusun I",
                    tenantId: tenantId
                }
            });
        }

        try {
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
                    tenantId: tenantId,
                    category: "DATA"
                }
            });
        } catch (e) {}

        revalidatePath("/master-admin/data");
        revalidatePath("/dashboard/warga");
        return result;
    } catch (error: any) {
        console.error("Error in upsertResident:", error);
        throw new Error(error.message || "Gagal menyimpan data warga");
    }
}

export async function bulkImportResidents(residents: any[], targetTenantId: string) {
    const session = await checkMaster();
    try {
        let tenantId = targetTenantId || (session.user as any).tenantId;
        if (!tenantId) {
            const firstTenant = await prisma.tenant.findFirst();
            tenantId = firstTenant?.id;
        }
        if (!tenantId) {
            const createdTenant = await prisma.tenant.upsert({
                where: { domain: "desa-cimanggu-i" },
                update: {},
                create: { name: "Desa Cimanggu I", domain: "desa-cimanggu-i" }
            });
            tenantId = createdTenant.id;
        }

        const structureConfig = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (structureConfig?.settings as any) || { dusun: [] };

        // Fetch existing NIKs from database to prevent duplicate insertions
        const existingResidents = await prisma.dataKependudukan.findMany({
            select: { nik: true }
        });
        const existingNikSet = new Set(existingResidents.map(w => w.nik?.trim()));

        const seenInBatch = new Set<string>();
        const toInsert: any[] = [];
        let skippedCount = 0;

        for (const r of residents) {
            const rawNik = r.nik ? String(r.nik).replace(/\D/g, '').trim() : "";
            if (!rawNik) {
                skippedCount++;
                continue;
            }

            // Skip if NIK already exists in database OR repeated in this import batch
            if (existingNikSet.has(rawNik) || seenInBatch.has(rawNik)) {
                skippedCount++;
                continue;
            }

            seenInBatch.add(rawNik);

            const { tanggalLahir, ...rest } = r;
            const rw = rest.rw ? rest.rw.toString().replace(/\D/g, '').padStart(3, '0') : "001";
            const rt = rest.rt ? rest.rt.toString().replace(/\D/g, '').padStart(3, '0') : "001";
            let dusun = rest.dusun || "";

            if (rw) {
                const resolvedDusun = resolveDusunForRw(rw, structure);
                if (resolvedDusun) {
                    dusun = resolvedDusun;
                }
            }
            if (!dusun) dusun = "Dusun I";

            let parsedDate = tanggalLahir ? new Date(tanggalLahir) : new Date("1995-01-01");
            if (isNaN(parsedDate.getTime())) {
                parsedDate = new Date("1995-01-01");
            }

            toInsert.push({
                nik: rawNik,
                noKK: rest.noKK ? String(rest.noKK).replace(/\D/g, '').trim() : rawNik,
                namaLengkap: rest.namaLengkap ? String(rest.namaLengkap).trim().toUpperCase() : "WARGA IMPOR",
                tempatLahir: rest.tempatLahir ? String(rest.tempatLahir).trim() : "BOGOR",
                tanggalLahir: parsedDate,
                jenisKelamin: rest.jenisKelamin ? String(rest.jenisKelamin).trim() : "LAKI_LAKI",
                agama: rest.agama ? String(rest.agama).trim() : "ISLAM",
                statusKawin: rest.statusKawin ? String(rest.statusKawin).trim() : "BELUM_KAWIN",
                hubunganKeluarga: rest.hubunganKeluarga ? String(rest.hubunganKeluarga).trim() : "KEPALA_KELUARGA",
                kewarganegaraan: rest.kewarganegaraan ? String(rest.kewarganegaraan).trim() : "WNI",
                pendidikan: rest.pendidikan ? String(rest.pendidikan).trim() : "TAMAT_SD",
                pekerjaan: rest.pekerjaan ? String(rest.pekerjaan).trim() : "BELUM_TIDAK_BEKERJA",
                golonganDarah: rest.golonganDarah ? String(rest.golonganDarah).trim() : "TIDAK_TAHU",
                namaAyah: rest.namaAyah ? String(rest.namaAyah).trim() : "-",
                namaIbu: rest.namaIbu ? String(rest.namaIbu).trim() : "-",
                alamat: rest.alamat ? String(rest.alamat).trim() : "Desa Cimanggu I",
                kampung: rest.kampung ? String(rest.kampung).trim() : "Kp. Ciaruteun",
                rt,
                rw,
                dusun,
                tenantId
            });
        }

        let insertedCount = 0;
        if (toInsert.length > 0) {
            const res = await prisma.dataKependudukan.createMany({
                data: toInsert,
                skipDuplicates: true
            });
            insertedCount = res.count;
        }

        try {
            await prisma.auditLog.create({
                data: {
                    action: "BULK_IMPORT_RESIDENTS",
                    entity: "DataKependudukan",
                    details: { 
                        totalProcessed: residents.length, 
                        insertedCount, 
                        skippedCount,
                        tenantId 
                    },
                    userId: session.user.id,
                    tenantId: tenantId,
                    category: "DATA"
                }
            });
        } catch (e) {}

        revalidatePath("/master-admin/data");
        revalidatePath("/dashboard/warga");
        return {
            success: true,
            totalProcessed: residents.length,
            insertedCount,
            skippedCount
        };
    } catch (error: any) {
        console.error("Error in bulkImportResidents:", error);
        throw new Error(error.message || "Gagal mengimpor data kependudukan.");
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
