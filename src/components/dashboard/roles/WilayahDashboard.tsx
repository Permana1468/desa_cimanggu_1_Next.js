"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Users, MapPin, FileText, AlertTriangle, HeartPulse, TrendingUp, Search, 
  CheckCircle2, ChevronRight, Banknote, Calendar, Plus, Trash2, ArrowUpRight, 
  ArrowDownRight, Check, X, FileSpreadsheet, Loader2, Sparkles, PlusCircle,
  FileDown, Info, Edit, Eye, UserPlus, Milestone, Megaphone, AlertCircle, Package,
  Compass, Share2, Clipboard, Activity, Layers, Maximize, Minimize
} from "lucide-react";
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
  getRtMapBoundary, saveRtMapBoundary, getRwDashboardStats, getRwMapBoundaries
} from "@/actions/rt";
import { getWargaList, addWarga, updateWarga, deleteWarga, getSuratList, updateSuratStatus } from "@/actions/village";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

export function WilayahDashboard({ session, stats: initialStats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace('_', ' ') || "Perangkat Wilayah";
  const userRt = (session?.user as any)?.rt;
  const userRw = (session?.user as any)?.rw;

  let displayTitle = `Dashboard ${roleName}`;
  if (roleName === "RT" && userRt && userRw) {
    displayTitle = `Dashboard RT ${userRt} / RW ${userRw}`;
  } else if (roleName === "RW" && userRw) {
    displayTitle = `Dashboard RW ${userRw}`;
  }

  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"overview" | "warga" | "finance" | "surat" | "kegiatan" | "lampid" | "announcements" | "complaints" | "inventory" | "geosensus" | "bansos">("overview");

  useEffect(() => {
    if (tabParam && ["overview", "warga", "finance", "surat", "kegiatan", "lampid", "announcements", "complaints", "inventory", "geosensus", "bansos"].includes(tabParam)) {
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
    if (session?.user?.role === "RW") {
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
        {activeTab === "warga" && <WargaTab session={session} />}
        {activeTab === "finance" && <FinanceTab totalKas={stats.totalKas} />}
        {activeTab === "surat" && <SuratTab />}
        {activeTab === "kegiatan" && <KegiatanTab session={session} />}
        {activeTab === "lampid" && <LampidTab stats={stats} />}
        {activeTab === "announcements" && <AnnouncementsTab rt={userRt} rw={userRw} />}
        {activeTab === "complaints" && <ComplaintsTab rt={userRt} rw={userRw} />}
        {activeTab === "inventory" && <InventoryTab rt={userRt} rw={userRw} session={session} />}
        {activeTab === "geosensus" && <GeoSensusTab session={session} />}
        {activeTab === "bansos" && <BansosTab session={session} />}
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
function WargaTab({ session }: { session?: any }) {
  const [query, setQuery] = useState("");
  const [filterRt, setFilterRt] = useState("");
  const [wargaList, setWargaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nik: "",
    noKK: "",
    namaLengkap: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "LAKI_LAKI",
    alamat: "",
    rt: "",
    rw: "",
    dusun: "Dusun 1",
    agama: "ISLAM",
    statusKawin: "BELUM_KAWIN",
    hubunganKeluarga: "KEPALA_KELUARGA",
    pekerjaan: ""
  });

  const loadWarga = async () => {
    setLoading(true);
    const data = await getWargaList(query, filterRt);
    setWargaList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWarga();
  }, [filterRt]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadWarga();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nik: "",
      noKK: "",
      namaLengkap: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "LAKI_LAKI",
      alamat: "",
      rt: "",
      rw: "",
      dusun: "Dusun 1",
      agama: "ISLAM",
      statusKawin: "BELUM_KAWIN",
      hubunganKeluarga: "KEPALA_KELUARGA",
      pekerjaan: ""
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      nik: item.nik,
      noKK: item.noKK,
      namaLengkap: item.namaLengkap,
      tempatLahir: item.tempatLahir,
      tanggalLahir: new Date(item.tanggalLahir).toISOString().split('T')[0],
      jenisKelamin: item.jenisKelamin,
      alamat: item.alamat,
      rt: item.rt,
      rw: item.rw,
      dusun: item.dusun,
      agama: item.agama,
      statusKawin: item.statusKawin,
      hubunganKeluarga: item.hubunganKeluarga,
      pekerjaan: item.pekerjaan || ""
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

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">{session?.user?.role === "RW" ? "Manajemen Data Warga RW" : "Manajemen Data Warga RT"}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{session?.user?.role === "RW" ? "Kelola dan pantau seluruh warga di wilayah RW Anda." : "Kelola, tambah, edit, dan hapus warga di wilayah RT Anda saja."}</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <UserPlus size={16} /> Tambah Warga
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-3">
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
            {[...Array(20)].map((_, i) => {
              const num = (i + 1).toString().padStart(3, '0');
              return <option key={num} value={num}>RT {num}</option>;
            })}
          </select>
        )}
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
        ) : wargaList.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama / NIK</th>
                <th className="py-3 px-4">No KK</th>
                {session?.user?.role === "RW" && <th className="py-3 px-4">RT</th>}
                <th className="py-3 px-4">Hub. Keluarga</th>
                <th className="py-3 px-4">Pekerjaan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
              {wargaList.map((w: any) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{w.namaLengkap}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{w.nik}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{w.noKK}</td>
                  {session?.user?.role === "RW" && (
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black">RT {w.rt}</span>
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[9px] font-bold uppercase text-slate-600">
                      {w.hubunganKeluarga.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{w.pekerjaan || "-"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(w)} className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 transition-all">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all">
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
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-800">{editingId ? "Edit Data Warga" : "Tambah Warga Baru"}</h4>
                <p className="text-slate-400 text-xs">Form input kependudukan resmi RT/RW.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/20">
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="NIK (16 Digit)" value={formData.nik} onChange={v => setFormData({...formData, nik: v})} placeholder="Masukkan NIK" />
                <FormGroup label="No. Kartu Keluarga" value={formData.noKK} onChange={v => setFormData({...formData, noKK: v})} placeholder="Masukkan No KK" />
              </div>
              <FormGroup label="Nama Lengkap" value={formData.namaLengkap} onChange={v => setFormData({...formData, namaLengkap: v})} placeholder="Masukkan Nama Lengkap" />
              
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Tempat Lahir" value={formData.tempatLahir} onChange={v => setFormData({...formData, tempatLahir: v})} placeholder="Masukkan Tempat Lahir" />
                <FormGroup label="Tanggal Lahir" type="date" value={formData.tanggalLahir} onChange={v => setFormData({...formData, tanggalLahir: v})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Jenis Kelamin</label>
                  <select value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
                    <option value="LAKI_LAKI">Laki-Laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Agama</label>
                  <select value={formData.agama} onChange={e => setFormData({...formData, agama: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
                    <option value="ISLAM">Islam</option>
                    <option value="KRISTEN">Kristen</option>
                    <option value="KATOLIK">Katolik</option>
                    <option value="HINDU">Hindu</option>
                    <option value="BUDHA">Budha</option>
                    <option value="KONGHUCU">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Hubungan Keluarga</label>
                  <select value={formData.hubunganKeluarga} onChange={e => setFormData({...formData, hubunganKeluarga: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="ISTRI">Istri</option>
                    <option value="ANAK">Anak</option>
                    <option value="ORANG_TUA">Orang Tua</option>
                    <option value="MERTUA">Mertua</option>
                    <option value="FAMILI_LAIN">Famili Lain</option>
                  </select>
                </div>
                <FormGroup label="Pekerjaan" value={formData.pekerjaan} onChange={v => setFormData({...formData, pekerjaan: v})} placeholder="Contoh: Karyawan Swasta" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Alamat Domisili</label>
                <textarea value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} placeholder="Masukkan alamat lengkap..." className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all min-h-[80px] text-slate-950" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormGroup label="RT" value={formData.rt} onChange={v => setFormData({...formData, rt: v})} placeholder="001" />
                <FormGroup label="RW" value={formData.rw} onChange={v => setFormData({...formData, rw: v})} placeholder="002" />
                <FormGroup label="Dusun" value={formData.dusun} onChange={v => setFormData({...formData, dusun: v})} placeholder="Dusun 1" />
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
function FinanceTab({ totalKas }: { totalKas: number }) {
  const [finances, setFinances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    type: "INCOME",
    category: "Iuran Warga",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });

  const loadFinances = async () => {
    setLoading(true);
    const data = await getRtFinance();
    setFinances(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFinances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addRtFinanceTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date),
        description: formData.description
      });
      if (res.success) {
        alert("Berhasil mencatat transaksi kas");
        setShowModal(false);
        setFormData({
          amount: "",
          type: "INCOME",
          category: "Iuran Warga",
          date: new Date().toISOString().split('T')[0],
          description: ""
        });
        loadFinances();
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Gagal menambahkan transaksi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan transaksi ini?")) return;
    try {
      const res = await deleteRtFinanceTransaction(id);
      if (res.success) {
        alert("Berhasil menghapus transaksi");
        loadFinances();
      } else {
        alert("Gagal menghapus");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">Kas & Iuran Keuangan RT</h3>
          <p className="text-slate-500 text-xs mt-0.5 font-bold">Total Saldo Kas RT Saat Ini: <span className="text-teal-600">Rp {totalKas.toLocaleString("id-ID")}</span></p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Catat Transaksi Kas
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-teal-600 mx-auto" size={32} />
          </div>
        ) : finances.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori / Keterangan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
              {finances.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500">{new Date(f.date).toLocaleDateString("id-ID")}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{f.category}</div>
                    {f.description && <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">{f.description}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    {f.type === "INCOME" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                        <ArrowUpRight size={12} /> Masuk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase">
                        <ArrowDownRight size={12} /> Keluar
                      </span>
                    )}
                  </td>
                  <td className={`py-3.5 px-4 font-black ${f.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {f.type === "INCOME" ? "+" : "-"} Rp {f.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center">
                      <button onClick={() => handleDelete(f.id)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-all">
                        <Trash2 size={14} />
                      </button>
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

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-800">Catat Kas Keuangan</h4>
                <p className="text-slate-400 text-xs">Pemasukan atau pengeluaran kas keuangan RT.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Jenis Transaksi</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
                    <option value="INCOME">Masuk (Pemasukan)</option>
                    <option value="EXPENSE">Keluar (Pengeluaran)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all text-slate-950">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Keterangan Tambahan</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Keterangan singkat..." className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all min-h-[70px] text-slate-950" />
              </div>

              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">
                Simpan Transaksi Kas
              </button>
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
function LampidTab({ stats }: { stats: any }) {
  const [subTab, setSubTab] = useState<"lahir" | "mati" | "pindah" | "datang">("lahir");
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Forms states
  const [birthForm, setBirthForm] = useState({ namaBayi: "", tanggalLahir: new Date().toISOString().split('T')[0], jenisKelamin: "LAKI_LAKI", namaAyah: "", namaIbu: "", keterangan: "" });
  const [deathForm, setDeathForm] = useState({ nik: "", namaLengkap: "", tanggalMeninggal: new Date().toISOString().split('T')[0], penyebab: "", keterangan: "" });
  const [moveForm, setMoveForm] = useState({ nik: "", namaLengkap: "", tanggalPindah: new Date().toISOString().split('T')[0], alamatTujuan: "", alasan: "" });
  const [incomingForm, setIncomingForm] = useState({ nik: "", noKK: "", namaLengkap: "", tanggalDatang: new Date().toISOString().split('T')[0], alamatAsal: "", keterangan: "" });

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
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Laporkan Peristiwa
        </button>
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
            
            <div className="p-6 bg-slate-50/20">
              {subTab === "lahir" && (
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

              {subTab === "mati" && (
                <form onSubmit={handleAddDeath} className="space-y-4">
                  <FormGroup label="NIK Warga Deceased" value={deathForm.nik} onChange={v => setDeathForm({...deathForm, nik: v})} placeholder="Masukkan NIK warga" />
                  <FormGroup label="Nama Lengkap" value={deathForm.namaLengkap} onChange={v => setDeathForm({...deathForm, namaLengkap: v})} placeholder="Sesuai KTP" />
                  <FormGroup label="Tanggal Meninggal" type="date" value={deathForm.tanggalMeninggal} onChange={v => setDeathForm({...deathForm, tanggalMeninggal: v})} />
                  <FormGroup label="Penyebab Kematian" value={deathForm.penyebab} onChange={v => setDeathForm({...deathForm, penyebab: v})} placeholder="Sakit, Kecelakaan, Usia Lanjut, dll" />
                  <FormGroup label="Keterangan Tambahan" value={deathForm.keterangan} onChange={v => setDeathForm({...deathForm, keterangan: v})} placeholder="Nomor surat kematian, dll" />
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Laporan Kematian</button>
                </form>
              )}

              {subTab === "pindah" && (
                <form onSubmit={handleAddMove} className="space-y-4">
                  <FormGroup label="NIK Warga Pindah" value={moveForm.nik} onChange={v => setMoveForm({...moveForm, nik: v})} placeholder="Masukkan NIK" />
                  <FormGroup label="Nama Lengkap" value={moveForm.namaLengkap} onChange={v => setMoveForm({...moveForm, namaLengkap: v})} placeholder="Sesuai KTP" />
                  <FormGroup label="Tanggal Kepindahan" type="date" value={moveForm.tanggalPindah} onChange={v => setMoveForm({...moveForm, tanggalPindah: v})} />
                  <FormGroup label="Alamat Tujuan Pindah" value={moveForm.alamatTujuan} onChange={v => setMoveForm({...moveForm, alamatTujuan: v})} placeholder="Alamat lengkap tujuan baru" />
                  <FormGroup label="Alasan Kepindahan" value={moveForm.alasan} onChange={v => setMoveForm({...moveForm, alasan: v})} placeholder="Pekerjaan, Keluarga, dll" />
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider mt-4 transition-all">Simpan Laporan Pindah</button>
                </form>
              )}

              {subTab === "datang" && (
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
          const latlngs = layer.getLatLngs()[0];
          const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
          coords.push(coords[0]);
          
          if (confirm("Gunakan poligon ini sebagai batas RT Anda?")) {
            handleSaveBoundary(coords);
          }
          layer.remove();
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
                        {kks.map(k => (
                          <option key={k.noKK} value={k.noKK}>{k.namaLengkap} (KK: {k.noKK})</option>
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
