"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectUserPosyanduUnit, normalizeRwList, getRWsForPosyandu } from "@/lib/posyandu";

export interface LiveNotification {
  id: string;
  type: "posyandu" | "surat" | "pengaduan" | "system" | "security" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  badgeColor?: string;
  priority?: "high" | "medium" | "low";
}

export async function getLiveNotifications(): Promise<LiveNotification[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    const user = session.user as any;
    const role = String(user.role || "ADMIN_DESA").toUpperCase();
    const tenantId = user.tenantId;

    if (!tenantId) return [];

    const userUnit = detectUserPosyanduUnit(session.user);
    const notifications: LiveNotification[] = [];

    // 1. Posyandu Realtime Events (For POSYANDU cadres, as well as KADES, ADMIN, KASI_KESEJAHTERAAN)
    if (role === "POSYANDU" || ["ADMIN_DESA", "KADES", "SEKDES", "KASI_KESEJAHTERAAN", "ADMIN_MASTER"].includes(role)) {
      let rws: string[] = [];
      if (userUnit) {
        rws = normalizeRwList(getRWsForPosyandu(userUnit.id));
      } else if (user.rw) {
        rws = normalizeRwList(String(user.rw).split(",").map((s: string) => s.trim()));
      }

      const rwFilter = rws.length > 0 ? { in: rws } : undefined;

      // A. Peringatan Stunting / Gizi Buruk Balita
      try {
        const stuntingBalitas = await prisma.posyanduBalita.findMany({
          where: {
            tenantId,
            statusStunting: true,
            ...(rwFilter ? { rw: rwFilter } : {})
          },
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: {
            records: {
              take: 1,
              orderBy: { tanggal: "desc" }
            }
          }
        });

        for (const b of stuntingBalitas) {
          const lastRec = b.records?.[0];
          const tbStr = lastRec?.tinggiBadan ? ` TB ${lastRec.tinggiBadan} cm` : "";
          const bbStr = lastRec?.beratBadan ? ` BB ${lastRec.beratBadan} kg` : "";
          const statTime = lastRec?.tanggal ? new Date(lastRec.tanggal).toISOString() : new Date(b.updatedAt).toISOString();

          notifications.push({
            id: `stunting-${b.id}`,
            type: "posyandu",
            title: "Peringatan Stunting Terdeteksi",
            description: `Balita ${b.namaLengkap} (RW ${b.rw || "-"})${tbStr}${bbStr} terindikasi stunting. Butuh intervensi PMT & pantauan rutin.`,
            time: statTime,
            read: false,
            actionUrl: "/dashboard?tab=layanan-balita",
            badgeColor: "text-rose-600 bg-rose-50 border-rose-200",
            priority: "high"
          });
        }
      } catch (err) {
        console.warn("Notification error stunting query:", err);
      }

      // B. Ibu Hamil Risiko Tinggi (Resti)
      try {
        const restiBumils = await prisma.posyanduIbuHamil.findMany({
          where: {
            tenantId,
            risikoTinggi: true,
            ...(rwFilter ? { rw: rwFilter } : {})
          },
          take: 4,
          orderBy: { updatedAt: "desc" }
        });

        for (const bumil of restiBumils) {
          notifications.push({
            id: `bumil-resti-${bumil.id}`,
            type: "posyandu",
            title: "Ibu Hamil Risiko Tinggi (Resti)",
            description: `Ibu ${bumil.namaLengkap} (Usia kandungan ${bumil.usiaKandungan} bln, RW ${bumil.rw || "-"}) terindikasi risiko tinggi. Perlu pemeriksaan berkala bidan.`,
            time: new Date(bumil.updatedAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=layanan-ibuhamil",
            badgeColor: "text-pink-600 bg-pink-50 border-pink-200",
            priority: "high"
          });
        }
      } catch (err) {
        console.warn("Notification error bumil query:", err);
      }

      // C. Agenda & Jadwal Posyandu Aktif / Terdekat
      try {
        const activeJadwals = await prisma.posyanduJadwal.findMany({
          where: {
            tenantId,
            status: { in: ["Terjadwal", "Berlangsung"] }
          },
          take: 3,
          orderBy: { tanggal: "asc" }
        });

        for (const j of activeJadwals) {
          const tglStr = new Date(j.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });

          notifications.push({
            id: `jadwal-${j.id}`,
            type: "posyandu",
            title: `Jadwal: ${j.namaKegiatan}`,
            description: `Kegiatan di ${j.lokasi} (${tglStr} pukul ${j.waktu}). Status: ${j.status}.`,
            time: new Date(j.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=jadwal",
            badgeColor: "text-teal-600 bg-teal-50 border-teal-200",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn("Notification error jadwal query:", err);
      }

      // D. Pencatatan Layanan Kesehatan Terbaru
      try {
        const recentRecords = await prisma.posyanduRecord.findMany({
          where: {
            tenantId,
            ...(rwFilter ? {
              OR: [
                { balita: { rw: rwFilter } },
                { ibuHamil: { rw: rwFilter } },
                { lansia: { rw: rwFilter } }
              ]
            } : {})
          },
          take: 3,
          orderBy: { tanggal: "desc" },
          include: {
            balita: { select: { namaLengkap: true, rw: true } },
            ibuHamil: { select: { namaLengkap: true, rw: true } },
            lansia: { select: { namaLengkap: true, rw: true } }
          }
        });

        for (const r of recentRecords) {
          const nama = r.balita?.namaLengkap || r.ibuHamil?.namaLengkap || r.lansia?.namaLengkap || "Peserta";
          const tipe = r.balita ? "Balita" : r.ibuHamil ? "Ibu Hamil" : "Lansia";
          const status = r.statusGizi || r.statusRisiko || r.kondisiUmum || "Normal";

          notifications.push({
            id: `record-${r.id}`,
            type: "posyandu",
            title: `Layanan ${tipe} Tercatat`,
            description: `Pemeriksaan ${nama} berhasil disimpan (${status}).`,
            time: new Date(r.tanggal).toISOString(),
            read: false,
            actionUrl: r.balita ? "/dashboard?tab=layanan-balita" : r.ibuHamil ? "/dashboard?tab=layanan-ibuhamil" : "/dashboard?tab=layanan-lansia",
            badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
            priority: "low"
          });
        }
      } catch (err) {
        console.warn("Notification error recent records query:", err);
      }

      // E. Inventaris & Alat Antropometri Rusak
      try {
        const brokenInventories = await prisma.posyanduInventory.findMany({
          where: {
            tenantId,
            kondisi: { not: "BAIK" }
          },
          take: 3,
          orderBy: { updatedAt: "desc" }
        });

        for (const inv of brokenInventories) {
          notifications.push({
            id: `inv-${inv.id}`,
            type: "posyandu",
            title: `Peringatan Aset: ${inv.namaBarang}`,
            description: `Alat di ${inv.posyanduName} berstatus ${inv.kondisi.replace(/_/g, " ")}. Perlu kalibrasi / penggantian.`,
            time: new Date(inv.updatedAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=posyandu-inventaris",
            badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn("Notification error inventory query:", err);
      }
    }

    // 2. Administrasi Desa / Layanan Publik (Untuk role selain Posyandu murni)
    if (role !== "POSYANDU") {
      try {
        const pendingSurat = await prisma.surat.findMany({
          where: { tenantId, status: "TERTUNDA" },
          take: 4,
          orderBy: { createdAt: "desc" }
        });

        for (const s of pendingSurat) {
          notifications.push({
            id: `surat-${s.id}`,
            type: "surat",
            title: "Permohonan Surat Perlu Verifikasi",
            description: `Permohonan ${s.jenisSurat || s.nomorSurat || "Surat"} menunggu proses persetujuan.`,
            time: new Date(s.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard/surat",
            badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
            priority: "high"
          });
        }
      } catch (err) {
        console.warn("Notification error surat query:", err);
      }

      try {
        const pendingComplaints = await prisma.rtComplaint.findMany({
          where: { tenantId, status: "PENDING" },
          take: 4,
          orderBy: { createdAt: "desc" }
        });

        for (const c of pendingComplaints) {
          notifications.push({
            id: `complaint-${c.id}`,
            type: "pengaduan",
            title: "Laporan Pengaduan Warga",
            description: `Pengaduan warga RT ${c.rt || "-"}/RW ${c.rw || "-"}: "${c.title}" menunggu tindak lanjut.`,
            time: new Date(c.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard/layanan/pengaduan",
            badgeColor: "text-rose-600 bg-rose-50 border-rose-200",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn("Notification error complaint query:", err);
      }
    }

    // Sort by latest time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return notifications;
  } catch (error) {
    console.error("Failed to retrieve live notifications:", error);
    return [];
  }
}

