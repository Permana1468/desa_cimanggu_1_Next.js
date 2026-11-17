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

    // ==========================================
    // 1. PUSKESOS NOTIFICATIONS (Khusus SLRT, Aduan Sosial, UHC, Buku Tamu)
    // ==========================================
    if (role === "PUSKESOS") {
      // A. Pengaduan Sosial Masuk / Menunggu Tindak Lanjut
      try {
        const pendingAduan = await prisma.puskesosPengaduan.findMany({
          where: {
            tenantId,
            status: { in: ["MENUNGGU", "DIPROSES"] }
          },
          take: 4,
          orderBy: { tanggalMasuk: "desc" },
          include: {
            warga: { select: { namaLengkap: true, nik: true, rw: true } }
          }
        });

        for (const a of pendingAduan) {
          notifications.push({
            id: `puskesos-aduan-${a.id}`,
            type: "pengaduan",
            title: `Aduan ${a.jenisPengaduan}: ${a.warga?.namaLengkap || "Warga"}`,
            description: `${a.deskripsi.substring(0, 80)}${a.deskripsi.length > 80 ? "..." : ""} (Status: ${a.status}).`,
            time: new Date(a.tanggalMasuk).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=pengaduan",
            badgeColor: a.status === "MENUNGGU" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-blue-600 bg-blue-50 border-blue-200",
            priority: "high"
          });
        }
      } catch (err) {
        console.warn("Notification error puskesos aduan:", err);
      }

      // B. Rujukan SLRT yang Belum Selesai (Draft / Butuh Dikirim)
      try {
        const activeRujukan = await prisma.puskesosRujukan.findMany({
          where: {
            tenantId,
            status: { in: ["DRAFT", "DICETAK", "DIKIRIM"] }
          },
          take: 3,
          orderBy: { tanggal: "desc" },
          include: {
            warga: { select: { namaLengkap: true } }
          }
        });

        for (const r of activeRujukan) {
          notifications.push({
            id: `puskesos-rujukan-${r.id}`,
            type: "pengaduan",
            title: `Rujukan SLRT: ${r.instansiTujuan}`,
            description: `No. ${r.nomorSuratRujukan} untuk ${r.warga?.namaLengkap || "Warga"} (${r.status}).`,
            time: new Date(r.tanggal).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=rujukan",
            badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn("Notification error puskesos rujukan:", err);
      }

      // C. Usulan UHC / BPJS PBI Masuk
      try {
        const recentUhc = await prisma.kesraUsulanUhc.findMany({
          where: { tenantId },
          take: 3,
          orderBy: { createdAt: "desc" }
        });

        for (const u of recentUhc) {
          notifications.push({
            id: `puskesos-uhc-${u.id}`,
            type: "info",
            title: `Usulan UHC: ${u.namaPasien}`,
            description: `Pengajuan oleh ${u.namaPemohon} (Status: ${u.statusTracking}, Hasil: ${u.hasilVerifikasi}).`,
            time: new Date(u.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=uhc",
            badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
            priority: "high"
          });
        }
      } catch (err) {
        console.warn("Notification error puskesos uhc:", err);
      }

      // D. Buku Tamu / Kunjungan Warga Terbaru
      try {
        const recentTamu = await prisma.puskesosBukuTamu.findMany({
          where: { tenantId },
          take: 3,
          orderBy: { createdAt: "desc" }
        });

        for (const t of recentTamu) {
          notifications.push({
            id: `puskesos-tamu-${t.id}`,
            type: "info",
            title: `Tamu Puskesos: ${t.namaLengkap}`,
            description: `Keperluan: "${t.keperluan}" (${t.alamat}).`,
            time: new Date(t.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard/puskesos/buku-tamu",
            badgeColor: "text-purple-600 bg-purple-50 border-purple-200",
            priority: "low"
          });
        }
      } catch (err) {
        console.warn("Notification error puskesos buku tamu:", err);
      }

      // E. Agenda Penjangkauan PPKS
      try {
        const recentKegiatan = await prisma.puskesosKegiatan.findMany({
          where: { tenantId, status: { in: ["RENCANA", "BERJALAN"] } },
          take: 2,
          orderBy: { tanggal: "asc" }
        });

        for (const k of recentKegiatan) {
          notifications.push({
            id: `puskesos-kegiatan-${k.id}`,
            type: "info",
            title: `Agenda PPKS: ${k.namaKegiatan}`,
            description: `Kegiatan ${k.jenisKegiatan} di ${k.lokasi} (${new Date(k.tanggal).toLocaleDateString("id-ID")}).`,
            time: new Date(k.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=ppks",
            badgeColor: "text-teal-600 bg-teal-50 border-teal-200",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn("Notification error puskesos kegiatan:", err);
      }

      notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return notifications;
    }

    // 2. Posyandu Realtime Events (For POSYANDU cadres, as well as KADES, ADMIN, KASI_KESEJAHTERAAN)
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

      // F. Transaksi Anggaran & PMT Terbaru
      try {
        const recentAnggarans = await prisma.posyanduAnggaran.findMany({
          where: { tenantId },
          take: 3,
          orderBy: { createdAt: "desc" }
        });

        for (const a of recentAnggarans) {
          const nominalStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(a.jumlah);
          notifications.push({
            id: `anggaran-${a.id}`,
            type: "posyandu",
            title: `Dana ${a.jenisDana}: ${a.tipe === "PEMASUKAN" ? "Penerimaan" : "Penyaluran"}`,
            description: `${nominalStr} (${a.posyanduName}) - ${a.keterangan || "Pencatatan dana posyandu"}.`,
            time: new Date(a.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=pmt",
            badgeColor: a.tipe === "PEMASUKAN" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200",
            priority: "low"
          });
        }
      } catch (err) {
        console.warn("Notification error anggaran query:", err);
      }

      // G. Catatan Absensi Petugas & Kader Posyandu
      try {
        const recentAbsensi = await prisma.posyanduAbsensi.findMany({
          where: { tenantId },
          take: 3,
          orderBy: { createdAt: "desc" }
        });

        for (const abs of recentAbsensi) {
          notifications.push({
            id: `absensi-${abs.id}`,
            type: "posyandu",
            title: `Kehadiran: ${abs.namaKader}`,
            description: `Status: ${abs.status} (${abs.peran.replace(/_/g, " ")}) di ${abs.posyanduName}.`,
            time: new Date(abs.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=posyandu-jadwal",
            badgeColor: abs.status === "HADIR" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200",
            priority: "low"
          });
        }
      } catch (err) {
        console.warn("Notification error absensi query:", err);
      }

      // Isolasi murni: Kader Posyandu selesai di sini, tidak dicampur surat desa
      if (role === "POSYANDU") {
        notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        return notifications;
      }
    }

    // ==========================================
    // 3. RT & RW NOTIFICATIONS (Wilayah spesifik)
    // ==========================================
    if (role === "RT" || role === "RW") {
      const userRt = user.rt ? String(user.rt).trim() : null;
      const userRw = user.rw ? String(user.rw).trim() : null;

      try {
        const whereClause: any = { tenantId, status: "PENDING" };
        if (role === "RT" && userRt) whereClause.rt = userRt;
        if (role === "RW" && userRw) whereClause.rw = userRw;

        const complaints = await prisma.rtComplaint.findMany({
          where: whereClause,
          take: 5,
          orderBy: { createdAt: "desc" }
        });

        for (const c of complaints) {
          notifications.push({
            id: `rt-complaint-${c.id}`,
            type: "pengaduan",
            title: `Pengaduan Warga RT ${c.rt || "-"}/RW ${c.rw || "-"}`,
            description: `"${c.title}": ${c.content ? c.content.substring(0, 75) + "..." : "Menunggu respon pengurus lingkungan."}`,
            time: new Date(c.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=complaints",
            badgeColor: "text-rose-600 bg-rose-50 border-rose-200",
            priority: "high"
          });
        }
      } catch (err) {
        console.warn("Notification error RT/RW complaints:", err);
      }

      try {
        const recentWarga = await prisma.dataKependudukan.findMany({
          where: {
            tenantId,
            ...(role === "RT" && userRt ? { rt: userRt } : {}),
            ...(role === "RW" && userRw ? { rw: userRw } : {})
          },
          take: 3,
          orderBy: { createdAt: "desc" }
        });

        for (const w of recentWarga) {
          notifications.push({
            id: `rt-warga-${w.id}`,
            type: "info",
            title: `Pembaruan Warga: ${w.namaLengkap}`,
            description: `Data warga RT ${w.rt || "-"}/RW ${w.rw || "-"} tercatat di sistem sensus.`,
            time: new Date(w.createdAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=warga",
            badgeColor: "text-blue-600 bg-blue-50 border-blue-200",
            priority: "low"
          });
        }
      } catch (err) {
        console.warn("Notification error RT/RW warga:", err);
      }

      notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return notifications;
    }

    // ==========================================
    // 4. KEUANGAN / BENDAHARA (Anggaran & Kas Desa)
    // ==========================================
    if (role === "KAUR_KEUANGAN") {
      try {
        const pendingBansos = await prisma.kesraDtks.findMany({
          where: { tenantId, isFlagged: true },
          take: 3,
          orderBy: { updatedAt: "desc" }
        });

        for (const b of pendingBansos) {
          notifications.push({
            id: `keu-bansos-${b.id}`,
            type: "info",
            title: `Verifikasi Bansos: ${b.namaKepalaKeluarga}`,
            description: `Bantuan ${b.jenisBantuan} memerlukan verifikasi kelayakan anggaran.`,
            time: new Date(b.updatedAt).toISOString(),
            read: false,
            actionUrl: "/dashboard?tab=dtks",
            badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
            priority: "medium"
          });
        }
      } catch (err) {
        console.warn("Notification error keuangan:", err);
      }
    }

    // ==========================================
    // 5. PELAYANAN & PEMERINTAHAN UMUM / EKSEKUTIF
    // ==========================================
    if (["ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER", "KASI_PELAYANAN", "KAUR_TU", "OPERATOR_DESA", "PERANGKAT_DESA"].includes(role)) {
      try {
        const pendingSurat = await prisma.surat.findMany({
          where: { tenantId, status: "TERTUNDA" },
          take: 5,
          orderBy: { createdAt: "desc" }
        });

        for (const s of pendingSurat) {
          notifications.push({
            id: `surat-${s.id}`,
            type: "surat",
            title: "Permohonan Surat Perlu Verifikasi",
            description: `Permohonan ${s.jenisSurat || s.nomorSurat || "Surat"} menunggu proses persetujuan dan tanda tangan.`,
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
          take: 3,
          orderBy: { createdAt: "desc" }
        });

        for (const c of pendingComplaints) {
          notifications.push({
            id: `complaint-${c.id}`,
            type: "pengaduan",
            title: "Pengaduan Warga Desa",
            description: `Aduan RT ${c.rt || "-"}/RW ${c.rw || "-"}: "${c.title}" menunggu tindak lanjut desa.`,
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

