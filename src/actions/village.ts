"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusSurat } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildWilayahFilterScope } from "./rt";

function cleanDigits(val: string): string {
    return val ? val.toString().replace(/\D/g, '').replace(/^0+/, '') || '0' : '';
}

export async function getVillageDashboardStats() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        const [suratPending, laporanVerified, totalAparatur, totalProposals] = await Promise.all([
            prisma.surat.count({ where: { tenantId, status: StatusSurat.TERTUNDA } }),
            prisma.surat.count({ where: { tenantId, status: StatusSurat.TERVERIFIKASI } }),
            prisma.user.count({ where: { tenantId, isActive: true } }),
            prisma.financeProposal.count({ where: { tenantId, status: "PENDING" } })
        ]);

        return { suratPending, laporanVerified, totalAparatur, totalProposals };
    } catch (error) {
    return { suratPending: 0, laporanVerified: 0, totalAparatur: 0 };
    }
}

export async function getSuratList() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;
        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        const filterScope: any = { tenantId };
        if (role === "WARGA") {
            const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
            if (user?.residentId) {
                filterScope.wargaId = user.residentId;
            } else {
                // Return empty if not linked to a resident
                return [];
            }
        } else if (role === "RT") {
            const rtClean = cleanDigits(userRt || "");
            const rwClean = cleanDigits(userRw || "");
            filterScope.warga = {
                rt: { in: [userRt, rtClean, rtClean.padStart(3, '0')] },
                rw: { in: [userRw, rwClean, rwClean.padStart(3, '0')] }
            };
        } else if (role === "RW") {
            const rwClean = cleanDigits(userRw || "");
            filterScope.warga = {
                rw: { in: [userRw, rwClean, rwClean.padStart(3, '0')] }
            };
        }

        return await prisma.surat.findMany({
            where: filterScope,
            orderBy: { createdAt: 'desc' },
            include: { warga: true },
            take: 20
        });
    } catch (error) {
        return [];
    }
}

export async function updateSuratStatus(id: string, status: StatusSurat, nomorSurat?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        if (role === "RT" || role === "RW") {
            const targetSurat = await prisma.surat.findUnique({
                where: { id },
                include: { warga: true }
            });
            if (!targetSurat) throw new Error("Surat tidak ditemukan");
            const cleanTargetRt = cleanDigits(targetSurat.warga.rt || "");
            const cleanTargetRw = cleanDigits(targetSurat.warga.rw || "");
            const cleanUserRt = cleanDigits(userRt || "");
            const cleanUserRw = cleanDigits(userRw || "");
            if (role === "RT" && (cleanTargetRt !== cleanUserRt || cleanTargetRw !== cleanUserRw)) {
                throw new Error("Unauthorized: data isolation violation");
            }
            if (role === "RW" && cleanTargetRw !== cleanUserRw) {
                throw new Error("Unauthorized: data isolation violation");
            }
        }

        return await prisma.surat.update({
            where: { id },
            data: { 
                status,
                ...(nomorSurat ? { nomorSurat } : {})
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function getWargaList(query?: string, rtFilter?: string, rwFilter?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;
        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        const { filterScope } = await buildWilayahFilterScope(role, userRt, userRw, tenantId);

        // Using global cleanDigits helper

        if (role === "RW") {
            if (rtFilter) {
                const rtClean = cleanDigits(rtFilter);
                filterScope.rt = { in: [rtFilter, rtClean.padStart(3, '0'), rtClean] };
            }
        } else if (role === "KADUS") {
            if (rwFilter) {
                delete filterScope.OR;
                const rwClean = cleanDigits(rwFilter);
                filterScope.rw = { in: [rwFilter, rwClean.padStart(3, '0'), rwClean] };
                
                if (rtFilter) {
                    const rtClean = cleanDigits(rtFilter);
                    filterScope.rt = { in: [rtFilter, rtClean.padStart(3, '0'), rtClean] };
                }
            } else if (rtFilter) {
                const rtClean = cleanDigits(rtFilter);
                if (filterScope.OR) {
                    filterScope.OR = filterScope.OR.map((cond: any) => {
                        return { ...cond, rt: { in: [rtFilter, rtClean.padStart(3, '0'), rtClean] } };
                    });
                }
            }
        }

        const [deaths, moves] = await Promise.all([
            prisma.rtDeathReport.findMany({ select: { nik: true } }),
            prisma.rtMoveReport.findMany({ select: { nik: true } })
        ]);
        const inactiveNiks = [...deaths.map(d => d.nik), ...moves.map(m => m.nik)];

        const whereCondition: any = {
            ...filterScope,
        };

        if (inactiveNiks.length > 0) {
            whereCondition.nik = { notIn: inactiveNiks };
        }

        if (query) {
            whereCondition.OR = [
                { namaLengkap: { contains: query, mode: 'insensitive' } },
                { nik: { contains: query } }
            ];
        }

        return await prisma.dataKependudukan.findMany({
            where: whereCondition,
            orderBy: [
                { dusun: 'asc' },
                { rw: 'asc' },
                { rt: 'asc' }
            ],
            take: 5000
        });
    } catch (error) {
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

// global cleanDigits helper moved to the top of the file

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

export async function addWarga(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;
        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        let rt = data.rt;
        let rw = data.rw;
        if (role === "RT") {
            rt = userRt;
            rw = userRw;
        } else if (role === "RW") {
            rw = userRw;
        }

        // Pad RT/RW
        if (rt) rt = rt.toString().replace(/\D/g, '').padStart(3, '0');
        if (rw) rw = rw.toString().replace(/\D/g, '').padStart(3, '0');

        // Fetch structure to resolve/validate dusun automatically
        const structureConfig = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (structureConfig?.settings as any) || { dusun: [] };
        
        let dusun = data.dusun || "";
        if (rw) {
            const resolvedDusun = resolveDusunForRw(rw, structure);
            if (resolvedDusun) {
                dusun = resolvedDusun;
            }
        }

        return await prisma.dataKependudukan.create({
            data: {
                ...data,
                rt,
                rw,
                dusun,
                tenantId
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function updateWarga(id: string, data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        if (role === "RT" || role === "RW") {
            const targetWarga = await prisma.dataKependudukan.findUnique({ where: { id } });
            if (!targetWarga) throw new Error("Warga not found");
            const cleanTargetRt = cleanDigits(targetWarga.rt || "");
            const cleanTargetRw = cleanDigits(targetWarga.rw || "");
            const cleanUserRt = cleanDigits(userRt || "");
            const cleanUserRw = cleanDigits(userRw || "");
            if (role === "RT" && (cleanTargetRt !== cleanUserRt || cleanTargetRw !== cleanUserRw)) {
                throw new Error("Unauthorized");
            }
            if (role === "RW" && cleanTargetRw !== cleanUserRw) {
                throw new Error("Unauthorized");
            }
        }

        let rt = data.rt;
        let rw = data.rw;
        if (role === "RT") {
            rt = userRt;
            rw = userRw;
        } else if (role === "RW") {
            rw = userRw;
        }

        // Pad RT/RW
        if (rt) rt = rt.toString().replace(/\D/g, '').padStart(3, '0');
        if (rw) rw = rw.toString().replace(/\D/g, '').padStart(3, '0');

        // Fetch structure to resolve/validate dusun automatically
        const structureConfig = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (structureConfig?.settings as any) || { dusun: [] };
        
        let dusun = data.dusun || "";
        if (rw) {
            const resolvedDusun = resolveDusunForRw(rw, structure);
            if (resolvedDusun) {
                dusun = resolvedDusun;
            }
        }

        return await prisma.dataKependudukan.update({
            where: { id },
            data: {
                ...data,
                rt,
                rw,
                dusun,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteWarga(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const role = (session.user as any).role;
        const userRt = (session.user as any).rt;
        const userRw = (session.user as any).rw;

        if (role === "RT" || role === "RW") {
            const targetWarga = await prisma.dataKependudukan.findUnique({ where: { id } });
            if (!targetWarga) throw new Error("Warga not found");
            const cleanTargetRt = cleanDigits(targetWarga.rt || "");
            const cleanTargetRw = cleanDigits(targetWarga.rw || "");
            const cleanUserRt = cleanDigits(userRt || "");
            const cleanUserRw = cleanDigits(userRw || "");
            if (role === "RT" && (cleanTargetRt !== cleanUserRt || cleanTargetRw !== cleanUserRw)) {
                throw new Error("Unauthorized");
            }
            if (role === "RW" && cleanTargetRw !== cleanUserRw) {
                throw new Error("Unauthorized");
            }
        }

        return await prisma.dataKependudukan.delete({
            where: { id }
        });
    } catch (error) {
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
        throw error;
    }
}

export async function getBumdesUnits() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.bumdesUnit.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addBumdesUnit(data: { name: string; description?: string; status?: string; growth?: string; color?: string; icon?: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.bumdesUnit.create({
            data: {
                ...data,
                tenantId
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteBumdesUnit(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.bumdesUnit.delete({
            where: { id }
        });
    } catch (error) {
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
        throw error;
    }
}

export async function getAparaturDesaList() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.aparaturDesa.findMany({
            where: { tenantId, isActive: true },
            orderBy: [{ level: 'asc' }, { order: 'asc' }]
        });
    } catch (error) {
        return [];
    }
}

export async function addAparaturDesa(data: { name: string; nik?: string; role: any; position: string; photo?: string; level: number; order?: number; parentId?: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.aparaturDesa.create({
            data: {
                ...data,
                tenantId,
                isActive: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function updateAparaturDesa(id: string, data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.aparaturDesa.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteAparaturDesa(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.aparaturDesa.delete({
            where: { id }
        });
    } catch (error) {
        throw error;
    }
}

export async function getLembagaMembers(lembagaId: string) {
    try {
        return await prisma.lembagaMember.findMany({
            where: { lembagaId, isActive: true },
            orderBy: [{ level: 'asc' }, { order: 'asc' }]
        });
    } catch (error) {
        return [];
    }
}

export async function addLembagaMember(data: { lembagaId: string; name: string; nik?: string; position: string; photo?: string; email?: string; phoneNumber?: string; level: number }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.lembagaMember.create({
            data: {
                ...data,
                isActive: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteLembagaMember(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.lembagaMember.delete({
            where: { id }
        });
    } catch (error) {
        throw error;
    }
}

export async function getLembagaPrograms(lembagaId: string) {
    try {
        return await prisma.lembagaProgram.findMany({
            where: { lembagaId },
            orderBy: { date: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function addLembagaProgram(data: { lembagaId: string; title: string; description: string; date?: Date; status?: string; budget?: number }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.lembagaProgram.create({
            data
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteLembagaProgram(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        return await prisma.lembagaProgram.delete({
            where: { id }
        });
    } catch (error) {
        throw error;
    }
}

export async function getLembagaByName(name: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.lembaga.findFirst({
            where: {
                tenantId,
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            }
        });
    } catch (error) {
        return null;
    }
}


export async function updateLembaga(id: string, data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.lembaga.update({
            where: { id, tenantId },
            data
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteLembaga(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.lembaga.delete({
            where: { id, tenantId }
        });
    } catch (error) {
        throw error;
    }
}
