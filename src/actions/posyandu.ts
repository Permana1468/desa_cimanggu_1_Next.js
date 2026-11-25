"use server";
// Triggering Next.js Turbopack HMR cache clearing

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getRWsForPosyandu, getPosyanduUnit, detectUserPosyanduUnit, normalizeRwList, resolvePosyanduUnit, POSYANDU_UNITS } from "@/lib/posyandu";
import { executePythonStuntingEngine, BalitaAnalysisInput, BalitaAnalysisResult } from "@/lib/pythonBridge";
import { runBalitaDemografiEngine, invalidateBalitaDemografiCache } from "@/lib/balitaDemografiBridge";

async function verifyPosyanduAccess(posyanduFilter?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rwString = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    const isAllowedRole = ["POSYANDU", "RW", "RT", "KADUS", "ADMIN_DESA", "KADES", "SEKDES", "KASI_KESEJAHTERAAN", "KASI_PELAYANAN", "TP_PKK", "ADMIN_MASTER", "SYSTEM_ADMIN", "KASI", "KAUR"].includes(role) || role?.startsWith("KASI");

    if (!isAllowedRole) {
        throw new Error(`Akses ditolak. Fitur ini khusus untuk Posyandu dan Administrator. Role Anda: ${role}`);
    }

    let rws: string[] = [];

    // If logged in as POSYANDU role, strictly force their dedicated unit's RW scope
    if (role === "POSYANDU") {
        const userUnit = detectUserPosyanduUnit(session.user);
        if (userUnit) {
            rws = userUnit.rws;
        } else if (rwString && rwString.trim() !== "") {
            rws = rwString.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
    } else {
        // For admin / Kasi Kesra / external roles
        if (posyanduFilter && posyanduFilter !== "ALL") {
            rws = getRWsForPosyandu(posyanduFilter);
        } else if (rwString && rwString.trim() !== "") {
            rws = rwString.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
    }

    const normalizedRws = normalizeRwList(rws);
    return { tenantId, rws, normalizedRws, user: session.user, role };
}

// =======================
// INTEGRASI DATA KEPENDUDUKAN
// =======================

export async function searchWargaForPosyandu(query: string, posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    if (!query || query.trim().length === 0) return [];

    const cleanQuery = query.trim();
    const whereCondition: any = {
        tenantId,
        OR: [
            { namaLengkap: { contains: cleanQuery, mode: 'insensitive' } },
            { nik: { contains: cleanQuery } }
        ]
    };

    // Filter by RW if scoped to a specific posyandu
    if (normalizedRws.length > 0) {
        whereCondition.rw = { in: normalizedRws };
    }

    return await prisma.dataKependudukan.findMany({
        where: whereCondition,
        take: 20,
        orderBy: { namaLengkap: 'asc' }
    });
}

// =======================
// POSYANDU BALITA
// =======================

export async function getPosyanduBalita(posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (normalizedRws.length > 0) {
        whereClause.rw = { in: normalizedRws };
    }

    return await prisma.posyanduBalita.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" },
        take: 500
    });
}

export async function addPosyanduBalita(data: any) {
    const { tenantId, user } = await verifyPosyanduAccess(data.posyanduFilter);
    const userUnit = detectUserPosyanduUnit(user);
    const unitObj = getPosyanduUnit(data.posyanduFilter) || userUnit;
    const resolvedPosyanduName = data.posyanduName || unitObj?.name || "Posyandu";

    const balita = await prisma.posyanduBalita.create({
        data: {
            nik: data.nik || null,
            namaLengkap: data.namaLengkap,
            tanggalLahir: new Date(data.tanggalLahir),
            jenisKelamin: data.jenisKelamin,
            namaOrangTua: data.namaOrangTua,
            rt: data.rt,
            rw: data.rw,
            posyanduName: resolvedPosyanduName,
            statusStunting: Boolean(data.statusStunting),
            tenantId
        }
    });

    // Auto-create initial record for Layanan Balita tab
    await prisma.posyanduRecord.create({
        data: {
            balitaId: balita.id,
            tanggal: new Date(),
            statusGizi: balita.statusStunting ? "Stunting" : "Normal",
            keterangan: "Pendaftaran Awal Posyandu Balita",
            tenantId
        }
    });

    invalidateBalitaDemografiCache();
    revalidatePath("/dashboard");
    return { success: true, balita };
}

/**
 * Sinkronisasi Rekapitulasi Balita (<= 5 Tahun) Data Kependudukan dengan Posyandu Mawar I - VII
 * Dihitung presisi menggunakan Python Demografi Engine dengan validasi kelompok usia & wilayah RW.
 */
export async function getPosyanduBalitaKependudukanSync(posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    // Filter balita maksimal 5 tahun (lahir dalam kurun 65 bulan terakhir)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setMonth(fiveYearsAgo.getMonth() - 65);

    const wargaCondition: any = {
        tenantId,
        tanggalLahir: { gte: fiveYearsAgo },
        statusKependudukan: { notIn: ["MENINGGAL", "PINDAH_KELUAR"] }
    };

    const posyanduCondition: any = { tenantId };

    if (normalizedRws.length > 0) {
        wargaCondition.rw = { in: normalizedRws };
        posyanduCondition.rw = { in: normalizedRws };
    }

    const [citizens, posyanduBalita] = await Promise.all([
        prisma.dataKependudukan.findMany({
            where: wargaCondition,
            select: {
                id: true,
                nik: true,
                noKK: true,
                namaLengkap: true,
                tempatLahir: true,
                tanggalLahir: true,
                jenisKelamin: true,
                namaIbu: true,
                namaAyah: true,
                rt: true,
                rw: true,
                dusun: true,
                alamat: true,
                statusKependudukan: true
            },
            orderBy: { tanggalLahir: "desc" }
        }),
        prisma.posyanduBalita.findMany({
            where: posyanduCondition,
            select: {
                id: true,
                nik: true,
                namaLengkap: true,
                tanggalLahir: true,
                jenisKelamin: true,
                namaOrangTua: true,
                rt: true,
                rw: true,
                statusStunting: true,
                posyanduName: true
            }
        })
    ]);

    const result = await runBalitaDemografiEngine({
        citizens,
        posyanduBalita,
        filterPosyandu: posyanduFilter || "ALL",
        referenceDate: new Date().toISOString().split("T")[0]
    });

    return result;
}

/**
 * Real-time Instant NIK Lookup saat Kader mengetik NIK Balita.
 * Otomatis mendeteksi data kependudukan resmi dan penetapan Posyandu Mawar.
 */
export async function lookupNikForBalita(nik: string, posyanduFilter?: string) {
    const cleanNik = String(nik || "").trim();
    if (!cleanNik || cleanNik.length < 10) {
        return { found: false, nik: cleanNik, message: "NIK minimal 10 digit angka" };
    }

    const { tenantId } = await verifyPosyanduAccess(posyanduFilter);

    const warga = await prisma.dataKependudukan.findFirst({
        where: {
            tenantId,
            nik: cleanNik
        }
    });

    if (!warga) {
        return {
            found: false,
            nik: cleanNik,
            message: "NIK belum terdaftar di Data Kependudukan Desa."
        };
    }

    // Periksa apakah balita sudah terdaftar di PosyanduBalita
    const existingBalita = await prisma.posyanduBalita.findFirst({
        where: {
            tenantId,
            OR: [
                { nik: cleanNik },
                { namaLengkap: { equals: warga.namaLengkap, mode: "insensitive" }, rt: warga.rt, rw: warga.rw }
            ]
        }
    });

    // Hitung usia dalam bulan
    const dob = new Date(warga.tanggalLahir);
    const now = new Date();
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

    // Alokasikan ke Posyandu Mawar sesuai cakupan RW
    const unit = resolvePosyanduUnit(warga.rw);

    return {
        found: true,
        warga: {
            id: warga.id,
            nik: warga.nik,
            noKK: warga.noKK,
            namaLengkap: warga.namaLengkap,
            tempatLahir: warga.tempatLahir,
            tanggalLahir: warga.tanggalLahir.toISOString().split("T")[0],
            jenisKelamin: warga.jenisKelamin === "LAKI_LAKI" || warga.jenisKelamin === "L" ? "L" : "P",
            namaOrangTua: warga.namaIbu || warga.namaAyah || "-",
            rt: warga.rt,
            rw: warga.rw,
            dusun: warga.dusun,
            alamat: warga.alamat,
            ageMonths,
            isBalita: ageMonths <= 60,
            posyanduName: unit.name,
            posyanduId: unit.id,
            posyanduUnitCode: unit.unitCode,
            alreadyInPosyandu: !!existingBalita,
            existingBalitaId: existingBalita?.id || null
        }
    };
}

/**
 * Pendaftaran Terpadu Balita yang Belum Masuk KK / Belum Terdata Kependudukan:
 * Menulis data kependudukan resmi (DataKependudukan) dengan No KK & NIK Wajib,
 * sekaligus mendaftarkan anak ke PosyanduBalita dan membuka PosyanduRecord.
 */
export async function registerBalitaWithNewWarga(payload: {
    nik: string;
    noKK: string;
    namaLengkap: string;
    tempatLahir?: string;
    tanggalLahir: string;
    jenisKelamin: string;
    namaIbu?: string;
    namaAyah?: string;
    rt: string;
    rw: string;
    alamat?: string;
    posyanduName?: string;
    posyanduFilter?: string;
    statusStunting?: boolean;
}) {
    const { tenantId, user } = await verifyPosyanduAccess(payload.posyanduFilter);

    const cleanNik = String(payload.nik || "").trim();
    const cleanNoKk = String(payload.noKK || "").trim();

    if (!cleanNik) {
        throw new Error("NIK Balita wajib diisi!");
    }
    if (!cleanNoKk) {
        throw new Error("No. Kartu Keluarga (KK) wajib diisi untuk melacak keberadaan fisik warga balita!");
    }
    if (!payload.namaLengkap || !payload.namaLengkap.trim()) {
        throw new Error("Nama Lengkap Balita wajib diisi!");
    }
    if (!payload.tanggalLahir) {
        throw new Error("Tanggal Lahir Balita wajib diisi!");
    }

    const cleanRt = String(payload.rt || "001").replace(/\D/g, "").padStart(3, "0");
    const cleanRw = String(payload.rw || "001").replace(/\D/g, "").padStart(3, "0");

    // Resolve Dusun
    const structureConfig = await prisma.systemSetting.findUnique({
        where: { id: "village_structure" }
    });
    const structure = (structureConfig?.settings as any) || { dusun: [] };
    let dusun = "Dusun I";
    if (structure && Array.isArray(structure.dusun)) {
        for (const d of structure.dusun) {
            if (Array.isArray(d.rwList) && d.rwList.includes(cleanRw)) {
                dusun = d.name;
                break;
            }
        }
    }

    // Resolve Posyandu Unit
    const unitObj = resolvePosyanduUnit(cleanRw);
    const finalPosyanduName = payload.posyanduName || unitObj.name;

    // 1. Simpan atau pastikan warga terdaftar di DataKependudukan
    let citizen = await prisma.dataKependudukan.findFirst({
        where: { tenantId, nik: cleanNik }
    });

    if (!citizen) {
        citizen = await prisma.dataKependudukan.create({
            data: {
                tenantId,
                nik: cleanNik,
                noKK: cleanNoKk,
                namaLengkap: payload.namaLengkap.trim().toUpperCase(),
                tempatLahir: payload.tempatLahir ? payload.tempatLahir.trim() : "BOGOR",
                tanggalLahir: new Date(payload.tanggalLahir),
                jenisKelamin: payload.jenisKelamin === "P" ? "PEREMPUAN" : "LAKI_LAKI",
                agama: "ISLAM",
                statusKawin: "BELUM_KAWIN",
                hubunganKeluarga: "ANAK",
                pendidikan: "BELUM_SEKOLAH",
                pekerjaan: "BELUM_TIDAK_BEKERJA",
                namaAyah: payload.namaAyah ? payload.namaAyah.trim() : "-",
                namaIbu: payload.namaIbu ? payload.namaIbu.trim() : "-",
                alamat: payload.alamat ? payload.alamat.trim() : `Desa Cimanggu I RT ${cleanRt} / RW ${cleanRw}`,
                rt: cleanRt,
                rw: cleanRw,
                dusun,
                statusKependudukan: "AKTIF",
                keteranganStatus: "TERCATAT_POSYANDU_VALIDASI_KK"
            }
        });
    }

    // 2. Simpan atau perbarui di PosyanduBalita
    let balita = await prisma.posyanduBalita.findFirst({
        where: { tenantId, nik: cleanNik }
    });

    const namaOrtu = payload.namaIbu || payload.namaAyah || citizen.namaIbu || citizen.namaAyah || "-";

    if (!balita) {
        balita = await prisma.posyanduBalita.create({
            data: {
                tenantId,
                nik: cleanNik,
                namaLengkap: payload.namaLengkap.trim().toUpperCase(),
                tanggalLahir: new Date(payload.tanggalLahir),
                jenisKelamin: payload.jenisKelamin === "P" ? "P" : "L",
                namaOrangTua: namaOrtu,
                rt: cleanRt,
                rw: cleanRw,
                posyanduName: finalPosyanduName,
                statusStunting: Boolean(payload.statusStunting)
            }
        });

        // 3. Catat rekam awal di PosyanduRecord
        await prisma.posyanduRecord.create({
            data: {
                tenantId,
                balitaId: balita.id,
                tanggal: new Date(),
                statusGizi: balita.statusStunting ? "Stunting" : "Normal",
                keterangan: "Pendaftaran Balita Terpadu (Sinkronisasi Data Kependudukan)",
            }
        });
    }

    invalidateBalitaDemografiCache();
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/warga");
    revalidatePath("/master-admin/data");
    revalidatePath("/dashboard/kesra");

    return {
        success: true,
        message: "Berhasil mendaftarkan balita dan menyinkronkan data kependudukan.",
        citizen,
        balita
    };
}

/**
 * Sinkronisasi Satu-Klik (Bulk / Individual) dari Data Kependudukan ke Register Posyandu
 */
export async function syncBalitaFromKependudukan(wargaIds: string[], targetPosyanduFilter?: string) {
    const { tenantId } = await verifyPosyanduAccess(targetPosyanduFilter);

    if (!Array.isArray(wargaIds) || wargaIds.length === 0) {
        throw new Error("Tidak ada warga yang dipilih untuk disinkronkan.");
    }

    const citizens = await prisma.dataKependudukan.findMany({
        where: {
            tenantId,
            id: { in: wargaIds }
        }
    });

    let syncedCount = 0;

    for (const c of citizens) {
        const cleanNik = String(c.nik || "").trim();
        const existing = await prisma.posyanduBalita.findFirst({
            where: {
                tenantId,
                OR: [
                    { nik: cleanNik },
                    { namaLengkap: { equals: c.namaLengkap, mode: "insensitive" }, rt: c.rt, rw: c.rw }
                ]
            }
        });

        if (!existing) {
            const unit = resolvePosyanduUnit(c.rw);
            const namaOrtu = c.namaIbu || c.namaAyah || "-";
            const jk = c.jenisKelamin === "PEREMPUAN" || c.jenisKelamin === "P" ? "P" : "L";

            const newBalita = await prisma.posyanduBalita.create({
                data: {
                    tenantId,
                    nik: cleanNik || null,
                    namaLengkap: c.namaLengkap,
                    tanggalLahir: c.tanggalLahir,
                    jenisKelamin: jk,
                    namaOrangTua: namaOrtu,
                    rt: c.rt,
                    rw: c.rw,
                    posyanduName: unit.name,
                    statusStunting: false
                }
            });

            await prisma.posyanduRecord.create({
                data: {
                    tenantId,
                    balitaId: newBalita.id,
                    tanggal: new Date(),
                    statusGizi: "Normal",
                    keterangan: "Auto-Sinkronisasi dari Data Kependudukan Resmi Desa",
                }
            });

            syncedCount++;
        }
    }

    invalidateBalitaDemografiCache();
    revalidatePath("/dashboard");
    return { success: true, count: syncedCount };
}

export async function updatePosyanduBalitaStatus(id: string, statusStunting: boolean) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduBalita.updateMany({
        where: { id, tenantId },
        data: { statusStunting }
    });

    invalidateBalitaDemografiCache();
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduBalita(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduBalita.deleteMany({
        where: { id, tenantId }
    });

    invalidateBalitaDemografiCache();
    revalidatePath("/dashboard");
    return { success: true };
}

export async function getBalitaDetail(balitaId: string) {
    const { tenantId } = await verifyPosyanduAccess();

    const balita = await prisma.posyanduBalita.findFirst({
        where: { id: balitaId, tenantId },
        include: {
            records: {
                orderBy: { tanggal: 'desc' },
                take: 36
            }
        }
    });

    if (!balita) throw new Error("Data Balita tidak ditemukan");

    let citizenData: any = null;
    if (balita.nik) {
        citizenData = await prisma.dataKependudukan.findFirst({
            where: { nik: balita.nik, tenantId },
            select: {
                nik: true,
                namaLengkap: true,
                namaIbu: true,
                namaAyah: true,
                alamat: true,
                rt: true,
                rw: true,
                dusun: true,
                noKK: true,
                tanggalLahir: true,
                jenisKelamin: true
            }
        });
    }

    // Hitung analisis antropometri AI Python (WHO Z-score, Laju Pertumbuhan & Proyeksi 60 hari)
    const validRecords = (balita.records || []).filter(r => (r.beratBadan && r.beratBadan > 0) || (r.tinggiBadan && r.tinggiBadan > 0));
    const latestRec = validRecords[0] || balita.records[0] || null;

    let aiAnalysis: BalitaAnalysisResult | null = null;
    try {
        aiAnalysis = await executePythonStuntingEngine({
            namaLengkap: balita.namaLengkap,
            tanggalLahir: balita.tanggalLahir.toISOString(),
            jenisKelamin: balita.jenisKelamin || citizenData?.jenisKelamin || "L",
            beratBadan: latestRec?.beratBadan || 0,
            tinggiBadan: latestRec?.tinggiBadan || 0,
            lingkarKepala: latestRec?.lingkarKepala || undefined,
            historyRecords: (balita.records || []).map(r => ({
                tanggal: r.tanggal.toISOString(),
                beratBadan: r.beratBadan || undefined,
                tinggiBadan: r.tinggiBadan || undefined,
            }))
        });
    } catch (e) {
        console.warn("AI Stunting Engine execution fallback:", e);
    }

    return {
        ...balita,
        citizenData,
        aiAnalysis
    };
}

export async function analyzeBalitaGrowthAI(input: BalitaAnalysisInput): Promise<BalitaAnalysisResult> {
    await verifyPosyanduAccess();
    return await executePythonStuntingEngine(input);
}

// =======================
// POSYANDU IBU HAMIL
// =======================

export async function getPosyanduIbuHamil(posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (normalizedRws.length > 0) {
        whereClause.rw = { in: normalizedRws };
    }

    return await prisma.posyanduIbuHamil.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" },
        take: 500
    });
}

export async function addPosyanduIbuHamil(data: any) {
    const { tenantId, user } = await verifyPosyanduAccess(data.posyanduFilter);
    const userUnit = detectUserPosyanduUnit(user);
    const unitObj = getPosyanduUnit(data.posyanduFilter) || userUnit;
    const resolvedPosyanduName = data.posyanduName || unitObj?.name || "Posyandu";

    const ibuHamil = await prisma.posyanduIbuHamil.create({
        data: {
            nik: data.nik || null,
            namaLengkap: data.namaLengkap,
            usiaKandungan: parseInt(data.usiaKandungan),
            beratBadan: data.beratBadan ? parseFloat(data.beratBadan) : null,
            noHp: data.noHp || null,
            rt: data.rt,
            rw: data.rw,
            risikoTinggi: Boolean(data.risikoTinggi),
            posyanduName: resolvedPosyanduName,
            tenantId
        }
    });

    // Auto-create initial record for Layanan Ibu Hamil tab
    await prisma.posyanduRecord.create({
        data: {
            ibuHamilId: ibuHamil.id,
            tanggal: new Date(),
            beratBadan: ibuHamil.beratBadan,
            statusRisiko: ibuHamil.risikoTinggi ? "Risiko Tinggi" : "Normal",
            keterangan: "Pendaftaran Awal Ibu Hamil",
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, ibuHamil };
}

export async function updatePosyanduIbuHamilStatus(id: string, risikoTinggi: boolean) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduIbuHamil.updateMany({
        where: { id, tenantId },
        data: { risikoTinggi }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduIbuHamil(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduIbuHamil.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getIbuHamilDetail(ibuHamilId: string) {
    const { tenantId } = await verifyPosyanduAccess();

    const ibuHamil = await prisma.posyanduIbuHamil.findFirst({
        where: { id: ibuHamilId, tenantId },
        include: {
            records: {
                orderBy: { tanggal: 'desc' },
                take: 36
            }
        }
    });

    if (!ibuHamil) throw new Error("Data Ibu Hamil tidak ditemukan");

    let citizenData: any = null;
    if (ibuHamil.nik) {
        citizenData = await prisma.dataKependudukan.findFirst({
            where: { nik: ibuHamil.nik, tenantId },
            select: {
                nik: true,
                namaLengkap: true,
                namaAyah: true,
                namaIbu: true,
                alamat: true,
                rt: true,
                rw: true,
                dusun: true,
                noKK: true,
                tanggalLahir: true
            }
        });
    }

    return {
        ...ibuHamil,
        citizenData
    };
}

// =======================
// POSYANDU LANSIA
// =======================

export async function getPosyanduLansia(posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (normalizedRws.length > 0) {
        whereClause.rw = { in: normalizedRws };
    }

    return await prisma.posyanduLansia.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" },
        take: 500
    });
}

export async function addPosyanduLansia(data: any) {
    const { tenantId, user } = await verifyPosyanduAccess(data.posyanduFilter);
    const userUnit = detectUserPosyanduUnit(user);
    const unitObj = getPosyanduUnit(data.posyanduFilter) || userUnit;
    const resolvedPosyanduName = data.posyanduName || unitObj?.name || "Posyandu";

    const lansia = await prisma.posyanduLansia.create({
        data: {
            nik: data.nik || null,
            namaLengkap: data.namaLengkap,
            jenisKelamin: data.jenisKelamin || null,
            tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
            usia: parseInt(data.usia) || 60,
            rt: data.rt,
            rw: data.rw,
            memilikiPenyakitBawaan: Boolean(data.memilikiPenyakitBawaan),
            posyanduName: resolvedPosyanduName,
            tenantId
        }
    });

    // Auto-create initial record for Layanan Lansia tab
    await prisma.posyanduRecord.create({
        data: {
            lansiaId: lansia.id,
            tanggal: new Date(),
            kondisiUmum: lansia.memilikiPenyakitBawaan ? "Perlu Rujukan" : "Baik",
            keterangan: "Pendaftaran Awal Posyandu Lansia",
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, lansia };
}

export async function deletePosyanduLansia(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduLansia.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getLansiaDetail(lansiaId: string) {
    const { tenantId } = await verifyPosyanduAccess();

    const lansia = await prisma.posyanduLansia.findFirst({
        where: { id: lansiaId, tenantId },
        include: {
            records: {
                orderBy: { tanggal: 'desc' },
                take: 36
            }
        }
    });

    if (!lansia) throw new Error("Data Lansia tidak ditemukan");

    let citizenData: any = null;
    if (lansia.nik) {
        citizenData = await prisma.dataKependudukan.findFirst({
            where: { nik: lansia.nik, tenantId },
            select: {
                nik: true,
                namaLengkap: true,
                namaAyah: true,
                namaIbu: true,
                alamat: true,
                rt: true,
                rw: true,
                dusun: true,
                noKK: true,
                tanggalLahir: true,
                jenisKelamin: true
            }
        });
    }

    return {
        ...lansia,
        citizenData
    };
}

// =======================
// POSYANDU DASHBOARD
// =======================

export async function getPosyanduDashboardStats(posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    const memberWhere: any = { tenantId };
    if (normalizedRws.length > 0) {
        memberWhere.rw = { in: normalizedRws };
    }

    const rwFilterBalita = normalizedRws.length > 0 ? { rw: { in: normalizedRws } } : undefined;
    const rwFilterIbuHamil = normalizedRws.length > 0 ? { rw: { in: normalizedRws } } : undefined;
    const rwFilterLansia = normalizedRws.length > 0 ? { rw: { in: normalizedRws } } : undefined;

    const recordScopeWhere: any = { tenantId };
    if (normalizedRws.length > 0) {
        recordScopeWhere.OR = [
            { balita: rwFilterBalita },
            { ibuHamil: rwFilterIbuHamil },
            { lansia: rwFilterLansia }
        ];
    }

    const [
        totalBalita,
        totalIbuHamil,
        totalLansia,
        stuntingBalita,
        recentRecords,
        giziNormal,
        giziKurang,
        giziLebih,
        totalJadwal,
        activeJadwals,
        kehadiranList,
        layananBalitaCount,
        layananIbuHamilCount,
        layananLansiaCount
    ] = await Promise.all([
        prisma.posyanduBalita.count({ where: memberWhere }),
        prisma.posyanduIbuHamil.count({ where: memberWhere }),
        prisma.posyanduLansia.count({ where: memberWhere }),
        prisma.posyanduBalita.count({ where: { ...memberWhere, statusStunting: true } }),
        prisma.posyanduRecord.findMany({
            where: recordScopeWhere,
            orderBy: { tanggal: 'desc' },
            take: 10,
            include: {
                balita: true,
                ibuHamil: true,
                lansia: true
            }
        }),
        prisma.posyanduRecord.count({
            where: {
                tenantId,
                statusGizi: "Normal",
                ...(rwFilterBalita ? { balita: rwFilterBalita } : { balitaId: { not: null } })
            }
        }),
        prisma.posyanduRecord.count({
            where: {
                tenantId,
                statusGizi: "Gizi Kurang",
                ...(rwFilterBalita ? { balita: rwFilterBalita } : { balitaId: { not: null } })
            }
        }),
        prisma.posyanduRecord.count({
            where: {
                tenantId,
                statusGizi: "Gizi Lebih",
                ...(rwFilterBalita ? { balita: rwFilterBalita } : { balitaId: { not: null } })
            }
        }),
        prisma.posyanduJadwal.count({ where: { tenantId } }),
        prisma.posyanduJadwal.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'asc' },
            take: 5
        }),
        prisma.posyanduKehadiran.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'desc' },
            take: 20
        }),
        prisma.posyanduRecord.count({
            where: {
                tenantId,
                balitaId: { not: null },
                ...(rwFilterBalita ? { balita: rwFilterBalita } : {})
            }
        }),
        prisma.posyanduRecord.count({
            where: {
                tenantId,
                ibuHamilId: { not: null },
                ...(rwFilterIbuHamil ? { ibuHamil: rwFilterIbuHamil } : {})
            }
        }),
        prisma.posyanduRecord.count({
            where: {
                tenantId,
                lansiaId: { not: null },
                ...(rwFilterLansia ? { lansia: rwFilterLansia } : {})
            }
        })
    ]);

    const recordsThisYear = await prisma.posyanduRecord.findMany({
        where: {
            tenantId,
            tanggal: {
                gte: new Date(new Date().getFullYear(), 0, 1)
            },
            balitaId: { not: null },
            ...(rwFilterBalita ? { balita: rwFilterBalita } : {})
        },
        select: {
            tanggal: true,
            beratBadan: true,
            tinggiBadan: true
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const chartMap: any = {};
    monthNames.forEach(m => chartMap[m] = { name: m, bb: 0, tb: 0, count: 0 });

    recordsThisYear.forEach(r => {
        const m = monthNames[new Date(r.tanggal).getMonth()];
        if (r.beratBadan) chartMap[m].bb += r.beratBadan;
        if (r.tinggiBadan) chartMap[m].tb += r.tinggiBadan;
        chartMap[m].count += 1;
    });

    const chartData = monthNames.map(m => {
        const item = chartMap[m];
        return {
            name: m,
            beratRataRata: item.count > 0 ? parseFloat((item.bb / item.count).toFixed(2)) : 0,
            tinggiRataRata: item.count > 0 ? parseFloat((item.tb / item.count).toFixed(2)) : 0
        };
    });

    return {
        totalBalita,
        totalIbuHamil,
        totalLansia,
        stuntingBalita,
        recentRecords,
        chartData,
        giziStats: {
            normal: giziNormal,
            kurang: giziKurang,
            stunting: stuntingBalita,
            lebih: giziLebih
        },
        totalJadwal,
        activeJadwals,
        kehadiranList,
        layananBalitaCount,
        layananIbuHamilCount,
        layananLansiaCount
    };
}

export async function exportPosyanduReport(posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (normalizedRws.length > 0) {
        whereClause.rw = { in: normalizedRws };
    }

    const balitas = await prisma.posyanduBalita.findMany({
        where: whereClause,
        include: {
            records: {
                orderBy: { tanggal: 'desc' },
                take: 1
            }
        },
        orderBy: { namaLengkap: "asc" }
    });

    const header = ["Nama Balita", "NIK", "Umur Bulan", "Nama Ortu", "RT", "RW", "Status Stunting", "BB Terakhir", "TB Terakhir", "Tgl Kunjungan Terakhir"];
    const rows = balitas.map(b => {
        const r = b.records[0];
        const birthDate = new Date(b.tanggalLahir);
        const today = new Date();
        const diffMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        
        return [
            `"${b.namaLengkap || ''}"`,
            `"${b.nik || ''}"`,
            diffMonths,
            `"${b.namaOrangTua || ''}"`,
            `"${b.rt || ''}"`,
            `"${b.rw || ''}"`,
            b.statusStunting ? "Ya" : "Tidak",
            r?.beratBadan || '',
            r?.tinggiBadan || '',
            r?.tanggal ? r.tanggal.toISOString().split('T')[0] : ''
        ].join(",");
    });

    return [header.join(","), ...rows].join("\n");
}

// =======================
// POSYANDU RECORDS (LAYANAN KESEHATAN)
// =======================

export async function getPosyanduRecords(kategori: "BALITA" | "IBU_HAMIL" | "LANSIA", posyanduFilter?: string) {
    const { tenantId, normalizedRws } = await verifyPosyanduAccess(posyanduFilter);
    
    // Auto-sync missing initial records for existing master entities
    const rwCondition = normalizedRws.length > 0 ? { in: normalizedRws } : undefined;

    if (kategori === "BALITA") {
        const balitasWithoutRecords = await prisma.posyanduBalita.findMany({
            where: {
                tenantId,
                ...(rwCondition ? { rw: rwCondition } : {}),
                records: { none: {} }
            }
        });
        for (const b of balitasWithoutRecords) {
            await prisma.posyanduRecord.create({
                data: {
                    balitaId: b.id,
                    tanggal: new Date(),
                    statusGizi: b.statusStunting ? "Stunting" : "Normal",
                    keterangan: "Pendaftaran Awal Posyandu Balita",
                    tenantId
                }
            });
        }
    } else if (kategori === "IBU_HAMIL") {
        const ibusWithoutRecords = await prisma.posyanduIbuHamil.findMany({
            where: {
                tenantId,
                ...(rwCondition ? { rw: rwCondition } : {}),
                records: { none: {} }
            }
        });
        for (const i of ibusWithoutRecords) {
            await prisma.posyanduRecord.create({
                data: {
                    ibuHamilId: i.id,
                    tanggal: new Date(),
                    beratBadan: i.beratBadan,
                    statusRisiko: i.risikoTinggi ? "Risiko Tinggi" : "Normal",
                    keterangan: "Pendaftaran Awal Ibu Hamil",
                    tenantId
                }
            });
        }
    } else if (kategori === "LANSIA") {
        const lansiasWithoutRecords = await prisma.posyanduLansia.findMany({
            where: {
                tenantId,
                ...(rwCondition ? { rw: rwCondition } : {}),
                records: { none: {} }
            }
        });
        for (const l of lansiasWithoutRecords) {
            await prisma.posyanduRecord.create({
                data: {
                    lansiaId: l.id,
                    tanggal: new Date(),
                    kondisiUmum: l.memilikiPenyakitBawaan ? "Perlu Rujukan" : "Baik",
                    keterangan: "Pendaftaran Awal Posyandu Lansia",
                    tenantId
                }
            });
        }
    }

    const whereClause: any = { tenantId };
    if (kategori === "BALITA") {
        whereClause.balitaId = { not: null };
        if (rwCondition) whereClause.balita = { rw: rwCondition };
    } else if (kategori === "IBU_HAMIL") {
        whereClause.ibuHamilId = { not: null };
        if (rwCondition) whereClause.ibuHamil = { rw: rwCondition };
    } else if (kategori === "LANSIA") {
        whereClause.lansiaId = { not: null };
        if (rwCondition) whereClause.lansia = { rw: rwCondition };
    }

    return await prisma.posyanduRecord.findMany({
        where: whereClause,
        include: {
            balita: true,
            ibuHamil: true,
            lansia: true
        },
        orderBy: { tanggal: "desc" },
        take: 200
    });
}

export async function addPosyanduRecord(data: any) {
    const { tenantId } = await verifyPosyanduAccess(data.posyanduFilter);

    const recordData: any = {
        tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
        tenantId
    };

    if (data.balitaId) recordData.balitaId = data.balitaId;
    if (data.ibuHamilId) recordData.ibuHamilId = data.ibuHamilId;
    if (data.lansiaId) recordData.lansiaId = data.lansiaId;
    if (data.beratBadan !== undefined) recordData.beratBadan = data.beratBadan;
    if (data.tinggiBadan !== undefined) recordData.tinggiBadan = data.tinggiBadan;
    if (data.lingkarKepala !== undefined) recordData.lingkarKepala = data.lingkarKepala;
    if (data.tensi !== undefined) recordData.tensi = data.tensi;
    if (data.gulaDarah !== undefined) recordData.gulaDarah = data.gulaDarah;
    if (data.statusGizi !== undefined) recordData.statusGizi = data.statusGizi;
    if (data.statusRisiko !== undefined) recordData.statusRisiko = data.statusRisiko;
    if (data.kondisiUmum !== undefined) recordData.kondisiUmum = data.kondisiUmum;
    if (data.imunisasi !== undefined) recordData.imunisasi = data.imunisasi;
    if (data.keterangan !== undefined) recordData.keterangan = data.keterangan;

    const record = await prisma.posyanduRecord.create({
        data: recordData
    });

    if (data.ibuHamilId && (data.beratBadan || data.statusRisiko)) {
        await prisma.posyanduIbuHamil.updateMany({
            where: { id: data.ibuHamilId, tenantId },
            data: {
                ...(data.beratBadan ? { beratBadan: data.beratBadan } : {}),
                ...(data.statusRisiko === "Risiko Tinggi" ? { risikoTinggi: true } : data.statusRisiko === "Normal" ? { risikoTinggi: false } : {})
            }
        });
    }

    if (data.lansiaId && data.kondisiUmum) {
        await prisma.posyanduLansia.updateMany({
            where: { id: data.lansiaId, tenantId },
            data: {
                ...(data.kondisiUmum === "Perlu Rujukan" || data.kondisiUmum === "Kurang Baik" ? { memilikiPenyakitBawaan: true } : {})
            }
        });
    }

    revalidatePath("/dashboard");
    return { success: true, record };
}

export async function deletePosyanduRecord(id: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduRecord.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU JADWAL
// =======================

export async function getPosyanduJadwals(posyanduFilter?: string) {
    const { tenantId } = await verifyPosyanduAccess(posyanduFilter);

    return await prisma.posyanduJadwal.findMany({
        where: { tenantId },
        orderBy: { tanggal: "asc" }
    });
}

export async function addPosyanduJadwal(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const jadwal = await prisma.posyanduJadwal.create({
        data: {
            namaKegiatan: data.namaKegiatan,
            tanggal: new Date(data.tanggal),
            waktu: data.waktu,
            lokasi: data.lokasi,
            petugas: data.petugas,
            status: data.status || "Terjadwal",
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, jadwal };
}

export async function updatePosyanduJadwalStatus(id: string, status: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduJadwal.updateMany({
        where: { id, tenantId },
        data: { status }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduJadwal(id: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduJadwal.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// =======================
// POSYANDU KEHADIRAN
// =======================

export async function getPosyanduKehadirans(posyanduFilter?: string) {
    const { tenantId } = await verifyPosyanduAccess(posyanduFilter);

    return await prisma.posyanduKehadiran.findMany({
        where: { tenantId },
        orderBy: { tanggal: "desc" },
        take: 200
    });
}

export async function addPosyanduKehadiran(data: any) {
    const { tenantId } = await verifyPosyanduAccess();

    const kehadiran = await prisma.posyanduKehadiran.create({
        data: {
            tanggal: new Date(data.tanggal),
            nama: data.nama,
            kategori: data.kategori,
            hadir: data.hadir,
            keterangan: data.keterangan || null,
            tenantId
        }
    });

    revalidatePath("/dashboard");
    return { success: true, kehadiran };
}

export async function deletePosyanduKehadiran(id: string) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduKehadiran.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getPosyanduLaporanStats(posyanduName: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    const nameVariations: any[] = [
        { posyanduName: { equals: posyanduName, mode: "insensitive" } },
        { posyanduName: { equals: posyanduName.replace(/posyandu\s+/i, "").trim(), mode: "insensitive" } }
    ];

    if (posyanduName.includes("Mawar I") && !posyanduName.includes("II") && !posyanduName.includes("IV")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 1", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 1", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 001", mode: "insensitive" } });
    } else if (posyanduName.includes("Mawar II") && !posyanduName.includes("III")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 2", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 2", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 002", mode: "insensitive" } });
    } else if (posyanduName.includes("Mawar III")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 3", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 3", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 003", mode: "insensitive" } });
    } else if (posyanduName.includes("Mawar IV")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 4", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 4", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 004", mode: "insensitive" } });
    } else if (posyanduName.includes("Mawar V") && !posyanduName.includes("VI") && !posyanduName.includes("IV")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 5", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 5", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 005", mode: "insensitive" } });
    } else if (posyanduName.includes("Mawar VI") && !posyanduName.includes("VII")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 6", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 6", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 006", mode: "insensitive" } });
    } else if (posyanduName.includes("Mawar VII")) {
        nameVariations.push({ posyanduName: { equals: "Posyandu Mawar 7", mode: "insensitive" } }, { posyanduName: { equals: "Mawar 7", mode: "insensitive" } }, { posyanduName: { equals: "Posyandu Unit 007", mode: "insensitive" } });
    }

    const whereClause = tenantId ? { tenantId, OR: nameVariations } : { OR: nameVariations };

    // Total Data
    const totalBalita = await prisma.posyanduBalita.count({ where: whereClause });
    const totalIbuHamil = await prisma.posyanduIbuHamil.count({ where: whereClause });
    const totalLansia = await prisma.posyanduLansia.count({ where: whereClause });
    const stuntingCount = await prisma.posyanduBalita.count({ where: { ...whereClause, statusStunting: true } });

    // Weekly Chart Data (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const records = await prisma.posyanduRecord.findMany({
        where: { 
            ...(tenantId ? { tenantId } : {}), 
            OR: [
                { balita: { OR: nameVariations } },
                { ibuHamil: { OR: nameVariations } },
                { lansia: { OR: nameVariations } }
            ],
            tanggal: { gte: startOfMonth }
        },
        select: { tanggal: true, balitaId: true, ibuHamilId: true, lansiaId: true }
    });

    const weeklyStats = [
        { label: 'Minggu 1', balita: 0, bumil: 0, lansia: 0 },
        { label: 'Minggu 2', balita: 0, bumil: 0, lansia: 0 },
        { label: 'Minggu 3', balita: 0, bumil: 0, lansia: 0 },
        { label: 'Minggu 4', balita: 0, bumil: 0, lansia: 0 },
    ];

    records.forEach(r => {
        const d = new Date(r.tanggal).getDate();
        let weekIdx = 0;
        if (d > 7 && d <= 14) weekIdx = 1;
        else if (d > 14 && d <= 21) weekIdx = 2;
        else if (d > 21) weekIdx = 3;

        if (r.balitaId) weeklyStats[weekIdx].balita += 1;
        if (r.ibuHamilId) weeklyStats[weekIdx].bumil += 1;
        if (r.lansiaId) weeklyStats[weekIdx].lansia += 1;
    });

    const listBalita = await prisma.posyanduBalita.findMany({ where: whereClause, select: { namaLengkap: true, namaOrangTua: true, jenisKelamin: true, statusStunting: true } });
    const listIbuHamil = await prisma.posyanduIbuHamil.findMany({ where: whereClause, select: { namaLengkap: true, usiaKandungan: true } });
    const listLansia = await prisma.posyanduLansia.findMany({ where: whereClause, select: { namaLengkap: true, usia: true, jenisKelamin: true } });

    return {
        totalBalita,
        totalIbuHamil,
        totalLansia,
        stuntingCount,
        weeklyStats,
        listBalita,
        listIbuHamil,
        listLansia
    };
}
