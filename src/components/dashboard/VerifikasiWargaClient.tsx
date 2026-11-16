"use client";

import React, { useState } from "react";
import { 
  Users, 
  CheckCircle2, 
  Search, 
  AlertTriangle, 
  Fingerprint, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  X 
} from "lucide-react";
import { verifyWargaUser } from "@/actions/wargaVerifikasi";

export default function VerifikasiWargaClient({ users }: { users: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.nik && u.nik.includes(searchQuery))
  );

  const pendingCount = users.filter((u) => !u.isActive).length;
  const verifiedCount = users.filter((u) => u.isActive).length;

  const handleVerify = async (userId: string, isActive: boolean) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin ${isActive ? "menyetujui" : "menolak/membekukan"} pendaftaran warga ini?`
      )
    )
      return;

    setIsSubmitting(userId);
    const res = await verifyWargaUser(userId, isActive);
    setIsSubmitting(null);

    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION (DESKTOP & MOBILE ADAPTIVE) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <Fingerprint size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Verifikasi Pendaftaran Warga
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {users.length} Akun
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 font-normal mt-0.5">
                Tinjau dan setujui pendaftaran akun Warga baru untuk akses layanan digital desa.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Menunggu:</span>
              <span className="font-extrabold">{pendingCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Aktif:</span>
              <span className="font-extrabold">{verifiedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white rounded-3xl p-4 lg:p-6 border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari warga berdasarkan Nama / NIK / Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. DESKTOP & TABLET VIEW: TERISOLASI (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar -mx-6 lg:-mx-8 px-6 lg:px-8">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-2">Identitas Warga</th>
                <th className="px-5 py-2">NIK</th>
                <th className="px-5 py-2">Kontak / Email</th>
                <th className="px-5 py-2 text-center">Status Verifikasi</th>
                <th className="px-5 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs font-bold">
                    Tidak ada data pendaftaran warga yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-all hover:translate-y-[-1px]">
                    <td className="bg-white border-y border-l border-slate-200/80 rounded-l-2xl px-5 py-4 group-hover:bg-slate-50/70 transition-colors shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs uppercase shrink-0 border border-slate-200">
                          {user.fullName.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            {user.resident?.rt ? `RT ${user.resident.rt} / RW ${user.resident.rw}` : "Belum terpetakan"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="bg-white border-y border-slate-200/80 px-5 py-4 group-hover:bg-slate-50/70 transition-colors shadow-xs">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        {user.nik || "-"}
                      </span>
                    </td>

                    <td className="bg-white border-y border-slate-200/80 px-5 py-4 group-hover:bg-slate-50/70 transition-colors shadow-xs">
                      <p className="text-xs font-medium text-slate-800">{user.phoneNumber || "-"}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email || ""}</p>
                    </td>

                    <td className="bg-white border-y border-slate-200/80 px-5 py-4 text-center group-hover:bg-slate-50/70 transition-colors shadow-xs">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {user.isActive ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        {user.isActive ? "TERVERIFIKASI" : "MENUNGGU"}
                      </span>
                    </td>

                    <td className="bg-white border-y border-r border-slate-200/80 rounded-r-2xl px-5 py-4 text-right group-hover:bg-slate-50/70 transition-colors shadow-xs">
                      {!user.isActive ? (
                        <button
                          onClick={() => handleVerify(user.id, true)}
                          disabled={isSubmitting === user.id}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 ml-auto"
                        >
                          <ShieldCheck size={14} />
                          <span>{isSubmitting === user.id ? "Memproses..." : "Verifikasi Akses"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(user.id, false)}
                          disabled={isSubmitting === user.id}
                          className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
                        >
                          <ShieldAlert size={14} />
                          <span>Cabut Akses</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MOBILE / APP VIEW: TERISOLASI (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center">
            <p className="text-sm font-bold text-slate-700">Tidak ada pendaftaran warga</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian Anda.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
            >
              {/* Top: Avatar, Name, Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs uppercase shrink-0 border border-slate-200">
                    {user.fullName.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-slate-900 leading-snug truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                      <MapPin size={11} className="shrink-0 text-slate-400" />
                      <span>{user.resident?.rt ? `RT ${user.resident.rt} / RW ${user.resident.rw}` : "Belum terpetakan"}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 flex items-center gap-1 border ${
                    user.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {user.isActive ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                  <span>{user.isActive ? "Aktif" : "Menunggu"}</span>
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">NIK</span>
                  <span className="font-mono font-bold text-slate-700">{user.nik || "-"}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Kontak</span>
                  <span className="font-medium text-slate-700 truncate block">{user.phoneNumber || "-"}</span>
                </div>
              </div>

              {/* Mobile Action Button */}
              <div className="pt-1">
                {!user.isActive ? (
                  <button
                    onClick={() => handleVerify(user.id, true)}
                    disabled={isSubmitting === user.id}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck size={15} />
                    <span>{isSubmitting === user.id ? "Memproses Verifikasi..." : "Verifikasi & Setujui Warga"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(user.id, false)}
                    disabled={isSubmitting === user.id}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:scale-98 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert size={14} />
                    <span>Cabut Akses Warga</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
