"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  RefreshCcw, 
  Search, 
  FileText,
  AlertCircle,
  Archive,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { PhysicalMutationAlertBanner } from "@/components/dashboard/mutasi/PhysicalMutationAlertBanner";
import { searchWarga } from "@/actions/village";

export function ManajemenKependudukan({ session }: { session: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const res = await searchWarga(searchQuery.trim());
      setSearchResults(res || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manajemen Kependudukan & Arsip Fisik</h1>
          <p className="text-slate-500 text-sm mt-1">
            Rekonsiliasi mutasi warga desa dan pencatatan berkas fisik Buku Induk Penduduk.
          </p>
        </div>
        <Link
          href="/dashboard/warga"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Users size={16} />
          <span>Buka Data Induk Warga</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Peringatan & Antrean Berkas Fisik Khusus Seksi Pelayanan */}
      <PhysicalMutationAlertBanner
        role="KASI_PELAYANAN"
        onMutationUpdated={() => {
          if (hasSearched) handleSearch();
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Kiri */}
        <div className="lg:col-span-1 space-y-4">
          <Link
            href="/dashboard/warga"
            className="block text-left bg-emerald-600 text-white p-6 rounded-[2rem] shadow-lg shadow-emerald-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
            <UserPlus size={32} className="mb-4 text-emerald-200 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xl mb-1">Registrasi Warga Baru</h3>
            <p className="text-emerald-100 text-sm">Pendaftaran warga kelahiran atau pindah masuk.</p>
          </Link>

          <Link
            href="/dashboard/warga"
            className="block text-left bg-rose-600 text-white p-6 rounded-[2rem] shadow-lg shadow-rose-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
            <UserMinus size={32} className="mb-4 text-rose-200 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xl mb-1">Pencatatan Mutasi</h3>
            <p className="text-rose-100 text-sm">Kelola arsip warga pindah keluar & meninggal.</p>
          </Link>

          <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-lg shadow-indigo-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
            <Archive size={32} className="mb-4 text-indigo-200" />
            <h3 className="font-black text-xl mb-1">Buku Induk Desa</h3>
            <p className="text-indigo-100 text-sm">
              Sesuai Permendagri No. 47/2016, seluruh mutasi fisik wajib dibukukan dan disimpan nomor mapnya.
            </p>
          </div>
        </div>

        {/* Form Pencarian Induk Kependudukan */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
          >
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Search className="text-indigo-600" />
              Cek Status Warga & Berkas Fisik
            </h2>
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik NIK atau Nama Lengkap Warga..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-900 text-xs"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 text-xs disabled:opacity-50"
              >
                {searching ? "Mencari..." : "Cari Data"}
              </button>
            </form>

            {hasSearched ? (
              searchResults.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((w: any) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{w.namaLengkap}</span>
                          {w.statusKependudukan === "MUTASI_PENDING" && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[9px] font-black uppercase">
                              ⚠️ Pending Fisik
                            </span>
                          )}
                          {w.statusKependudukan === "MENINGGAL" && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-[9px] font-black uppercase">
                              Meninggal
                            </span>
                          )}
                          {w.statusKependudukan === "PINDAH_KELUAR" && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[9px] font-black uppercase">
                              Pindah
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          NIK: {w.nik} | No. KK: {w.noKK} | RT {w.rt} / RW {w.rw}
                        </div>
                        {w.keteranganStatus && (
                          <div className="text-[11px] text-amber-800 font-medium">{w.keteranganStatus}</div>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/warga?q=${encodeURIComponent(w.nik)}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 transition-colors shrink-0"
                      >
                        Detail
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 bg-slate-50/50">
                  <p className="font-bold">Tidak ada data warga yang cocok dengan pencarian.</p>
                </div>
              )
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <FileText size={48} className="mb-4 text-slate-300" />
                <p className="font-bold">Hasil pencarian warga akan muncul di sini</p>
                <p className="text-xs mt-1">Masukkan NIK atau Nama Lengkap untuk mengecek status fisik.</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-amber-50 rounded-[2rem] p-6 border border-amber-200 flex gap-4"
          >
            <AlertCircle size={24} className="text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800 mb-1">Rekonsiliasi Dual-Sync (Digital & Fisik)</h3>
              <p className="text-amber-700/80 text-xs leading-relaxed">
                Setiap mutasi warga yang dilaporkan oleh Ketua RT akan memunculkan peringatan otomatis. Berkas fisik
                seperti KTP lama yang ditarik, Surat Kematian asli, atau Surat Pengantar RT wajib diverifikasi di meja
                pelayanan dan dicatat lokasi map arsipnya sebelum draft peringatan dihilangkan.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
