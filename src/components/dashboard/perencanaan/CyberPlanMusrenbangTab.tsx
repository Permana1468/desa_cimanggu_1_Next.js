"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Printer, 
  FileText, 
  X, 
  Users, 
  Building2, 
  Mail, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Send,
  UserCheck
} from "lucide-react";

import { UndanganMuslingRw } from "./UndanganMuslingRw";
import { SafePrintPortal } from "./SafePrintPortal";

export type MusrenbangSubFeature = "undangan-musrenbang" | "musling-rw" | "musling-kadus";

interface UndanganItem {
  id: string;
  noSurat: string;
  perihal: string;
  tanggalKegiatan: string;
  waktu: string;
  tempat: string;
  sasaranPeserta: string;
  status: "DRAFT" | "TERKIRIM" | "SELESAI";
}

interface MuslingProposal {
  id: string;
  tingkat: "RW" | "KADUS";
  wilayah: string; // e.g. "RW 03 Kp. Jatake" or "Dusun 2"
  namaKegiatan: string;
  lokasiDetail: string;
  volume: string;
  estimasiBiaya: number;
  prioritasKe: number;
  pengusul: string;
  status: "USULAN" | "TERVERIFIKASI" | "MASUK_RKP" | "DITOLAK";
}

const initialUndanganList: UndanganItem[] = [
  {
    id: "und-1",
    noSurat: "005/012/Pem-Cmg/2026",
    perihal: "Undangan Musrenbang Desa Tahun Anggaran 2027",
    tanggalKegiatan: "2026-08-20",
    waktu: "08:30 WIB",
    tempat: "Aula Utama Kantor Desa Cimanggu I",
    sasaranPeserta: "BPD, LPM, RT/RW, Tokoh Masyarakat & Kader",
    status: "TERKIRIM"
  },
  {
    id: "und-2",
    noSurat: "005/008/Pem-Cmg/2026",
    perihal: "Undangan Musyawarah Lingkungan (Musling) Tingkat RW",
    tanggalKegiatan: "2026-08-15",
    waktu: "19:30 WIB",
    tempat: "Posyandu Mawar RW 04 Kp. Serab",
    sasaranPeserta: "Warga RW 04 & Tokoh Pemuda",
    status: "SELESAI"
  }
];

const initialProposals: MuslingProposal[] = [
  {
    id: "mus-1",
    tingkat: "RW",
    wilayah: "RW 03 Kp. Jatake",
    namaKegiatan: "Pengaspalan & Pengerasan Jalan Lingkungan Warga",
    lokasiDetail: "RT 01 & RT 02 / RW 03",
    volume: "450 m x 3 m",
    estimasiBiaya: 150000000,
    prioritasKe: 1,
    pengusul: "Ketua RW 03",
    status: "MASUK_RKP"
  },
  {
    id: "mus-2",
    tingkat: "RW",
    wilayah: "RW 04 Kp. Serab",
    namaKegiatan: "Pembangunan Pos Kamling & Pemasangan Penerangan Jalan (PJU)",
    lokasiDetail: "RT 01 / RW 04",
    volume: "1 Unit & 10 Titik PJU",
    estimasiBiaya: 35000000,
    prioritasKe: 2,
    pengusul: "Ketua RW 04",
    status: "USULAN"
  },
  {
    id: "mus-3",
    tingkat: "KADUS",
    wilayah: "Dusun 1 (Kadus 1)",
    namaKegiatan: "Normalisasi & TPT Saluran Irigasi Tersier Sawah Warga",
    lokasiDetail: "Dusun 1 Blok Cikurutug",
    volume: "250 Meter",
    estimasiBiaya: 85000000,
    prioritasKe: 1,
    pengusul: "Kepala Dusun 1",
    status: "MASUK_RKP"
  },
  {
    id: "mus-4",
    tingkat: "KADUS",
    wilayah: "Dusun 2 (Kadus 2)",
    namaKegiatan: "Rehabilitasi Rumah Tidak Layak Huni (RTLH)",
    lokasiDetail: "RT 03 / RW 07",
    volume: "3 Unit Rumah",
    estimasiBiaya: 60000000,
    prioritasKe: 1,
    pengusul: "Kepala Dusun 2",
    status: "TERVERIFIKASI"
  }
];

export function CyberPlanMusrenbangTab({ 
  defaultTab = "undangan-musrenbang", 
  onBack 
}: { 
  defaultTab?: MusrenbangSubFeature; 
  onBack?: () => void 
}) {
  const [activeSubTab, setActiveSubTab] = useState<MusrenbangSubFeature>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveSubTab(defaultTab);
    }
  }, [defaultTab]);
  const [undanganList, setUndanganList] = useState<UndanganItem[]>(initialUndanganList);
  const [proposals, setProposals] = useState<MuslingProposal[]>(initialProposals);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Undangan
  const [undanganForm, setUndanganForm] = useState<Partial<UndanganItem>>({
    noSurat: "005/015/Pem-Cmg/2026",
    perihal: "Undangan Musrenbang Desa Cimanggu I",
    tanggalKegiatan: "2026-08-25",
    waktu: "09:00 WIB",
    tempat: "Aula Desa Cimanggu I",
    sasaranPeserta: "Pengurus RT/RW & Lembaga Desa",
    status: "DRAFT"
  });

  // Form State for Musling
  const [muslingForm, setMuslingForm] = useState<Partial<MuslingProposal>>({
    tingkat: activeSubTab === "musling-rw" ? "RW" : "KADUS",
    wilayah: activeSubTab === "musling-rw" ? "RW 01 Kp. Cimanggu" : "Dusun 1",
    namaKegiatan: "",
    lokasiDetail: "",
    volume: "1 Paket",
    estimasiBiaya: 0,
    prioritasKe: 1,
    pengusul: "Ketua RW",
    status: "USULAN"
  });

  const [selectedPrintUndangan, setSelectedPrintUndangan] = useState<UndanganItem | null>(initialUndanganList[0]);

  const handlePrintUndangan = (und: UndanganItem) => {
    setSelectedPrintUndangan(und);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCreateUndangan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!undanganForm.perihal) return;
    const newItem: UndanganItem = {
      id: `und-${Date.now()}`,
      noSurat: undanganForm.noSurat || "005/NEW/2026",
      perihal: undanganForm.perihal,
      tanggalKegiatan: undanganForm.tanggalKegiatan || "2026-08-25",
      waktu: undanganForm.waktu || "09:00 WIB",
      tempat: undanganForm.tempat || "Aula Desa",
      sasaranPeserta: undanganForm.sasaranPeserta || "Warga",
      status: "TERKIRIM"
    };
    setUndanganList([newItem, ...undanganList]);
    setIsAddModalOpen(false);
  };

  const handleCreateMusling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muslingForm.namaKegiatan) return;
    const newItem: MuslingProposal = {
      id: `mus-${Date.now()}`,
      tingkat: activeSubTab === "musling-rw" ? "RW" : "KADUS",
      wilayah: muslingForm.wilayah || "RW 01",
      namaKegiatan: muslingForm.namaKegiatan,
      lokasiDetail: muslingForm.lokasiDetail || "Desa Cimanggu I",
      volume: muslingForm.volume || "1 Paket",
      estimasiBiaya: Number(muslingForm.estimasiBiaya) || 0,
      prioritasKe: Number(muslingForm.prioritasKe) || 1,
      pengusul: muslingForm.pengusul || "Pengusul Warga",
      status: "USULAN"
    };
    setProposals([newItem, ...proposals]);
    setIsAddModalOpen(false);
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeSubTab === "musling-rw" && p.tingkat !== "RW") return false;
    if (activeSubTab === "musling-kadus" && p.tingkat !== "KADUS") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.namaKegiatan.toLowerCase().includes(q) || p.wilayah.toLowerCase().includes(q);
    }
    return true;
  });

  const subTabInfo = {
    "undangan-musrenbang": {
      title: "Surat & Agenda Undangan Musrenbang",
      subtitle: "Manajemen Penerbitan & Cetak Surat Undangan Musrenbang Desa F4",
      badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/30"
    },
    "musling-rw": {
      title: "Musling (Musyawarah Lingkungan) Tingkat RW",
      subtitle: "Kompilasi & Pemeringkatan Usulan Pembangunan Dari Tingkat RW (RW 01 - RW 12)",
      badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
    },
    "musling-kadus": {
      title: "Musling (Musyawarah Lingkungan) Tingkat Kadus",
      subtitle: "Kompilasi & Pemeringkatan Usulan Pembangunan Dari Kepala Dusun (Dusun 1, 2, 3)",
      badgeBg: "bg-purple-500/10 text-purple-600 border-purple-500/30"
    }
  };

  const currentInfo = subTabInfo[activeSubTab];

  if (activeSubTab === "musling-rw") {
    return <UndanganMuslingRw onBack={onBack} />;
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer min-w-[44px] min-h-[44px]"
                aria-label="Kembali"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                <Sparkles size={12} className="text-emerald-600" />
                <span>MODUL USULAN MUSRENBANG</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                {currentInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>{activeSubTab === "undangan-musrenbang" ? "Buat Undangan Baru" : "Tambah Usulan Musling"}</span>
          </button>
        </div>

        {/* 3 SUB-FEATURE TABS */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {[
            { id: "undangan-musrenbang", label: "1. UNDANGAN MUSRENBANG", icon: Mail },
            { id: "musling-rw", label: "2. MUSLING TINGKAT RW", icon: Building2 },
            { id: "musling-kadus", label: "3. MUSLING TINGKAT KADUS", icon: Users },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as MusrenbangSubFeature)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                <tab.icon size={15} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT BASED ON SUB-TAB */}
      {activeSubTab === "undangan-musrenbang" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {undanganList.map((und) => (
              <div key={und.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {und.noSurat}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {und.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{und.perihal}</h3>
                
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Tanggal: <strong className="text-slate-800">{und.tanggalKegiatan}</strong> ({und.waktu})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span>Tempat: <strong className="text-slate-800">{und.tempat}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-slate-400" />
                    <span>Peserta: <span className="text-slate-700">{und.sasaranPeserta}</span></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handlePrintUndangan(und)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Printer size={14} /> Cetak Undangan F4 (Cambria)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TABLE VIEW FOR MUSLING KADUS */
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari usulan Musling Kadus..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Prio #</th>
                  <th className="p-3.5">Wilayah</th>
                  <th className="p-3.5">Usulan Kegiatan</th>
                  <th className="p-3.5">Lokasi Detail & Vol</th>
                  <th className="p-3.5 text-right">Estimasi Biaya (Rp)</th>
                  <th className="p-3.5">Pengusul</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Belum ada data usulan untuk Musling Kadus.
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-black text-center text-emerald-700">
                        #{item.prioritasKe}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {item.wilayah}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 max-w-xs">
                        {item.namaKegiatan}
                      </td>
                      <td className="p-3.5">
                        <span className="block text-slate-700">{item.lokasiDetail}</span>
                        <span className="text-[11px] text-slate-400">{item.volume}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        Rp {item.estimasiBiaya.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {item.pengusul}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === "MASUK_RKP" ? "bg-emerald-100 text-emerald-800" :
                          item.status === "TERVERIFIKASI" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {activeSubTab === "undangan-musrenbang" ? "Buat Undangan Musrenbang Baru" : "Tambah Usulan Musling Kadus"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {activeSubTab === "undangan-musrenbang" ? (
              <form onSubmit={handleCreateUndangan} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Surat Undangan</label>
                  <input
                    type="text"
                    required
                    value={undanganForm.noSurat}
                    onChange={(e) => setUndanganForm({ ...undanganForm, noSurat: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perihal</label>
                  <input
                    type="text"
                    required
                    value={undanganForm.perihal}
                    onChange={(e) => setUndanganForm({ ...undanganForm, perihal: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Kegiatan</label>
                    <input
                      type="date"
                      value={undanganForm.tanggalKegiatan}
                      onChange={(e) => setUndanganForm({ ...undanganForm, tanggalKegiatan: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Waktu</label>
                    <input
                      type="text"
                      value={undanganForm.waktu}
                      onChange={(e) => setUndanganForm({ ...undanganForm, waktu: e.target.value })}
                      placeholder="09:00 WIB"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Musrenbang</label>
                  <input
                    type="text"
                    value={undanganForm.tempat}
                    onChange={(e) => setUndanganForm({ ...undanganForm, tempat: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Terbitkan Undangan
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateMusling} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wilayah (Dusun)</label>
                  <input
                    type="text"
                    required
                    value={muslingForm.wilayah}
                    onChange={(e) => setMuslingForm({ ...muslingForm, wilayah: e.target.value })}
                    placeholder="Contoh: Dusun 2"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Usulan Pembangunan</label>
                  <input
                    type="text"
                    required
                    value={muslingForm.namaKegiatan}
                    onChange={(e) => setMuslingForm({ ...muslingForm, namaKegiatan: e.target.value })}
                    placeholder="Contoh: Perbaikan PJU & Drainase"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimasi Biaya (Rp)</label>
                    <input
                      type="number"
                      required
                      value={muslingForm.estimasiBiaya || ""}
                      onChange={(e) => setMuslingForm({ ...muslingForm, estimasiBiaya: Number(e.target.value) })}
                      placeholder="50000000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Skala Prioritas Ke</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={muslingForm.prioritasKe}
                      onChange={(e) => setMuslingForm({ ...muslingForm, prioritasKe: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Simpan Usulan Musling
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PRINT PORTAL FOR UNDANGAN MUSRENBANG */}
      <SafePrintPortal portalId="undangan-musrenbang-print-mount-root">
        {selectedPrintUndangan && (
          <div
            id="undangan-musrenbang-print-portal"
            className="bg-white mx-auto shadow-2xl text-black font-serif relative"
            style={{
              width: "215.9mm",
              minHeight: "330.2mm",
              padding: "20mm 22mm",
              fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
              color: "#000",
              boxSizing: "border-box",
              fontSize: "12pt",
              lineHeight: "1.5"
            }}
          >
            {/* KOP SURAT RESMI DESA CIMANGGU I */}
            <div className="text-center font-bold text-black border-b-4 border-double border-black pb-3 mb-6">
              <div className="text-[13pt] uppercase tracking-wider font-bold">PEMERINTAH KABUPATEN BOGOR</div>
              <div className="text-[12pt] uppercase tracking-wider font-bold">KECAMATAN CIBUNGBULANG</div>
              <div className="text-[16pt] uppercase tracking-wide font-black mt-0.5">PEMERINTAH DESA CIMANGGU I</div>
              <div className="text-[10pt] font-normal italic font-sans text-slate-700 mt-1">
                Jl. Raya Cimanggu No. 01 Kec. Cibungbulang Kab. Bogor Kode Pos 16630
              </div>
            </div>

            {/* METADATA SURAT */}
            <div className="grid grid-cols-12 gap-2 text-[11pt] mb-6">
              <div className="col-span-6 space-y-0.5">
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <div>Nomor</div><div>:</div><div className="font-mono font-bold">{selectedPrintUndangan.noSurat}</div>
                </div>
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <div>Sifat</div><div>:</div><div>Penting</div>
                </div>
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <div>Lampiran</div><div>:</div><div>1 (Satu) Lembar</div>
                </div>
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <div>Perihal</div><div>:</div><div className="font-bold underline">{selectedPrintUndangan.perihal}</div>
                </div>
              </div>

              <div className="col-span-6 pl-6 space-y-0.5">
                <div>Cimanggu I, {selectedPrintUndangan.tanggalKegiatan}</div>
                <div className="mt-2">Kepada Yth,</div>
                <div className="font-bold">{selectedPrintUndangan.sasaranPeserta}</div>
                <div>di -</div>
                <div className="pl-6 underline">Tempat</div>
              </div>
            </div>

            {/* SALAM OPENING */}
            <div className="mb-4 text-[11.5pt] font-bold">
              Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,
            </div>

            {/* PARAGRAF PEMBUKA */}
            <div className="mb-4 text-[11.5pt] text-justify leading-relaxed">
              Dengan mengharap rahmat dan ridho Allah SWT, kami Pemerintah Desa Cimanggu I mengundang Bapak/Ibu/Saudara/i Pengurus Lembaga Desa & Tokoh Masyarakat untuk dapat hadir dalam <strong>{selectedPrintUndangan.perihal}</strong>, yang insya Allah akan dilaksanakan pada:
            </div>

            {/* RINCIAN ACARA */}
            <div className="my-6 pl-8 text-[11.5pt] space-y-2 border-l-2 border-slate-300 py-1">
              <div className="grid grid-cols-[110px_15px_1fr]">
                <div>Hari / Tanggal</div><div>:</div><div className="font-bold">{selectedPrintUndangan.tanggalKegiatan}</div>
              </div>
              <div className="grid grid-cols-[110px_15px_1fr]">
                <div>Waktu</div><div>:</div><div className="font-bold">{selectedPrintUndangan.waktu}</div>
              </div>
              <div className="grid grid-cols-[110px_15px_1fr]">
                <div>Tempat</div><div>:</div><div className="font-bold">{selectedPrintUndangan.tempat}</div>
              </div>
              <div className="grid grid-cols-[110px_15px_1fr]">
                <div>Acara</div><div>:</div><div className="font-bold">{selectedPrintUndangan.perihal}</div>
              </div>
            </div>

            {/* PARAGRAF PENUTUP */}
            <div className="mb-8 text-[11.5pt] text-justify leading-relaxed">
              Mengingat pentingnya acara ini demi kemajuan dan perencanaan pembangunan Desa Cimanggu I, kehadiran Bapak/Ibu/Saudara/i tepat pada waktunya sangat kami harapkan.
            </div>
            <div className="mb-10 text-[11.5pt]">
              Demikian surat undangan ini kami sampaikan. Atas perhatian, kerja sama, dan kehadirannya kami ucapkan terima kasih.
            </div>

            {/* SALAM PENUTUP & TTD KEPALA DESA */}
            <div className="mb-4 text-[11.5pt] font-bold">
              Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.
            </div>

            <div className="mt-12 flex justify-end text-[11.5pt]">
              <div className="text-center w-[250px]">
                <div>Kepala Desa Cimanggu I</div>
                <div className="h-24"></div>
                <div className="font-bold underline uppercase tracking-wide text-[12pt]">
                  H. AHMAD BAEHAKI
                </div>
              </div>
            </div>
          </div>
        )}
      </SafePrintPortal>

      {/* CSS PRINT STYLES FOR UNDANGAN MUSRENBANG */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #undangan-musrenbang-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #undangan-musrenbang-print-mount-root {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #undangan-musrenbang-print-portal {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 330.2mm !important;
            margin: 0 auto !important;
            padding: 20mm 22mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #undangan-musrenbang-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #undangan-musrenbang-print-portal .grid {
            display: grid !important;
          }

          #undangan-musrenbang-print-portal .flex {
            display: flex !important;
          }

          @page {
            size: 215.9mm 330.2mm portrait; /* F4 Paper */
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
