"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Award, HeartPulse, ShoppingBag, ArrowRight, ShieldCheck,
  Calendar, CheckCircle2, Sparkles, LogIn, ChevronRight, Phone, MapPin,
  Building2, Activity, Wallet, FileText, Compass, Lightbulb
} from "lucide-react";
import { getKarangTarunaPerformanceSummaryForKasiPelayanan } from "@/actions/karangTarunaPortal";

export function LandingPortalKT() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKarangTarunaPerformanceSummaryForKasiPelayanan();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* NAVBAR PORTAL KARANG TARUNA */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
            KT
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white block leading-tight">KARANG TARUNA</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">DESA CIMANGGU I • KEC. CIBUNGBULANG</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
          <a href="#tentang" className="hover:text-indigo-400 transition-colors">Tentang</a>
          <a href="#proker" className="hover:text-indigo-400 transition-colors">Program Kerja</a>
          <a href="#uep" className="hover:text-indigo-400 transition-colors">Kewirausahaan UEP</a>
          <a href="#kinerja" className="hover:text-indigo-400 transition-colors">Rekapan Kinerja</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            Portal Desa Utama
          </Link>
          <Link
            href="/karang-taruna/login"
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all flex items-center gap-2"
          >
            <LogIn size={15} /> Login Anggota & Pengurus
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6 backdrop-blur-md">
          <Sparkles size={14} className="text-indigo-400 animate-pulse" /> Ekosistem Resmi Wadah Pemuda Kreatif Desa Cimanggu I
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl">
          Generasi Pemuda Unggul, <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mandiri, Kreatif & Berdampak
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl font-normal leading-relaxed">
          Pusat kegiatan kepemudaan, kewirausahaan UEP, kegiatan sosial kemasyarakatan, dan transparansi kinerja anggota Karang Taruna Desa Cimanggu I yang terintegrasi langsung dengan Pemerintah Desa.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/karang-taruna/login"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            Masuk Portal Anggota <ArrowRight size={16} />
          </Link>
          <a
            href="#proker"
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm transition-all"
          >
            Lihat Program Kerja
          </a>
        </div>

        {/* METRICS / STATS BANNER */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 text-center space-y-1">
            <Users className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{summary ? summary.activeMembersCount : "0"}</p>
            <p className="text-xs text-slate-400 font-medium">Anggota Aktif</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 text-center space-y-1">
            <Activity className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{summary ? summary.runningProgramsCount : "0"}</p>
            <p className="text-xs text-slate-400 font-medium">Proker Berjalan</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 text-center space-y-1">
            <ShoppingBag className="w-6 h-6 text-pink-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">3 Unit</p>
            <p className="text-xs text-slate-400 font-medium">Usaha UEP Pemuda</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 text-center space-y-1">
            <Wallet className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">
              {summary ? `Rp ${(summary.saldoKas || 0).toLocaleString("id-ID")}` : "Rp 0"}
            </p>
            <p className="text-xs text-slate-400 font-medium">Kas Terbuka LPJ</p>
          </div>
        </div>
      </section>

      {/* DIVISI & PILAR UTAMA */}
      <section id="tentang" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Pilar Gerakan Karang Taruna</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Membangun potensi pemuda desa melalui 4 pilar utama keberlanjutan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/40 p-6 rounded-3xl border border-indigo-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Sosial & Kemasyarakatan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Aksi tanggap bencana, gotong royong warga, bakti sosial, dan kepedulian lansia serta anak yatim desa.</p>
          </div>

          <div className="bg-gradient-to-b from-purple-950/40 to-slate-900/40 p-6 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              <ShoppingBag size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Kewirausahaan UEP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Pengembangan Usaha Ekonomi Produktif pemuda di bidang kuliner, jasa digital, dan produk kreatif desa.</p>
          </div>

          <div className="bg-gradient-to-b from-pink-950/40 to-slate-900/40 p-6 rounded-3xl border border-pink-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold">
              <Award size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Olahraga & Seni Budaya</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Turnamen pemuda desa, pelestarian seni tradisional, serta fasilitas olahraga kreatif generasi muda.</p>
          </div>

          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900/40 p-6 rounded-3xl border border-emerald-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Lightbulb size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Inovasi Digital Pemuda</h3>
            <p className="text-xs text-slate-400 leading-relaxed">E-Office kepemudaan, transparansi keuangan kas, serta integrasi rekapan kinerja dengan Kasi Pelayanan Desa.</p>
          </div>
        </div>
      </section>

      {/* FOOTER PORTAL */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 Portal Karang Taruna Desa Cimanggu I. Terintegrasi dengan Sistem Informasi Desa.</p>
      </footer>

    </div>
  );
}
