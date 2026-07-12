"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { getApbdesFinances, upsertApbdesFinance, deleteApbdesFinance, saveApbdesBatch } from "@/actions/dashboard";
import { useSession } from "next-auth/react";
import { PieChart, Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, Sparkles, UploadCloud, X, Loader2, Save } from "lucide-react";

export default function ApbdesPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email || "";
    const isKaurKeuangan = role === "KAUR_KEUANGAN" || (role === "KAUR" && email.includes("keuangan"));
    const canEdit = ["ADMIN_MASTER", "ADMIN_DESA", "SEKDES"].includes(role) || isKaurKeuangan;
    const [finances, setFinances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [formData, setFormData] = useState<any>({
        kategori: "PENDAPATAN", sumberDana: "", anggaranTotal: "", realisasi: "", keterangan: ""
    });

    // AI Scan States
    const [showScanModal, setShowScanModal] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanFile, setScanFile] = useState<File | null>(null);
    const [scanPreview, setScanPreview] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (session?.user?.tenantId) {
            loadData();
        }
    }, [session, tahun]);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getApbdesFinances(session?.user?.tenantId || "", tahun);
        setFinances(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const ang = parseFloat(formData.anggaranTotal) || 0;
            const real = parseFloat(formData.realisasi) || 0;
            const persentase = ang > 0 ? (real / ang) * 100 : 0;
            
            await upsertApbdesFinance({
                ...formData,
                tahunAnggaran: tahun,
                anggaranTotal: ang,
                realisasi: real,
                persentase,
                tenantId: session?.user?.tenantId
            });
            setShowModal(false);
            setFormData({ kategori: "PENDAPATAN", sumberDana: "", anggaranTotal: "", realisasi: "", keterangan: "" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data APBDes");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Hapus data ini?")) {
            await deleteApbdesFinance(id);
            loadData();
        }
    };

    const handleScanFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanFile) return;

        setIsScanning(true);
        const data = new FormData();
        data.append("file", scanFile);

        try {
            const res = await fetch("/api/ai/scan-apbdes", {
                method: "POST",
                body: data
            });
            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Gagal memindai file");
            } else {
                setScanPreview(result);
            }
        } catch (error) {
            alert("Terjadi kesalahan jaringan.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleSavePreview = async () => {
        if (scanPreview.length === 0) return;
        setIsScanning(true);
        try {
            // Include tahunAnggaran for all items
            const finalData = scanPreview.map(item => ({
                ...item,
                tahunAnggaran: tahun
            }));
            await saveApbdesBatch(finalData, session?.user?.tenantId || "");
            setShowScanModal(false);
            setScanPreview([]);
            setScanFile(null);
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data hasil scan.");
        } finally {
            setIsScanning(false);
        }
    };

    const totalPendapatan = finances.filter(f => f.kategori === "PENDAPATAN").reduce((a, b) => a + b.anggaranTotal, 0);
    const totalBelanja = finances.filter(f => f.kategori === "BELANJA").reduce((a, b) => a + b.anggaranTotal, 0);
    const realisasiPendapatan = finances.filter(f => f.kategori === "PENDAPATAN").reduce((a, b) => a + b.realisasi, 0);
    const realisasiBelanja = finances.filter(f => f.kategori === "BELANJA").reduce((a, b) => a + b.realisasi, 0);

    return (
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">Loading...</div>}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/10 rounded-[1.25rem] flex items-center justify-center text-emerald-400 border border-white/10">
                            <PieChart size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Akuntabilitas APBDes</h1>
                            <p className="text-slate-400 text-sm font-medium">Transparansi Pendapatan dan Belanja Desa.</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex gap-3">
                        <select 
                            value={tahun} 
                            onChange={e => setTahun(parseInt(e.target.value))}
                            className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:bg-white/20"
                        >
                            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="text-slate-900">Tahun {y}</option>)}
                        </select>
                        {canEdit && (
                            <div className="flex gap-2">
                                <button onClick={() => setShowScanModal(true)} className="px-5 py-3 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2 border-2 border-white/20 hover:border-white/50">
                                    <UploadCloud size={16} className="text-amber-500" /> Upload
                                </button>
                                <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                                    <Plus size={16}/> Input Manual
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><ArrowDownRight className="text-emerald-500"/> PENDAPATAN</h2>
                            <span className="text-2xl font-black text-emerald-600">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                            <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${totalPendapatan > 0 ? (realisasiPendapatan / totalPendapatan) * 100 : 0}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 font-bold text-right">Realisasi: Rp {realisasiPendapatan.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><ArrowUpRight className="text-rose-500"/> BELANJA</h2>
                            <span className="text-2xl font-black text-rose-600">Rp {totalBelanja.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                            <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${totalBelanja > 0 ? (realisasiBelanja / totalBelanja) * 100 : 0}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 font-bold text-right">Realisasi: Rp {realisasiBelanja.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-x-auto">
                    <h3 className="text-lg font-black text-slate-800 mb-6">Rincian APBDes {tahun}</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="pb-4 pl-4">Kategori & Sumber Daya</th>
                                <th className="pb-4 text-right">Anggaran (Rp)</th>
                                <th className="pb-4 text-right">Realisasi (Rp)</th>
                                <th className="pb-4 text-center">Persentase</th>
                                {canEdit && <th className="pb-4 text-right pr-4">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading...</td></tr>
                            ) : finances.map((f: any) => (
                                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${f.kategori === 'PENDAPATAN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{f.sumberDana}</div>
                                                <div className="text-[10px] text-slate-400">{f.keterangan || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right font-bold text-slate-600">{f.anggaranTotal.toLocaleString('id-ID')}</td>
                                    <td className="py-4 text-right font-bold text-slate-800">{f.realisasi.toLocaleString('id-ID')}</td>
                                    <td className="py-4 text-center">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">{f.persentase.toFixed(1)}%</span>
                                    </td>
                                    {canEdit && (
                                        <td className="py-4 text-right pr-4">
                                            <button onClick={() => handleDelete(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full">
                            <h2 className="text-xl font-black text-slate-800 mb-6">Input Data APBDes</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Kategori</label>
                                    <select required value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                        <option value="PENDAPATAN">Pendapatan Desa</option>
                                        <option value="BELANJA">Belanja Desa</option>
                                        <option value="PEMBIAYAAN">Pembiayaan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Sumber Dana / Pos Belanja</label>
                                    <input required value={formData.sumberDana} onChange={e => setFormData({...formData, sumberDana: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" placeholder="Contoh: Dana Desa, ADD, dll" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Anggaran Total (Rp)</label>
                                    <input required type="number" value={formData.anggaranTotal} onChange={e => setFormData({...formData, anggaranTotal: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Realisasi Berjalan (Rp)</label>
                                    <input required type="number" value={formData.realisasi} onChange={e => setFormData({...formData, realisasi: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Keterangan Opsional</label>
                                    <input value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
                                    <button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">Simpan APBDes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL SCAN AI */}
                {showScanModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isScanning && setShowScanModal(false)} />
                        <div className="bg-white rounded-[2.5rem] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><UploadCloud className="text-amber-500"/> Upload Dokumen</h2>
                                    <p className="text-slate-500 text-xs font-medium">Unggah file Excel, Word, atau Gambar (JPG/PNG) laporan APBDes.</p>
                                </div>
                                <button onClick={() => !isScanning && setShowScanModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all" disabled={isScanning}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                                {scanPreview.length === 0 ? (
                                    <form onSubmit={handleScanFile} className="flex flex-col items-center justify-center py-10">
                                        <div 
                                            className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-3xl p-10 flex flex-col items-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <UploadCloud size={48} className="text-slate-400 mb-4" />
                                            <p className="font-bold text-slate-700 mb-2">
                                                {scanFile ? scanFile.name : "Klik untuk Memilih File"}
                                            </p>
                                            <p className="text-xs text-slate-500">Mendukung: .xlsx, .docx, .jpg, .png</p>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef}
                                                accept=".xlsx,.xls,.docx,.jpg,.jpeg,.png"
                                                onChange={(e) => setScanFile(e.target.files?.[0] || null)}
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={!scanFile || isScanning}
                                            className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isScanning ? (
                                                <><Loader2 size={18} className="animate-spin" /> Memindai Dokumen...</>
                                            ) : (
                                                <><UploadCloud size={18} /> Ekstrak Dokumen</>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-700">Pratinjau Hasil Ekstraksi AI</h3>
                                            <button onClick={() => setScanPreview([])} className="text-xs text-blue-600 font-bold hover:underline">Scan Ulang</button>
                                        </div>
                                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-slate-500">
                                                    <tr>
                                                        <th className="p-3 font-bold">Kategori</th>
                                                        <th className="p-3 font-bold">Sumber Dana</th>
                                                        <th className="p-3 text-right font-bold">Anggaran (Rp)</th>
                                                        <th className="p-3 text-right font-bold">Realisasi (Rp)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {scanPreview.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.kategori === 'PENDAPATAN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                    {item.kategori}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 font-medium text-slate-700">{item.sumberDana}</td>
                                                            <td className="p-3 text-right text-slate-600">{Number(item.anggaranTotal).toLocaleString('id-ID')}</td>
                                                            <td className="p-3 text-right text-slate-600">{Number(item.realisasi).toLocaleString('id-ID')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button 
                                                onClick={handleSavePreview} 
                                                disabled={isScanning}
                                                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg flex items-center gap-2"
                                            >
                                                {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Semua ke Database
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Suspense>
    );
}
