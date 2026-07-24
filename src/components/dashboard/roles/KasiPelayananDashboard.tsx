import { useSearchParams } from "next/navigation";
import { DashboardUtama } from "../kasi-pelayanan/DashboardUtama";
import { AntrianLoket } from "../kasi-pelayanan/AntrianLoket";
import { PusatPersuratan } from "../kasi-pelayanan/PusatPersuratan";
import { ManajemenKependudukan } from "../kasi-pelayanan/ManajemenKependudukan";
import { TrackingLayanan } from "../kasi-pelayanan/TrackingLayanan";
import { LayananUmum } from "../kasi-pelayanan/LayananUmum";
import { LaporanPosyandu } from "../kasi-pelayanan/LaporanPosyandu";
import { LaporanKarangTaruna } from "../kasi-pelayanan/LaporanKarangTaruna";
import { LaporanKegiatan } from "../kasi-pelayanan/LaporanKegiatan";

export function KasiPelayananDashboard({ session, stats }: { session: any, stats: any }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : "overview";

  // Rute berdasarkan tab
  if (tabParam === "antrian-loket") {
    return <AntrianLoket session={session} />;
  }
  
  if (["buat-surat", "surat-masuk", "surat-keluar"].includes(tabParam || "")) {
    return <PusatPersuratan session={session} tab={tabParam || "buat-surat"} />;
  }

  if (tabParam === "kependudukan") {
    return <ManajemenKependudukan session={session} />;
  }

  if (tabParam === "tracking-layanan") {
    return <TrackingLayanan session={session} />;
  }

  if (["buku-tamu", "reporting", "tte"].includes(tabParam || "")) {
    return <LayananUmum session={session} tab={tabParam || "buku-tamu"} />;
  }

  if ((tabParam || "").startsWith("posyandu-")) {
    return <LaporanPosyandu session={session} posyanduId={tabParam || "posyandu-mawar-1"} />;
  }

  if (tabParam === "karang-taruna") {
    return <LaporanKarangTaruna session={session} />;
  }

  if (tabParam === "laporan-kegiatan") {
    return <LaporanKegiatan session={session} />;
  }

  // Default fallback (overview)
  return <DashboardUtama session={session} stats={stats} />;
}
