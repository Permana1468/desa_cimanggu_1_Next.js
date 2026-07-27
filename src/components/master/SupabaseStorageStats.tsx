import React from 'react';
import prisma from "@/lib/prisma";
import { Database, HardDrive, AlertTriangle, Cloud, Server, ChevronRight } from 'lucide-react';
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
    let statusBg = "bg-emerald-500/10 text-emerald-600";
    let barGradient = "from-emerald-400 to-emerald-600";
    
    if (isCritical) {
        statusColor = "bg-rose-500";
        statusText = "Kritis (Wajib Backup)";
        statusBg = "bg-rose-500/10 text-rose-600";
        barGradient = "from-rose-400 to-rose-600";
    } else if (isWarning) {
        statusColor = "bg-amber-500";
        statusText = "Hampir Penuh";
        statusBg = "bg-amber-500/10 text-amber-600";
        barGradient = "from-amber-400 to-amber-500";
    }

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-3 rounded-2xl ${statusBg}`}>
                                <Database size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kapasitas Supabase</h2>
                        </div>
                        <p className="text-slate-500 font-medium">Batas penyimpanan database utama aplikasi (Free Tier: 500 MB)</p>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 border ${isCritical ? 'border-rose-200 bg-rose-50 text-rose-600' : isWarning ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
                        Status: {statusText}
                    </div>
                </div>

                {/* Main Progress Bar */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{dbSizeMb.toFixed(1)}</span>
                            <span className="text-slate-500 font-bold ml-1">MB</span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-900 font-bold">{percentage.toFixed(1)}%</span>
                            <span className="text-slate-400 font-medium ml-1">Terpakai dari {MAX_MB} MB</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner relative">
                        <div 
                            className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-1000 ease-out relative`}
                            style={{ width: `${percentage}%` }}
                        >
                            {/* Reflection effect */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20" />
                        </div>
                    </div>
                </div>

                {/* Educational Alert */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex gap-4">
                        <div className="mt-1 bg-blue-100 text-blue-600 p-2 rounded-xl h-fit">
                            <Server size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Infrastruktur Vercel</h4>
                            <p className="text-blue-700/80 text-xs font-medium leading-relaxed">Digunakan sebagai otak dan mesin website. <strong>Tidak ada batas penyimpanan</strong>, menangani logika tanpa khawatir penuh.</p>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex gap-4">
                        <div className="mt-1 bg-indigo-100 text-indigo-600 p-2 rounded-xl h-fit">
                            <Cloud size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Database Supabase</h4>
                            <p className="text-indigo-700/80 text-xs font-medium leading-relaxed">Menyimpan teks, NIK, dan Foto Base64. Jika hampir mencapai 500 MB, segera ke menu UHC untuk membackup foto lama.</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                {(isWarning || isCritical) && (
                    <div className="mt-6 p-5 rounded-3xl bg-rose-50 border border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                            <AlertTriangle size={24} className="text-rose-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-rose-900">Tindakan Diperlukan!</h4>
                                <p className="text-sm font-medium text-rose-700/80">Penyimpanan foto UHC dan Bansos menumpuk. Cadangkan data ke Google Drive agar sistem tidak error.</p>
                            </div>
                        </div>
                        <Link href="/dashboard?tab=usulan-uhc" className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm text-center shadow-lg shadow-rose-600/20 transition-all shrink-0 flex justify-center items-center gap-2">
                            Mulai Backup <ChevronRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
