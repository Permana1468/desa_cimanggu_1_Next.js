"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Users, MapPin, FileText, AlertTriangle, HeartPulse, TrendingUp, Search, 
  CheckCircle2, ChevronRight, Banknote, Calendar, Plus, Trash2, ArrowUpRight, 
  ArrowDownRight, Check, X, FileSpreadsheet, Loader2, Sparkles, PlusCircle,
  FileDown, Info, Edit, Eye, UserPlus, Milestone, Megaphone, AlertCircle, Package,
  Compass, Share2, Clipboard, Activity, Layers, Maximize, Minimize,
  Fingerprint, Printer, Skull, LogOut, UserX,
  Home as HomeIcon, 
  User as LucideUser, 
  Users as LucideUsers, 
  Heart as HeartIcon, 
  GraduationCap, 
  Users2, 
  Globe, 
  Map as MapIcon, 
  ShieldCheck, 
  Activity as ActivityIcon
} from "lucide-react";
import { WARGA_FIELDS, DEFAULT_WARGA_FORM, isWargaDataIncomplete } from "@/lib/wargaSchema";
import { 
  getRtDashboardStats, getRtFinance, addRtFinanceTransaction, deleteRtFinanceTransaction,
  getRtActivities, addRtActivity, deleteRtActivity,
  getRtBirthReports, addRtBirthReport, deleteRtBirthReport,
  getRtDeathReports, addRtDeathReport, deleteRtDeathReport,
  getRtMoveReports, addRtMoveReport, deleteRtMoveReport,
  getRtIncomingReports, addRtIncomingReport, deleteRtIncomingReport,
  getRtAnnouncements, addRtAnnouncement, deleteRtAnnouncement,
  getRtComplaints, addRtComplaint, updateRtComplaintStatus, deleteRtComplaint,
  getRtInventories, addRtInventory, deleteRtInventory,
  getRtInventoryLoans, addRtInventoryLoan, returnRtInventoryLoan,
  getResidentKks, getSensusPoints, saveSensusPoint, deleteSensusPoint,
  getRtMapBoundary, saveRtMapBoundary, getRwDashboardStats, getRwMapBoundaries, getWilayahStrukturOptions, getFullVillageStructure,
  getRtDemographicReport
} from "@/actions/rt";
import { getRumahWargaList, addRumahWarga, updateRumahWarga, deleteRumahWarga, getKKWithoutRumah } from "@/actions/rumahWarga";
import { getWargaList, addWarga, updateWarga, deleteWarga, getSuratList, updateSuratStatus } from "@/actions/village";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { RwSecurityTab } from "../rw/RwSecurityTab";
import { RwHealthTab } from "../rw/RwHealthTab";
import { RwInstitutionsTab } from "../rw/RwInstitutionsTab";

export function WilayahDashboard({ session, stats: initialStats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace('_', ' ') || "Perangkat Wilayah";
  const userRt = (session?.user as any)?.rt;
  const userRw = (session?.user as any)?.rw;

  let displayTitle = `Dashboard ${roleName}`;
  if (roleName === "RT" && userRt && userRw) {
    displayTitle = `Dashboard RT ${userRt} / RW ${userRw}`;
  } else if (roleName === "RW" && userRw) {
    displayTitle = `Dashboard RW ${userRw}`;
  } else if (roleName === "KADUS" && userRw) {
    displayTitle = `Dashboard ${userRw}`;
  }

  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"overview" | "warga" | "rumah" | "finance" | "surat" | "kegiatan" | "lampid" | "announcements" | "complaints" | "inventory" | "geosensus" | "bansos" | "security" | "health" | "institutions">("overview");
  const [preFilledMutation, setPreFilledMutation] = useState<{ nik: string, namaLengkap: string, type: "mati" | "pindah" } | null>(null);

  useEffect(() => {
    if (tabParam && ["overview", "warga", "rumah", "finance", "surat", "kegiatan", "lampid", "announcements", "complaints", "inventory", "geosensus", "bansos", "security", "health", "institutions"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  
  // Realtime Stats State
  const [stats, setStats] = useState<any>({
    totalWarga: 0,
    totalKK: 0,
    totalKas: 0,
    pendingLetters: 0,
    births: 0,
    deaths: 0,
    moves: 0,
    incoming: 0
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [rtBreakdown, setRtBreakdown] = useState<any[]>([]);

  // Load stats
  const fetchStats = async () => {
    setLoadingStats(true);
    let data;
    if (session?.user?.role === "RW" || session?.user?.role === "KADUS") {
        const rwData = await getRwDashboardStats();
        if (rwData.success) {
            setRtBreakdown(rwData.rtBreakdown);
            let tWarga = 0, tKK = 0, tKas = 0;
            rwData.rtBreakdown.forEach((r: any) => {
                tWarga += r.totalWarga; tKK += r.totalKK; tKas += r.totalKas;
            });
            // Fetch normal stats to get pending letters and LAMPID
            data = await getRtDashboardStats();
            data.totalWarga = tWarga;
            data.totalKK = tKK;
            data.totalKas = tKas;
            setStats(data);
        }
    } else {
        data = await getRtDashboardStats();
        setStats(data);
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER CARD - PREMIUM TEAL GRADIENT */}
      {activeTab === "overview" && (
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-teal-900/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 text-white">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin size={14} /> Panel Wilayah RT/RW
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                      {displayTitle}
                  </h1>
                  <p className="text-teal-100 max-w-xl leading-relaxed">
                      Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Kelola administrasi warga, keuangan kas RT, persetujuan surat pengantar, dan laporan LAMPID.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-sm">
                          <Users size={14} className="text-teal-200" /> {stats.totalKK} Kepala Keluarga
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-sm">
                          <FileText size={14} className="text-teal-200" /> {stats.pendingLetters} Pengajuan Surat
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[150px] backdrop-blur-md">
                      <span className="block text-[10px] font-bold text-teal-100 mb-1 uppercase">{session?.user?.role === "RW" ? "Total Warga RW" : "Total Warga RT"}</span>
                      <span className="block text-3xl font-black text-white">{stats.totalWarga}</span>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[150px] backdrop-blur-md">
                      <span className="block text-[10px] font-bold text-teal-100 mb-1 uppercase font-black">{session?.user?.role === "RW" ? "Saldo Kas RW" : "Saldo Kas RT"}</span>
                      <span className="block text-xl font-black text-white">Rp {stats.totalKas.toLocaleString("id-ID")}</span>
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      <div className="mt-2">
        {activeTab === "overview" && <OverviewTab stats={stats} loading={loadingStats} session={session} rtBreakdown={rtBreakdown} />}
        {activeTab === "warga" && (
          <WargaTab 
            session={session} 
            onReportMutation={(nik: string, namaLengkap: string, type: "mati" | "pindah") => {
              setPreFilledMutation({ nik, namaLengkap, type });
              setActiveTab("lampid");
            }}
          />
        )}
        {activeTab === "rumah" && <RumahWargaTab session={session} />}
        {activeTab === "finance" && <FinanceTab session={session} />}
        {activeTab === "surat" && <SuratTab />}
        {activeTab === "kegiatan" && <KegiatanTab session={session} />}
        {activeTab === "lampid" && (
          <LampidTab 
            stats={stats} 
            preFilledMutation={preFilledMutation}
            clearPreFilledMutation={() => setPreFilledMutation(null)}
          />
        )}
        {activeTab === "announcements" && <AnnouncementsTab rt={userRt} rw={userRw} />}
        {activeTab === "complaints" && <ComplaintsTab rt={userRt} rw={userRw} />}
        {activeTab === "inventory" && <InventoryTab rt={userRt} rw={userRw} session={session} />}
        {activeTab === "geosensus" && <GeoSensusTab session={session} />}
        {activeTab === "bansos" && <BansosTab session={session} />}
        {activeTab === "security" && <RwSecurityTab session={session} />}
        {activeTab === "health" && <RwHealthTab session={session} />}
        {activeTab === "institutions" && <RwInstitutionsTab session={session} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
        active 
          ? "bg-teal-600 text-white shadow-lg shadow-teal-600/10" 
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ==========================================
// 1. OVERVIEW TAB
// ==========================================
function OverviewTab({ stats, loading, session, rtBreakdown }: { stats: any; loading: boolean; session?: any; rtBreakdown?: any[] }) {
  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-teal-600" size={40} />
        <p className="text-slate-500 text-xs font-bold">Memuat data statistik realtime...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* STATS TILES */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OverviewCard title="Lahir (Births)" value={stats.births} icon={HeartPulse} color="from-blue-500 to-indigo-600" />
          <OverviewCard title="Meninggal (Deaths)" value={stats.deaths} icon={AlertTriangle} color="from-rose-500 to-pink-600" />
          <OverviewCard title="Pindah (Moved)" value={stats.moves} icon={Milestone} color="from-amber-500 to-orange-600" />
          <OverviewCard title="Datang (Incoming)" value={stats.incoming} icon={Users} color="from-emerald-500 to-teal-600" />
        </div>

        {/* SUMMARY GRAPHIC */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
          <h3 className="text-base font-black text-slate-800 mb-6">Rekapan Administrasi Bulanan (LAMPID)</h3>
          <div className="space-y-4">
            <ProgressBar label="Lahir" count={stats.births} total={stats.births + stats.deaths + stats.moves + stats.incoming || 1} color="bg-blue-500" />
            <ProgressBar label="Mati" count={stats.deaths} total={stats.births + stats.deaths + stats.moves + stats.incoming || 1} color="bg-rose-500" />
            <ProgressBar label="Pindah" count={stats.moves} total={stats.births + stats.deaths + stats.moves + stats.incoming || 1} color="bg-amber-500" />
            <ProgressBar label="Datang" count={stats.incoming} total={stats.births + stats.deaths + stats.moves + stats.incoming || 1} color="bg-emerald-500" />
          </div>
        </div>
      </div>

      {session?.user?.role === "RW" && rtBreakdown && rtBreakdown.length > 0 && (
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm mt-2">
          <h3 className="text-base font-black text-slate-800 mb-6">Rekapitulasi RT di Wilayah RW {(session.user as any).rw}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="p-4">Nama RT</th>
                  <th className="p-4">Total Warga</th>
                  <th className="p-4">Total KK</th>
                  <th className="p-4">Saldo Kas</th>
                  <th className="p-4 text-right">Total Kegiatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rtBreakdown.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-black text-slate-800">RT {r.rt}</td>
                    <td className="p-4 font-bold text-slate-600">{r.totalWarga} Jiwa</td>
                    <td className="p-4 font-bold text-slate-600">{r.totalKK} Keluarga</td>
                    <td className="p-4 font-black text-emerald-600">Rp {r.totalKas.toLocaleString("id-ID")}</td>
                    <td className="p-4 font-bold text-slate-500 text-right">{r.totalActivities} Laporan</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK RULES/INFO */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-800">Panduan Tugas RT</h3>
          <ul className="space-y-3 text-xs text-slate-500 leading-relaxed font-semibold">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Lakukan pengecekan pengajuan surat pengantar secara berkala.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Segera catat mutasi warga (Lahir, Meninggal, Pindah, Datang) agar sensus real-time.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Transparansi kas keuangan RT dengan menginput pemasukan dan pengeluaran secara jujur.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mb-6" />
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{title}</span>
          <span className="block text-4xl font-black mt-2">{value}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-slate-700">
        <span>{label}</span>
        <span>{count} ({pct}%)</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ==========================================
// 2. DATA WARGA TAB
// ==========================================
function HoverMask({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  if (!value) return <span>-</span>;
  const getMasked = (val: string) => {
    if (val.length <= 6) return "*".repeat(val.length);
    return val.substring(0, 6) + "*".repeat(val.length - 6);
  };
  return (
    <span 
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
      className="cursor-pointer transition-all duration-200 hover:text-teal-600 select-all font-mono"
      title="Arahkan kursor atau klik untuk melihat lengkap"
    >
      {visible ? value : getMasked(value)}
    </span>
  );
}

function WargaTab({ session, onReportMutation }: { session?: any; onReportMutation: (nik: string, namaLengkap: string, type: "mati" | "pindah") => void }) {
  const [query, setQuery] = useState("");
  const [filterRt, setFilterRt] = useState("");
  const [filterRw, setFilterRw] = useState("");
  const [allowedRts, setAllowedRts] = useState<string[]>([]);
  const [allowedRws, setAllowedRws] = useState<{ name: string, rt: string[] }[]>([]);
  const [dusunName, setDusunName] = useState("");
  const [fullStructure, setFullStructure] = useState<{ dusun: { name: string, rw: { name: string, rt: string[] }[] }[] }>({ dusun: [] });
  const [wargaList, setWargaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterIncomplete, setFilterIncomplete] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  const [formData, setFormData] = useState({
    ...DEFAULT_WARGA_FORM
  });

  const loadWarga = async () => {
    setLoading(true);
    const data = await getWargaList(query, filterRt, filterRw);
    setWargaList(data);
    setLoading(false);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const [opts, structure] = await Promise.all([
        getWilayahStrukturOptions(),
        getFullVillageStructure()
      ]);
      if (opts.rtList) {
        setAllowedRts(opts.rtList);
      }
      if (opts.rwList) {
        setAllowedRws(opts.rwList);
      }
      if (opts.dusunName) {
        setDusunName(opts.dusunName);
      }
      if (structure?.dusun) {
        setFullStructure(structure);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    loadWarga();
  }, [filterRt, filterRw]);

  const handleRwChange = (val: string) => {
    setFilterRw(val);
    setFilterRt("");
  };

  const rtOptions = useMemo(() => {
    if (session?.user?.role === "RW") {
      return allowedRts;
    } else if (session?.user?.role === "KADUS") {
      if (!filterRw) return [];
      const rwObj = allowedRws.find(r => r.name === filterRw);
      return rwObj ? rwObj.rt : [];
    }
    return [];
  }, [session, filterRw, allowedRts, allowedRws]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadWarga();
  };

  const userRole = session?.user?.role;
  const userRt = session?.user?.rt || "";
  const userRw = session?.user?.rw || "";

  const handleOpenAdd = () => {
    setEditingId(null);
    // Auto-prefill rt/rw/dusun based on role
    const prefillRw = (userRole === "RT" || userRole === "RW") ? userRw : "";
    const prefillRt = userRole === "RT" ? userRt : "";
    // Resolve dusun from structure based on RW
    let prefillDusun = dusunName;
    if (userRole === "KADUS") prefillDusun = (session?.user as any)?.rw || "";
    setFormData({
      ...DEFAULT_WARGA_FORM,
      rt: prefillRt,
      rw: prefillRw,
      dusun: prefillDusun
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      nik: item.nik || "",
      noKK: item.noKK || "",
      namaLengkap: item.namaLengkap || "",
      tempatLahir: item.tempatLahir || "",
      tanggalLahir: item.tanggalLahir ? new Date(item.tanggalLahir).toISOString().split('T')[0] : "",
      jenisKelamin: item.jenisKelamin || "LAKI_LAKI",
      alamat: item.alamat || "",
      rt: item.rt || "",
      rw: item.rw || "",
      dusun: item.dusun || "",
      agama: item.agama || "ISLAM",
      statusKawin: item.statusKawin || "BELUM_KAWIN",
      hubunganKeluarga: item.hubunganKeluarga || "KEPALA_KELUARGA",
      pekerjaan: item.pekerjaan || "",
      pendidikan: item.pendidikan || "SD",
      golonganDarah: item.golonganDarah || "-",
      kewarganegaraan: item.kewarganegaraan || "WNI",
      namaAyah: item.namaAyah || "",
      namaIbu: item.namaIbu || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data warga ini?")) return;
    try {
      await deleteWarga(id);
      alert("Berhasil menghapus data warga");
      loadWarga();
    } catch (e) {
      alert("Gagal menghapus data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tanggalLahir: new Date(formData.tanggalLahir)
      };
      if (editingId) {
        await updateWarga(editingId, payload);
        alert("Berhasil memperbarui data warga");
      } else {
        await addWarga(payload);
        alert("Berhasil menambahkan data warga");
      }
      setShowModal(false);
      loadWarga();
    } catch (err) {
      alert("Terjadi kesalahan data.");
    }
  };

  const displayedWarga = useMemo(() => {
    const filtered = wargaList.filter(w => !filterIncomplete || isWargaDataIncomplete(w));

    const PENDIDIKAN_ORDER: Record<string, number> = {
      "TIDAK_SEKOLAH": 0,
      "SD": 1,
      "SMP": 2,
      "SMA": 3,
      "D3": 4,
      "S1": 5,
      "S2": 6,
      "S3": 7
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === "kk") {
        const kkA = a.noKK || "";
        const kkB = b.noKK || "";
        if (kkA !== kkB) return kkA.localeCompare(kkB);
        const roleOrder: Record<string, number> = {
          "KEPALA_KELUARGA": 0,
          "ISTRI": 1,
          "ANAK": 2,
          "MERTUA": 3,
          "ORANG_TUA": 4,
          "LAINNYA": 5
        };
        const orderA = roleOrder[a.hubunganKeluarga] ?? 99;
        const orderB = roleOrder[b.hubunganKeluarga] ?? 99;
        return orderA - orderB;
      }
      if (sortBy === "umur-asc") {
        const dateA = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : 0;
        const dateB = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : 0;
        return dateB - dateA; // Youngest first (most recent date)
      }
      if (sortBy === "umur-desc") {
        const dateA = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : 0;
        const dateB = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : 0;
        return dateA - dateB; // Oldest first
      }
      if (sortBy === "pendidikan") {
        const orderA = PENDIDIKAN_ORDER[a.pendidikan || ""] ?? -1;
        const orderB = PENDIDIKAN_ORDER[b.pendidikan || ""] ?? -1;
        return orderB - orderA; // Higher education first
      }
      return a.namaLengkap.localeCompare(b.namaLengkap);
    });
  }, [wargaList, filterIncomplete, sortBy]);

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
            {session?.user?.role === "KADUS" ? `Manajemen Data Warga ${session?.user?.rw}` : session?.user?.role === "RW" ? "Manajemen Data Warga RW" : "Manajemen Data Warga RT"}
            <span className="bg-teal-100 text-teal-700 px-3 py-1 text-[10px] rounded-full">Total: {displayedWarga.length} Warga</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {session?.user?.role === "KADUS" ? "Kelola dan pantau seluruh warga di wilayah Dusun Anda." : session?.user?.role === "RW" ? "Kelola dan pantau seluruh warga di wilayah RW Anda." : "Kelola, tambah, edit, dan hapus warga di wilayah RT Anda saja."}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <UserPlus size={16} /> Tambah Warga
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex flex-wrap md:flex-nowrap gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari NIK atau Nama Lengkap..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-900"
          />
        </div>
        {session?.user?.role === "RW" && (
          <select
            value={filterRt}
            onChange={e => setFilterRt(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-900"
          >
            <option value="">Semua RT</option>
            {allowedRts.map((rtVal) => {
              const cleanDigits = rtVal.replace(/\D/g, '');
              const label = `RT ${cleanDigits.padStart(3, '0')}`;
              return <option key={rtVal} value={rtVal}>{label}</option>;
            })}
          </select>
        )}
        {session?.user?.role === "KADUS" && (
          <>
            <select
              value={filterRw}
              onChange={e => handleRwChange(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-900"
            >
              <option value="">Semua RW</option>
              {allowedRws.map((rwObj) => {
                const cleanDigits = rwObj.name.replace(/\D/g, '');
                const label = `RW ${cleanDigits.padStart(3, '0')}`;
                return <option key={rwObj.name} value={rwObj.name}>{label}</option>;
              })}
            </select>

            <select
              value={filterRt}
              onChange={e => setFilterRt(e.target.value)}
              disabled={!filterRw}
              className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-900 disabled:opacity-50"
            >
              <option value="">Semua RT</option>
              {rtOptions.map((rtVal) => {
                const cleanDigits = rtVal.replace(/\D/g, '');
                const label = `RT ${cleanDigits.padStart(3, '0')}`;
                return <option key={rtVal} value={rtVal}>{label}</option>;
              })}
            </select>
          </>
        )}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-900"
        >
          <option value="default">Urutkan: Nama (A-Z)</option>
          <option value="kk">Urutkan: No KK</option>
          <option value="umur-desc">Urutkan: Umur (Tua ke Muda)</option>
          <option value="umur-asc">Urutkan: Umur (Muda ke Tua)</option>
          <option value="pendidikan">Urutkan: Pendidikan</option>
        </select>
        <button 
          type="button"
          onClick={() => setFilterIncomplete(prev => !prev)}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            filterIncomplete 
              ? "bg-rose-50 text-rose-600 border-rose-100" 
              : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
          }`}
        >
          <AlertCircle size={14} /> Perlu Sinkronisasi ({wargaList.filter(isWargaDataIncomplete).length})
        </button>
        <button type="submit" className="bg-slate-950 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
          Cari
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
          </div>
        ) : displayedWarga.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama / NIK</th>
                <th className="py-3 px-4">No KK</th>
                {(session?.user?.role === "RW" || session?.user?.role === "KADUS") && <th className="py-3 px-4">RT / RW</th>}
                <th className="py-3 px-4">Hub. Keluarga</th>
                <th className="py-3 px-4">Pekerjaan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
              {displayedWarga.map((w: any) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{w.namaLengkap}</div>
                      {isWargaDataIncomplete(w) && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                          <AlertCircle size={10} /> Belum Lengkap
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5"><HoverMask value={w.nik} /></div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono"><HoverMask value={w.noKK} /></td>
                  {(session?.user?.role === "RW" || session?.user?.role === "KADUS") && (
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black">RT {w.rt} / RW {w.rw}</span>
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[9px] font-bold uppercase text-slate-600">
                      {(w.hubunganKeluarga || "").replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{w.pekerjaan || "-"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center gap-2">
                      {isWargaDataIncomplete(w) && (
                        <button
                          onClick={() => handleEdit(w)}
                          title="Upgrade / Lengkapi Data Kependudukan"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all"
                        >
                          <ArrowUpRight size={11} />
                          Upgrade
                        </button>
                      )}
                      <button onClick={() => handleEdit(w)} className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-all" title="Lengkapi / Edit Data">
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => onReportMutation(w.nik, w.namaLengkap, "mati")} 
                        className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-all" 
                        title="Laporkan Meninggal (Mati)"
                      >
                        <Skull size={14} />
                      </button>
                      <button 
                        onClick={() => onReportMutation(w.nik, w.namaLengkap, "pindah")} 
                        className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-all" 
                        title="Laporkan Pindah"
                      >
                        <LogOut size={14} />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all" title="Hapus Data Warga">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-400 font-bold">Tidak ada data warga ditemukan.</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-800">
                  {editingId
                    ? isWargaDataIncomplete(wargaList.find((w: any) => w.id === editingId))
                      ? "⬆ Upgrade Data Kependudukan"
                      : "Edit Data Warga"
                    : "Tambah Warga Baru"}
                </h4>
                <p className="text-slate-400 text-xs">
                  {editingId && isWargaDataIncomplete(wargaList.find((w: any) => w.id === editingId))
                    ? "Perbarui data yang belum lengkap agar tersinkronisasi dengan admin master."
                    : "Form input kependudukan resmi RT/RW."}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WARGA_FIELDS.map((field) => {
                  const isDisabled = (field.key === "rt" || field.key === "rw") && userRole === "RT";
                  
                  if (field.key === "rw") {
                    if (userRole === "RT" || userRole === "RW") {
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          <input 
                            disabled
                            type="text"
                            value={formData.rw || ""} 
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-505"
                          />
                        </div>
                      );
                    } else if (userRole === "KADUS") {
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          <select 
                            required
                            value={formData.rw || ""} 
                            onChange={e => {
                              const selectedRw = e.target.value;
                              const matchedDusunName = (session?.user as any)?.rw || "";
                              setFormData({
                                ...formData,
                                rw: selectedRw,
                                rt: "",
                                dusun: matchedDusunName
                              });
                            }} 
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950"
                          >
                            <option value="">Pilih RW</option>
                            {allowedRws.map(rwObj => {
                              const cleanDigits = rwObj.name.replace(/\D/g, '');
                              const label = `RW ${cleanDigits.padStart(3, '0')}`;
                              return <option key={rwObj.name} value={rwObj.name}>{label}</option>;
                            })}
                          </select>
                        </div>
                      );
                    }
                  }

                  if (field.key === "rt") {
                    if (userRole === "RT") {
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          <input 
                            disabled
                            type="text"
                            value={formData.rt || ""} 
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-505"
                          />
                        </div>
                      );
                    } else if (userRole === "RW") {
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          <select 
                            required
                            value={formData.rt || ""} 
                            onChange={e => setFormData({ ...formData, rt: e.target.value })} 
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950"
                          >
                            <option value="">Pilih RT</option>
                            {allowedRts.map(rtVal => {
                              const cleanDigits = rtVal.replace(/\D/g, '');
                              const label = `RT ${cleanDigits.padStart(3, '0')}`;
                              return <option key={rtVal} value={rtVal}>{label}</option>;
                            })}
                          </select>
                        </div>
                      );
                    } else if (userRole === "KADUS") {
                      const currentRwObj = allowedRws.find(r => r.name === formData.rw);
                      const formRtOptions = currentRwObj ? currentRwObj.rt : [];
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          <select 
                            required
                            disabled={!formData.rw}
                            value={formData.rt || ""} 
                            onChange={e => setFormData({ ...formData, rt: e.target.value })} 
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950 disabled:opacity-60 disabled:bg-slate-100"
                          >
                            <option value="">Pilih RT</option>
                            {formRtOptions.map(rtVal => {
                              const cleanDigits = rtVal.replace(/\D/g, '');
                              const label = `RT ${cleanDigits.padStart(3, '0')}`;
                              return <option key={rtVal} value={rtVal}>{label}</option>;
                            })}
                          </select>
                        </div>
                      );
                    }
                  }

                  if (field.key === "dusun") {
                    if (userRole === "KADUS") {
                      // KADUS: full dusun select, on change resets rw/rt and updates allowedRws
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          <select
                            required
                            value={formData.dusun || ""}
                            onChange={e => {
                              const selectedDusun = e.target.value;
                              const dusunObj = fullStructure.dusun?.find((d: any) => d.name === selectedDusun);
                              const newRwList = dusunObj?.rw?.map((r: any) => ({ name: r.name, rt: r.rt || [] })) || [];
                              setAllowedRws(newRwList);
                              setFormData({ ...formData, dusun: selectedDusun, rw: "", rt: "" });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950"
                          >
                            <option value="">Pilih Dusun</option>
                            {fullStructure.dusun?.map((d: any) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    // RT / RW: show locked dusun (auto-resolved)
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                        <input
                          disabled
                          type="text"
                          value={formData.dusun || dusunName || ""}
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-500"
                        />
                      </div>
                    );
                  }
                  
                  if (field.type === "select") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                        <select 
                          disabled={isDisabled}
                          value={formData[field.key as keyof typeof formData] || ""} 
                          onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950 disabled:opacity-60 disabled:bg-slate-100"
                        >
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                      <input 
                        required={field.required}
                        disabled={isDisabled}
                        type={field.type}
                        value={formData[field.key as keyof typeof formData] || ""} 
                        onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                        placeholder={field.placeholder} 
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950 disabled:opacity-60 disabled:bg-slate-100"
                      />
                    </div>
                  );
                })}
              </div>

              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">
                {editingId ? "Simpan Perubahan" : "Simpan Warga Baru"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormGroup({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950"
      />
    </div>
  );
}

// ==========================================
// 3. KAS KEUANGAN TAB
// ==========================================
function FinanceTab({ session }: { session?: any }) {
  const [finances, setFinances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const loadFinances = async () => {
    setLoading(true);
    const data = await getRtFinance();
    setFinances(data);
    setLoading(false);
  };

  useEffect(() => { loadFinances(); }, []);

  // Hitung saldo otomatis dari seluruh transaksi (INCOME - EXPENSE)
  const totalIncome = finances.filter(f => f.type === "INCOME").reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter(f => f.type === "EXPENSE").reduce((s, f) => s + f.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // Sorted oldest-first untuk running balance
  const sortedFinances = [...finances].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const withRunning = sortedFinances.reduce<any[]>((acc, f) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].running : 0;
    const running = f.type === "INCOME" ? prev + f.amount : prev - f.amount;
    return [...acc, { ...f, running }];
  }, []).reverse(); // newest first for display

  const [formData, setFormData] = useState({ amount: "", type: "INCOME", category: "Iuran Warga", date: new Date().toISOString().split('T')[0], description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtFinanceTransaction({ amount: parseFloat(formData.amount), type: formData.type, category: formData.category, date: new Date(formData.date), description: formData.description });
      if (res.success) {
        setShowModal(false);
        setFormData({ amount: "", type: "INCOME", category: "Iuran Warga", date: new Date().toISOString().split('T')[0], description: "" });
        loadFinances();
      } else { alert(res.error); }
    } catch { alert("Gagal menambahkan transaksi"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan transaksi ini?")) return;
    const res = await deleteRtFinanceTransaction(id);
    if (res.success) loadFinances();
    else alert("Gagal menghapus");
  };

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Laporan Kas RT</title><style>
      body{font-family:Arial,sans-serif;font-size:11px;padding:20px;color:#111}
      h2{text-align:center;margin:0;font-size:16px}
      p.sub{text-align:center;margin:2px 0 16px;color:#555;font-size:11px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th{background:#065f46;color:#fff;padding:8px 6px;font-size:10px;text-align:left}
      td{padding:7px 6px;border-bottom:1px solid #e5e7eb;font-size:10px}
      .inc{color:#065f46;font-weight:bold} .exp{color:#dc2626;font-weight:bold}
      .saldo{color:#1e40af;font-weight:bold}
      .footer{margin-top:20px;display:flex;gap:40px;justify-content:flex-end}
      .footer div{text-align:right} .footer label{font-size:10px;color:#555}
      .footer span{display:block;font-size:13px;font-weight:bold}
      @media print{body{padding:0}}
    </style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  const userRt = (session?.user as any)?.rt;
  const userRw = (session?.user as any)?.rw;
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">Kas &amp; Iuran Keuangan RT</h3>
          <p className="text-slate-500 text-xs mt-0.5 font-bold">Saldo Kas RT Saat Ini: <span className="text-teal-600 text-sm font-black">Rp {currentBalance.toLocaleString("id-ID")}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
            <Printer size={15} /> Cetak Laporan
          </button>
          <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
            <Plus size={15} /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Total Pemasukan</p>
          <p className="text-base font-black text-emerald-600">Rp {totalIncome.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
          <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">Total Pengeluaran</p>
          <p className="text-base font-black text-rose-600">Rp {totalExpense.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Saldo Akhir</p>
          <p className={`text-base font-black ${currentBalance >= 0 ? "text-blue-600" : "text-rose-600"}`}>Rp {currentBalance.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-600 mx-auto" size={32} /></div>
        ) : withRunning.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori / Keterangan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Debit (Masuk)</th>
                <th className="py-3 px-4">Kredit (Keluar)</th>
                <th className="py-3 px-4">Saldo</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
              {withRunning.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{new Date(f.date).toLocaleDateString("id-ID")}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{f.category}</div>
                    {f.description && <div className="text-[10px] text-slate-400 mt-0.5">{f.description}</div>}
                  </td>
                  <td className="py-3 px-4">
                    {f.type === "INCOME"
                      ? <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase"><ArrowUpRight size={11} /> Masuk</span>
                      : <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase"><ArrowDownRight size={11} /> Keluar</span>}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-600">{f.type === "INCOME" ? `Rp ${f.amount.toLocaleString("id-ID")}` : "-"}</td>
                  <td className="py-3 px-4 font-black text-rose-600">{f.type === "EXPENSE" ? `Rp ${f.amount.toLocaleString("id-ID")}` : "-"}</td>
                  <td className={`py-3 px-4 font-black ${f.running >= 0 ? "text-blue-600" : "text-rose-600"}`}>Rp {f.running.toLocaleString("id-ID")}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <button onClick={() => handleDelete(f.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-400 font-bold">Belum ada transaksi kas tercatat.</div>
        )}
      </div>

      {/* HIDDEN PRINT TEMPLATE */}
      <div className="hidden">
        <div ref={printRef}>
          <h2>LAPORAN KAS KEUANGAN RT</h2>
          <p className="sub">RT {userRt || "-"} / RW {userRw || "-"} &nbsp;|&nbsp; Desa Cimanggu I &nbsp;|&nbsp; Dicetak: {today}</p>
          <table>
            <thead>
              <tr><th>No</th><th>Tanggal</th><th>Kategori</th><th>Keterangan</th><th>Debit (Rp)</th><th>Kredit (Rp)</th><th>Saldo (Rp)</th></tr>
            </thead>
            <tbody>
              {[...withRunning].reverse().map((f: any, i: number) => (
                <tr key={f.id}>
                  <td>{i + 1}</td>
                  <td>{new Date(f.date).toLocaleDateString("id-ID")}</td>
                  <td>{f.category}</td>
                  <td>{f.description || "-"}</td>
                  <td className="inc">{f.type === "INCOME" ? f.amount.toLocaleString("id-ID") : ""}</td>
                  <td className="exp">{f.type === "EXPENSE" ? f.amount.toLocaleString("id-ID") : ""}</td>
                  <td className="saldo">{f.running.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="footer">
            <div><label>Total Pemasukan</label><span className="inc">Rp {totalIncome.toLocaleString("id-ID")}</span></div>
            <div><label>Total Pengeluaran</label><span className="exp">Rp {totalExpense.toLocaleString("id-ID")}</span></div>
            <div><label>Saldo Akhir</label><span className="saldo">Rp {currentBalance.toLocaleString("id-ID")}</span></div>
          </div>
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div><h4 className="text-lg font-black text-slate-800">Catat Kas Keuangan</h4><p className="text-slate-400 text-xs">Pemasukan atau pengeluaran kas RT.</p></div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Jenis Transaksi</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 text-slate-950">
                    <option value="INCOME">Masuk (Pemasukan)</option>
                    <option value="EXPENSE">Keluar (Pengeluaran)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 text-slate-950">
                    <option value="Iuran Warga">Iuran Warga</option>
                    <option value="Bantuan Sosial">Bantuan Sosial</option>
                    <option value="Kegiatan Fisik">Kegiatan Fisik</option>
                    <option value="Alat RT/Perlengkapan">Alat RT / Perlengkapan</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>
              <FormGroup label="Jumlah (Nominal Rp)" type="number" value={formData.amount} onChange={v => setFormData({...formData, amount: v})} placeholder="Contoh: 50000" />
              <FormGroup label="Tanggal Transaksi" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Keterangan</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Keterangan singkat..." className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 min-h-[70px] text-slate-950" />
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Transaksi Kas</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3.5 RUMAH WARGA TAB
// ==========================================
function RumahWargaTab({ session }: { session?: any }) {
  const [rumahList, setRumahList] = useState<any[]>([]);
  const [kkList, setKkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const emptyForm = { noKK: "", rt: (session?.user as any)?.rt || "", rw: (session?.user as any)?.rw || "", alamat: "", latitude: "", longitude: "", lokasiDetail: "", fotoUrl: "", statusRumah: "MILIK_SENDIRI", kondisi: "LAYAK", keterangan: "" };
  const [formData, setFormData] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    const [list, kk] = await Promise.all([getRumahWargaList(query), getKKWithoutRumah()]);
    setRumahList(list);
    setKkList(kk);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => { setEditingId(null); setFormData(emptyForm); setShowModal(true); };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ noKK: item.noKK, rt: item.rt, rw: item.rw, alamat: item.alamat, latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", lokasiDetail: item.lokasiDetail || "", fotoUrl: item.fotoUrl || "", statusRumah: item.statusRumah, kondisi: item.kondisi, keterangan: item.keterangan || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, latitude: formData.latitude ? parseFloat(formData.latitude) : null, longitude: formData.longitude ? parseFloat(formData.longitude) : null };
    try {
      let res: any;
      if (editingId) { res = await updateRumahWarga(editingId, payload); }
      else { res = await addRumahWarga(payload); }
      if (res?.success) { setShowModal(false); loadData(); }
      else alert(res?.error || "Gagal menyimpan data");
    } catch { alert("Terjadi kesalahan"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data rumah ini?")) return;
    const res = await deleteRumahWarga(id);
    if (res.success) loadData();
  };

  const STATUS_COLORS: Record<string, string> = { MILIK_SENDIRI: "bg-emerald-50 text-emerald-700", KONTRAK: "bg-amber-50 text-amber-700", MENUMPANG: "bg-blue-50 text-blue-700", DINAS: "bg-purple-50 text-purple-700", LAINNYA: "bg-slate-100 text-slate-600" };
  const KONDISI_COLORS: Record<string, string> = { LAYAK: "bg-teal-50 text-teal-700", TIDAK_LAYAK: "bg-rose-50 text-rose-700", BUTUH_PERBAIKAN: "bg-orange-50 text-orange-700" };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">Rumah Warga</h3>
          <p className="text-slate-500 text-xs mt-0.5">Detail rumah per KK — koordinat, foto, lokasi, status kepemilikan.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
          <Plus size={16} /> Tambah Rumah
        </button>
      </div>

      <form onSubmit={e => { e.preventDefault(); loadData(); }} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari No KK atau Alamat..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 text-slate-900" />
        </div>
        <button type="submit" className="bg-slate-950 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">Cari</button>
      </form>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-600 mx-auto" size={32} /></div>
      ) : rumahList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rumahList.map((r: any) => (
            <div key={r.id} className="border border-slate-100 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition-all group">
              <div className="flex gap-4">
                {r.fotoUrl ? (
                  <img src={r.fotoUrl} alt="Foto Rumah" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100" onError={e => { (e.target as any).style.display = "none"; }} />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <HomeIcon size={28} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">{r.kepalaKeluarga?.namaLengkap || "— Kepala Keluarga Tidak Ditemukan —"}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">No KK: {r.noKK}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setDetailItem(r)} className="p-1.5 hover:bg-teal-50 rounded-lg text-teal-600 transition-all" title="Detail"><Eye size={13} /></button>
                      <button onClick={() => handleEdit(r)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-all" title="Edit"><Edit size={13} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-all" title="Hapus"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">{r.alamat}</p>
                  {r.lokasiDetail && <p className="text-[10px] text-slate-400 truncate">{r.lokasiDetail}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[r.statusRumah] || "bg-slate-100 text-slate-600"}`}>{r.statusRumah?.replace(/_/g, " ")}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${KONDISI_COLORS[r.kondisi] || "bg-slate-100 text-slate-600"}`}>{r.kondisi?.replace(/_/g, " ")}</span>
                    {r.latitude && r.longitude && (
                      <a href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 flex items-center gap-1 hover:bg-blue-100 transition-colors">
                        <MapPin size={9} /> GPS
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 font-bold">Belum ada data rumah warga tercatat.</div>
      )}

      {/* DETAIL MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setDetailItem(null)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div><h4 className="text-lg font-black text-slate-800">Detail Rumah Warga</h4><p className="text-slate-400 text-xs">No KK: {detailItem.noKK}</p></div>
              <button onClick={() => setDetailItem(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              {detailItem.fotoUrl && <img src={detailItem.fotoUrl} alt="Foto Rumah" className="w-full h-48 object-cover rounded-2xl border border-slate-100" />}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kepala Keluarga</p><p className="font-black text-slate-800">{detailItem.kepalaKeluarga?.namaLengkap || "-"}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RT / RW</p><p className="font-bold text-slate-700">RT {detailItem.rt} / RW {detailItem.rw}</p></div>
                <div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat</p><p className="font-bold text-slate-700">{detailItem.alamat}</p></div>
                {detailItem.lokasiDetail && <div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Detail</p><p className="font-bold text-slate-700">{detailItem.lokasiDetail}</p></div>}
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Rumah</p><p className="font-bold text-slate-700">{detailItem.statusRumah?.replace(/_/g, " ")}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kondisi</p><p className="font-bold text-slate-700">{detailItem.kondisi?.replace(/_/g, " ")}</p></div>
                {detailItem.latitude && detailItem.longitude && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Koordinat GPS</p>
                    <p className="font-mono text-xs text-slate-700">{detailItem.latitude}, {detailItem.longitude}</p>
                    <a href={`https://maps.google.com/?q=${detailItem.latitude},${detailItem.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                      <MapPin size={11} /> Lihat di Google Maps
                    </a>
                  </div>
                )}
                {detailItem.keterangan && <div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</p><p className="font-bold text-slate-700">{detailItem.keterangan}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div><h4 className="text-lg font-black text-slate-800">{editingId ? "Edit Data Rumah" : "Tambah Rumah Warga"}</h4><p className="text-slate-400 text-xs">Data fisik rumah per KK.</p></div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/20">
              {!editingId && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">No KK (Kepala Keluarga)</label>
                  <select required value={formData.noKK} onChange={e => setFormData({...formData, noKK: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 text-slate-950">
                    <option value="">-- Pilih KK --</option>
                    {kkList.map((kk, idx) => <option key={`${kk.noKK}-${idx}`} value={kk.noKK}>{kk.namaLengkap} ({kk.noKK})</option>)}
                  </select>
                </div>
              )}
              <FormGroup label="Alamat Lengkap" type="text" value={formData.alamat} onChange={v => setFormData({...formData, alamat: v})} placeholder="Jl. Contoh No. 1..." />
              <FormGroup label="Lokasi Detail (Patokan)" type="text" value={formData.lokasiDetail} onChange={v => setFormData({...formData, lokasiDetail: v})} placeholder="Misal: Sebelah kanan masjid Al-Ikhlas" />
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Latitude GPS" type="text" value={formData.latitude} onChange={v => setFormData({...formData, latitude: v})} placeholder="-6.1234567" />
                <FormGroup label="Longitude GPS" type="text" value={formData.longitude} onChange={v => setFormData({...formData, longitude: v})} placeholder="106.7654321" />
              </div>
              <FormGroup label="URL Foto Rumah" type="text" value={formData.fotoUrl} onChange={v => setFormData({...formData, fotoUrl: v})} placeholder="https://..." />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Status Kepemilikan</label>
                  <select value={formData.statusRumah} onChange={e => setFormData({...formData, statusRumah: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 text-slate-950">
                    <option value="MILIK_SENDIRI">Milik Sendiri</option>
                    <option value="KONTRAK">Kontrak / Sewa</option>
                    <option value="MENUMPANG">Menumpang</option>
                    <option value="DINAS">Rumah Dinas</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Kondisi Rumah</label>
                  <select value={formData.kondisi} onChange={e => setFormData({...formData, kondisi: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 text-slate-950">
                    <option value="LAYAK">Layak Huni</option>
                    <option value="BUTUH_PERBAIKAN">Butuh Perbaikan</option>
                    <option value="TIDAK_LAYAK">Tidak Layak Huni</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Keterangan Tambahan</label>
                <textarea value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} placeholder="Keterangan lainnya..." className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 min-h-[70px] text-slate-950" />
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all">Simpan Data Rumah</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CEK SURAT TAB
// ==========================================

function SuratTab() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSurat = async () => {
    setLoading(true);
    const data = await getSuratList();
    setSuratList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSurat();
  }, []);

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await updateSuratStatus(id, status);
      alert(`Berhasil memperbarui status surat menjadi ${status}`);
      loadSurat();
    } catch (err) {
      alert("Gagal memperbarui status");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-800">Persetujuan & Tanda Tangan Surat Pengantar RT</h3>
        <p className="text-slate-500 text-xs mt-0.5">Tinjau permohonan surat dari warga Anda dan berikan verifikasi pengantar.</p>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
          </div>
        ) : suratList.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal Pengajuan</th>
                <th className="py-3 px-4">Nama Warga / NIK</th>
                <th className="py-3 px-4">Jenis / Keperluan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
              {suratList.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{s.warga?.namaLengkap || "Warga Terhapus"}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.warga?.nik || "-"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-teal-600 font-bold uppercase text-[10px]">{s.jenisSurat}</div>
                    <div className="text-slate-500 font-semibold mt-0.5">{s.keperluan || "-"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.status === "TERTUNDA" && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase">Pending RT</span>}
                    {s.status === "TERVERIFIKASI" && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Terverifikasi</span>}
                    {s.status === "DISETUJUI" && <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">Disetujui Desa</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.status === "TERTUNDA" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus(s.id, "TERVERIFIKASI")}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                        >
                          Verifikasi RT
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] text-slate-400 font-bold uppercase">Sudah Diproses</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-400 font-bold">Belum ada pengajuan surat di wilayah RT Anda.</div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. LAPORAN KEGIATAN TAB
// ==========================================
function KegiatanTab({ session }: { session?: any }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    budget: "",
    status: "RENCANA",
    imageUrl: "",
    rt: ""
  });

  const loadActivities = async () => {
    setLoading(true);
    const data = await getRtActivities();
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtActivity({
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
        rt: session?.user?.role === "RW" ? formData.rt : undefined
      });
      if (res.success) {
        alert("Berhasil menerbitkan laporan kegiatan");
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          budget: "",
          status: "RENCANA",
          imageUrl: "",
          rt: ""
        });
        loadActivities();
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus laporan kegiatan ini?")) return;
    try {
      const res = await deleteRtActivity(id);
      if (res.success) {
        alert("Laporan kegiatan dihapus");
        loadActivities();
      }
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">{session?.user?.role === "RW" ? "Laporan & Publikasi Kegiatan RW" : "Laporan & Publikasi Kegiatan RT"}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{session?.user?.role === "RW" ? "Pantau agenda kegiatan dari seluruh RT di wilayah Anda." : "Catat agenda gotong royong, arisan RT, pembangunan fisik, dan rapat koordinasi."}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Buat Kegiatan
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
        </div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((a: any) => (
            <div key={a.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/20 hover:shadow-lg transition-all relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${a.status === "RENCANA" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                      {a.status}
                    </span>
                    {session?.user?.role === "RW" && (
                      <span className="ml-2 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-[9px] font-black">RT {a.rt}</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <h4 className="text-sm font-black text-slate-800 leading-tight mb-2">{a.title}</h4>
                <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed line-clamp-3">{a.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100/60 text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {new Date(a.date).toLocaleDateString("id-ID")}
                </div>
                <div className="text-right font-black text-slate-700">
                  {a.budget ? `Anggaran: Rp ${a.budget.toLocaleString("id-ID")}` : "Tanpa Anggaran"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 font-bold">Belum ada agenda atau laporan kegiatan RT yang dibuat.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-800">Buat Kegiatan RT Baru</h4>
                <p className="text-slate-400 text-xs">Publikasikan agenda kerja atau laporan sosial RT.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/20">
              {session?.user?.role === "RW" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Pilih RT Target</label>
                  <select value={formData.rt} onChange={e => setFormData({...formData, rt: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950" required>
                    <option value="">-- Pilih RT --</option>
                    {[...Array(20)].map((_, i) => {
                      const num = (i + 1).toString().padStart(3, '0');
                      return <option key={num} value={num}>RT {num}</option>;
                    })}
                  </select>
                </div>
              )}
              <FormGroup label="Judul Kegiatan" value={formData.title} onChange={v => setFormData({...formData, title: v})} placeholder="Contoh: Gotong Royong RT 01" />
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Deskripsi Kegiatan</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Jelaskan detail jalannya kegiatan..." className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all min-h-[100px] text-slate-950" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Tanggal Pelaksanaan" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Status Kegiatan</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
                    <option value="RENCANA">Rencana</option>
                    <option value="TERLAKSANA">Terlaksana</option>
                  </select>
                </div>
              </div>

              <FormGroup label="Anggaran (Rp - Opsional)" type="number" value={formData.budget} onChange={v => setFormData({...formData, budget: v})} placeholder="Contoh: 1500000" />
              <FormGroup label="Foto URL (Opsional)" value={formData.imageUrl} onChange={v => setFormData({...formData, imageUrl: v})} placeholder="http://url-gambar.com/kegiatan.jpg" />

              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">
                Mulai Publikasikan Kegiatan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. LAMPID TAB (Lahir, Mati, Pindah, Datang)
// ==========================================
function LampidTab({ 
  stats, 
  preFilledMutation, 
  clearPreFilledMutation 
}: { 
  stats: any; 
  preFilledMutation: { nik: string, namaLengkap: string, type: "mati" | "pindah" } | null;
  clearPreFilledMutation: () => void;
}) {
  const [subTab, setSubTab] = useState<"lahir" | "mati" | "pindah" | "datang">("lahir");
  const [modalFormType, setModalFormType] = useState<"lahir" | "mati" | "pindah" | "datang">("lahir");
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchReportData = async () => {
    setLoadingReport(true);
    const res = await getRtDemographicReport(reportMonth, reportYear);
    if (res.success) {
      setReportData(res);
    } else {
      alert("Gagal memuat laporan: " + res.error);
    }
    setLoadingReport(false);
  };

  useEffect(() => {
    if (showPrintModal) {
      fetchReportData();
    }
  }, [showPrintModal, reportMonth, reportYear]);

  // Forms states
  const [birthForm, setBirthForm] = useState({ namaBayi: "", tanggalLahir: new Date().toISOString().split('T')[0], jenisKelamin: "LAKI_LAKI", namaAyah: "", namaIbu: "", keterangan: "" });
  const [deathForm, setDeathForm] = useState({ nik: "", namaLengkap: "", tanggalMeninggal: new Date().toISOString().split('T')[0], penyebab: "", keterangan: "" });
  const [moveForm, setMoveForm] = useState({ nik: "", namaLengkap: "", tanggalPindah: new Date().toISOString().split('T')[0], alamatTujuan: "", alasan: "" });
  const [incomingForm, setIncomingForm] = useState({ nik: "", noKK: "", namaLengkap: "", tanggalDatang: new Date().toISOString().split('T')[0], alamatAsal: "", keterangan: "" });

  useEffect(() => {
    if (preFilledMutation) {
      const { nik, namaLengkap, type } = preFilledMutation;
      if (type === "mati") {
        setDeathForm({
          nik,
          namaLengkap,
          tanggalMeninggal: new Date().toISOString().split('T')[0],
          penyebab: "",
          keterangan: ""
        });
        setModalFormType("mati");
      } else if (type === "pindah") {
        setMoveForm({
          nik,
          namaLengkap,
          tanggalPindah: new Date().toISOString().split('T')[0],
          alamatTujuan: "",
          alasan: ""
        });
        setModalFormType("pindah");
      }
      setShowModal(true);
      clearPreFilledMutation();
    }
  }, [preFilledMutation, clearPreFilledMutation]);

  const loadData = async () => {
    setLoading(true);
    let data: any[] = [];
    if (subTab === "lahir") data = await getRtBirthReports();
    else if (subTab === "mati") data = await getRtDeathReports();
    else if (subTab === "pindah") data = await getRtMoveReports();
    else if (subTab === "datang") data = await getRtIncomingReports();
    setListData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [subTab]);

  const handlePrint = () => {
    if (!reportData) return;

    const monthName = new Date(0, reportMonth - 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase();
    const ageDist = reportData.ageDistribution || {};

    // Build left table rows (0-11 BLN + 1-38)
    const leftRows: string[] = [];
    const m0_11 = ageDist["0-11 BLN"] || { L: 0, P: 0 };
    leftRows.push(`<tr><td>0-11 BLN</td><td>${m0_11.L || "-"}</td><td>${m0_11.P || "-"}</td></tr>`);
    for (let i = 1; i <= 38; i++) {
      const v = ageDist[i.toString()] || { L: 0, P: 0 };
      leftRows.push(`<tr><td>${i}</td><td>${v.L || "-"}</td><td>${v.P || "-"}</td></tr>`);
    }

    // Build right table rows (39-74, 75+, JUMLAH)
    const rightRows: string[] = [];
    for (let i = 39; i <= 74; i++) {
      const v = ageDist[i.toString()] || { L: 0, P: 0 };
      rightRows.push(`<tr><td>${i}</td><td>${v.L || "-"}</td><td>${v.P || "-"}</td></tr>`);
    }
    const m75 = ageDist["75+"] || { L: 0, P: 0 };
    rightRows.push(`<tr><td>75+</td><td>${m75.L || "-"}</td><td>${m75.P || "-"}</td></tr>`);
    let sumL = 0, sumP = 0;
    Object.values(ageDist).forEach((v: any) => { sumL += v.L || 0; sumP += v.P || 0; });
    rightRows.push(`<tr class="bold"><td>JUMLAH</td><td>${sumL}</td><td>${sumP}</td></tr>`);

    const totals = reportData.totals || {};
    const mutasi = reportData.mutasi || {};
    const rtInfo = reportData.rtInfo || {};

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Laporan LAMPID RT ${rtInfo.rt || ".."} RW ${rtInfo.rw || ".."} - ${monthName} ${reportYear}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; font-size: 10px; background: white; color: black; padding: 20px; }
    h1, h2 { text-align: center; font-size: 11px; text-transform: uppercase; }
    .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 6px; margin-bottom: 10px; }
    .layout { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    table { width: 100%; border-collapse: collapse; }
    table, th, td { border: 1px solid black; }
    th, td { padding: 2px 4px; text-align: center; }
    th { font-weight: bold; }
    .summary-box { border: 1px solid black; padding: 4px; margin-bottom: 4px; }
    .summary-box .title { font-weight: bold; font-size: 9px; margin-bottom: 3px; border-bottom: 1px solid black; padding-bottom: 2px; }
    .summary-row { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; }
    .summary-row div { border-right: 1px solid black; padding: 1px; }
    .summary-row div:last-child { border-right: none; font-weight: bold; }
    .bold { font-weight: bold; }
    .keterangan { border: 1px solid black; padding: 6px; margin-top: 8px; min-height: 50px; }
    .keterangan .ktitle { font-weight: bold; margin-bottom: 4px; }
    .realisasi { border: 1px solid black; padding: 6px; margin-top: 4px; }
    .realisasi .ktitle { font-weight: bold; margin-bottom: 4px; }
    .realisasi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .signatures { margin-top: 30px; display: flex; justify-content: flex-end; }
    .sig-box { text-align: center; width: 200px; }
    .sig-line { border-bottom: 1px solid black; width: 150px; margin: 60px auto 0; }
    .sig-note { font-size: 9px; color: #555; margin-top: 2px; }
    @page { size: Legal portrait; margin: 10mm; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Laporan Data (Lahir, Mati, Pindah dan Datang) Penduduk</h1>
    <h2>Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor</h2>
    <div style="margin-top:4px;font-weight:bold;">RT ${rtInfo.rt || "...."} RW ${rtInfo.rw || "...."} Bulan ${monthName} Tahun ${reportYear}</div>
  </div>

  <div class="layout">
    <!-- Left: Age 0-38 -->
    <table>
      <thead><tr><th>USIA</th><th>L</th><th>P</th></tr></thead>
      <tbody>${leftRows.join("")}</tbody>
    </table>

    <!-- Right: Age 39-75+ -->
    <table>
      <thead><tr><th>USIA</th><th>L</th><th>P</th></tr></thead>
      <tbody>${rightRows.join("")}</tbody>
    </table>

    <!-- Summary panel -->
    <div>
      <div class="summary-box">
        <div class="title">PENDUDUK</div>
        <div class="summary-row">
          <div>L: ${totals.penduduk?.L || 0}</div>
          <div>P: ${totals.penduduk?.P || 0}</div>
          <div>JML: ${(totals.penduduk?.L || 0) + (totals.penduduk?.P || 0)}</div>
        </div>
      </div>
      <div class="summary-box">
        <div class="title">WAJIB KTP 17+</div>
        <div class="summary-row">
          <div>L: ${totals.wajibKtp?.L || 0}</div>
          <div>P: ${totals.wajibKtp?.P || 0}</div>
          <div>JML: ${(totals.wajibKtp?.L || 0) + (totals.wajibKtp?.P || 0)}</div>
        </div>
      </div>
      <div class="summary-box">
        <div class="title">KARTU KELUARGA (KK)</div>
        <div style="text-align:center;padding:2px;font-weight:bold;">TOTAL: ${totals.totalKK || 0} KK</div>
      </div>
      <div class="summary-box">
        <div class="title">PENDUDUK SEMENTARA</div>
        <div class="summary-row">
          <div>L: ${totals.pendudukSementara?.L || 0}</div>
          <div>P: ${totals.pendudukSementara?.P || 0}</div>
          <div>JML: ${(totals.pendudukSementara?.L || 0) + (totals.pendudukSementara?.P || 0)}</div>
        </div>
      </div>
      <div class="summary-box">
        <div class="title">MUTASI: LAHIR</div>
        <div class="summary-row">
          <div>L: ${mutasi.lahir?.L || 0}</div>
          <div>P: ${mutasi.lahir?.P || 0}</div>
          <div>JML: ${(mutasi.lahir?.L || 0) + (mutasi.lahir?.P || 0)}</div>
        </div>
      </div>
      <div class="summary-box">
        <div class="title">MUTASI: MENINGGAL</div>
        <div class="summary-row">
          <div>L: ${mutasi.mati?.L || 0}</div>
          <div>P: ${mutasi.mati?.P || 0}</div>
          <div>JML: ${(mutasi.mati?.L || 0) + (mutasi.mati?.P || 0)}</div>
        </div>
      </div>
      <div class="summary-box">
        <div class="title">MUTASI: PINDAH (KELUAR)</div>
        <div class="summary-row">
          <div>L: ${mutasi.pindah?.L || 0}</div>
          <div>P: ${mutasi.pindah?.P || 0}</div>
          <div>JML: ${(mutasi.pindah?.L || 0) + (mutasi.pindah?.P || 0)}</div>
        </div>
      </div>
      <div class="summary-box">
        <div class="title">MUTASI: DATANG (MASUK)</div>
        <div class="summary-row">
          <div>L: ${mutasi.datang?.L || 0}</div>
          <div>P: ${mutasi.datang?.P || 0}</div>
          <div>JML: ${(mutasi.datang?.L || 0) + (mutasi.datang?.P || 0)}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="keterangan">
    <div class="ktitle">KETERANGAN PERUBAHAN PENDUDUK:</div>
    <div>${reportData.changesDesc || ""}</div>
  </div>

  <div class="realisasi">
    <div class="ktitle">REALISASI PEMBUATAN KTP DAN KK BULAN INI:</div>
    <div class="realisasi-grid">
      <div>Kartu Tanda Penduduk (KTP): ${(totals.wajibKtp?.L || 0) + (totals.wajibKtp?.P || 0)} Warga Wajib KTP terdata aktif</div>
      <div>Kartu Keluarga (KK): ${totals.totalKK || 0} KK terdaftar aktif di RT</div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <div>Bogor, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="bold" style="margin-top:4px;text-transform:uppercase;">Ketua RT ${rtInfo.rt || "...."} RW ${rtInfo.rw || "...."}</div>
      <div class="sig-line"></div>
      <div class="sig-note">Tanda Tangan &amp; Cap Basah</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus laporan mutasi penduduk ini?")) return;
    try {
      if (subTab === "lahir") await deleteRtBirthReport(id);
      else if (subTab === "mati") await deleteRtDeathReport(id);
      else if (subTab === "pindah") await deleteRtMoveReport(id);
      else if (subTab === "datang") await deleteRtIncomingReport(id);
      alert("Berhasil menghapus laporan mutasi");
      loadData();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  const handleAddBirth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtBirthReport({
        namaBayi: birthForm.namaBayi,
        tanggalLahir: new Date(birthForm.tanggalLahir),
        jenisKelamin: birthForm.jenisKelamin,
        namaAyah: birthForm.namaAyah || undefined,
        namaIbu: birthForm.namaIbu || undefined,
        keterangan: birthForm.keterangan || undefined
      });
      if (res.success) {
        alert("Berhasil melaporkan kelahiran");
        setShowModal(false);
        setBirthForm({ namaBayi: "", tanggalLahir: new Date().toISOString().split('T')[0], jenisKelamin: "LAKI_LAKI", namaAyah: "", namaIbu: "", keterangan: "" });
        loadData();
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleAddDeath = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtDeathReport({
        nik: deathForm.nik,
        namaLengkap: deathForm.namaLengkap,
        tanggalMeninggal: new Date(deathForm.tanggalMeninggal),
        penyebab: deathForm.penyebab || undefined,
        keterangan: deathForm.keterangan || undefined
      });
      if (res.success) {
        alert("Berhasil melaporkan kematian");
        setShowModal(false);
        setDeathForm({ nik: "", namaLengkap: "", tanggalMeninggal: new Date().toISOString().split('T')[0], penyebab: "", keterangan: "" });
        setSubTab("mati");
        loadData();
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleAddMove = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtMoveReport({
        nik: moveForm.nik,
        namaLengkap: moveForm.namaLengkap,
        tanggalPindah: new Date(moveForm.tanggalPindah),
        alamatTujuan: moveForm.alamatTujuan,
        alasan: moveForm.alasan || undefined
      });
      if (res.success) {
        alert("Berhasil melaporkan kepindahan");
        setShowModal(false);
        setMoveForm({ nik: "", namaLengkap: "", tanggalPindah: new Date().toISOString().split('T')[0], alamatTujuan: "", alasan: "" });
        setSubTab("pindah");
        loadData();
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleAddIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtIncomingReport({
        nik: incomingForm.nik,
        noKK: incomingForm.noKK,
        namaLengkap: incomingForm.namaLengkap,
        tanggalDatang: new Date(incomingForm.tanggalDatang),
        alamatAsal: incomingForm.alamatAsal,
        keterangan: incomingForm.keterangan || undefined
      });
      if (res.success) {
        alert("Berhasil melaporkan kedatangan warga");
        setShowModal(false);
        setIncomingForm({ nik: "", noKK: "", namaLengkap: "", tanggalDatang: new Date().toISOString().split('T')[0], alamatAsal: "", keterangan: "" });
        setSubTab("datang");
        loadData();
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">Rekapan Administrasi LAMPID</h3>
          <p className="text-slate-500 text-xs mt-0.5">Pantau dan publikasikan mutasi kelahiran, kematian, kepindahan, dan kedatangan warga.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Printer size={16} /> Cetak Laporan (Gambar 2)
          </button>
          <button
            onClick={() => {
              setModalFormType(subTab);
              setShowModal(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> Laporkan Peristiwa
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setSubTab("lahir")} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${subTab === "lahir" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>Lahir ({stats.births})</button>
        <button onClick={() => setSubTab("mati")} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${subTab === "mati" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>Meninggal ({stats.deaths})</button>
        <button onClick={() => setSubTab("pindah")} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${subTab === "pindah" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>Pindah ({stats.moves})</button>
        <button onClick={() => setSubTab("datang")} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${subTab === "datang" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>Datang ({stats.incoming})</button>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
          </div>
        ) : listData.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              {subTab === "lahir" && (
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Bayi</th>
                  <th className="py-3 px-4">Jenis Kelamin</th>
                  <th className="py-3 px-4">Tanggal Lahir</th>
                  <th className="py-3 px-4">Nama Orang Tua</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              )}
              {subTab === "mati" && (
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Warga / NIK</th>
                  <th className="py-3 px-4">Tanggal Meninggal</th>
                  <th className="py-3 px-4">Penyebab</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              )}
              {subTab === "pindah" && (
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Warga / NIK</th>
                  <th className="py-3 px-4">Tanggal Pindah</th>
                  <th className="py-3 px-4">Alamat Tujuan</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              )}
              {subTab === "datang" && (
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Warga / NIK</th>
                  <th className="py-3 px-4">No KK</th>
                  <th className="py-3 px-4">Tanggal Datang</th>
                  <th className="py-3 px-4">Alamat Asal</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
              {listData.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  {subTab === "lahir" && (
                    <>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{d.namaBayi}</td>
                      <td className="py-3.5 px-4 text-slate-500">{d.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(d.tanggalLahir).toLocaleDateString("id-ID")}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {d.namaIbu && <div>Ibu: {d.namaIbu}</div>}
                        {d.namaAyah && <div className="text-[10px] mt-0.5">Ayah: {d.namaAyah}</div>}
                      </td>
                    </>
                  )}
                  {subTab === "mati" && (
                    <>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{d.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{d.nik}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(d.tanggalMeninggal).toLocaleDateString("id-ID")}</td>
                      <td className="py-3.5 px-4 text-slate-500">{d.penyebab || "-"}</td>
                      <td className="py-3.5 px-4 text-slate-500">{d.keterangan || "-"}</td>
                    </>
                  )}
                  {subTab === "pindah" && (
                    <>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{d.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{d.nik}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(d.tanggalPindah).toLocaleDateString("id-ID")}</td>
                      <td className="py-3.5 px-4 text-slate-500">{d.alamatTujuan}</td>
                      <td className="py-3.5 px-4 text-slate-500">{d.alasan || "-"}</td>
                    </>
                  )}
                  {subTab === "datang" && (
                    <>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{d.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{d.nik}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{d.noKK}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(d.tanggalDatang).toLocaleDateString("id-ID")}</td>
                      <td className="py-3.5 px-4 text-slate-500">{d.alamatAsal}</td>
                    </>
                  )}
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center">
                      <button onClick={() => handleDelete(d.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-400 font-bold">Belum ada mutasi penduduk tercatat.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-800">Lapor Mutasi LAMPID</h4>
                <p className="text-slate-400 text-xs">Catat peristiwa kependudukan di wilayah RT.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            {/* Form Selection Tabs */}
            <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex gap-1.5 no-print">
              <button
                type="button"
                onClick={() => setModalFormType("lahir")}
                className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  modalFormType === "lahir"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white text-slate-400 hover:text-slate-700 border border-slate-200/60"
                }`}
              >
                Lahir
              </button>
              <button
                type="button"
                onClick={() => setModalFormType("mati")}
                className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  modalFormType === "mati"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white text-slate-400 hover:text-slate-700 border border-slate-200/60"
                }`}
              >
                Meninggal
              </button>
              <button
                type="button"
                onClick={() => setModalFormType("pindah")}
                className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  modalFormType === "pindah"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white text-slate-400 hover:text-slate-700 border border-slate-200/60"
                }`}
              >
                Pindah
              </button>
              <button
                type="button"
                onClick={() => setModalFormType("datang")}
                className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  modalFormType === "datang"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white text-slate-400 hover:text-slate-700 border border-slate-200/60"
                }`}
              >
                Datang
              </button>
            </div>

            <div className="p-6 bg-slate-50/20">
              {modalFormType === "lahir" && (
                <form onSubmit={handleAddBirth} className="space-y-4">
                  <FormGroup label="Nama Bayi" value={birthForm.namaBayi} onChange={v => setBirthForm({...birthForm, namaBayi: v})} placeholder="Masukkan nama bayi" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Tanggal Lahir" type="date" value={birthForm.tanggalLahir} onChange={v => setBirthForm({...birthForm, tanggalLahir: v})} />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Jenis Kelamin</label>
                      <select value={birthForm.jenisKelamin} onChange={e => setBirthForm({...birthForm, jenisKelamin: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
                        <option value="LAKI_LAKI">Laki-Laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <FormGroup label="Nama Ayah" value={birthForm.namaAyah} onChange={v => setBirthForm({...birthForm, namaAyah: v})} placeholder="Nama Ayah kandung" />
                  <FormGroup label="Nama Ibu" value={birthForm.namaIbu} onChange={v => setBirthForm({...birthForm, namaIbu: v})} placeholder="Nama Ibu kandung" />
                  <FormGroup label="Keterangan (Opsional)" value={birthForm.keterangan} onChange={v => setBirthForm({...birthForm, keterangan: v})} placeholder="Keterangan kelahiran" />
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Laporan Lahir</button>
                </form>
              )}

              {modalFormType === "mati" && (
                <form onSubmit={handleAddDeath} className="space-y-4">
                  <FormGroup label="NIK Warga Meninggal" value={deathForm.nik} onChange={v => setDeathForm({...deathForm, nik: v})} placeholder="Masukkan NIK warga" />
                  <FormGroup label="Nama Lengkap" value={deathForm.namaLengkap} onChange={v => setDeathForm({...deathForm, namaLengkap: v})} placeholder="Sesuai KTP" />
                  <FormGroup label="Tanggal Meninggal" type="date" value={deathForm.tanggalMeninggal} onChange={v => setDeathForm({...deathForm, tanggalMeninggal: v})} />
                  <FormGroup label="Penyebab Kematian" value={deathForm.penyebab} onChange={v => setDeathForm({...deathForm, penyebab: v})} placeholder="Sakit, Kecelakaan, Usia Lanjut, dll" />
                  <FormGroup label="Keterangan Tambahan" value={deathForm.keterangan} onChange={v => setDeathForm({...deathForm, keterangan: v})} placeholder="Nomor surat kematian, dll" />
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Laporan Kematian</button>
                </form>
              )}

              {modalFormType === "pindah" && (
                <form onSubmit={handleAddMove} className="space-y-4">
                  <FormGroup label="NIK Warga Pindah" value={moveForm.nik} onChange={v => setMoveForm({...moveForm, nik: v})} placeholder="Masukkan NIK" />
                  <FormGroup label="Nama Lengkap" value={moveForm.namaLengkap} onChange={v => setMoveForm({...moveForm, namaLengkap: v})} placeholder="Sesuai KTP" />
                  <FormGroup label="Tanggal Kepindahan" type="date" value={moveForm.tanggalPindah} onChange={v => setMoveForm({...moveForm, tanggalPindah: v})} />
                  <FormGroup label="Alamat Tujuan Pindah" value={moveForm.alamatTujuan} onChange={v => setMoveForm({...moveForm, alamatTujuan: v})} placeholder="Alamat lengkap tujuan baru" />
                  <FormGroup label="Alasan Kepindahan" value={moveForm.alasan} onChange={v => setMoveForm({...moveForm, alasan: v})} placeholder="Pekerjaan, Keluarga, dll" />
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Laporan Pindah</button>
                </form>
              )}

              {modalFormType === "datang" && (
                <form onSubmit={handleAddIncoming} className="space-y-4">
                  <FormGroup label="NIK Warga Datang" value={incomingForm.nik} onChange={v => setIncomingForm({...incomingForm, nik: v})} placeholder="Masukkan NIK" />
                  <FormGroup label="No Kartu Keluarga" value={incomingForm.noKK} onChange={v => setIncomingForm({...incomingForm, noKK: v})} placeholder="Masukkan No KK" />
                  <FormGroup label="Nama Lengkap" value={incomingForm.namaLengkap} onChange={v => setIncomingForm({...incomingForm, namaLengkap: v})} placeholder="Sesuai KTP/Kartu Keluarga" />
                  <FormGroup label="Tanggal Kedatangan" type="date" value={incomingForm.tanggalDatang} onChange={v => setIncomingForm({...incomingForm, tanggalDatang: v})} />
                  <FormGroup label="Alamat Asal" value={incomingForm.alamatAsal} onChange={v => setIncomingForm({...incomingForm, alamatAsal: v})} placeholder="Kabupaten/Provinsi asal" />
                  <FormGroup label="Keterangan" value={incomingForm.keterangan} onChange={v => setIncomingForm({...incomingForm, keterangan: v})} placeholder="Keterangan status tinggal" />
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Laporan Kedatangan</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto print-modal-parent">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md no-print" onClick={() => setShowPrintModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl relative z-10 shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between no-print">
              <div>
                <h4 className="text-lg font-black text-slate-800">Cetak Laporan Bulanan Demografi RT</h4>
                <p className="text-slate-400 text-xs">Preview laporan demografi format standar bulanan.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>
                        {new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handlePrint()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer size={14} /> Cetak / Print
                </button>
                <button onClick={() => setShowPrintModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 bg-slate-50 overflow-y-auto max-h-[70vh] flex justify-center">
              {loadingReport ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
                  <p className="text-xs text-slate-400 mt-2 font-bold">Menghitung statistik demografi...</p>
                </div>
              ) : reportData ? (
                <div className="print-area bg-white text-black p-8 shadow-md border border-slate-200 w-full max-w-[210mm] min-h-[297mm] font-serif text-[10px] leading-normal flex flex-col justify-between">
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      body {
                        visibility: hidden !important;
                      }
                      .print-area, .print-area * {
                        visibility: visible !important;
                      }
                      .print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}} />
                  
                  <div>
                    {/* Header */}
                    <div className="text-center font-bold text-xs uppercase border-b border-black pb-2 mb-4">
                      <div>Laporan Data (Lahir, Mati, Pindah dan Datang) Penduduk</div>
                      <div>Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor</div>
                      <div className="mt-1">
                        RT {reportData.rtInfo?.rt || "...."} RW {reportData.rtInfo?.rw || "...."} Bulan {new Date(0, reportMonth - 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase()} Tahun {reportYear}
                      </div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-12 gap-3 items-start">
                      {/* Left Age Table (0-38) */}
                      <div className="col-span-4">
                        <table className="w-full border-collapse border border-black text-center">
                          <thead>
                            <tr className="border-b border-black font-bold">
                              <th className="border-r border-black p-1 w-[40%]">USIA</th>
                              <th className="border-r border-black p-1 w-[30%]">L</th>
                              <th className="p-1 w-[30%]">P</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const rows = [];
                              const m0_11 = reportData.ageDistribution["0-11 BLN"] || { L: 0, P: 0 };
                              rows.push(
                                <tr key="0-11" className="border-b border-black">
                                  <td className="border-r border-black p-0.5 font-bold">0-11 BLN</td>
                                  <td className="border-r border-black p-0.5">{m0_11.L || "-"}</td>
                                  <td className="p-0.5">{m0_11.P || "-"}</td>
                                </tr>
                              );
                              for (let i = 1; i <= 38; i++) {
                                const val = reportData.ageDistribution[i.toString()] || { L: 0, P: 0 };
                                rows.push(
                                  <tr key={i} className="border-b border-black">
                                    <td className="border-r border-black p-0.5">{i}</td>
                                    <td className="border-r border-black p-0.5">{val.L || "-"}</td>
                                    <td className="p-0.5">{val.P || "-"}</td>
                                  </tr>
                                );
                              }
                              return rows;
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Right Age Table (39-75+ and JUMLAH) */}
                      <div className="col-span-4">
                        <table className="w-full border-collapse border border-black text-center">
                          <thead>
                            <tr className="border-b border-black font-bold">
                              <th className="border-r border-black p-1 w-[40%]">USIA</th>
                              <th className="border-r border-black p-1 w-[30%]">L</th>
                              <th className="p-1 w-[30%]">P</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const rows = [];
                              for (let i = 39; i <= 74; i++) {
                                const val = reportData.ageDistribution[i.toString()] || { L: 0, P: 0 };
                                rows.push(
                                  <tr key={i} className="border-b border-black">
                                    <td className="border-r border-black p-0.5">{i}</td>
                                    <td className="border-r border-black p-0.5">{val.L || "-"}</td>
                                    <td className="p-0.5">{val.P || "-"}</td>
                                  </tr>
                                );
                              }
                              const m75 = reportData.ageDistribution["75+"] || { L: 0, P: 0 };
                              rows.push(
                                <tr key="75+" className="border-b border-black">
                                  <td className="border-r border-black p-0.5">75 +</td>
                                  <td className="border-r border-black p-0.5">{m75.L || "-"}</td>
                                  <td className="p-0.5">{m75.P || "-"}</td>
                                </tr>
                              );
                              
                              // Calculate sums
                              let sumL = 0;
                              let sumP = 0;
                              Object.values(reportData.ageDistribution).forEach((val: any) => {
                                sumL += val.L || 0;
                                sumP += val.P || 0;
                              });

                              rows.push(
                                <tr key="jumlah" className="font-bold bg-slate-50">
                                  <td className="border-r border-black p-1">JUMLAH</td>
                                  <td className="border-r border-black p-1">{sumL}</td>
                                  <td className="p-1">{sumP}</td>
                                </tr>
                              );
                              return rows;
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary boxes (Right-most panel) */}
                      <div className="col-span-4 flex flex-col gap-2">
                        {/* 1. Penduduk */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] mb-1">PENDUDUK</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.totals?.penduduk?.L}</div>
                            <div className="border-r border-black">P: {reportData.totals?.penduduk?.P}</div>
                            <div className="font-bold">JML: {reportData.totals?.penduduk?.L + reportData.totals?.penduduk?.P}</div>
                          </div>
                        </div>

                        {/* 2. Wajib KTP */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] mb-1">WAJIB KTP 17+</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.totals?.wajibKtp?.L}</div>
                            <div className="border-r border-black">P: {reportData.totals?.wajibKtp?.P}</div>
                            <div className="font-bold">JML: {reportData.totals?.wajibKtp?.L + reportData.totals?.wajibKtp?.P}</div>
                          </div>
                        </div>

                        {/* 3. Kartu Keluarga */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] mb-1">KARTU KELUARGA (KK)</div>
                          <div className="text-center border-t border-black pt-1 font-bold">
                            TOTAL: {reportData.totals?.totalKK} KK
                          </div>
                        </div>

                        {/* 4. Penduduk Sementara */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] mb-1">PENDUDUK SEMENTARA</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.totals?.pendudukSementara?.L}</div>
                            <div className="border-r border-black">P: {reportData.totals?.pendudukSementara?.P}</div>
                            <div className="font-bold">JML: {reportData.totals?.pendudukSementara?.L + reportData.totals?.pendudukSementara?.P}</div>
                          </div>
                        </div>

                        {/* 5. Lahir */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] text-teal-800 mb-1">MUTASI: LAHIR</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.mutasi?.lahir?.L}</div>
                            <div className="border-r border-black">P: {reportData.mutasi?.lahir?.P}</div>
                            <div className="font-bold">JML: {reportData.mutasi?.lahir?.L + reportData.mutasi?.lahir?.P}</div>
                          </div>
                        </div>

                        {/* 6. Mati */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] text-red-800 mb-1">MUTASI: MENINGGAL</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.mutasi?.mati?.L}</div>
                            <div className="border-r border-black">P: {reportData.mutasi?.mati?.P}</div>
                            <div className="font-bold">JML: {reportData.mutasi?.mati?.L + reportData.mutasi?.mati?.P}</div>
                          </div>
                        </div>

                        {/* 7. Pindah */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] text-orange-800 mb-1">MUTASI: PINDAH (KELUAR)</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.mutasi?.pindah?.L}</div>
                            <div className="border-r border-black">P: {reportData.mutasi?.pindah?.P}</div>
                            <div className="font-bold">JML: {reportData.mutasi?.pindah?.L + reportData.mutasi?.pindah?.P}</div>
                          </div>
                        </div>

                        {/* 8. Datang */}
                        <div className="border border-black p-1.5">
                          <div className="font-bold text-[9px] text-blue-800 mb-1">MUTASI: DATANG (MASUK)</div>
                          <div className="grid grid-cols-3 text-center border-t border-black pt-1">
                            <div className="border-r border-black">L: {reportData.mutasi?.datang?.L}</div>
                            <div className="border-r border-black">P: {reportData.mutasi?.datang?.P}</div>
                            <div className="font-bold">JML: {reportData.mutasi?.datang?.L + reportData.mutasi?.datang?.P}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer text boxes */}
                    <div className="mt-4 border border-black p-2 min-h-[50px]">
                      <div className="font-bold mb-1">KETERANGAN PERUBAHAN PENDUDUK:</div>
                      <div className="italic text-slate-700 leading-relaxed">
                        {reportData.changesDesc}
                      </div>
                    </div>

                    <div className="mt-2 border border-black p-2">
                      <div className="font-bold mb-1">REALISASI PEMBUATAN KTP DAN KK BULAN INI:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>Kartu Tanda Penduduk (KTP): {reportData.totals?.wajibKtp?.L + reportData.totals?.wajibKtp?.P} Warga Wajib KTP terdata aktif</div>
                        <div>Kartu Keluarga (KK): {reportData.totals?.totalKK} KK terdaftar aktif di RT</div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="mt-8 flex justify-between items-end text-center">
                    <div>
                      {/* Empty spacer for alignment */}
                    </div>
                    <div className="w-[200px]">
                      <div>Bogor, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="font-bold mt-1 uppercase">Ketua RT {reportData.rtInfo?.rt || "...."} RW {reportData.rtInfo?.rw || "...."}</div>
                      <div className="h-16"></div>
                      <div className="border-b border-black mx-auto w-[150px]"></div>
                      <div className="text-[9px] mt-0.5 text-slate-500">Tanda Tangan & Cap Basah</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. ANNOUNCEMENTS TAB
// ==========================================
function AnnouncementsTab({ rt, rw }: { rt: string; rw: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "Kerja Bakti", date: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const data = await getRtAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.date) return;
    setActionLoading(true);
    const res = await addRtAnnouncement({
      title: form.title,
      content: form.content,
      category: form.category,
      date: new Date(form.date)
    });
    setActionLoading(false);
    if (res.success) {
      setForm({ title: "", content: "", category: "Kerja Bakti", date: "" });
      setShowAddForm(false);
      fetchAnnouncements();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    const res = await deleteRtAnnouncement(id);
    if (res.success) {
      fetchAnnouncements();
    }
  };

  const getWaText = (item: any) => {
    const formattedDate = new Date(item.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    return `📢 *PENGUMUMAN RT ${rt} / RW ${rw}* 📢\n------------------------------------\n*Topik*: ${item.title}\n*Kategori*: ${item.category}\n*Tanggal*: ${formattedDate}\n\n${item.content}\n------------------------------------\n_Pesan ini dikirim otomatis dari Dashboard Desa Cimanggu I_`;
  };

  const shareToWa = (item: any) => {
    const text = getWaText(item);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyToClipboard = (item: any) => {
    const text = getWaText(item);
    navigator.clipboard.writeText(text);
    alert("Template WhatsApp disalin ke clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">📢 Pengumuman & Agenda</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Siarkan informasi berkala untuk warga RT {rt} / RW {rw}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Batal" : "Buat Pengumuman"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm max-w-2xl">
          <form onSubmit={handleAdd} className="space-y-4">
            <FormGroup label="Judul/Topik Pengumuman" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="Contoh: Rapat Bulanan Warga" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
                <select
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="Kerja Bakti">Kerja Bakti</option>
                  <option value="Rapat Warga">Rapat Warga</option>
                  <option value="Posyandu">Posyandu</option>
                  <option value="Berita Duka">Berita Duka</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <FormGroup label="Tanggal Pelaksanaan" type="date" value={form.date} onChange={v => setForm({...form, date: v})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detail Informasi</label>
              <textarea
                value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
                placeholder="Tulis detail waktu, tempat, dan instruksi pengumuman..."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              {actionLoading ? "Menyimpan..." : "Simpan & Siarkan"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p className="text-slate-400 text-xs font-bold">Memuat pengumuman...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200/60 shadow-sm">
          <Megaphone className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold">Belum ada pengumuman terdaftar.</p>
          <p className="text-slate-400 text-xs mt-1">Pengumuman yang dibuat akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-600 rounded-md text-[9px] font-black tracking-wider uppercase">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Calendar size={12} />
                  <span>Pelaksanaan: {new Date(item.date).toLocaleDateString("id-ID")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => copyToClipboard(item)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 px-4 rounded-xl text-xs font-bold transition-all"
                >
                  <Clipboard size={14} /> Salin Template WA
                </button>
                <button
                  onClick={() => shareToWa(item)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10"
                >
                  <Share2 size={14} /> Share WA
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. COMPLAINTS TAB
// ==========================================
function ComplaintsTab({ rt, rw }: { rt: string; rw: string }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ reporterName: "", reporterPhone: "", title: "", content: "", category: "Fasilitas Umum", date: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const [showNotesModal, setShowNotesModal] = useState<any | null>(null);
  const [notes, setNotes] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    const data = await getRtComplaints();
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reporterName || !form.title || !form.content || !form.date) return;
    setActionLoading(true);
    const res = await addRtComplaint({
      reporterName: form.reporterName,
      reporterPhone: form.reporterPhone,
      title: form.title,
      content: form.content,
      category: form.category,
      date: new Date(form.date)
    });
    setActionLoading(false);
    if (res.success) {
      setForm({ reporterName: "", reporterPhone: "", title: "", content: "", category: "Fasilitas Umum", date: "" });
      setShowAddForm(false);
      fetchComplaints();
    }
  };

  const handleUpdateStatus = async (id: string, status: string, notesVal?: string) => {
    const res = await updateRtComplaintStatus(id, status, notesVal);
    if (res.success) {
      setShowNotesModal(null);
      setNotes("");
      fetchComplaints();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aduan ini?")) return;
    const res = await deleteRtComplaint(id);
    if (res.success) {
      fetchComplaints();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">🚨 Aduan & Aspirasi</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Pantau dan tindak lanjuti laporan serta keluhan warga
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Batal" : "Input Laporan Warga"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm max-w-2xl">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Nama Pelapor" value={form.reporterName} onChange={v => setForm({...form, reporterName: v})} placeholder="Contoh: Budi Santoso" />
              <FormGroup label="Nomor WhatsApp Pelapor" value={form.reporterPhone} onChange={v => setForm({...form, reporterPhone: v})} placeholder="Contoh: 0812xxxxxxxx" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori Aduan</label>
                <select
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="Fasilitas Umum">Fasilitas Umum (Lampu mati, dll)</option>
                  <option value="Keamanan">Keamanan & Ketertiban</option>
                  <option value="Sosial">Masalah Sosial/Warga</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <FormGroup label="Tanggal Kejadian/Laporan" type="date" value={form.date} onChange={v => setForm({...form, date: v})} />
            </div>

            <FormGroup label="Subjek Aduan" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="Contoh: Lampu Jalan RT 01 Mati" />

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detail Kronologi/Aspirasi</label>
              <textarea
                value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
                placeholder="Tuliskan keterangan detail..."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              {actionLoading ? "Menyimpan..." : "Kirim Aduan"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p className="text-slate-400 text-xs font-bold">Memuat laporan...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200/60 shadow-sm">
          <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold">Belum ada aduan warga.</p>
          <p className="text-slate-400 text-xs mt-1">Aduan yang diinput akan dipantau di sini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="p-6">Pelapor</th>
                  <th className="p-6">Laporan & Kategori</th>
                  <th className="p-6">Tanggal</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Tindak Lanjut</th>
                  <th className="p-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-slate-800">{item.reporterName}</div>
                      {item.reporterPhone && <div className="text-[10px] text-slate-400 font-medium">{item.reporterPhone}</div>}
                    </td>
                    <td className="p-6 max-w-md">
                      <div className="font-bold text-slate-800">{item.title}</div>
                      <div className="text-slate-500 mt-1 leading-relaxed">{item.content}</div>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black tracking-wider uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-6 font-semibold text-slate-500">
                      {new Date(item.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        item.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        item.status === "PROSES" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-6 max-w-xs">
                      {item.notes ? (
                        <div className="text-slate-600 italic">"{item.notes}"</div>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Belum ada tanggapan</span>
                      )}
                    </td>
                    <td className="p-6 text-right space-x-2 whitespace-nowrap">
                      {item.status !== "SELESAI" && (
                        <button
                          onClick={() => {
                            setShowNotesModal(item);
                            setNotes(item.notes || "");
                          }}
                          className="bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg font-bold"
                        >
                          Tindak Lanjut
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-200/60 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowNotesModal(null)}
              className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-xl text-slate-400 transition-all"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-lg font-black text-slate-800 mb-2">Tindak Lanjut Aduan</h3>
            <p className="text-xs text-slate-500 mb-6 font-semibold">Tulis catatan tindak lanjut dan ubah status aduan.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Status Baru</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(showNotesModal.id, "PROSES", notes)}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Set ke PROSES
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(showNotesModal.id, "SELESAI", notes)}
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Set ke SELESAI
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan Tindak Lanjut</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Contoh: Petugas sedang menuju ke lokasi untuk perbaikan."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 9. INVENTORY TAB
// ==========================================
function InventoryTab({ rt, rw, session }: { rt: string; rw: string; session?: any }) {
  const [inventories, setInventories] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [subTab, setSubTab] = useState<"items" | "loans">("items");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  
  const [itemForm, setItemForm] = useState({ itemName: "", quantity: 1, condition: "Baik", rt: "" });
  const [loanForm, setLoanForm] = useState({ inventoryId: "", borrowerName: "", borrowerPhone: "", quantity: 1, loanDate: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [invData, loanData] = await Promise.all([
      getRtInventories(),
      getRtInventoryLoans()
    ]);
    setInventories(invData);
    setLoans(loanData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.itemName || itemForm.quantity <= 0) return;
    setActionLoading(true);
    const res = await addRtInventory({
      itemName: itemForm.itemName,
      quantity: Number(itemForm.quantity),
      condition: itemForm.condition,
      rt: session?.user?.role === "RW" ? itemForm.rt : undefined
    });
    setActionLoading(false);
    if (res.success) {
      setItemForm({ itemName: "", quantity: 1, condition: "Baik", rt: "" });
      setShowAddForm(false);
      fetchData();
    }
  };

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.inventoryId || !loanForm.borrowerName || loanForm.quantity <= 0 || !loanForm.loanDate) return;
    setActionLoading(true);
    const res = await addRtInventoryLoan({
      inventoryId: loanForm.inventoryId,
      borrowerName: loanForm.borrowerName,
      borrowerPhone: loanForm.borrowerPhone,
      quantity: Number(loanForm.quantity),
      loanDate: new Date(loanForm.loanDate)
    });
    setActionLoading(false);
    if (res.success) {
      setLoanForm({ inventoryId: "", borrowerName: "", borrowerPhone: "", quantity: 1, loanDate: "" });
      setShowLoanForm(false);
      fetchData();
    } else {
      alert(res.error || "Gagal meminjam barang");
    }
  };

  const handleReturn = async (id: string) => {
    if (!confirm("Apakah barang ini sudah benar-benar dikembalikan?")) return;
    const res = await returnRtInventoryLoan(id);
    if (res.success) {
      fetchData();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Hapus aset ini dari database?")) return;
    const res = await deleteRtInventory(id);
    if (res.success) {
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">📦 Manajemen Inventaris {session?.user?.role === "RW" ? "RW" : "RT"}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            {session?.user?.role === "RW" ? `Data aset fasilitas seluruh RT di wilayah RW ${rw} dan pencatatan peminjaman barang` : `Data aset fasilitas RT ${rt} / RW ${rw} dan pencatatan peminjaman barang`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab("items")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "items" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Daftar Aset
          </button>
          <button
            onClick={() => setSubTab("loans")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "loans" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Peminjaman Aset
          </button>
        </div>
      </div>

      {subTab === "items" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Aset Fisik RT</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              {showAddForm ? <X size={14} /> : <Plus size={14} />}
              {showAddForm ? "Batal" : "Tambah Barang"}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm max-w-2xl">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormGroup label="Nama Barang/Aset" value={itemForm.itemName} onChange={v => setItemForm({...itemForm, itemName: v})} placeholder="Contoh: Kursi Plastik Hijau" />
                  </div>
                  <FormGroup label="Jumlah Unit" type="number" value={itemForm.quantity.toString()} onChange={v => setItemForm({...itemForm, quantity: Number(v)})} />
                </div>
                {session?.user?.role === "RW" && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aset Kepemilikan RT</label>
                    <select value={itemForm.rt} onChange={e => setItemForm({...itemForm, rt: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500" required>
                      <option value="">-- Pilih RT --</option>
                      {[...Array(20)].map((_, i) => {
                        const num = (i + 1).toString().padStart(3, '0');
                        return <option key={num} value={num}>RT {num}</option>;
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kondisi Awal</label>
                  <select
                    value={itemForm.condition}
                    onChange={e => setItemForm({...itemForm, condition: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  >
                    <option value="Baik">Baik & Layak Pakai</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Aset"}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-teal-600" size={32} />
              <p className="text-slate-400 text-xs font-bold">Memuat daftar aset...</p>
            </div>
          ) : inventories.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200/60 shadow-sm">
              <Package className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-bold">Belum ada aset terdaftar.</p>
              <p className="text-slate-400 text-xs mt-1">Daftarkan barang-barang milik RT di sini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="p-6">Nama Barang</th>
                      {session?.user?.role === "RW" && <th className="p-6">RT</th>}
                      <th className="p-6">Total Unit</th>
                      <th className="p-6">Dipinjam</th>
                      <th className="p-6">Kondisi</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {inventories.map((item) => {
                      const activeBorrowed = item.loans
                        ?.filter((l: any) => l.status === "DIPINJAM")
                        .reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 font-bold text-slate-800">{item.itemName}</td>
                          {session?.user?.role === "RW" && (
                            <td className="p-6">
                              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black">RT {item.rt}</span>
                            </td>
                          )}
                          <td className="p-6 font-black text-slate-800">{item.quantity} Unit</td>
                          <td className="p-6 font-semibold text-slate-500">
                            {activeBorrowed > 0 ? (
                              <span className="text-rose-500 font-bold">{activeBorrowed} Unit</span>
                            ) : (
                              "0 Unit"
                            )}
                          </td>
                          <td className="p-6">
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                              {item.condition}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === "loans" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Log Peminjaman Barang</h3>
            <button
              onClick={() => setShowLoanForm(!showLoanForm)}
              disabled={inventories.length === 0}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              {showLoanForm ? <X size={14} /> : <Plus size={14} />}
              {showLoanForm ? "Batal" : "Catat Pinjaman Baru"}
            </button>
          </div>

          {showLoanForm && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm max-w-2xl">
              <form onSubmit={handleAddLoan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Aset RT</label>
                    <select
                      value={loanForm.inventoryId}
                      onChange={e => setLoanForm({...loanForm, inventoryId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Pilih Barang --</option>
                      {inventories.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.itemName} (Stok: {inv.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <FormGroup label="Jumlah Dipinjam" type="number" value={loanForm.quantity.toString()} onChange={v => setLoanForm({...loanForm, quantity: Number(v)})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Nama Peminjam (Warga)" value={loanForm.borrowerName} onChange={v => setLoanForm({...loanForm, borrowerName: v})} placeholder="Contoh: Pak Joko" />
                  <FormGroup label="Nomor WhatsApp/Telepon" value={loanForm.borrowerPhone} onChange={v => setLoanForm({...loanForm, borrowerPhone: v})} placeholder="Contoh: 0812xxxxxxxx" />
                </div>

                <FormGroup label="Tanggal Peminjaman" type="date" value={loanForm.loanDate} onChange={v => setLoanForm({...loanForm, loanDate: v})} />

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {actionLoading ? "Menyimpan..." : "Kirim Catatan Pinjam"}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-teal-600" size={32} />
              <p className="text-slate-400 text-xs font-bold">Memuat data pinjaman...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200/60 shadow-sm">
              <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-bold">Belum ada riwayat peminjaman.</p>
              <p className="text-slate-400 text-xs mt-1">Gunakan tombol di atas untuk mencatat peminjaman baru.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="p-6">Peminjam</th>
                      <th className="p-6">Barang</th>
                      {session?.user?.role === "RW" && <th className="p-6">RT</th>}
                      <th className="p-6">Jumlah</th>
                      <th className="p-6">Tgl Pinjam</th>
                      <th className="p-6">Tgl Kembali</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loans.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <div className="font-bold text-slate-800">{item.borrowerName}</div>
                          {item.borrowerPhone && <div className="text-[10px] text-slate-400 font-medium">{item.borrowerPhone}</div>}
                        </td>
                        <td className="p-6 font-bold text-slate-800">{item.inventory?.itemName || "Barang Dihapus"}</td>
                        {session?.user?.role === "RW" && (
                          <td className="p-6">
                            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black">RT {item.inventory?.rt}</span>
                          </td>
                        )}
                        <td className="p-6 font-black text-slate-800">{item.quantity} Unit</td>
                        <td className="p-6 font-semibold text-slate-500">
                          {new Date(item.loanDate).toLocaleDateString("id-ID")}
                        </td>
                        <td className="p-6 font-semibold text-slate-500">
                          {item.returnDate ? new Date(item.returnDate).toLocaleDateString("id-ID") : "-"}
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                            item.status === "DIPINJAM" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                            "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          {item.status === "DIPINJAM" && (
                            <button
                              onClick={() => handleReturn(item.id)}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold"
                            >
                              Kembalikan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 10. GeoSENSUS TAB
// ==========================================
function GeoSensusTab({ session }: { session: any }) {
  const rt = (session?.user as any)?.rt || "";
  const rw = (session?.user as any)?.rw || "";
  const tenantId = (session?.user as any)?.tenantId || "";

  const [points, setPoints] = useState<any[]>([]);
  const [kks, setKks] = useState<any[]>([]);
  const [boundary, setBoundary] = useState<any>(null);
  const [rtBoundaries, setRtBoundaries] = useState<any[]>([]);
  const [rwBoundary, setRwBoundary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mapContainerId = "geosensus-operator-map";
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);
  const boundaryGroupRef = useRef<any>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [mode, setMode] = useState<"view" | "sensus" | "boundary">("view");
  const [isOffline, setIsOffline] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.invalidateSize();
      const t1 = setTimeout(() => map.invalidateSize(), 50);
      const t2 = setTimeout(() => map.invalidateSize(), 200);
      const t3 = setTimeout(() => map.invalidateSize(), 500);
      const t4 = setTimeout(() => map.invalidateSize(), 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isMapFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMapFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().catch(err => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  const [poiForm, setPoiForm] = useState({
    type: "RUMAH_WARGA",
    latitude: 0,
    longitude: 0,
    noKK: "",
    statusWarga: "WARGA_TETAP",
    name: "",
    categoryFasum: "IBADAH",
    description: ""
  });

  const [layers, setLayers] = useState({
    warga: true,
    fasum: true,
    boundary: true
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => {
        setIsOffline(false);
        triggerSync();
      };
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const triggerSync = async () => {
    const cached = localStorage.getItem("sensus-points-offline");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.length > 0) {
        for (const p of parsed) {
          await saveSensusPoint(p);
        }
        localStorage.removeItem("sensus-points-offline");
      }
    }

    const cachedBoundary = localStorage.getItem("sensus-boundary-offline");
    if (cachedBoundary) {
      await saveRtMapBoundary(JSON.parse(cachedBoundary));
      localStorage.removeItem("sensus-boundary-offline");
    }

    fetchInitialData();
  };

  const fetchInitialData = async () => {
    setLoading(true);
    if (session?.user?.role === "RW") {
      const [pts, fams, rwBoundRes] = await Promise.all([
        getSensusPoints(),
        getResidentKks(),
        getRwMapBoundaries()
      ]);
      setPoints(pts);
      setKks(fams);
      if (rwBoundRes.success) {
        setRwBoundary(rwBoundRes.rwBoundary);
        setRtBoundaries(rwBoundRes.rtBoundaries);
      }
    } else {
      const [pts, fams, boundRes] = await Promise.all([
        getSensusPoints(),
        getResidentKks(),
        getRtMapBoundary()
      ]);
      setPoints(pts);
      setKks(fams);
      if (boundRes.success && boundRes.boundary) {
        setBoundary(boundRes.boundary);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (loading) return;

    let mapInstance: any = null;

    async function init() {
      const L = (await import("leaflet")).default;
      LRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      await import("@geoman-io/leaflet-geoman-free");

      const container = L.DomUtil.get(mapContainerId);
      if (container) {
        (container as any)._leaflet_id = null;
      }

      let defaultCenter: [number, number] = [-6.5971, 106.6786];
      let defaultZoom = 16;

      if (session?.user?.role === "RW" && rwBoundary) {
        try {
          const coords = typeof rwBoundary.coordinates === "string" ? JSON.parse(rwBoundary.coordinates) : rwBoundary.coordinates;
          if (coords && coords.length > 0) defaultCenter = coords[0];
        } catch (e) {}
      } else if (boundary) {
        try {
          const coords = typeof boundary.coordinates === "string" ? JSON.parse(boundary.coordinates) : boundary.coordinates;
          if (coords && coords.length > 0) {
            defaultCenter = coords[0];
          }
        } catch (e) {}
      }

      mapInstance = L.map(mapContainerId, {
        zoomControl: true,
      }).setView(defaultCenter, defaultZoom);

      mapRef.current = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      layersGroupRef.current = L.layerGroup().addTo(mapInstance);
      boundaryGroupRef.current = L.layerGroup().addTo(mapInstance);

      mapInstance.on("click", (e: any) => {
        const activeMode = mapInstance.options.customMode;
        if (activeMode === "sensus") {
          const { lat, lng } = e.latlng;
          setPoiForm({
            type: "RUMAH_WARGA",
            latitude: lat,
            longitude: lng,
            noKK: "",
            statusWarga: "WARGA_TETAP",
            name: "",
            categoryFasum: "IBADAH",
            description: ""
          });
          setSelectedPoint({ isNew: true, latitude: lat, longitude: lng });
        }
      });

      redrawAll();
    }

    if (typeof window !== "undefined") {
      init();
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [loading, boundary, rwBoundary, rtBoundaries]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.options.customMode = mode;

      const L = LRef.current;
      if (!L) return;

      if (mode === "boundary") {
        mapRef.current.pm.addControls({
          position: 'topleft',
          drawMarker: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: false,
          drawCircle: false,
          drawPolygon: true,
          editMode: true,
          dragMode: true,
          cutPolygon: false,
          removalMode: true
        });

        mapRef.current.on("pm:create", (e: any) => {
          const layer = e.layer;
          
          if (typeof layer.getLatLngs === 'function') {
            try {
              const latlngs = layer.getLatLngs()[0];
              if (latlngs && Array.isArray(latlngs)) {
                const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
                coords.push(coords[0]); // Close the polygon
                
                if (confirm("Gunakan poligon ini sebagai batas RT Anda?")) {
                  handleSaveBoundary(coords);
                }
              }
            } catch (err) {
              console.error("Failed to parse polygon coordinates", err);
              alert("Gagal memproses poligon. Pastikan Anda menggambar bentuk area tertutup.");
            }
          } else {
            alert("Harap gunakan alat Poligon (Polygon) untuk menggambar batas wilayah.");
          }
          
          layer.remove(); // Always remove the drawn layer immediately as it's saved/handled via API
        });
      } else {
        mapRef.current.pm.removeControls();
      }
    }
  }, [mode]);

  useEffect(() => {
    redrawAll();
  }, [points, layers, boundary, rwBoundary, rtBoundaries]);

  const redrawAll = () => {
    const L = LRef.current;
    const map = mapRef.current;
    const pointGroup = layersGroupRef.current;
    const boundGroup = boundaryGroupRef.current;

    if (!L || !map || !pointGroup || !boundGroup) return;

    pointGroup.clearLayers();
    boundGroup.clearLayers();

    if (session?.user?.role === "RW") {
      if (layers.boundary && rtBoundaries.length > 0) {
        rtBoundaries.forEach(b => {
          try {
            const coords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates;
            if (coords && coords.length > 0) {
              const poly = L.polygon(coords, {
                color: b.color || "#10b981",
                fillColor: b.color || "#10b981",
                fillOpacity: 0.08,
                weight: 2,
                dashArray: "3, 5"
              }).addTo(boundGroup);
              poly.bindTooltip(`Batas RT ${b.name}`, { sticky: true, className: "font-bold text-xs text-slate-700 bg-white border border-slate-200 shadow-sm" });
            }
          } catch (e) {}
        });
      }
      if (layers.boundary && rwBoundary) {
        try {
          const coords = typeof rwBoundary.coordinates === "string" ? JSON.parse(rwBoundary.coordinates) : rwBoundary.coordinates;
          if (coords && coords.length > 0) {
            const poly = L.polygon(coords, {
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.05,
              weight: 4,
              dashArray: "8, 8"
            }).addTo(boundGroup);
            poly.bindTooltip(`Batas RW ${rwBoundary.name}`, { permanent: true, direction: "center", className: "font-black text-[10px] text-amber-700 bg-amber-50/80 border border-amber-200 shadow-sm px-2 py-1 rounded" });
          }
        } catch (e) {}
      }
    } else {
      if (boundary && layers.boundary) {
        try {
          const coords = typeof boundary.coordinates === "string" ? JSON.parse(boundary.coordinates) : boundary.coordinates;
          if (coords && coords.length > 0) {
            L.polygon(coords, {
              color: "#f43f5e",
              fillColor: "#f43f5e",
              fillOpacity: 0.15,
              weight: 3,
              dashArray: "4, 6"
            }).addTo(boundGroup);
          }
        } catch (e) {}
      }
    }

    points.forEach(p => {
      if (p.type === "RUMAH_WARGA" && !layers.warga) return;
      if (p.type === "FASUM_FASOS" && !layers.fasum) return;

      let markerColor = "#3b82f6";
      let popupContent = "";

      if (p.type === "RUMAH_WARGA") {
        if (p.statusWarga === "WARGA_TETAP") markerColor = "#10b981";
        else if (p.statusWarga === "KONTRAK") markerColor = "#f59e0b";
        else markerColor = "#94a3b8";

        popupContent = `
          <div class="font-sans">
            <span class="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mr-1">RUMAH</span>
            <span class="font-black text-slate-800 text-xs">${p.name || "Keluarga Baru"}</span>
            <div class="text-[10px] text-slate-500 mt-1 font-bold">KK: ${p.noKK || "-"}</div>
            <div class="text-[9px] font-bold text-slate-400 mt-0.5">Status: ${p.statusWarga?.replace("_", " ")}</div>
          </div>
        `;
      } else {
        markerColor = "#8b5cf6";
        popupContent = `
          <div class="font-sans">
            <span class="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded mr-1">FASUM</span>
            <span class="font-black text-slate-800 text-xs">${p.categoryFasum?.replace("_", " ")}</span>
            <div class="text-[10px] text-slate-500 mt-1 leading-relaxed">${p.description || "-"}</div>
          </div>
        `;
      }

      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: 8,
        fillColor: markerColor,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(pointGroup);

      marker.bindPopup(popupContent, { className: "premium-leaflet-popup" });

      marker.on("click", () => {
        setSelectedPoint(p);
        setPoiForm({
          type: p.type,
          latitude: p.latitude,
          longitude: p.longitude,
          noKK: p.noKK || "",
          statusWarga: p.statusWarga || "WARGA_TETAP",
          name: p.name || "",
          categoryFasum: p.categoryFasum || "IBADAH",
          description: p.description || ""
        });
      });
    });
  };

  const handleSavePoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poiForm.latitude === 0 || poiForm.longitude === 0) return;

    let payload: any = {
      type: poiForm.type,
      latitude: poiForm.latitude,
      longitude: poiForm.longitude,
    };

    if (selectedPoint && !selectedPoint.isNew) {
      payload.id = selectedPoint.id;
    }

    if (poiForm.type === "RUMAH_WARGA") {
      const selectedKk = kks.find(k => k.noKK === poiForm.noKK);
      payload.noKK = poiForm.noKK;
      payload.statusWarga = poiForm.statusWarga;
      payload.name = selectedKk ? selectedKk.namaLengkap : poiForm.name;
    } else {
      payload.categoryFasum = poiForm.categoryFasum;
      payload.description = poiForm.description;
    }

    if (isOffline) {
      const cached = localStorage.getItem("sensus-points-offline");
      const list = cached ? JSON.parse(cached) : [];
      list.push(payload);
      localStorage.setItem("sensus-points-offline", JSON.stringify(list));
      alert("Offline Mode: Data disimpan lokal di cache browser.");
      
      setPoints([...points, { ...payload, id: Math.random().toString() }]);
      setSelectedPoint(null);
      redrawAll();
    } else {
      setActionLoading(true);
      const res = await saveSensusPoint(payload);
      setActionLoading(false);
      if (res.success) {
        setSelectedPoint(null);
        fetchInitialData();
      }
    }
  };

  const handleDeletePoi = async (id: string) => {
    if (!confirm("Hapus data sensus ini?")) return;
    if (isOffline) {
      setPoints(points.filter(p => p.id !== id));
      setSelectedPoint(null);
    } else {
      const res = await deleteSensusPoint(id);
      if (res.success) {
        setSelectedPoint(null);
        fetchInitialData();
      }
    }
  };

  const handleSaveBoundary = async (coordinates: any) => {
    if (isOffline) {
      localStorage.setItem("sensus-boundary-offline", JSON.stringify(coordinates));
      alert("Offline Mode: Batas wilayah disimpan lokal di browser cache.");
      setBoundary({ coordinates });
    } else {
      setActionLoading(true);
      const res = await saveRtMapBoundary(coordinates);
      setActionLoading(false);
      if (res.success) {
        alert("Batas wilayah RT berhasil disimpan!");
        fetchInitialData();
      } else {
        alert("Gagal menyimpan batas wilayah: " + res.error);
      }
    }
    setMode("view");
  };

  const handleAutoRecommendPolygon = () => {
    if (points.length < 3) {
      alert("Dibutuhkan minimal 3 titik sensus untuk membuat rekomendasi batas (Convex Hull).");
      return;
    }

    const turf = require("@turf/turf");
    try {
      const turfPoints = points.map(p => turf.point([p.longitude, p.latitude]));
      const collection = turf.featureCollection(turfPoints);
      const hull = turf.convex(collection);

      if (hull) {
        const coordinates = hull.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);
        if (confirm("Sistem mendeteksi outline spasial pemukiman RT Anda. Gunakan rekomendasi ini sebagai batas wilayah?")) {
          handleSaveBoundary(coordinates);
        }
      } else {
        alert("Gagal menghitung Convex Hull. Pastikan koordinat titik-titik Anda tidak sejajar satu garis lurus.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const calculatePolygonStats = () => {
    if (!boundary) return { area: 0, houses: 0, fasum: 0 };

    const turf = require("@turf/turf");
    let areaVal = 0;
    try {
      const coords = typeof boundary.coordinates === "string" ? JSON.parse(boundary.coordinates) : boundary.coordinates;
      const turfCoords = coords.map((c: any) => [c[1], c[0]]);
      if (turfCoords[0][0] !== turfCoords[turfCoords.length - 1][0] || turfCoords[0][1] !== turfCoords[turfCoords.length - 1][1]) {
        turfCoords.push(turfCoords[0]);
      }
      const poly = turf.polygon([turfCoords]);
      areaVal = turf.area(poly);
    } catch (e) {}

    const housesPlotted = points.filter(p => p.type === "RUMAH_WARGA").length;
    const fasumPlotted = points.filter(p => p.type === "FASUM_FASOS").length;

    return {
      area: areaVal,
      houses: housesPlotted,
      fasum: fasumPlotted
    };
  };

  const polyStats = calculatePolygonStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">🗺️ GeoSENSUS RT</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Digitalisasi spasial pemukiman, fasilitas, dan batas teritorial RT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOffline && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-rose-100 animate-pulse">
              Offline Cache Aktif
            </div>
          )}
          {isOffline && (
            <button
              onClick={triggerSync}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Sync
            </button>
          )}

          {mode === "view" ? (
            <>
              <button
                onClick={() => setMode("sensus")}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Sensus POI (Plotting)
              </button>
              <button
                onClick={() => setMode("boundary")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Gambar Batas (Polygon)
              </button>
              <button
                onClick={handleAutoRecommendPolygon}
                title="Menarik polygon terluar dari titik pemukiman warga secara otomatis"
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Batas Otomatis (Convex Hull)
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMode("view");
                setSelectedPoint(null);
              }}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Kembali ke Preview
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Layer Switcher:</span>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
          <input type="checkbox" checked={layers.warga} onChange={e => setLayers({...layers, warga: e.target.checked})} className="rounded text-teal-600" />
          Rumah Warga
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
          <input type="checkbox" checked={layers.fasum} onChange={e => setLayers({...layers, fasum: e.target.checked})} className="rounded text-purple-600" />
          Fasilitas Umum / POI
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
          <input type="checkbox" checked={layers.boundary} onChange={e => setLayers({...layers, boundary: e.target.checked})} className="rounded text-rose-600" />
          Batas Teritorial RT
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        <div 
          ref={mapWrapperRef}
          className={`lg:col-span-2 bg-white p-3 border border-slate-200/60 shadow-sm relative overflow-hidden ${
            isMapFullscreen ? "w-full h-full rounded-none p-0" : "rounded-[3rem]"
          }`}
        >
          {mode === "sensus" && (
            <div className="absolute top-6 left-6 z-[1000] bg-teal-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider animate-bounce shadow-md">
              Mode Plotting: Klik di Peta untuk Menaruh Point Sensus
            </div>
          )}
          {mode === "boundary" && (
            <div className="absolute top-6 left-6 z-[1000] bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse shadow-md">
              Mode Batas: Klik tools gambar poligon (pentagon icon) di pojok kiri atas peta
            </div>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 z-[5000] bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center border border-slate-200"
            title={isMapFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isMapFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <div id={mapContainerId} className={`w-full ${isMapFullscreen ? "h-screen rounded-none" : "h-[550px] rounded-[2.5rem]"} z-10`} />
        </div>

        <div className="space-y-6">
          {boundary && (
            <div className="bg-slate-950 p-6 md:p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                <Compass size={12} /> Estimasi Batas Teritorial RT
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase">Luas Wilayah</span>
                  <span className="text-xl font-black">{polyStats.area > 10000 ? `${(polyStats.area / 10000).toFixed(2)} Ha` : `${polyStats.area.toFixed(0)} m²`}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase">Pemukiman Warga</span>
                  <span className="text-xl font-black">{polyStats.houses} Rumah</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Fasum Plotted</span>
                <span className="font-black text-white">{polyStats.fasum} Fasilitas</span>
              </div>
            </div>
          )}

          {selectedPoint ? (
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-4 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm">
                  {selectedPoint.isNew ? "Plotting Sensus Baru" : "Edit Sensus Point"}
                </h3>
                <button onClick={() => setSelectedPoint(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
              </div>

              <form onSubmit={handleSavePoi} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipe Point</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPoiForm({ ...poiForm, type: "RUMAH_WARGA" })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        poiForm.type === "RUMAH_WARGA" ? "bg-teal-600 text-white" : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      Rumah Warga
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoiForm({ ...poiForm, type: "FASUM_FASOS" })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        poiForm.type === "FASUM_FASOS" ? "bg-purple-600 text-white" : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      Fasum / Fasos
                    </button>
                  </div>
                </div>

                {poiForm.type === "RUMAH_WARGA" ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kepala Keluarga (Database)</label>
                      <select
                        value={poiForm.noKK}
                        onChange={e => setPoiForm({ ...poiForm, noKK: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                      >
                        <option value="">-- Pilih KK --</option>
                        {kks.map((k, index) => (
                          <option key={`${k.noKK}-${index}`} value={k.noKK}>{k.namaLengkap} (KK: {k.noKK})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status Hunian</label>
                      <select
                        value={poiForm.statusWarga}
                        onChange={e => setPoiForm({ ...poiForm, statusWarga: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                      >
                        <option value="WARGA_TETAP">Warga Tetap</option>
                        <option value="KONTRAK">Kontrak/Sewa</option>
                        <option value="RUMAH_KOSONG">Rumah Kosong</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kategori Fasilitas</label>
                      <select
                        value={poiForm.categoryFasum}
                        onChange={e => setPoiForm({ ...poiForm, categoryFasum: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                      >
                        <option value="IBADAH">Masjid / Mushola</option>
                        <option value="POS_RONDA">Pos Ronda / Poskamling</option>
                        <option value="LAPANGAN">Lapangan / Area Terbuka</option>
                        <option value="PEMAKAMAN">Pemakaman Warga</option>
                        <option value="UMKM">Toko / UMKM Warga</option>
                        <option value="RAWAN_BENCANA">Area Rawan Bencana</option>
                        <option value="SAMPAH">TPS / Pembuangan Sampah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deskripsi Singkat</label>
                      <textarea
                        value={poiForm.description}
                        onChange={e => setPoiForm({ ...poiForm, description: e.target.value })}
                        placeholder="Contoh: Mushola RT 02 Nurul Huda"
                        className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Simpan Point
                  </button>
                  {!selectedPoint.isNew && (
                    <button
                      type="button"
                      onClick={() => handleDeletePoi(selectedPoint.id)}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-3 rounded-xl text-xs font-bold transition-all"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm text-center">
              <Compass className="mx-auto text-slate-300 mb-3" size={36} />
              <p className="text-slate-500 text-xs font-bold">Pilih Point Sensus di Peta untuk melihat detail atau klik tombol sensus untuk memplot data baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { BansosClient } from "../bansos/BansosClient";
function BansosTab({ session }: { session: any }) {
  return <BansosClient session={session} />;
}
