"use client";

import { useState } from "react";
import { FileText, Wand2, X, Download, FileSpreadsheet, Send, Loader2, CheckCircle2 } from "lucide-react";
import { saveGeneratedReport } from "@/actions/arsip";

export function FormatDokumenClient({ templates, userCategory }: { templates: any[], userCategory: string }) {
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [generating, setGenerating] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleOpenForm = (t: any) => {
        setSelectedTemplate(t);
        setFormData({});
        setSuccess(false);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        
        try {
            // Simulasi proses pembuatan dokumen (biasanya memanggil Google API di sini)
            await new Promise(r => setTimeout(r, 2000));

            // Simpan ke Arsip Laporan
            await saveGeneratedReport({
                templateId: selectedTemplate.id,
                templateName: selectedTemplate.name,
                kategori: selectedTemplate.category || "UMUM",
                fileUrl: selectedTemplate.googleId.startsWith("http") ? selectedTemplate.googleId : `https://docs.google.com/document/d/${selectedTemplate.googleId}/view`,
                formData: formData
            });

            setSuccess(true);
        } catch (error) {
            alert("Terjadi kesalahan saat membuat dokumen");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* HERO PANEL */}
            <div className="bg-slate-950 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border border-purple-400/20">
                        <Wand2 size={14} /> AI Document Generator
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Cetak Format Dokumen <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{userCategory}</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed font-medium">
                        Pilih template resmi di bawah ini, isi data yang diperlukan, dan biarkan AI menyusun dokumennya secara otomatis untuk Anda cetak.
                    </p>
                </div>
            </div>

            {/* TEMPLATES GRID */}
            {templates.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-[3rem] border border-slate-100 shadow-sm border-dashed">
                    Tidak ada template format yang ditugaskan untuk kategori Anda.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleOpenForm(t)}
                            className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:border-purple-300 hover:shadow-purple-100 transition-all flex flex-col justify-between group active:scale-95 text-left h-full min-h-[220px]"
                        >
                            <div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${t.type === "SPREADSHEET" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"} group-hover:scale-110 transition-transform`}>
                                    {t.type === "SPREADSHEET" ? <FileSpreadsheet size={28} /> : <FileText size={28} />}
                                </div>
                                <h3 className="font-black text-slate-800 tracking-tight text-lg group-hover:text-purple-600 transition-colors leading-snug">{t.name}</h3>
                                <p className="text-slate-500 text-xs font-medium mt-3 line-clamp-2 leading-relaxed">{t.description || "Tidak ada deskripsi."}</p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Wand2 size={12} /> {t.aiSchema?.length || 0} Kolom Isian Otomatis
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* AI FORM MODAL */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => !generating && setSelectedTemplate(null)} />
                    
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <Wand2 className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black leading-tight">{selectedTemplate.name}</h3>
                                    <p className="text-purple-300 text-xs font-bold mt-1 tracking-widest uppercase">AI Form Generator</p>
                                </div>
                            </div>
                            <button onClick={() => !generating && setSelectedTemplate(null)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {success ? (
                                <div className="flex flex-col items-center justify-center text-center py-10 space-y-6 animate-in zoom-in">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">Dokumen Berhasil Dibuat!</h3>
                                        <p className="text-slate-500 mt-2 font-medium">Dokumen telah dicetak dan salinannya sudah diarsipkan secara otomatis ke Admin Desa.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setSelectedTemplate(null)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Tutup</button>
                                        <a href={selectedTemplate.googleId.startsWith("http") ? selectedTemplate.googleId : `https://docs.google.com/document/d/${selectedTemplate.googleId}/view`} target="_blank" className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                                            <Download size={18} /> Unduh Hasil Dokumen
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <form id="ai-form" onSubmit={handleGenerate} className="space-y-6">
                                    {selectedTemplate.aiSchema && selectedTemplate.aiSchema.length > 0 ? (
                                        selectedTemplate.aiSchema.map((field: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">{field.label || field.name}</label>
                                                <input 
                                                    required
                                                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                                                    value={formData[field.name] || ""}
                                                    onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                                                    placeholder={`Masukkan ${field.label || field.name}...`}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm text-center">
                                            Template ini belum memiliki skema kolom dari AI. Silakan hubungi Master Admin untuk memindai ulang dokumen ini.
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {!success && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 gap-3">
                                <button type="button" onClick={() => setSelectedTemplate(null)} className="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-xs">
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    form="ai-form"
                                    disabled={generating || !selectedTemplate.aiSchema || selectedTemplate.aiSchema.length === 0}
                                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {generating ? <><Loader2 size={16} className="animate-spin"/> Memproses AI...</> : <><Send size={16} /> Buat & Cetak Dokumen</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
