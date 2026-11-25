"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getWilayahVariants } from "@/lib/wilayahUtils";
import { buildWilayahFilterScope } from "./rt";
import { resolvePosyanduUnit } from "@/lib/posyandu";

async function getAuthorizedWilayahSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const role = String((session.user as any).role || "").toUpperCase();
    const tenantId = (session.user as any).tenantId;
    const userRt = String((session.user as any).rt || "");
    const userRw = String((session.user as any).rw || "");

    const allowedRoles = ["RT", "RW", "KADUS", "ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER", "KASI_KESEJAHTERAAN", "POSYANDU"];
    if (!allowedRoles.includes(role)) {
        throw new Error("Akses ditolak.");
    }

    const { filterScope, allowedRws } = await buildWilayahFilterScope(role, userRt, userRw, tenantId);
    return { session, role, tenantId, userRt, userRw, filterScope, allowedRws };
}

function buildWilayahMemberWhere(role: string, tenantId: string, userRt: string, userRw: string, allowedRws: string[]) {
    const where: any = { tenantId };
    if (role === "RT") {
        where.rt = { in: getWilayahVariants(userRt) };
        where.rw = { in: getWilayahVariants(userRw) };
    } else if (role === "RW") {
        where.rw = { in: getWilayahVariants(userRw) };
    } else if (role === "KADUS") {
        const validRws = allowedRws.length > 0 ? allowedRws : ["_NONE_"];
        where.rw = { in: validRws };
    }
    return where;
}

/**
 * Rekapitulasi Posyandu & Kesehatan Terpadu (Read-Only)
 * Otomatis menyesuaikan cakupan wilayah:
 * - RT: Hanya RT tersebut + Posyandu Mawar pembina RW-nya
 * - RW: Hanya RW tersebut + rincian per RT di bawahnya
 * - KADUS: Seluruh RW & RT di dalam Dusun binaannya + unit Posyandu Mawar masing-masing RW
 */
export async function getWilayahPosyanduRecap(filterRw?: string, filterRt?: string) {
    try {
        const { role, tenantId, userRt, userRw, filterScope, allowedRws } = await getAuthorizedWilayahSession();

        const memberWhere = buildWilayahMemberWhere(role, tenantId, userRt, userRw, allowedRws);
        const residentWhere: any = {
            ...filterScope,
            statusKependudukan: { notIn: ["MENINGGAL", "PINDAH", "PINDAH_KELUAR"] }
        };

        if ((role === "KADUS" || ["ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role)) && filterRw && filterRw !== "ALL") {
            const rwVars = getWilayahVariants(filterRw);
            memberWhere.rw = { in: rwVars };
            residentWhere.rw = { in: rwVars };
        }
        if (filterRt && filterRt !== "ALL" && role !== "RT") {
            const rtVars = getWilayahVariants(filterRt);
            memberWhere.rt = { in: rtVars };
            residentWhere.rt = { in: rtVars };
        }

        const [residents, balitaList, ibuHamilList, lansiaList] = await Promise.all([
            prisma.dataKependudukan.findMany({
                where: residentWhere,
                select: {
                    id: true,
                    rt: true,
                    rw: true,
                    tanggalLahir: true,
                    jenisKelamin: true,
                    noKK: true
                }
            }),
            prisma.posyanduBalita.findMany({
                where: memberWhere,
                include: {
                    records: {
                        orderBy: { tanggal: "desc" },
                        take: 1
                    }
                },
                orderBy: [{ rw: "asc" }, { rt: "asc" }, { namaLengkap: "asc" }]
            }),
            prisma.posyanduIbuHamil.findMany({
                where: memberWhere,
                include: {
                    records: {
                        orderBy: { tanggal: "desc" },
                        take: 1
                    }
                },
                orderBy: [{ rw: "asc" }, { rt: "asc" }, { namaLengkap: "asc" }]
            }),
            prisma.posyanduLansia.findMany({
                where: memberWhere,
                include: {
                    records: {
                        orderBy: { tanggal: "desc" },
                        take: 1
                    }
                },
                orderBy: [{ rw: "asc" }, { rt: "asc" }, { namaLengkap: "asc" }]
            })
        ]);

        const today = new Date();
        let sasaranBalita = 0;
        let sasaranLansia = 0;
        const uniqueKK = new Set<string>();

        const rtStatsMap: Record<string, {
            key: string;
            rt: string;
            rw: string;
            posyanduName: string;
            totalWarga: number;
            sasaranBalita: number;
            balitaPosyandu: number;
            balitaStunting: number;
            ibuHamil: number;
            ibuHamilRisti: number;
            sasaranLansia: number;
            lansiaPosyandu: number;
        }> = {};

        const rwStatsMap: Record<string, {
            rw: string;
            posyanduName: string;
            totalWarga: number;
            sasaranBalita: number;
            balitaPosyandu: number;
            balitaStunting: number;
            ibuHamil: number;
            ibuHamilRisti: number;
            sasaranLansia: number;
            lansiaPosyandu: number;
        }> = {};

        const ensureRt = (rawRw?: string | null, rawRt?: string | null) => {
            const cleanRw = String(rawRw || "000").replace(/\D/g, "").padStart(3, "0");
            const cleanRt = String(rawRt || "000").replace(/\D/g, "").padStart(3, "0");
            const key = `${cleanRw}-${cleanRt}`;
            const unit = resolvePosyanduUnit(cleanRw);

            if (!rtStatsMap[key]) {
                rtStatsMap[key] = {
                    key,
                    rt: cleanRt,
                    rw: cleanRw,
                    posyanduName: unit.name,
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
            if (!rwStatsMap[cleanRw]) {
                rwStatsMap[cleanRw] = {
                    rw: cleanRw,
                    posyanduName: unit.name,
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
            return { rtStat: rtStatsMap[key], rwStat: rwStatsMap[cleanRw] };
        };

        residents.forEach(r => {
            const { rtStat, rwStat } = ensureRt(r.rw, r.rt);
            rtStat.totalWarga++;
            rwStat.totalWarga++;
            if (r.noKK) uniqueKK.add(r.noKK);
            if (r.tanggalLahir) {
                const birth = new Date(r.tanggalLahir);
                const ageYears = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
                if (ageYears >= 0 && ageYears <= 5) {
                    sasaranBalita++;
                    rtStat.sasaranBalita++;
                    rwStat.sasaranBalita++;
                } else if (ageYears >= 60) {
                    sasaranLansia++;
                    rtStat.sasaranLansia++;
                    rwStat.sasaranLansia++;
                }
            }
        });

        let giziNormal = 0;
        let giziKurang = 0;
        let giziLebih = 0;
        let stuntingCount = 0;
        let balitaDitimbangCount = 0;

        const balitaDetails = balitaList.map(b => {
            const { rtStat, rwStat } = ensureRt(b.rw, b.rt);
            rtStat.balitaPosyandu++;
            rwStat.balitaPosyandu++;
            if (b.statusStunting) {
                stuntingCount++;
                rtStat.balitaStunting++;
                rwStat.balitaStunting++;
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
            const cleanRw = String(b.rw || "").replace(/\D/g, "").padStart(3, "0");
            const unit = resolvePosyanduUnit(cleanRw);

            return {
                id: b.id,
                nik: b.nik || "-",
                namaLengkap: b.namaLengkap,
                jenisKelamin: b.jenisKelamin,
                tanggalLahir: b.tanggalLahir,
                usiaBulan: diffMonths,
                namaOrangTua: b.namaOrangTua,
                rt: String(b.rt || "").replace(/\D/g, "").padStart(3, "0"),
                rw: cleanRw,
                posyanduName: b.posyanduName || unit.name,
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
            const { rtStat, rwStat } = ensureRt(ih.rw, ih.rt);
            rtStat.ibuHamil++;
            rwStat.ibuHamil++;
            if (ih.risikoTinggi) {
                ibuHamilRistiCount++;
                rtStat.ibuHamilRisti++;
                rwStat.ibuHamilRisti++;
            }
            const latestRec = ih.records?.[0] || null;
            const cleanRw = String(ih.rw || "").replace(/\D/g, "").padStart(3, "0");
            const unit = resolvePosyanduUnit(cleanRw);

            return {
                id: ih.id,
                nik: ih.nik || "-",
                namaLengkap: ih.namaLengkap,
                usiaKandungan: ih.usiaKandungan,
                beratBadanAwal: ih.beratBadan,
                risikoTinggi: ih.risikoTinggi,
                rt: String(ih.rt || "").replace(/\D/g, "").padStart(3, "0"),
                rw: cleanRw,
                posyanduName: ih.posyanduName || unit.name,
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
            const { rtStat, rwStat } = ensureRt(l.rw, l.rt);
            rtStat.lansiaPosyandu++;
            rwStat.lansiaPosyandu++;
            const latestRec = l.records?.[0] || null;
            let ageYears = l.usia || 60;
            if (l.tanggalLahir) {
                const birth = new Date(l.tanggalLahir);
                ageYears = Math.max(0, today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0));
            }
            const cleanRw = String(l.rw || "").replace(/\D/g, "").padStart(3, "0");
            const unit = resolvePosyanduUnit(cleanRw);

            return {
                id: l.id,
                nik: l.nik || "-",
                namaLengkap: l.namaLengkap,
                usiaTahun: ageYears,
                memilikiPenyakitBawaan: l.memilikiPenyakitBawaan,
                rt: String(l.rt || "").replace(/\D/g, "").padStart(3, "0"),
                rw: cleanRw,
                posyanduName: l.posyanduName || unit.name,
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

        const rtBreakdown = Object.values(rtStatsMap).sort((a, b) => a.key.localeCompare(b.key));
        const rwBreakdown = Object.values(rwStatsMap).sort((a, b) => a.rw.localeCompare(b.rw));

        const cleanUserRw = userRw.replace(/\D/g, "").padStart(3, "0");
        const cleanUserRt = userRt.replace(/\D/g, "").padStart(3, "0");
        const posyanduUnits = rwBreakdown.length > 0
            ? Array.from(new Set(rwBreakdown.map(r => r.posyanduName)))
            : [resolvePosyanduUnit(cleanUserRw).name];

        let scopeLabel = `Wilayah Desa`;
        if (role === "RT") scopeLabel = `RT ${cleanUserRt} / RW ${cleanUserRw}`;
        else if (role === "RW") scopeLabel = `RW ${cleanUserRw} (Seluruh RT Binaan)`;
        else if (role === "KADUS") scopeLabel = `${userRw} (${rwBreakdown.map(r => `RW ${r.rw}`).join(", ") || "Wilayah Dusun"})`;

        return {
            role,
            scopeLabel,
            posyanduUnits,
            rw: cleanUserRw,
            rt: cleanUserRt,
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
            rwBreakdown,
            rtBreakdown,
            balitaDetails,
            ibuHamilDetails,
            lansiaDetails
        };
    } catch (e) {
        console.error("getWilayahPosyanduRecap error:", e);
        return null;
    }
}

/**
 * Data Sosial Wilayah (Pengangguran & Anak Putus Sekolah / ATS) Terintegrasi & Tersinkron dengan Kasi Kesra
 * Cakupan otomatis sesuai role: RT -> RT tsb, RW -> RW & RT-nya, KADUS -> Dusun (RW & RT binaannya).
 */
export async function getWilayahSosialData(filterRw?: string, filterRt?: string) {
    try {
        const { role, tenantId, userRt, userRw, filterScope } = await getAuthorizedWilayahSession();

        const citizenWhere: any = {
            ...filterScope,
            statusKependudukan: { notIn: ["MENINGGAL", "PINDAH", "PINDAH_KELUAR"] }
        };

        if ((role === "KADUS" || ["ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role)) && filterRw && filterRw !== "ALL") {
            citizenWhere.rw = { in: getWilayahVariants(filterRw) };
        }
        if (filterRt && filterRt !== "ALL" && role !== "RT") {
            citizenWhere.rt = { in: getWilayahVariants(filterRt) };
        }

        const citizens = await prisma.dataKependudukan.findMany({
            where: citizenWhere,
            select: {
                nik: true,
                rt: true,
                rw: true,
                dusun: true,
                alamat: true
            }
        });

        const citizenByNik = new Map<string, { rt: string; rw: string; dusun: string; alamat: string }>();
        const nikList: string[] = [];
        const uniqueRws = new Set<string>();
        const uniqueRts = new Set<string>();

        citizens.forEach(c => {
            if (c.nik) {
                nikList.push(c.nik);
                const cleanRw = String(c.rw || "").replace(/\D/g, "").padStart(3, "0");
                const cleanRt = String(c.rt || "").replace(/\D/g, "").padStart(3, "0");
                citizenByNik.set(c.nik, { rt: cleanRt, rw: cleanRw, dusun: c.dusun, alamat: c.alamat });
                uniqueRws.add(cleanRw);
                uniqueRts.add(cleanRt);
            }
        });

        if (nikList.length === 0) {
            return {
                role,
                availableRws: [],
                availableRts: [],
                atsList: [],
                pengangguranList: [],
                summary: {
                    totalAts: 0,
                    atsMinatPaket: 0,
                    atsDisetujui: 0,
                    totalPengangguran: 0,
                    mencariKerja: 0,
                    pelatihan: 0,
                    sudahKerja: 0
                }
            };
        }

        const [atsRaw, pengangguranRaw] = await Promise.all([
            prisma.kesraAts.findMany({
                where: { tenantId, nik: { in: nikList } },
                orderBy: { createdAt: "desc" }
            }),
            prisma.kesraPengangguran.findMany({
                where: { tenantId, nik: { in: nikList } },
                orderBy: { createdAt: "desc" }
            })
        ]);

        const atsList = atsRaw.map(a => {
            const loc = citizenByNik.get(a.nik);
            return { ...a, rt: loc?.rt || "-", rw: loc?.rw || "-", dusun: loc?.dusun || "-" };
        });

        const pengangguranList = pengangguranRaw.map(p => {
            const loc = citizenByNik.get(p.nik);
            return { ...p, rt: loc?.rt || "-", rw: loc?.rw || "-", dusun: loc?.dusun || "-" };
        });

        return {
            role,
            availableRws: Array.from(uniqueRws).sort(),
            availableRts: Array.from(uniqueRts).sort(),
            atsList,
            pengangguranList,
            summary: {
                totalAts: atsList.length,
                atsMinatPaket: atsList.filter(a => a.minatKejarPaket).length,
                atsDisetujui: atsList.filter(a => a.statusBantuan === "DISETUJUI").length,
                totalPengangguran: pengangguranList.length,
                mencariKerja: pengangguranList.filter(p => p.status === "MENCARI_KERJA").length,
                pelatihan: pengangguranList.filter(p => p.status === "PELATIHAN").length,
                sudahKerja: pengangguranList.filter(p => p.status === "SUDAH_KERJA").length
            }
        };
    } catch (e) {
        console.error("getWilayahSosialData error:", e);
        return null;
    }
}

/**
 * Pencarian NIK Cerdas Terisolasi Wilayah (RT / RW / KADUS)
 * Hanya mengembalikan warga dalam wilayah kekuasaan petugas yang login.
 */
export async function lookupWargaByNikForWilayah(query: string) {
    const { filterScope } = await getAuthorizedWilayahSession();
    const cleanQ = (query || "").trim();
    if (!cleanQ) return [];

    const citizens = await prisma.dataKependudukan.findMany({
        where: {
            ...filterScope,
            statusKependudukan: { notIn: ["MENINGGAL", "PINDAH", "PINDAH_KELUAR"] },
            OR: [
                { nik: { contains: cleanQ } },
                { namaLengkap: { contains: cleanQ, mode: "insensitive" } }
            ]
        },
        select: {
            id: true,
            nik: true,
            namaLengkap: true,
            tanggalLahir: true,
            jenisKelamin: true,
            pendidikan: true,
            pekerjaan: true,
            rt: true,
            rw: true,
            dusun: true
        },
        take: 8,
        orderBy: { namaLengkap: "asc" }
    });

    const today = new Date();
    return citizens.map(c => {
        const birth = new Date(c.tanggalLahir);
        const ageYears = Math.max(
            0,
            today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
        );
        return {
            ...c,
            rt: String(c.rt || "").replace(/\D/g, "").padStart(3, "0"),
            rw: String(c.rw || "").replace(/\D/g, "").padStart(3, "0"),
            usia: ageYears
        };
    });
}

async function verifyCitizenInWilayah(nik: string) {
    const { tenantId, filterScope } = await getAuthorizedWilayahSession();
    const cleanNik = String(nik || "").trim();
    if (!cleanNik) throw new Error("NIK wajib diisi.");

    const citizen = await prisma.dataKependudukan.findFirst({
        where: {
            ...filterScope,
            nik: cleanNik
        }
    });

    if (!citizen) {
        throw new Error(`NIK ${cleanNik} tidak ditemukan dalam cakupan wilayah Anda.`);
    }

    return { tenantId, citizen };
}

export async function addWilayahAts(data: any) {
    try {
        const { tenantId, citizen } = await verifyCitizenInWilayah(data.nik);

        const existing = await prisma.kesraAts.findFirst({
            where: { nik: citizen.nik, tenantId }
        });
        if (existing) {
            return { success: false, error: `NIK ${citizen.nik} sudah tercatat pada data Anak Putus Sekolah.` };
        }

        const ats = await prisma.kesraAts.create({
            data: {
                nik: citizen.nik,
                nama: citizen.namaLengkap,
                usia: parseInt(data.usia) || 12,
                pendidikanTerakhir: data.pendidikanTerakhir,
                alasanPutusSekolah: data.alasanPutusSekolah,
                minatKejarPaket: data.minatKejarPaket === "true" || data.minatKejarPaket === true,
                statusBantuan: "PENDING",
                tenantId
            }
        });

        revalidatePath("/dashboard");
        return { success: true, ats };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal menyimpan data ATS." };
    }
}

export async function deleteWilayahAts(id: string) {
    const { tenantId, filterScope } = await getAuthorizedWilayahSession();
    const record = await prisma.kesraAts.findFirst({ where: { id, tenantId } });
    if (!record) return { success: false, error: "Data tidak ditemukan" };

    const citizen = await prisma.dataKependudukan.findFirst({
        where: { ...filterScope, nik: record.nik }
    });
    if (!citizen) return { success: false, error: "Anda tidak berhak menghapus data di luar wilayah Anda." };

    await prisma.kesraAts.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function addWilayahPengangguran(data: any) {
    try {
        const { tenantId, citizen } = await verifyCitizenInWilayah(data.nik);

        const existing = await prisma.kesraPengangguran.findFirst({
            where: { nik: citizen.nik, tenantId }
        });
        if (existing) {
            return { success: false, error: `NIK ${citizen.nik} sudah tercatat pada data Pengangguran.` };
        }

        const pengangguran = await prisma.kesraPengangguran.create({
            data: {
                nik: citizen.nik,
                nama: citizen.namaLengkap,
                usia: parseInt(data.usia) || 18,
                pendidikan: data.pendidikan || citizen.pendidikan || "-",
                keahlian: data.keahlian || "-",
                lamaMenganggur: parseInt(data.lamaMenganggur) || 0,
                minatPelatihan: data.minatPelatihan === "true" || data.minatPelatihan === true,
                status: data.status || "MENCARI_KERJA",
                tenantId
            }
        });

        revalidatePath("/dashboard");
        return { success: true, pengangguran };
    } catch (error: any) {
        return { success: false, error: error.message || "Gagal menyimpan data pengangguran." };
    }
}

export async function updateWilayahPengangguranStatus(id: string, status: string) {
    const { tenantId, filterScope } = await getAuthorizedWilayahSession();
    const record = await prisma.kesraPengangguran.findFirst({ where: { id, tenantId } });
    if (!record) return { success: false, error: "Data tidak ditemukan" };

    const citizen = await prisma.dataKependudukan.findFirst({
        where: { ...filterScope, nik: record.nik }
    });
    if (!citizen) return { success: false, error: "Akses ditolak." };

    await prisma.kesraPengangguran.update({
        where: { id },
        data: { status }
    });
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteWilayahPengangguran(id: string) {
    const { tenantId, filterScope } = await getAuthorizedWilayahSession();
    const record = await prisma.kesraPengangguran.findFirst({ where: { id, tenantId } });
    if (!record) return { success: false, error: "Data tidak ditemukan" };

    const citizen = await prisma.dataKependudukan.findFirst({
        where: { ...filterScope, nik: record.nik }
    });
    if (!citizen) return { success: false, error: "Akses ditolak." };

    await prisma.kesraPengangguran.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
}

