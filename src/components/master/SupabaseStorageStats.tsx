import React from 'react';
import prisma from "@/lib/prisma";
import { Database, AlertTriangle, Cloud, Server, ChevronRight, HardDrive } from 'lucide-react';
import Link from 'next/link';

export async function SupabaseStorageStats() {
    let dbSizeMb = 0;
    const MAX_MB = 500; // Supabase Free Tier limit
    let errorMsg = null;

    try {
        const result = await prisma.$queryRaw<[{ size: bigint }]>`SELECT pg_database_size(current_database()) as size`;
        if (result && result[0] && result[0].size) {
            const bytes = Number(result[0].size);
            dbSizeMb = bytes / (1024 * 1024);
        }
    } catch (e: any) {
        errorMsg = "Gagal mengambil data penyimpanan.";
    }

    const percentage = Math.min((dbSizeMb / MAX_MB) * 100, 100);
    const isCritical = percentage >= 85;
    const isWarning = percentage >= 70 && percentage < 85;

    let statusColor = "bg-emerald-500";
    let statusText = "Aman";
    let statusBorder = "border-emerald-200 bg-emerald-50 text-emerald-700";
    let barGradient = "from-emerald-500 to-teal-500";
    
    if (isCritical) {
        statusColor = "bg-rose-500";
        statusText = "Kritis (Backup)";
        statusBorder = "border-rose-200 bg-rose-50 text-rose-700";
        barGradient = "from-rose-500 to-red-600";
    } else if (isWarning) {
        statusColor = "bg-amber-500";
        statusText = "Hampir Penuh";
        statusBorder = "border-amber-200 bg-amber-50 text-amber-700";
        barGradient = "from-amber-400 to-amber-600";
    }

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Kapasitas Database</h3>
                            <p className="text-slate-400 text-xs font-semibold">PostgreSQL Supabase (Limit 500 MB)</p>
                        </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shrink-0 ${statusBorder}`}>
                        <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
                        <span>{statusText}</span>
                    </div>
                </div>

                {/* Main Progress Bar & Numbers */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100/80">
                    <div className="flex justify-between items-baseline mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                                {dbSizeMb.toFixed(1)}
                            </span>
                            <span className="text-xs font-bold text-slate-400">MB</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black text-slate-800 tabular-nums">{percentage.toFixed(1)}%</span>
                            <span className="text-[11px] font-semibold text-slate-400 block">dari {MAX_MB} MB</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden shadow-inner relative">
                        <div 
                            className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-1000 ease-out rounded-full relative`}
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Storage Context Information */}
                <div className="space-y-2.5">
                    <div className="bg-blue-50/70 border border-blue-100/80 p-3 sm:p-3.5 rounded-2xl flex items-start gap-3">
                        <div className="mt-0.5 bg-blue-100 text-blue-600 p-1.5 rounded-xl shrink-0">
                            <Server size={16} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-blue-950 text-xs">Vercel Engine</h4>
                            <p className="text-blue-800/80 text-[11px] font-medium leading-relaxed mt-0.5">
                                Serverless cloud compute tanpa limit disk lokal, memproses komputasi portal secara otomatis.
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50/70 border border-indigo-100/80 p-3 sm:p-3.5 rounded-2xl flex items-start gap-3">
                        <div className="mt-0.5 bg-indigo-100 text-indigo-600 p-1.5 rounded-xl shrink-0">
                            <Cloud size={16} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-indigo-950 text-xs">Supabase Storage</h4>
                            <p className="text-indigo-800/80 text-[11px] font-medium leading-relaxed mt-0.5">
                                Menyimpan relasi tabel, NIK, dan log transaksi desa dengan backup otomatis harian.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action if Warning or Critical */}
                {(isWarning || isCritical) && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-3">
                        <div className="flex gap-2.5 items-start">
                            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-rose-900 text-xs">Perhatian Kapasitas!</h4>
                                <p className="text-[11px] font-medium text-rose-700 leading-relaxed mt-0.5">
                                    Penyimpanan database mendekati batas kuota. Bersihkan berkas usulan lama atau arsipkan log.
                                </p>
                            </div>
                        </div>
                        <Link 
                            href="/master-admin/data" 
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs text-center shadow-md shadow-rose-600/20 transition-all flex justify-center items-center gap-1.5"
                        >
                            <span>Kelola Data & Arsip</span>
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
