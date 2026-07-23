"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getRWsForPosyandu, getPosyanduUnit, detectUserPosyanduUnit } from "@/lib/posyandu";

async function verifyPosyanduAccess(posyanduFilter?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = (session.user as any).role;
    const rwString = (session.user as any).rw;
    const tenantId = (session.user as any).tenantId;

    if (!["POSYANDU", "RW", "ADMIN_DESA", "KADES", "SEKDES", "KASI_KESEJAHTERAAN", "TP_PKK", "ADMIN_MASTER"].includes(role)) {
        throw new Error("Akses ditolak. Fitur ini khusus untuk Posyandu dan Administrator.");
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

    return { tenantId, rws, user: session.user, role };
}

// =======================
// INTEGRASI DATA KEPENDUDUKAN
// =======================

export async function searchWargaForPosyandu(query: string, posyanduFilter?: string) {
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);

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
    if (rws.length === 1) {
        whereCondition.rw = rws[0];
    } else if (rws.length > 1) {
        whereCondition.rw = { in: rws };
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
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (rws.length === 1) {
        whereClause.rw = rws[0];
    } else if (rws.length > 1) {
        whereClause.rw = { in: rws };
    }

    return await prisma.posyanduBalita.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addPosyanduBalita(data: any) {
    const { tenantId } = await verifyPosyanduAccess(data.posyanduFilter);

    const balita = await prisma.posyanduBalita.create({
        data: {
            nik: data.nik || null,
            namaLengkap: data.namaLengkap,
            tanggalLahir: new Date(data.tanggalLahir),
            jenisKelamin: data.jenisKelamin,
            namaOrangTua: data.namaOrangTua,
            rt: data.rt,
            rw: data.rw,
            posyanduName: data.posyanduName || "Posyandu",
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

    revalidatePath("/dashboard");
    return { success: true, balita };
}

export async function updatePosyanduBalitaStatus(id: string, statusStunting: boolean) {
    const { tenantId } = await verifyPosyanduAccess();

    await prisma.posyanduBalita.updateMany({
        where: { id, tenantId },
        data: { statusStunting }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePosyanduBalita(id: string) {
    const { tenantId } = await verifyPosyanduAccess();
    
    await prisma.posyanduBalita.deleteMany({
        where: { id, tenantId }
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getBalitaDetail(balitaId: string) {
    const { tenantId } = await verifyPosyanduAccess();

    const balita = await prisma.posyanduBalita.findFirst({
        where: { id: balitaId, tenantId },
        include: {
            records: {
                orderBy: { tanggal: 'desc' }
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

    return {
        ...balita,
        citizenData
    };
}

// =======================
// POSYANDU IBU HAMIL
// =======================

export async function getPosyanduIbuHamil(posyanduFilter?: string) {
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (rws.length === 1) {
        whereClause.rw = rws[0];
    } else if (rws.length > 1) {
        whereClause.rw = { in: rws };
    }

    return await prisma.posyanduIbuHamil.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addPosyanduIbuHamil(data: any) {
    const { tenantId } = await verifyPosyanduAccess(data.posyanduFilter);

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
            posyanduName: data.posyanduName || "Posyandu",
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
                orderBy: { tanggal: 'desc' }
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
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (rws.length === 1) {
        whereClause.rw = rws[0];
    } else if (rws.length > 1) {
        whereClause.rw = { in: rws };
    }

    return await prisma.posyanduLansia.findMany({
        where: whereClause,
        orderBy: { namaLengkap: "asc" }
    });
}

export async function addPosyanduLansia(data: any) {
    const { tenantId } = await verifyPosyanduAccess(data.posyanduFilter);

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
            posyanduName: data.posyanduName || "Posyandu",
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
                orderBy: { tanggal: 'desc' }
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
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (rws.length === 1) {
        whereClause.rw = rws[0];
    } else if (rws.length > 1) {
        whereClause.rw = { in: rws };
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
        prisma.posyanduBalita.count({ where: whereClause }),
        prisma.posyanduIbuHamil.count({ where: whereClause }),
        prisma.posyanduLansia.count({ where: whereClause }),
        prisma.posyanduBalita.count({ where: { ...whereClause, statusStunting: true } }),
        prisma.posyanduRecord.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'desc' },
            take: 10,
            include: {
                balita: true,
                ibuHamil: true,
                lansia: true
            }
        }),
        prisma.posyanduRecord.count({ where: { tenantId, statusGizi: "Normal" } }),
        prisma.posyanduRecord.count({ where: { tenantId, statusGizi: "Gizi Kurang" } }),
        prisma.posyanduRecord.count({ where: { tenantId, statusGizi: "Gizi Lebih" } }),
        prisma.posyanduJadwal.count({ where: { tenantId } }),
        prisma.posyanduJadwal.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'asc' },
            take: 5
        }),
        prisma.posyanduKehadiran.findMany({
            where: { tenantId },
            orderBy: { tanggal: 'desc' }
        }),
        prisma.posyanduRecord.count({ where: { tenantId, balitaId: { not: null } } }),
        prisma.posyanduRecord.count({ where: { tenantId, ibuHamilId: { not: null } } }),
        prisma.posyanduRecord.count({ where: { tenantId, lansiaId: { not: null } } })
    ]);

    const recordsThisYear = await prisma.posyanduRecord.findMany({
        where: {
            tenantId,
            tanggal: {
                gte: new Date(new Date().getFullYear(), 0, 1)
            },
            balitaId: { not: null }
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
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);

    const whereClause: any = { tenantId };
    if (rws.length === 1) {
        whereClause.rw = rws[0];
    } else if (rws.length > 1) {
        whereClause.rw = { in: rws };
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
    const { tenantId, rws } = await verifyPosyanduAccess(posyanduFilter);
    
    // Auto-sync missing initial records for existing master entities
    const rwCondition = rws.length === 1 ? rws[0] : rws.length > 1 ? { in: rws } : undefined;

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
        orderBy: { tanggal: "desc" }
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
        orderBy: { tanggal: "desc" }
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
