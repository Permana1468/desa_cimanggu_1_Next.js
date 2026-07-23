"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Wallet, FileText, Package, Calendar,
  ShoppingBag, Image as ImageIcon, Sparkles, LogOut, ExternalLink,
  ChevronRight, Building2, UserPlus, ShieldCheck, HeartPulse
} from "lucide-react";
import Link from "next/link";
import { KarangTarunaDashboardClient } from "@/components/dashboard/roles/KarangTarunaDashboardClient";
import { DashboardPortalKT } from "./DashboardPortalKT";

export function AdminKetuaDashboardKT({ session }: { session?: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admin" | "member_portal">("admin");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER BAR KETUA / ADMIN */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
            KT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm text-white">Dashboard Admin Ketua Karang Taruna</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Akses Ketua / Pengurus Inti
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Desa Cimanggu I • Terintegrasi dengan Dashboard Kasi Pelayanan & Kades
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "admin" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Panel Utama Ketua
            </button>
            <button
              onClick={() => setActiveTab("member_portal")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "member_portal" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Monitor Kinerja Anggota
            </button>
          </div>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Portal Desa Utama
          </Link>
          <Link
            href="/karang-taruna"
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
          >
            <LogOut size={14} /> Keluar
          </Link>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {activeTab === "admin" ? (
          <div className="bg-slate-900/50 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <KarangTarunaDashboardClient />
          </div>
        ) : (
          <DashboardPortalKT />
        )}
      </main>

    </div>
  );
}
