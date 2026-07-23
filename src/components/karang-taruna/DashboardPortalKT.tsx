"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Activity, Plus, Search, CheckCircle2, AlertTriangle, FileText,
  DollarSign, ArrowLeft, LogOut, Sparkles, Building2, UserPlus, HeartPulse,
  ShoppingBag, ShieldCheck, UserCheck
} from "lucide-react";
import {
  searchWargaForKarangTaruna, createKarangTarunaMemberAccount,
  getKarangTarunaActivityLogs, addKarangTarunaActivityLog,
  getKarangTarunaPerformanceSummaryForKasiPelayanan
} from "@/actions/karangTarunaPortal";

export function DashboardPortalKT() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "MEMBER";
  const user = searchParams.get("user") || "Anggota Pemuda";

  const [activeTab, setActiveTab] = useState<"kinerja" | "anggota" | "kas">("kinerja");
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Member Registration State with Data Kependudukan Integration
  const [wargaQuery, setWargaQuery] = useState("");
  const [wargaResults, setWargaResults] = useState<any[]>([]);
  const [promptNotice, setPromptNotice] = useState<string | null>(null);
  const [searchingWarga, setSearchingWarga] = useState(false);

  // New Member Form Data
  const [memberForm, setMemberForm] = useState({
    namaLengkap: "",
    nik: "",
    role: "KARANG_TARUNA_MEMBER" as any,
    divisi: "Kegiatan Sosial",
    rt: "001",
    rw: "001",
    noHp: "",
    keahlian: "",
    username: ""
  });

  // New Activity Log Form Data
  const [logForm, setLogForm] = useState({
    title: "",
    category: "Kegiatan Sosial",
    description: "",
    memberName: user,
    fileUrl: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, logsRes] = await Promise.all([
        getKarangTarunaPerformanceSummaryForKasiPelayanan(),
        getKarangTarunaActivityLogs()
      ]);
      setSummary(sumRes);
      setLogs(logsRes);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search Warga Integration Effect
  useEffect(() => {
    if (!wargaQuery || wargaQuery.trim().length === 0) {
      setWargaResults([]);
      setPromptNotice(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingWarga(true);
      const { results, promptNotice: notice } = await searchWargaForKarangTaruna(wargaQuery);
      setWargaResults(results);
      setPromptNotice(notice);
      setSearchingWarga(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [wargaQuery]);

  const handleSelectWarga = (w: any) => {
    setMemberForm(prev => ({
      ...prev,
      namaLengkap: w.namaLengkap,
      nik: w.nik,
      rt: w.rt || "001",
      rw: w.rw || "001",
      username: (w.namaLengkap || "").toLowerCase().replace(/\s+/g, "")
    }));
    setWargaResults([]);
    setWargaQuery(w.namaLengkap);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await createKarangTarunaMemberAccount(memberForm);
    setShowMemberModal(false);
    setMemberForm({
      namaLengkap: "", nik: "", role: "KARANG_TARUNA_MEMBER",
      divisi: "Kegiatan Sosial", rt: "001", rw: "001", noHp: "", keahlian: "", username: ""
    });
    setWargaQuery("");
    fetchData();
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await addKarangTarunaActivityLog(logForm);
    setShowLogModal(false);
    setLogForm({ title: "", category: "Kegiatan Sosial", description: "", memberName: user, fileUrl: "" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/karang-taruna" className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md">
            KT
          </Link>
          <div>
            <h1 className="font-extrabold text-sm text-white">Dashboard Portal Karang Taruna</h1>
            <p className="text-[10px] text-indigo-400 font-bold">
              Role: {role === "BENDAHARA" ? "Bendahara Keuangan" : "Anggota Pemuda"} • Login: {user}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Dashboard Desa Utama
          </Link>
          <Link
            href="/karang-taruna/login"
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
          >
            <LogOut size={14} /> Keluar
          </Link>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Anggota Aktif</p>
              <p className="text-2xl font-black text-white mt-1">{summary ? summary.activeMembersCount : 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laporan Kinerja Terkirim</p>
              <p className="text-2xl font-black text-white mt-1">{logs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Activity size={22} />
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Pemuda</p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {summary ? `Rp ${(summary.saldoKas || 0).toLocaleString("id-ID")}` : "Rp 0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
          </div>
        </div>

        {/* SUB-TABS & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("kinerja")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "kinerja" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Laporan Kinerja Anggota
            </button>
            <button
              onClick={() => setActiveTab("anggota")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "anggota" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Kelola & Tambah Anggota
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus size={15} /> Mendaftarkan Anggota Baru
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-95"
            >
              <Plus size={15} /> Input Laporan Kinerja
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "kinerja" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-white">Rekapan Laporan Kinerja Anggota</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tersinkronisasi otomatis dengan Dashboard Kasi Pelayanan Desa</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ✓ Auto-Sync Kasi Pelayanan Active
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Memuat laporan kinerja...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Belum ada laporan kinerja yang diinput.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {log.category || "Kegiatan Sosial"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm leading-snug">{log.fileName}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{log.size || "Oleh: Anggota Karang Taruna"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "anggota" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-white">Database Anggota & Integrasi Data Kependudukan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daftar anggota aktif terintegrasi dengan Data Kependudukan Desa</p>
              </div>
              <button
                onClick={() => setShowMemberModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                + Tambah Anggota
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <th className="p-3">Nama Anggota</th>
                    <th className="p-3">Jabatan / Role</th>
                    <th className="p-3">Wilayah</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {summary?.programs ? (
                    <tr>
                      <td className="p-3 font-extrabold text-white">{user}</td>
                      <td className="p-3">{role === "BENDAHARA" ? "Bendahara Keuangan" : "Anggota Pemuda"}</td>
                      <td className="p-3">RT 001 / RW 001</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">Aktif</span></td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL INPUT LAPORAN KINERJA */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">Input Laporan Kinerja Anggota</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Kegiatan / Kinerja *</label>
                <input
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                  required
                  type="text"
                  placeholder="Misal: Kerja Bakti Pembersihan Pos Ronda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kategori Divisi *</label>
                <select
                  value={logForm.category}
                  onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="Kegiatan Sosial">Kegiatan Sosial & Gotong Royong</option>
                  <option value="Kewirausahaan UEP">Kewirausahaan UEP</option>
                  <option value="Olahraga & Seni">Olahraga & Seni Budaya</option>
                  <option value="Keuangan & LPJ">Keuangan & LPJ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Hasil Kinerja *</label>
                <textarea
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Rincian hasil kegiatan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">Simpan & Kirim Laporan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENDAFTARAN ANGGOTA (WITH DATA KEPENDUDUKAN SEARCH & WARNING PROMPT) */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">Mendaftarkan Anggota Baru</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            {/* INTEGRASI DATA KEPENDUDUKAN SEARCH BOX */}
            <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2">
              <label className="block font-bold text-indigo-300">
                🔍 Integrasi Data Kependudukan (Cari NIK / Nama Warga)
              </label>
              <input
                type="text"
                value={wargaQuery}
                onChange={(e) => setWargaQuery(e.target.value)}
                placeholder="Ketik NIK atau Nama Calon Anggota..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
              />

              {/* SEARCH RESULTS DROPDOWN */}
              {wargaResults.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800 max-h-40 overflow-y-auto">
                  {wargaResults.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectWarga(w)}
                      className="w-full p-2.5 text-left hover:bg-indigo-600/20 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-bold text-white">{w.namaLengkap}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIK: {w.nik} • RT {w.rt}/RW {w.rw}</p>
                      </div>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">Pilih</span>
                    </button>
                  ))}
                </div>
              )}

              {/* WARNING PROMPT NOTICE IF NOT FOUND IN DATA KEPENDUDUKAN DESA */}
              {promptNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Data Belum Terdaftar di Desa:</strong>
                    <span>{promptNotice}</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Anggota *</label>
                <input
                  value={memberForm.namaLengkap}
                  onChange={(e) => setMemberForm({ ...memberForm, namaLengkap: e.target.value })}
                  required
                  type="text"
                  placeholder="Nama Lengkap Pemuda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NIK (Opsional)</label>
                  <input
                    value={memberForm.nik}
                    onChange={(e) => setMemberForm({ ...memberForm, nik: e.target.value })}
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role / Jabatan *</label>
                  <select
                    value={memberForm.role}
                    onChange={(e: any) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="KARANG_TARUNA_MEMBER">Anggota Divisi / RW</option>
                    <option value="KARANG_TARUNA_BENDAHARA">Bendahara Keuangan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">RT *</label>
                  <input
                    value={memberForm.rt}
                    onChange={(e) => setMemberForm({ ...memberForm, rt: e.target.value })}
                    required
                    type="text"
                    placeholder="001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">RW *</label>
                  <input
                    value={memberForm.rw}
                    onChange={(e) => setMemberForm({ ...memberForm, rw: e.target.value })}
                    required
                    type="text"
                    placeholder="001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">Simpan Anggota</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
