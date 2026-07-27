"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusSurat } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { buildWilayahFilterScope, buildReportFilterScope } from "./rt";

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
        const reportFilterScope = await buildReportFilterScope(role, userRt, userRw, tenantId);

        if (role === "RW") {
            if (rtFilter) {
                const rtClean = cleanDigits(rtFilter);
                const rtIn = [rtFilter, rtClean.padStart(3, '0'), rtClean];
                filterScope.rt = { in: rtIn };
                reportFilterScope.rt = { in: rtIn };
            }
        } else if (role === "KADUS") {
            if (rwFilter) {
                delete filterScope.OR;
                const rwClean = cleanDigits(rwFilter);
                const rwIn = [rwFilter, rwClean.padStart(3, '0'), rwClean];
                filterScope.rw = { in: rwIn };
                reportFilterScope.rw = { in: rwIn };
                
                if (rtFilter) {
                    const rtClean = cleanDigits(rtFilter);
                    const rtIn = [rtFilter, rtClean.padStart(3, '0'), rtClean];
                    filterScope.rt = { in: rtIn };
                    reportFilterScope.rt = { in: rtIn };
                }
            } else if (rtFilter) {
                const rtClean = cleanDigits(rtFilter);
                const rtIn = [rtFilter, rtClean.padStart(3, '0'), rtClean];
                if (filterScope.OR) {
                    filterScope.OR = filterScope.OR.map((cond: any) => {
                        return { ...cond, rt: { in: rtIn } };
                    });
                }
                reportFilterScope.rt = { in: rtIn };
            }
        }

        const [deaths, moves] = await Promise.all([
            prisma.rtDeathReport.findMany({ where: reportFilterScope, select: { nik: true } }),
            prisma.rtMoveReport.findMany({ where: reportFilterScope, select: { nik: true } })
        ]);
        const inactiveNiks = [...deaths.map(d => d.nik), ...moves.map(m => m.nik)];

        const whereCondition: any = {
            ...filterScope,
        };

        if (inactiveNiks.length > 0) {
            whereCondition.nik = { notIn: inactiveNiks };
        }

        if (query && query.trim()) {
            const cleanQ = query.trim();
            whereCondition.OR = [
                { namaLengkap: { contains: cleanQ, mode: 'insensitive' } },
                { nik: { contains: cleanQ } },
                { noKK: { contains: cleanQ } }
            ];
        }

        return await prisma.dataKependudukan.findMany({
            where: whereCondition,
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
                agama: true,
                statusKawin: true,
                hubunganKeluarga: true,
                pekerjaan: true,
                pendidikan: true,
                golonganDarah: true,
                kewarganegaraan: true,
                namaAyah: true,
                namaIbu: true,
                tenantId: true
            },
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
        if (!session?.user) throw new Error("Unauthorized: Harap login terlebih dahulu.");

        let tenantId = (session.user as any).tenantId;
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

        if (rt) rt = rt.toString().replace(/\D/g, '').padStart(3, '0');
        if (rw) rw = rw.toString().replace(/\D/g, '').padStart(3, '0');

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
        if (!dusun) dusun = "Dusun I";

        const {
            id: _id,
            createdAt: _c,
            updatedAt: _u,
            tenant: _t,
            user: _usr,
            surat: _s,
            bansosData: _b,
            puskesosPengaduans: _p1,
            puskesosRujukans: _p2,
            tenantId: _tid,
            ...cleanData
        } = data;

        let tanggalLahir = cleanData.tanggalLahir;
        if (tanggalLahir) {
            tanggalLahir = new Date(tanggalLahir);
            if (isNaN(tanggalLahir.getTime())) {
                tanggalLahir = new Date("1995-01-01");
            }
        } else {
            tanggalLahir = new Date("1995-01-01");
        }

        const nikStr = cleanData.nik ? String(cleanData.nik).trim() : "";
        if (!nikStr) {
            throw new Error("NIK wajib diisi!");
        }

        const existingNik = await prisma.dataKependudukan.findUnique({
            where: { nik: nikStr }
        });
        if (existingNik) {
            throw new Error(`NIK ${nikStr} sudah terdaftar atas nama ${existingNik.namaLengkap}.`);
        }

        const payload: any = {
            nik: nikStr,
            noKK: cleanData.noKK ? String(cleanData.noKK).trim() : (nikStr || "0000000000000000"),
            namaLengkap: cleanData.namaLengkap ? String(cleanData.namaLengkap).trim().toUpperCase() : "TANPA NAMA",
            tempatLahir: cleanData.tempatLahir ? String(cleanData.tempatLahir).trim() : "BOGOR",
            tanggalLahir: tanggalLahir,
            jenisKelamin: cleanData.jenisKelamin ? String(cleanData.jenisKelamin).trim() : "LAKI_LAKI",
            agama: cleanData.agama ? String(cleanData.agama).trim() : "ISLAM",
            statusKawin: cleanData.statusKawin ? String(cleanData.statusKawin).trim() : "BELUM_KAWIN",
            hubunganKeluarga: cleanData.hubunganKeluarga ? String(cleanData.hubunganKeluarga).trim() : "KEPALA_KELUARGA",
            kewarganegaraan: cleanData.kewarganegaraan ? String(cleanData.kewarganegaraan).trim() : "WNI",
            pendidikan: cleanData.pendidikan ? String(cleanData.pendidikan).trim() : "TAMAT_SD",
            pekerjaan: cleanData.pekerjaan ? String(cleanData.pekerjaan).trim() : "BELUM_TIDAK_BEKERJA",
            golonganDarah: cleanData.golonganDarah ? String(cleanData.golonganDarah).trim() : "TIDAK_TAHU",
            namaAyah: cleanData.namaAyah ? String(cleanData.namaAyah).trim() : "-",
            namaIbu: cleanData.namaIbu ? String(cleanData.namaIbu).trim() : "-",
            alamat: cleanData.alamat ? String(cleanData.alamat).trim() : "Desa Cimanggu I",
            kampung: cleanData.kampung ? String(cleanData.kampung).trim() : "Kp. Ciaruteun",
            rt: rt || "001",
            rw: rw || "001",
            dusun: dusun,
            tenantId: tenantId
        };

        const result = await prisma.dataKependudukan.create({
            data: payload
        });

        revalidatePath("/dashboard/warga");
        revalidatePath("/dashboard");
        revalidatePath("/master-admin/data");
        revalidatePath("/dashboard/kesra");
        revalidatePath("/dashboard/surat");
        return result;
    } catch (error: any) {
        console.error("Error in addWarga:", error);
        throw new Error(error.message || "Gagal menambahkan data warga");
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

        if (rt) rt = rt.toString().replace(/\D/g, '').padStart(3, '0');
        if (rw) rw = rw.toString().replace(/\D/g, '').padStart(3, '0');

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

        const {
            id: _id,
            createdAt: _c,
            updatedAt: _u,
            tenant: _t,
            user: _usr,
            surat: _s,
            bansosData: _b,
            puskesosPengaduans: _p1,
            puskesosRujukans: _p2,
            tenantId: _tid,
            ...cleanData
        } = data;

        let tanggalLahir = cleanData.tanggalLahir;
        if (tanggalLahir) {
            tanggalLahir = new Date(tanggalLahir);
            if (isNaN(tanggalLahir.getTime())) {
                delete cleanData.tanggalLahir;
            } else {
                cleanData.tanggalLahir = tanggalLahir;
            }
        }

        if (rt) cleanData.rt = rt;
        if (rw) cleanData.rw = rw;
        if (dusun) cleanData.dusun = dusun;

        const result = await prisma.dataKependudukan.update({
            where: { id },
            data: {
                ...cleanData,
                updatedAt: new Date()
            }
        });

        revalidatePath("/dashboard/warga");
        revalidatePath("/dashboard");
        revalidatePath("/master-admin/data");
        revalidatePath("/dashboard/kesra");
        revalidatePath("/dashboard/surat");
        return result;
    } catch (error: any) {
        console.error("Error in updateWarga:", error);
        throw new Error(error.message || "Gagal memperbarui data warga");
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

        const deleted = await prisma.dataKependudukan.delete({
            where: { id }
        });

        revalidatePath("/dashboard/warga");
        revalidatePath("/dashboard");
        revalidatePath("/master-admin/data");
        revalidatePath("/dashboard/kesra");
        revalidatePath("/dashboard/surat");
        return deleted;
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
