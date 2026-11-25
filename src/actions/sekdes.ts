"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifySekdesAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const role = String((session.user as any).role || "").toUpperCase();
    const tenantId = (session.user as any).tenantId;

    if (!["SEKDES", "KADES", "ADMIN_DESA", "ADMIN_MASTER"].includes(role)) {
        throw new Error("Akses ditolak. Fitur ini khusus Sekretaris Desa.");
    }
    return { session, role, tenantId, userId: (session.user as any).id };
}

/**
 * Mengambil seluruh data ringkas Tupoksi Sekretaris Desa (PPKD, Persuratan, Kepegawaian, Kependudukan)
 * dalam 1x eksekusi paralel ringan tanpa beban query berlebih.
 */
export async function getSekdesCommandCenterData() {
    const { tenantId } = await verifySekdesAccess();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;
    const startOfMonth = new Date(curYear, curMonth - 1, 1);

    const [
        suratPendingCount,
        suratVerifiedCount,
        suratApprovedToday,
        pendingSuratList,
        surat7DaysRaw,
        unverifiedWargaCount,
        totalWargaAktif,
        totalAparatur,
        absensiHariIniCount,
        apbdesItems,
        pendingFinanceProposals,
        totalArsipDokumen,
        birthMonthCount,
        deathMonthCount,
        moveMonthCount,
        incomingMonthCount
    ] = await Promise.all([
        prisma.surat.count({ where: { tenantId, status: "TERTUNDA" } }),
        prisma.surat.count({ where: { tenantId, status: "TERVERIFIKASI" } }),
        prisma.surat.count({ where: { tenantId, status: "DISETUJUI", updatedAt: { gte: today } } }),
        prisma.surat.findMany({
            where: { tenantId, status: { in: ["TERTUNDA", "TERVERIFIKASI"] } },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                jenisSurat: true,
                nomorSurat: true,
                keperluan: true,
                status: true,
                createdAt: true,
                warga: {
                    select: {
                        namaLengkap: true,
                        nik: true,
                        rt: true,
                        rw: true
                    }
                }
            }
        }),
        prisma.surat.findMany({
            where: { tenantId, createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true, status: true }
        }),
        prisma.user.count({ where: { tenantId, role: "WARGA", isActive: false } }),
        prisma.dataKependudukan.count({
            where: { tenantId, statusKependudukan: { notIn: ["MENINGGAL", "PINDAH", "PINDAH_KELUAR"] } }
        }),
        prisma.aparaturDesa.count({ where: { tenantId } }),
        prisma.user.count({ where: { tenantId, role: { not: "WARGA" }, lastActiveAt: { gte: today } } }),
        prisma.apbdesFinance.findMany({
            where: { tenantId, tahunAnggaran: curYear },
            select: { kategori: true, anggaranTotal: true, realisasi: true }
        }),
        prisma.financeProposal.count({ where: { tenantId, status: "PENDING" } }),
        prisma.villageDocument.count({ where: { tenantId } }),
        prisma.rtBirthReport.count({ where: { tenantId, tanggalLahir: { gte: startOfMonth } } }),
        prisma.rtDeathReport.count({ where: { tenantId, tanggalMeninggal: { gte: startOfMonth } } }),
        prisma.rtMoveReport.count({ where: { tenantId, tanggalPindah: { gte: startOfMonth } } }),
        prisma.rtIncomingReport.count({ where: { tenantId, tanggalDatang: { gte: startOfMonth } } })
    ]);

    let totalPendapatan = 0;
    let totalBelanjaAnggaran = 0;
    let totalBelanjaRealisasi = 0;
    const apbdesByCat: Record<string, { kategori: string; anggaran: number; realisasi: number }> = {};

    apbdesItems.forEach((item: any) => {
        const katRaw = (item.kategori || "LAINNYA").toUpperCase();
        const katLabel = katRaw.includes("PENDAPATAN")
            ? "Pendapatan"
            : katRaw.includes("BELANJA")
                ? "Belanja"
                : katRaw.includes("PEMBIAYAAN")
                    ? "Pembiayaan"
                    : item.kategori || "Lainnya";

        if (!apbdesByCat[katLabel]) {
            apbdesByCat[katLabel] = { kategori: katLabel, anggaran: 0, realisasi: 0 };
        }
        apbdesByCat[katLabel].anggaran += item.anggaranTotal || 0;
        apbdesByCat[katLabel].realisasi += item.realisasi || 0;

        if (katRaw.includes("PENDAPATAN")) {
            totalPendapatan += item.anggaranTotal || 0;
        } else if (katRaw.includes("BELANJA")) {
            totalBelanjaAnggaran += item.anggaranTotal || 0;
            totalBelanjaRealisasi += item.realisasi || 0;
        }
    });

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const trendMap: Record<string, { label: string; masuk: number; terverifikasi: number; disetujui: number }> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        trendMap[key] = {
            label: `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
            masuk: 0,
            terverifikasi: 0,
            disetujui: 0
        };
    }

    surat7DaysRaw.forEach((s: any) => {
        const key = new Date(s.createdAt).toISOString().slice(0, 10);
        const bucket = trendMap[key];
        if (!bucket) return;
        bucket.masuk += 1;
        if (s.status === "TERVERIFIKASI") bucket.terverifikasi += 1;
        if (s.status === "DISETUJUI") bucket.disetujui += 1;
    });

    const serapanPersen = totalBelanjaAnggaran > 0
        ? Math.min(100, Math.round((totalBelanjaRealisasi / totalBelanjaAnggaran) * 100))
        : 0;

    const kehadiranPersen = totalAparatur > 0
        ? Math.min(100, Math.round((absensiHariIniCount / totalAparatur) * 100))
        : 0;

    return {
        persuratan: {
            pendingCount: suratPendingCount,
            verifiedCount: suratVerifiedCount,
            approvedToday: suratApprovedToday,
            queueList: pendingSuratList
        },
        ppkd: {
            tahun: curYear,
            totalPendapatan,
            totalBelanjaAnggaran,
            totalBelanjaRealisasi,
            serapanPersen,
            pendingProposals: pendingFinanceProposals
        },
        kepegawaian: {
            totalAparatur,
            hadirHariIni: absensiHariIniCount,
            kehadiranPersen
        },
        kependudukan: {
            totalWargaAktif,
            unverifiedWargaCount,
            totalArsipDokumen,
            mutasiBulanIni: {
                lahir: birthMonthCount,
                mati: deathMonthCount,
                pindah: moveMonthCount,
                datang: incomingMonthCount
            }
        },
        charts: {
            suratTrend: Object.values(trendMap),
            apbdesBreakdown: Object.values(apbdesByCat)
        }
    };
}

/**
 * Paraf / Verifikasi Surat oleh Sekretaris Desa sebelum pengesahan Kepala Desa
 */
export async function verifySuratBySekdes(suratId: string) {
    const { tenantId, userId } = await verifySekdesAccess();

    const updated = await prisma.surat.updateMany({
        where: { id: suratId, tenantId, status: "TERTUNDA" },
        data: { status: "TERVERIFIKASI" }
    });

    if (updated.count > 0) {
        await prisma.auditLog.create({
            data: {
                action: "SEKDES_PARAF_SURAT",
                entity: "Surat",
                entityId: suratId,
                details: { status: "TERVERIFIKASI" },
                userId,
                tenantId,
                category: "SYSTEM"
            }
        });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/surat");
    return { success: true };
}

