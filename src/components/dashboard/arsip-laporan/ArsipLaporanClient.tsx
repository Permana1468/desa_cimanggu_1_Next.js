"use client";

import { useState } from "react";
import { Folder, FileText, ChevronLeft, Calendar, User as UserIcon, Download } from "lucide-react";

export function ArsipLaporanClient({ initialReports }: { initialReports: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // List of predefined standard categories
    const standardCategories = [
        "SEKDES", "KASI PEMERINTAHAN", "KASI KESEJAHTERAAN", "KASI PELAYANAN", 
        "KAUR TU", "KAUR PERENCANAAN", "KAUR KEUANGAN", 
        "KEPALA DUSUN 1", "KEPALA DUSUN 2", "KEPALA DUSUN 3", "KEPALA DUSUN 4", 
        "POSYANDU", "TP-PKK", "LPM", "KARANG TARUNA", "BUMDES", "PUSKESOS", "UMUM"
    ];

    // Group reports by category
    const groupedReports = initialReports.reduce((acc, report) => {
        const cat = report.kategori || "UMUM";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(report);
        return acc;
    }, {} as Record<string, any[]>);

    // Merge standard categories with any dynamic ones, ensuring all standard ones exist in the object
    standardCategories.forEach(cat => {
        if (!groupedReports[cat]) groupedReports[cat] = [];
    });

    // List of categories (Folders)
    const categories = Object.keys(groupedReports);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* HERO PANEL */}
            <div className="bg-slate-950 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border border-blue-400/20">
                        <Folder size={14} /> Pusat Arsip Sentral
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Arsip Laporan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Jajaran Desa</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed font-medium">
                        Pantau dan unduh seluruh dokumen laporan hasil cetak otomatis dari berbagai divisi pemerintahan desa dalam satu tempat.
                    </p>
                </div>
            </div>

            {!selectedCategory ? (
                /* FOLDER VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-white rounded-[3rem] border border-slate-100 shadow-sm border-dashed">
                            Belum ada dokumen yang dicetak oleh jajaran desa.
                        </div>
                    )}
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:border-blue-300 hover:shadow-blue-100 transition-all flex flex-col items-center justify-center text-center gap-4 group active:scale-95"
                        >
                            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                <Folder size={48} className="fill-current opacity-80" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 tracking-tight text-lg group-hover:text-blue-600 transition-colors">{cat}</h3>
                                <p className="text-slate-500 text-xs font-bold mt-1">{groupedReports[cat].length} Dokumen Laporan</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                /* LIST VIEW FOR SELECTED CATEGORY */
                <div className="space-y-6">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 hover:text-slate-900 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-all w-fit active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={16} /> Kembali ke Kategori
                    </button>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Folder size={32} className="fill-current opacity-80" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Laporan {selectedCategory}</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Daftar riwayat dokumen yang telah dicetak.</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {groupedReports[selectedCategory].length === 0 ? (
                                <div className="py-12 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                                    Belum ada arsip dokumen untuk folder ini.
                                </div>
                            ) : (
                                groupedReports[selectedCategory].map(report => (
                                    <div key={report.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-base mb-1">{report.templateName}</h4>
                                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(report.createdAt).toLocaleString('id-ID')}</span>
                                                    <span className="flex items-center gap-1.5"><UserIcon size={14} className="text-slate-400" /> {report.generatedByName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <a 
                                            href={report.fileUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                                        >
                                            <Download size={14} /> Unduh Arsip
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
