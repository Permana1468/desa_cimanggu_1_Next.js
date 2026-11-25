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
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;
    const startOfMonth = new Date(curYear, curMonth - 1, 1);

    const [
        suratPendingCount,
        suratVerifiedCount,
        suratApprovedToday,
        pendingSuratList,
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

    apbdesItems.forEach((item: any) => {
        const kat = (item.kategori || "").toUpperCase();
        if (kat.includes("PENDAPATAN")) {
            totalPendapatan += item.anggaranTotal || 0;
        } else if (kat.includes("BELANJA")) {
            totalBelanjaAnggaran += item.anggaranTotal || 0;
            totalBelanjaRealisasi += item.realisasi || 0;
        }
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

