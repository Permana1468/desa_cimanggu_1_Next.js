"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { buildWilayahFilterScope } from "./rt";

export type PhysicalMutationItem = {
  id: string;
  type: "death" | "move" | "birth" | "incoming";
  typeLabel: string;
  nik?: string;
  namaLengkap: string;
  rt: string;
  rw: string;
  tanggalKejadian: string;
  detail: string;
  statusFisik: "MENUNGGU_BERKAS_FISIK" | "SELESAI_FISIK";
  tanggalLapor: string;
  lokasiArsipFisik?: string | null;
  verifikatorNama?: string | null;
  catatanVerifikasi?: string | null;
  tanggalSelesaiFisik?: string | null;
};

export type PhysicalMutationSummary = {
  totalPending: number;
  deathCount: number;
  moveCount: number;
  birthCount: number;
  incomingCount: number;
  items: PhysicalMutationItem[];
  userRole: string;
  wilayahLabel: string;
};

/**
 * Fetch pending or all physical mutation items filtered automatically by caller role scope:
 * - RT: only reports within their RT/RW
 * - RW: only reports within their RW
 * - KADUS: only reports within the RWs of their Dusun
 * - KASI_PELAYANAN / ADMIN_DESA / KADES / SEKDES: all reports across the entire village
 */
export async function getPhysicalMutations(status: "PENDING" | "SELESAI" | "ALL" = "PENDING"): Promise<{
  success: boolean;
  data?: PhysicalMutationSummary;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = (session.user as any).role as string;
    const userRt = (session.user as any).rt || "";
    const userRw = (session.user as any).rw || "";
    const tenantId = (session.user as any).tenantId;

    if (!tenantId) {
      return { success: false, error: "Tenant context not found" };
    }

    let filterScope: any = { tenantId };
    let wilayahLabel = "Tingkat Desa";

    // 1. Scope based on role
    if (role === "RT") {
      const scopeRes = await buildWilayahFilterScope("RT", userRt, userRw, tenantId);
      filterScope = { ...filterScope, ...scopeRes.filterScope };
      wilayahLabel = `RT ${userRt} / RW ${userRw}`;
    } else if (role === "RW") {
      const scopeRes = await buildWilayahFilterScope("RW", "", userRw, tenantId);
      filterScope = { ...filterScope, ...scopeRes.filterScope };
      wilayahLabel = `RW ${userRw}`;
    } else if (role === "KADUS") {
      const scopeRes = await buildWilayahFilterScope("KADUS", "", userRw, tenantId);
      if (scopeRes.allowedRws.length > 0) {
        filterScope.rw = { in: scopeRes.allowedRws };
      }
      wilayahLabel = `Dusun ${userRw || ""}`;
    } else {
      wilayahLabel = "Pusat Pelayanan Desa Cimanggu I";
    }

    // 2. Status filter
    const statusCondition =
      status === "PENDING"
        ? { statusFisik: "MENUNGGU_BERKAS_FISIK" }
        : status === "SELESAI"
        ? { statusFisik: "SELESAI_FISIK" }
        : {};

    const baseWhere = {
      ...filterScope,
      ...statusCondition,
    };

    // 3. Parallel fetch across all 4 LAMPID tables
    const [deaths, moves, births, incomings] = await Promise.all([
      prisma.rtDeathReport.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
      }),
      prisma.rtMoveReport.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
      }),
      prisma.rtBirthReport.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
      }),
      prisma.rtIncomingReport.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const items: PhysicalMutationItem[] = [];

    // Format Death Reports
    deaths.forEach((d) => {
      items.push({
        id: d.id,
        type: "death",
        typeLabel: "Meninggal Dunia",
        nik: d.nik,
        namaLengkap: d.namaLengkap,
        rt: d.rt,
        rw: d.rw,
        tanggalKejadian: d.tanggalMeninggal ? new Date(d.tanggalMeninggal).toLocaleDateString("id-ID") : "-",
        detail: d.penyebab ? `Penyebab: ${d.penyebab}` : d.keterangan || "Tidak ada rincian penyebab",
        statusFisik: (d.statusFisik as any) || "MENUNGGU_BERKAS_FISIK",
        tanggalLapor: d.createdAt ? new Date(d.createdAt).toLocaleDateString("id-ID") : "-",
        lokasiArsipFisik: d.lokasiArsipFisik,
        verifikatorNama: d.verifikatorNama,
        catatanVerifikasi: d.catatanVerifikasi,
        tanggalSelesaiFisik: d.tanggalSelesaiFisik ? new Date(d.tanggalSelesaiFisik).toLocaleDateString("id-ID") : null,
      });
    });

    // Format Move Reports
    moves.forEach((m) => {
      items.push({
        id: m.id,
        type: "move",
        typeLabel: "Pindah Keluar Desa",
        nik: m.nik,
        namaLengkap: m.namaLengkap,
        rt: m.rt,
        rw: m.rw,
        tanggalKejadian: m.tanggalPindah ? new Date(m.tanggalPindah).toLocaleDateString("id-ID") : "-",
        detail: `Tujuan: ${m.alamatTujuan}${m.alasan ? ` (Alasan: ${m.alasan})` : ""}`,
        statusFisik: (m.statusFisik as any) || "MENUNGGU_BERKAS_FISIK",
        tanggalLapor: m.createdAt ? new Date(m.createdAt).toLocaleDateString("id-ID") : "-",
        lokasiArsipFisik: m.lokasiArsipFisik,
        verifikatorNama: m.verifikatorNama,
        catatanVerifikasi: m.catatanVerifikasi,
        tanggalSelesaiFisik: m.tanggalSelesaiFisik ? new Date(m.tanggalSelesaiFisik).toLocaleDateString("id-ID") : null,
      });
    });

    // Format Birth Reports
    births.forEach((b) => {
      items.push({
        id: b.id,
        type: "birth",
        typeLabel: "Kelahiran Baru",
        namaLengkap: b.namaBayi,
        rt: b.rt,
        rw: b.rw,
        tanggalKejadian: b.tanggalLahir ? new Date(b.tanggalLahir).toLocaleDateString("id-ID") : "-",
        detail: `JK: ${b.jenisKelamin} | Orang Tua: ${b.namaAyah || "-"} & ${b.namaIbu || "-"}`,
        statusFisik: (b.statusFisik as any) || "MENUNGGU_BERKAS_FISIK",
        tanggalLapor: b.createdAt ? new Date(b.createdAt).toLocaleDateString("id-ID") : "-",
        lokasiArsipFisik: b.lokasiArsipFisik,
        verifikatorNama: b.verifikatorNama,
        catatanVerifikasi: b.catatanVerifikasi,
        tanggalSelesaiFisik: b.tanggalSelesaiFisik ? new Date(b.tanggalSelesaiFisik).toLocaleDateString("id-ID") : null,
      });
    });

    // Format Incoming Reports
    incomings.forEach((inc) => {
      items.push({
        id: inc.id,
        type: "incoming",
        typeLabel: "Pindah Datang / Masuk",
        nik: inc.nik,
        namaLengkap: inc.namaLengkap,
        rt: inc.rt,
        rw: inc.rw,
        tanggalKejadian: inc.tanggalDatang ? new Date(inc.tanggalDatang).toLocaleDateString("id-ID") : "-",
        detail: `Asal: ${inc.alamatAsal} | No. KK: ${inc.noKK || "-"}`,
        statusFisik: (inc.statusFisik as any) || "MENUNGGU_BERKAS_FISIK",
        tanggalLapor: inc.createdAt ? new Date(inc.createdAt).toLocaleDateString("id-ID") : "-",
        lokasiArsipFisik: inc.lokasiArsipFisik,
        verifikatorNama: inc.verifikatorNama,
        catatanVerifikasi: inc.catatanVerifikasi,
        tanggalSelesaiFisik: inc.tanggalSelesaiFisik ? new Date(inc.tanggalSelesaiFisik).toLocaleDateString("id-ID") : null,
      });
    });

    // Sort newest first
    items.sort((a, b) => (b.tanggalLapor > a.tanggalLapor ? 1 : -1));

    const deathCount = deaths.filter((d) => d.statusFisik === "MENUNGGU_BERKAS_FISIK").length;
    const moveCount = moves.filter((m) => m.statusFisik === "MENUNGGU_BERKAS_FISIK").length;
    const birthCount = births.filter((b) => b.statusFisik === "MENUNGGU_BERKAS_FISIK").length;
    const incomingCount = incomings.filter((i) => i.statusFisik === "MENUNGGU_BERKAS_FISIK").length;

    return {
      success: true,
      data: {
        totalPending: deathCount + moveCount + birthCount + incomingCount,
        deathCount,
        moveCount,
        birthCount,
        incomingCount,
        items,
        userRole: role,
        wilayahLabel,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memuat mutasi fisik" };
  }
}

/**
 * Complete physical verification for a mutation report.
 * Executed by authorized Village Administration (Kasi Pelayanan, Kasi Pemerintahan, Admin Desa, Sekdes, Kades).
 */
export async function completePhysicalMutation(payload: {
  id: string;
  type: "death" | "move" | "birth" | "incoming";
  lokasiArsipFisik: string;
  catatanVerifikasi?: string;
  checklist?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = (session.user as any).role as string;
    const tenantId = (session.user as any).tenantId;
    const verifikatorNama = session.user.name || (session.user as any).fullName || "Petugas Pelayanan";
    const verifikatorId = (session.user as any).id;

    // Authorization: Only Village Level administrative officers
    const allowedRoles = [
      "ADMIN_DESA",
      "ADMIN_MASTER",
      "KASI_PELAYANAN",
      "KASI_PEMERINTAHAN",
      "KASI",
      "KAUR_TU",
      "SEKDES",
      "KADES",
      "OPERATOR_DESA",
    ];

    if (!allowedRoles.includes(role)) {
      return {
        success: false,
        error: "Akses ditolak: Verifikasi berkas fisik hanya dapat dilakukan oleh Seksi Pelayanan atau Administrator Desa.",
      };
    }

    const now = new Date();
    const updateData = {
      statusFisik: "SELESAI_FISIK",
      tanggalSelesaiFisik: now,
      verifikatorNama,
      lokasiArsipFisik: payload.lokasiArsipFisik.trim(),
      catatanVerifikasi: payload.catatanVerifikasi ? payload.catatanVerifikasi.trim() : null,
    };

    let targetNik = "";
    let citizenStatusUpdate = "";
    let statusKeterangan = "";

    if (payload.type === "death") {
      const rep = await prisma.rtDeathReport.findUnique({ where: { id: payload.id } });
      if (!rep || rep.tenantId !== tenantId) throw new Error("Laporan kematian tidak ditemukan");
      await prisma.rtDeathReport.update({
        where: { id: payload.id },
        data: updateData,
      });
      targetNik = rep.nik;
      citizenStatusUpdate = "MENINGGAL";
      statusKeterangan = `Meninggal Dunia - Berkas Fisik Terverifikasi (${payload.lokasiArsipFisik})`;
    } else if (payload.type === "move") {
      const rep = await prisma.rtMoveReport.findUnique({ where: { id: payload.id } });
      if (!rep || rep.tenantId !== tenantId) throw new Error("Laporan pindah tidak ditemukan");
      await prisma.rtMoveReport.update({
        where: { id: payload.id },
        data: updateData,
      });
      targetNik = rep.nik;
      citizenStatusUpdate = "PINDAH_KELUAR";
      statusKeterangan = `Pindah Keluar Desa - Berkas Fisik Terverifikasi (${payload.lokasiArsipFisik})`;
    } else if (payload.type === "birth") {
      const rep = await prisma.rtBirthReport.findUnique({ where: { id: payload.id } });
      if (!rep || rep.tenantId !== tenantId) throw new Error("Laporan kelahiran tidak ditemukan");
      await prisma.rtBirthReport.update({
        where: { id: payload.id },
        data: updateData,
      });
    } else if (payload.type === "incoming") {
      const rep = await prisma.rtIncomingReport.findUnique({ where: { id: payload.id } });
      if (!rep || rep.tenantId !== tenantId) throw new Error("Laporan kedatangan tidak ditemukan");
      await prisma.rtIncomingReport.update({
        where: { id: payload.id },
        data: updateData,
      });
      targetNik = rep.nik;
      citizenStatusUpdate = "AKTIF";
      statusKeterangan = `Warga Pindahan Baru - Berkas Fisik Terverifikasi (${payload.lokasiArsipFisik})`;
    }

    // Update Central Data Kependudukan if citizen exists
    if (targetNik && citizenStatusUpdate) {
      await prisma.dataKependudukan.updateMany({
        where: { tenantId, nik: targetNik },
        data: {
          statusKependudukan: citizenStatusUpdate,
          keteranganStatus: statusKeterangan,
        },
      });
    }

    // Record Immutable Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "VERIFIKASI_BERKAS_FISIK",
          entity: "DataKependudukan",
          entityId: targetNik || payload.id,
          details: {
            mutationType: payload.type,
            mutationId: payload.id,
            nik: targetNik,
            verifikator: verifikatorNama,
            lokasiArsipFisik: payload.lokasiArsipFisik,
            checklist: payload.checklist || [],
          },
          userId: verifikatorId,
          tenantId,
          category: "USER_ACTION",
        },
      });
    } catch {}

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/warga");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memverifikasi berkas fisik" };
  }
}

