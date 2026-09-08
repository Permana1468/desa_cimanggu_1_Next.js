"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Printer, 
  Edit2, 
  FileText, 
  X, 
  PieChart, 
  Banknote, 
  Building2, 
  TrendingUp, 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Download,
  AlertCircle
} from "lucide-react";
import { ApbdesTotalTab } from "./ApbdesTotalTab";
import { RkkdAddSection } from "./RkkdAddSection";
import { RkkdDdSection } from "./RkkdDdSection";
import { RkkdBhprdSection } from "./RkkdBhprdSection";
import { RkkdBankeuSection } from "./RkkdBankeuSection";

export type RkkdSubFeature = "apbdes" | "rkkd-add" | "rkkd-dd" | "rkkd-bhprd" | "rkkd-bankeu";

interface RkkdActivityItem {
  id: string;
  kodeKegiatan: string;
  bidang: string;
  namaKegiatan: string;
  lokasi: string;
  volume: string;
  sumberDana: "ADD" | "DD" | "BHPRD" | "BANKEU" | "PADes" | "DLL";
  paguAnggaran: number;
  realisasi: number;
  status: "DRAFT" | "TERVERIFIKASI" | "BERJALAN" | "SELESAI";
  pelaksana: string;
}

const initialActivities: RkkdActivityItem[] = [
  {
    id: "act-1",
    kodeKegiatan: "02.01.01",
    bidang: "Pelaksanaan Pembangunan Desa",
    namaKegiatan: "Pengaspalan & Pengerasan Jalan Desa Kp. Jatake RT 03/07",
    lokasi: "Dusun 2 Kp. Jatake",
    volume: "450 m x 3 m",
    sumberDana: "BANKEU",
    paguAnggaran: 150000000,
    realisasi: 150000000,
    status: "SELESAI",
    pelaksana: "TPK Pembangunan Desa"
  },
  {
    id: "act-2",
    kodeKegiatan: "02.02.03",
    bidang: "Pelaksanaan Pembangunan Desa",
    namaKegiatan: "Pembangunan Tembok Penahan Tanah (TPT) Kp. Cimanggu I",
    lokasi: "RT 01/02",
    volume: "120 m3",
    sumberDana: "DD",
    paguAnggaran: 85000000,
    realisasi: 42500000,
    status: "BERJALAN",
    pelaksana: "TPK Pembangunan Desa"
  },
  {
    id: "act-3",
    kodeKegiatan: "01.01.02",
    bidang: "Penyelenggaraan Pemerintahan Desa",
    namaKegiatan: "Penyediaan Penghasilan Tetap & Tunjangan Kepala Desa dan Perangkat",
    lokasi: "Kantor Desa Cimanggu I",
    volume: "12 Bulan",
    sumberDana: "ADD",
    paguAnggaran: 320000000,
    realisasi: 160000000,
    status: "BERJALAN",
    pelaksana: "Kaur TU & Umum"
  },
  {
    id: "act-4",
    kodeKegiatan: "03.01.04",
    bidang: "Pembinaan Kemasyarakatan Desa",
    namaKegiatan: "Dukungan Penyelenggaraan Posyandu & Pemberdayaan Kader Kesehatan",
    lokasi: "12 Posyandu Se-Desa",
    volume: "1 Tahun",
    sumberDana: "BHPRD",
    paguAnggaran: 45000000,
    realisasi: 22500000,
    status: "BERJALAN",
    pelaksana: "Kasi Kesejahteraan"
  },
  {
    id: "act-5",
    kodeKegiatan: "04.02.01",
    bidang: "Pemberdayaan Masyarakat Desa",
    namaKegiatan: "Pelatihan & Penyertaan Modal BUMDes Cimanggu Mandiri",
    lokasi: "Gedung Serbaguna",
    volume: "1 Paket",
    sumberDana: "DD",
    paguAnggaran: 60000000,
    realisasi: 60000000,
    status: "SELESAI",
    pelaksana: "Direktur BUMDes"
  },
  {
    id: "act-6",
    kodeKegiatan: "02.03.02",
    bidang: "Pelaksanaan Pembangunan Desa",
    namaKegiatan: "Rehabilitasi Drainase Pemukiman Warga RW 04",
    lokasi: "RW 04 Kp. Serab",
    volume: "200 m",
    sumberDana: "ADD",
    paguAnggaran: 40000000,
    realisasi: 0,
    status: "TERVERIFIKASI",
    pelaksana: "TPK Pembangunan Desa"
  }
];

export function CyberPlanRkkdTab({ 
  defaultTab = "apbdes", 
  onBack 
}: { 
  defaultTab?: RkkdSubFeature; 
  onBack?: () => void 
}) {
  const [activeSubTab, setActiveSubTab] = useState<RkkdSubFeature>(defaultTab);
  const [activities, setActivities] = useState<RkkdActivityItem[]>(initialActivities);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new activity
  const [formData, setFormData] = useState<Partial<RkkdActivityItem>>({
    kodeKegiatan: "",
    bidang: "Pelaksanaan Pembangunan Desa",
    namaKegiatan: "",
    lokasi: "",
    volume: "",
    sumberDana: activeSubTab === "apbdes" ? "DD" : (activeSubTab.replace("rkkd-", "").toUpperCase() as any),
    paguAnggaran: 0,
    realisasi: 0,
    status: "DRAFT",
    pelaksana: "TPK Pembangunan Desa"
  });

  const getFilteredActivities = () => {
    return activities.filter((act) => {
      // Filter by sub-tab category
      if (activeSubTab === "rkkd-add" && act.sumberDana !== "ADD") return false;
      if (activeSubTab === "rkkd-dd" && act.sumberDana !== "DD") return false;
      if (activeSubTab === "rkkd-bhprd" && act.sumberDana !== "BHPRD") return false;
      if (activeSubTab === "rkkd-bankeu" && act.sumberDana !== "BANKEU") return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = act.namaKegiatan.toLowerCase().includes(query);
        const matchKode = act.kodeKegiatan.toLowerCase().includes(query);
        const matchLokasi = act.lokasi.toLowerCase().includes(query);
        if (!matchName && !matchKode && !matchLokasi) return false;
      }

      // Filter by status
      if (statusFilter !== "ALL" && act.status !== statusFilter) return false;

      return true;
    });
  };

  const filteredList = getFilteredActivities();

  // Summary Metrics
  const totalPagu = filteredList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasi = filteredList.reduce((acc, curr) => acc + curr.realisasi, 0);
  const percentageRealisasi = totalPagu > 0 ? ((totalRealisasi / totalPagu) * 100).toFixed(1) : "0";

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.paguAnggaran) return;

    const newItem: RkkdActivityItem = {
      id: `act-${Date.now()}`,
      kodeKegiatan: formData.kodeKegiatan || `02.0${activities.length + 1}.01`,
      bidang: formData.bidang || "Pelaksanaan Pembangunan Desa",
      namaKegiatan: formData.namaKegiatan,
      lokasi: formData.lokasi || "Desa Cimanggu I",
      volume: formData.volume || "1 Paket",
      sumberDana: formData.sumberDana || "DD",
      paguAnggaran: Number(formData.paguAnggaran) || 0,
      realisasi: Number(formData.realisasi) || 0,
      status: (formData.status as any) || "DRAFT",
      pelaksana: formData.pelaksana || "TPK Pembangunan Desa"
    };

    setActivities([newItem, ...activities]);
    setIsAddModalOpen(false);
    setFormData({
      kodeKegiatan: "",
      bidang: "Pelaksanaan Pembangunan Desa",
      namaKegiatan: "",
      lokasi: "",
      volume: "",
      sumberDana: "DD",
      paguAnggaran: 0,
      realisasi: 0,
      status: "DRAFT",
      pelaksana: "TPK Pembangunan Desa"
    });
  };

  const handleDeleteActivity = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kegiatan RKP ini?")) {
      setActivities(activities.filter(a => a.id !== id));
    }
  };

  const subTabInfo = {
    "apbdes": {
      title: "Ringkasan APBDes 2026",
      subtitle: "Konsolidasi Seluruh Sumber Anggaran Pendapatan & Belanja Desa",
      badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      accentBg: "from-amber-500/20 to-yellow-600/10"
    },
    "rkkd-add": {
      title: "RKKD - Alokasi Dana Desa (ADD)",
      subtitle: "Rencana Kerja Kegiatan Desa Bersumber dari Dana Alokasi Kabupaten",
      badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      accentBg: "from-blue-500/20 to-indigo-600/10"
    },
    "rkkd-dd": {
      title: "RKKD - Dana Desa (DD Transfer APBN)",
      subtitle: "Rencana Kerja Kegiatan Desa Bersumber dari Dana APBN Pusat",
      badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      accentBg: "from-emerald-500/20 to-teal-600/10"
    },
    "rkkd-bhprd": {
      title: "RKKD - Bagi Hasil Pajak & Retribusi (BHPRD)",
      subtitle: "Rencana Kerja Kegiatan Desa Bersumber dari Bagi Hasil Pajak Daerah",
      badgeBg: "bg-purple-500/10 text-purple-600 border-purple-500/30",
      accentBg: "from-purple-500/20 to-violet-600/10"
    },
    "rkkd-bankeu": {
      title: "RKKD - Bantuan Keuangan (BANKEU)",
      subtitle: "Rencana Kerja Kegiatan Desa Bersumber dari Bantuan Keuangan Kabupaten/Provinsi",
      badgeBg: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
      accentBg: "from-cyan-500/20 to-sky-600/10"
    }
  };

  const currentInfo = subTabInfo[activeSubTab];

  return (
    <div className="space-y-6 pb-20">
      {/* TOP NAVIGATION / HEADER BAR */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
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
                <span>MODUL RKP DESA 2026</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                {currentInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
            >
              <Plus size={16} />
              <span>Tambah Kegiatan RKP</span>
            </button>
          </div>
        </div>

        {/* 5 SUB-FEATURE TABS (APBDes, RKKD ADD, RKKD DD, RKKD BHPRD, RKKD BANKEU) */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {[
            { id: "apbdes", label: "1. APBDes (Total)", icon: PieChart },
            { id: "rkkd-add", label: "2. RKKD ADD", icon: Banknote },
            { id: "rkkd-dd", label: "3. RKKD DD", icon: Building2 },
            { id: "rkkd-bhprd", label: "4. RKKD BHPRD", icon: Layers },
            { id: "rkkd-bankeu", label: "5. RKKD BANKEU", icon: TrendingUp },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as RkkdSubFeature)}
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

      {/* CONTENT BASED ON SUB-TAB: APBDES VS RKKD SPECIFIC TABS */}
      {activeSubTab === "apbdes" ? (
        <ApbdesTotalTab rkkdActivities={activities} onNavigateToRkkd={(subTab) => setActiveSubTab(subTab as any)} />
      ) : activeSubTab === "rkkd-add" ? (
        <RkkdAddSection />
      ) : activeSubTab === "rkkd-dd" ? (
        <RkkdDdSection />
      ) : activeSubTab === "rkkd-bhprd" ? (
        <RkkdBhprdSection />
      ) : (
        <RkkdBankeuSection />
      )}
    </div>
  );
}
