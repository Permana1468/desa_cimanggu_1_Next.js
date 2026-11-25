"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getWilayahVariants } from "@/lib/wilayahUtils";
import { resolvePosyanduUnit } from "@/lib/posyandu";

async function verifyRwAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rw = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (role !== "RW" && role !== "ADMIN_DESA" && role !== "ADMIN_MASTER" && role !== "KADES" && role !== "SEKDES") {
        throw new Error("Akses ditolak. Fitur ini hanya untuk pengurus RW.");
    }

    return { tenantId, rw, user: session.user };
}

// =======================
// SECURITY LOGS
// =======================

export async function getRwSecurityLogs(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwSecurityLog.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        orderBy: { date: "desc" }
    });
}

export async function addRwSecurityLog(data: { type: string, reporter: string, title: string, description: string, date: Date, rw?: string }) {
    const { tenantId, rw: userRw } = await verifyRwAccess();
    const targetRw = data.rw || userRw || "009";

    const log = await prisma.rwSecurityLog.create({
        data: {
            type: data.type,
            reporter: data.reporter,
            title: data.title,
            description: data.description,
            date: data.date,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, log };
}

export async function updateRwSecurityLogStatus(id: string, status: string) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwSecurityLog.updateMany({
        where: { id, tenantId },
        data: { status }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwSecurityLog(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwSecurityLog.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// PATROL SCHEDULES
// =======================

export async function getRwPatrolSchedules(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwPatrolSchedule.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        orderBy: { date: "desc" }
    });
}

export async function addRwPatrolSchedule(data: { rt: string, date: Date, personnel: string, notes?: string, rw?: string }) {
    const { tenantId, rw: userRw } = await verifyRwAccess();
    const targetRw = data.rw || userRw || "009";

    const schedule = await prisma.rwPatrolSchedule.create({
        data: {
            rt: data.rt,
            date: data.date,
            personnel: data.personnel,
            notes: data.notes,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, schedule };
}

export async function updateRwPatrolSchedule(id: string, data: { rt: string, date: Date, personnel: string, notes?: string }) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwPatrolSchedule.updateMany({
        where: { id, tenantId },
        data: {
            rt: data.rt,
            date: data.date,
            personnel: data.personnel,
            notes: data.notes
        }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwPatrolSchedule(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwPatrolSchedule.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// HEALTH DATA
// =======================

export async function getRwHealthData(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwHealthData.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        orderBy: [{ year: "desc" }, { month: "desc" }]
    });
}

export async function addRwHealthData(data: { 
    month: number, year: number, posyanduName?: string,
    balitaTotal: number, balitaStunting: number,
    ibuHamil: number, lansia: number, imunisasiPercentage: number, notes?: string,
    rw?: string
}) {
    // Health data can also be updated by POSYANDU role
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const userRw = (session.user as any).rw;
    const targetRw = data.rw || userRw || "009";
    const tenantId = (session.user as any).tenantId;

    if (role !== "RW" && role !== "POSYANDU" && role !== "ADMIN_DESA" && role !== "KADES" && role !== "SEKDES") {
        throw new Error("Akses ditolak. Fitur ini untuk pengurus RW atau Kader Posyandu.");
    }

    const { rw: _discard, ...restData } = data;
    const healthData = await prisma.rwHealthData.create({
        data: {
            ...restData,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, healthData };
}

export async function updateRwHealthData(id: string, data: {
    month: number, year: number, posyanduName?: string,
    balitaTotal: number, balitaStunting: number,
    ibuHamil: number, lansia: number, imunisasiPercentage: number, notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as any).tenantId;

    await prisma.rwHealthData.updateMany({
        where: { id, tenantId },
        data
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwHealthData(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as any).tenantId;
    
    await prisma.rwHealthData.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Real-time demographic calculation directly from DataKependudukan for this RW.
 * Provides the RW Chairman with actual live figures for Balita (0-5 y.o.), Lansia (60+ y.o.), and total population.
 */
export async function getRwHealthRealtimeSummary(rwParam?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as any).tenantId;
        const rw = rwParam || (session.user as any).rw;

        if (!tenantId || !rw) return null;

        const residents = await prisma.dataKependudukan.findMany({
            where: {
                tenantId,
                rw: { in: getWilayahVariants(rw) },
                statusKependudukan: { notIn: ["MENINGGAL", "PINDAH", "PINDAH_KELUAR"] }
            },
            select: {
                tanggalLahir: true,
                jenisKelamin: true,
                noKK: true
            }
        });

        const today = new Date();
        let totalBalita = 0;
        let totalLansia = 0;
        const uniqueKK = new Set<string>();

        residents.forEach(r => {
            if (r.noKK) uniqueKK.add(r.noKK);
            if (r.tanggalLahir) {
                const birth = new Date(r.tanggalLahir);
                const ageYears = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
                if (ageYears >= 0 && ageYears <= 5) {
                    totalBalita++;
                } else if (ageYears >= 60) {
                    totalLansia++;
                }
            }
        });

        return {
            totalWarga: residents.length,
            totalKK: uniqueKK.size,
            totalBalita,
            totalLansia
        };
    } catch {
        return null;
    }
}

/**
 * Rekapitulasi Posyandu & Kesehatan Terintegrasi Real-Time untuk Dashboard RW
 * Menarik langsung hasil inputan Kader Posyandu (Balita, Penimbangan, Ibu Hamil, Lansia) khusus cakupan wilayah RW & RT tersebut.
 */
export async function getRwPosyanduRecap(rwParam?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const tenantId = (session.user as any).tenantId;
        const userRole = String((session.user as any).role || "").toUpperCase();
        const rw = (userRole === "RW" ? (session.user as any).rw : rwParam) || (session.user as any).rw;

        if (!tenantId || !rw) return null;

        const rwVariants = getWilayahVariants(rw);
        const posyanduUnit = resolvePosyanduUnit(rw);

        const [residents, balitaList, ibuHamilList, lansiaList] = await Promise.all([
            prisma.dataKependudukan.findMany({
                where: {
                    tenantId,
                    rw: { in: rwVariants },
                    statusKependudukan: { notIn: ["MENINGGAL", "PINDAH", "PINDAH_KELUAR"] }
                },
                select: {
                    id: true,
                    rt: true,
                    tanggalLahir: true,
                    jenisKelamin: true,
                    noKK: true
                }
            }),
            prisma.posyanduBalita.findMany({
                where: {
                    tenantId,
                    rw: { in: rwVariants }
                },
                include: {
                    records: {
                        orderBy: { tanggal: "desc" },
                        take: 1
                    }
                },
                orderBy: [{ rt: "asc" }, { namaLengkap: "asc" }]
            }),
            prisma.posyanduIbuHamil.findMany({
                where: {
                    tenantId,
                    rw: { in: rwVariants }
                },
                include: {
                    records: {
                        orderBy: { tanggal: "desc" },
                        take: 1
                    }
                },
                orderBy: [{ rt: "asc" }, { namaLengkap: "asc" }]
            }),
            prisma.posyanduLansia.findMany({
                where: {
                    tenantId,
                    rw: { in: rwVariants }
                },
                include: {
                    records: {
                        orderBy: { tanggal: "desc" },
                        take: 1
                    }
                },
                orderBy: [{ rt: "asc" }, { namaLengkap: "asc" }]
            })
        ]);

        const today = new Date();
        let sasaranBalita = 0;
        let sasaranLansia = 0;
        const uniqueKK = new Set<string>();
        const rtStatsMap: Record<string, {
            rt: string;
            totalWarga: number;
            sasaranBalita: number;
            balitaPosyandu: number;
            balitaStunting: number;
            ibuHamil: number;
            ibuHamilRisti: number;
            sasaranLansia: number;
            lansiaPosyandu: number;
        }> = {};

        const ensureRt = (rawRt?: string | null) => {
            const clean = String(rawRt || "000").replace(/\D/g, "").padStart(3, "0");
            if (!rtStatsMap[clean]) {
                rtStatsMap[clean] = {
                    rt: clean,
                    totalWarga: 0,
                    sasaranBalita: 0,
                    balitaPosyandu: 0,
                    balitaStunting: 0,
                    ibuHamil: 0,
                    ibuHamilRisti: 0,
                    sasaranLansia: 0,
                    lansiaPosyandu: 0
                };
            }
            return rtStatsMap[clean];
        };

        residents.forEach(r => {
            const rtStat = ensureRt(r.rt);
            rtStat.totalWarga++;
            if (r.noKK) uniqueKK.add(r.noKK);
            if (r.tanggalLahir) {
                const birth = new Date(r.tanggalLahir);
                const ageYears = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
                if (ageYears >= 0 && ageYears <= 5) {
                    sasaranBalita++;
                    rtStat.sasaranBalita++;
                } else if (ageYears >= 60) {
                    sasaranLansia++;
                    rtStat.sasaranLansia++;
                }
            }
        });

        let giziNormal = 0;
        let giziKurang = 0;
        let giziLebih = 0;
        let stuntingCount = 0;
        let balitaDitimbangCount = 0;

        const balitaDetails = balitaList.map(b => {
            const rtStat = ensureRt(b.rt);
            rtStat.balitaPosyandu++;
            if (b.statusStunting) {
                stuntingCount++;
                rtStat.balitaStunting++;
            }

            const latestRec = b.records?.[0] || null;
            if (latestRec && (latestRec.beratBadan || latestRec.tinggiBadan)) {
                balitaDitimbangCount++;
            }
            const statusGizi = latestRec?.statusGizi || (b.statusStunting ? "Stunting" : "Normal");
            if (statusGizi === "Normal") giziNormal++;
            else if (statusGizi === "Gizi Kurang" || statusGizi === "Stunting" || b.statusStunting) giziKurang++;
            else if (statusGizi === "Gizi Lebih") giziLebih++;

            const birth = new Date(b.tanggalLahir);
            const diffMonths = Math.max(0, (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth()));

            return {
                id: b.id,
                nik: b.nik || "-",
                namaLengkap: b.namaLengkap,
                jenisKelamin: b.jenisKelamin,
                tanggalLahir: b.tanggalLahir,
                usiaBulan: diffMonths,
                namaOrangTua: b.namaOrangTua,
                rt: String(b.rt || "").padStart(3, "0"),
                rw: String(b.rw || "").padStart(3, "0"),
                posyanduName: b.posyanduName || posyanduUnit.name,
                statusStunting: b.statusStunting,
                latestRecord: latestRec ? {
                    tanggal: latestRec.tanggal,
                    beratBadan: latestRec.beratBadan,
                    tinggiBadan: latestRec.tinggiBadan,
                    lingkarKepala: latestRec.lingkarKepala,
                    statusGizi: latestRec.statusGizi,
                    imunisasi: latestRec.imunisasi,
                    keterangan: latestRec.keterangan
                } : null
            };
        });

        let ibuHamilRistiCount = 0;
        const ibuHamilDetails = ibuHamilList.map(ih => {
            const rtStat = ensureRt(ih.rt);
            rtStat.ibuHamil++;
            if (ih.risikoTinggi) {
                ibuHamilRistiCount++;
                rtStat.ibuHamilRisti++;
            }
            const latestRec = ih.records?.[0] || null;
            return {
                id: ih.id,
                nik: ih.nik || "-",
                namaLengkap: ih.namaLengkap,
                usiaKandungan: ih.usiaKandungan,
                beratBadanAwal: ih.beratBadan,
                risikoTinggi: ih.risikoTinggi,
                rt: String(ih.rt || "").padStart(3, "0"),
                rw: String(ih.rw || "").padStart(3, "0"),
                posyanduName: ih.posyanduName || posyanduUnit.name,
                latestRecord: latestRec ? {
                    tanggal: latestRec.tanggal,
                    beratBadan: latestRec.beratBadan ?? ih.beratBadan,
                    tensiDarah: latestRec.tensi,
                    statusRisiko: latestRec.statusRisiko,
                    keterangan: latestRec.keterangan
                } : null
            };
        });

        const lansiaDetails = lansiaList.map(l => {
            const rtStat = ensureRt(l.rt);
            rtStat.lansiaPosyandu++;
            const latestRec = l.records?.[0] || null;
            let ageYears = l.usia || 60;
            if (l.tanggalLahir) {
                const birth = new Date(l.tanggalLahir);
                ageYears = Math.max(0, today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0));
            }
            return {
                id: l.id,
                nik: l.nik || "-",
                namaLengkap: l.namaLengkap,
                usiaTahun: ageYears,
                memilikiPenyakitBawaan: l.memilikiPenyakitBawaan,
                rt: String(l.rt || "").padStart(3, "0"),
                rw: String(l.rw || "").padStart(3, "0"),
                posyanduName: l.posyanduName || posyanduUnit.name,
                latestRecord: latestRec ? {
                    tanggal: latestRec.tanggal,
                    beratBadan: latestRec.beratBadan,
                    tensiDarah: latestRec.tensi,
                    gulaDarah: latestRec.gulaDarah,
                    kondisiUmum: latestRec.kondisiUmum,
                    keterangan: latestRec.keterangan
                } : null
            };
        });

        const rtBreakdown = Object.values(rtStatsMap).sort((a, b) => a.rt.localeCompare(b.rt));

        return {
            rw: String(rw).replace(/\D/g, "").padStart(3, "0"),
            posyanduUnit,
            summary: {
                totalWarga: residents.length,
                totalKK: uniqueKK.size,
                sasaranBalita,
                balitaTerdaftarPosyandu: balitaList.length,
                balitaDitimbang: balitaDitimbangCount,
                balitaStunting: stuntingCount,
                giziNormal,
                giziKurang,
                giziLebih,
                ibuHamilTerdaftar: ibuHamilList.length,
                ibuHamilRisti: ibuHamilRistiCount,
                sasaranLansia,
                lansiaTerdaftarPosyandu: lansiaList.length
            },
            rtBreakdown,
            balitaDetails,
            ibuHamilDetails,
            lansiaDetails
        };
    } catch (e) {
        console.error("getRwPosyanduRecap error:", e);
        return null;
    }
}

// =======================
// INSTITUTIONS & MEMBERS
// =======================

export async function getRwInstitutions(rwParam?: string) {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    const rw = rwParam || (session?.user as any)?.rw;

    if (!tenantId || !rw) return [];

    return await prisma.rwInstitution.findMany({
        where: { tenantId, rw: { in: getWilayahVariants(rw) } },
        include: { 
            members: {
                orderBy: { position: "asc" }
            } 
        },
        orderBy: { name: "asc" }
    });
}

export async function addRwInstitution(data: { name: string, description?: string, rw?: string }) {
    const { tenantId, rw: userRw } = await verifyRwAccess();
    const targetRw = data.rw || userRw || "009";

    const institution = await prisma.rwInstitution.create({
        data: {
            name: data.name,
            description: data.description,
            rw: targetRw,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, institution };
}

export async function updateRwInstitution(id: string, data: { name: string, description?: string }) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwInstitution.updateMany({
        where: { id, tenantId },
        data: {
            name: data.name,
            description: data.description
        }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteRwInstitution(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    // Explicitly delete members first to ensure no constraint violations
    await prisma.rwInstitutionMember.deleteMany({
        where: { rwInstitutionId: id, tenantId }
    });
    
    await prisma.rwInstitution.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function addRwInstitutionMember(institutionId: string, data: { name: string, position: string, phoneNumber?: string }) {
    const { tenantId } = await verifyRwAccess();

    const member = await prisma.rwInstitutionMember.create({
        data: {
            ...data,
            rwInstitutionId: institutionId,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, member };
}

export async function updateRwInstitutionMember(id: string, data: { name: string, position: string, phoneNumber?: string }) {
    const { tenantId } = await verifyRwAccess();

    await prisma.rwInstitutionMember.updateMany({
        where: { id, tenantId },
        data: {
            name: data.name,
            position: data.position,
            phoneNumber: data.phoneNumber
        }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function removeRwInstitutionMember(id: string) {
    const { tenantId } = await verifyRwAccess();
    
    await prisma.rwInstitutionMember.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}
