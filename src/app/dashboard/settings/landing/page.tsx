"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
    getVillageProfile, 
    updateVillageProfile, 
    getOrganizationalStructure, 
    updateAparatur,
    createBerita 
} from "@/actions/landing";
import { 
    Save, 
    Info, 
    Globe,
    ArrowLeft,
    CheckCircle2,
    Plus,
    Trash2,
    LayoutDashboard,
    Users,
    Newspaper,
    UserPlus,
    AlertCircle,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { useSession } from "next-auth/react";

export default function LandingCMSPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState(tabParam || "landing");

    const isAdmin = ["ADMIN_DESA", "KADES", "SEKDES", "OPERATOR_DESA", "ADMIN_MASTER"].includes(session?.user?.role as string);

    if (session && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-800">Akses Dibatasi</h1>
                <p className="text-slate-500 max-w-md text-center">Anda tidak memiliki izin untuk mengakses pengaturan website desa. Silakan hubungi Admin Desa jika ini adalah kesalahan.</p>
                <Link href="/dashboard" className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">
                    Kembali ke Dashboard
                </Link>
            </div>
        );
    }
    
    // Landing State
    const [formData, setFormData] = useState({
        title: "",
        hero_title: "",
        hero_subtitle: "",
        about_title: "",
        about_text: "",
        about_image: "",
        logo: "",
        gallery: [] as string[]
    });

    // Aparatur State
    const [aparatur, setAparatur] = useState<any[]>([]);
    const [showAparaturForm, setShowAparaturForm] = useState(false);
    const [newAparatur, setNewAparatur] = useState({
        name: "",
        position: "",
        role: "KADES",
        level: 0,
        photo: ""
    });

    // Berita State
    const [newBerita, setNewBerita] = useState({
        judul: "",
        konten: "",
        gambar: "",
        kategori: "Berita"
    });

    useEffect(() => {
        if (tabParam) setActiveTab(tabParam);
    }, [tabParam]);

    useEffect(() => {
        async function load() {
            const [profile, org] = await Promise.all([
                getVillageProfile(),
                getOrganizationalStructure()
            ]);
            
            if (profile) {
                setFormData({
                    title: profile.title || "",
                    hero_title: profile.hero_title || "",
                    hero_subtitle: profile.hero_subtitle || "",
                    about_title: profile.about_title || "",
                    about_text: profile.about_text || "",
                    about_image: profile.about_image || "",
                    logo: profile.logo || "",
                    gallery: (profile.gallery as string[]) || []
                });
            }
            if (org) setAparatur(org);
            setLoading(false);
        }
        load();
    }, []);

    const handleLandingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateVillageProfile(formData);
            setMessage("Konten Landing Page berhasil diperbarui!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            alert("Gagal memperbarui konten.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddAparatur = async () => {
        setSaving(true);
        try {
            await updateAparatur("", newAparatur);
            const updated = await getOrganizationalStructure();
            setAparatur(updated);
            setShowAparaturForm(false);
            setNewAparatur({ name: "", position: "", role: "KADES", level: 0, photo: "" });
            setMessage("Aparatur berhasil ditambahkan!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            alert("Gagal menambah aparatur.");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateBerita = async () => {
        setSaving(true);
        try {
            await createBerita(newBerita);
            setNewBerita({ judul: "", konten: "", gambar: "", kategori: "Berita" });
            setMessage("Berita berhasil diterbitkan!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            alert("Gagal membuat berita.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 animate-pulse text-slate-400">Memuat Sistem CMS...</div>;

    return (
        <div className="max-w-5xl space-y-8 pb-32 px-4 md:px-0">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:gap-3 transition-all mb-4">
                        <ArrowLeft size={14} /> Kembali ke Pengaturan
                    </Link>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pusat Kendali Website</h1>
                    <p className="text-slate-500 text-sm">Kelola seluruh konten publik desa dalam satu tempat.</p>
                </div>
                {message && (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 animate-bounce">
                        <CheckCircle2 size={16} /> {message}
                    </div>
                )}
            </div>

            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-3xl w-fit overflow-x-auto shadow-sm">
                <button 
                    onClick={() => setActiveTab("landing")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all whitespace-nowrap ${activeTab === "landing" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Globe size={16} /> Landing Page
                </button>
                <button 
                    onClick={() => setActiveTab("aparatur")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all whitespace-nowrap ${activeTab === "aparatur" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Users size={16} /> Struktur Organisasi
                </button>
                <button 
                    onClick={() => setActiveTab("berita")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all whitespace-nowrap ${activeTab === "berita" ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Newspaper size={16} /> Berita Desa
                </button>
            </div>

            {/* TAB: LANDING PAGE */}
            {activeTab === "landing" && (
                <form onSubmit={handleLandingSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Carousel Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard className="text-orange-500" size={24} />
                                <h2 className="text-lg font-bold text-slate-800">Manajemen Slide (Carousel)</h2>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <AlertCircle size={14} className="text-orange-400" />
                                Rekomendasi: Maksimal 3 Slide
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {formData.gallery.map((url, idx) => (
                                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                                    <img src={url} alt="Slide" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-black text-slate-800">
                                        SLIDE {idx + 1}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, i) => i !== idx)})}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {formData.gallery.length < 3 ? (
                                <div className="aspect-video">
                                    <ImageUpload onUploadSuccess={(url) => setFormData({...formData, gallery: [...formData.gallery, url]})} label="" />
                                </div>
                            ) : (
                                <div className="aspect-video border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-4 text-center">
                                    <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Slide Maksimal Tercapai (3)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profil Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Info className="text-emerald-500" size={24} />
                                <h2 className="text-lg font-bold text-slate-800">Tentang Desa</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Judul Profil</label>
                                    <input value={formData.about_title} onChange={e => setFormData({...formData, about_title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Teks Profil</label>
                                    <textarea rows={5} value={formData.about_text} onChange={e => setFormData({...formData, about_text: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold resize-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <ImageUpload defaultValue={formData.about_image} onUploadSuccess={(url) => setFormData({...formData, about_image: url})} label="Foto Kantor Desa" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Desa</label>
                                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Judul Hero</label>
                                    <input value={formData.hero_title} onChange={e => setFormData({...formData, hero_title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3">
                        {saving ? "Menyimpan..." : <><Save size={24} /> Simpan Seluruh Konten Landing</>}
                    </button>
                </form>
            )}

            {/* TAB: APARATUR DESA */}
            {activeTab === "aparatur" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <Users className="text-blue-500" size={24} /> Struktur Aparatur
                            </h2>
                            <button onClick={() => setShowAparaturForm(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                <UserPlus size={16} /> Tambah Pejabat Baru
                            </button>
                        </div>

                        {showAparaturForm && (
                            <div className="mb-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                                        <input value={newAparatur.name} onChange={e => setNewAparatur({...newAparatur, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan</label>
                                        <input value={newAparatur.position} onChange={e => setNewAparatur({...newAparatur, position: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Level Struktur</label>
                                        <select value={newAparatur.level} onChange={e => setNewAparatur({...newAparatur, level: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold">
                                            <option value={0}>Pimpinan (Kades)</option>
                                            <option value={1}>Sekretariat (Sekdes)</option>
                                            <option value={2}>Pelaksana Teknis (Kasi/Kaur)</option>
                                            <option value={3}>Pelaksana Kewilayahan (Kadus)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Role Sistem</label>
                                        <select value={newAparatur.role} onChange={e => setNewAparatur({...newAparatur, role: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold">
                                            <option value="KADES">Kepala Desa</option>
                                            <option value="SEKDES">Sekretaris Desa</option>
                                            <option value="KASI">Kepala Seksi (KASI)</option>
                                            <option value="KAUR">Kepala Urusan (KAUR)</option>
                                            <option value="KADUS">Kepala Dusun (KADUS)</option>
                                            <option value="PERANGKAT_DESA">Perangkat Desa</option>
                                            <option value="BPD">BPD</option>
                                            <option value="LPM">LPM</option>
                                        </select>
                                    </div>
                                    <button onClick={handleAddAparatur} disabled={saving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Simpan Aparatur</button>
                                </div>
                                <ImageUpload onUploadSuccess={(url) => setNewAparatur({...newAparatur, photo: url})} label="Foto Pejabat" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {aparatur.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 shadow-sm border border-white">
                                        <img src={p.photo || "/images/placeholder.png"} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: BERITA DESA */}
            {activeTab === "berita" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-3 mb-8">
                            <Newspaper className="text-purple-500" size={24} />
                            <h2 className="text-xl font-bold text-slate-800">Tulis Berita Baru</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Judul Berita</label>
                                    <input value={newBerita.judul} onChange={e => setNewBerita({...newBerita, judul: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Konten Berita</label>
                                    <textarea rows={8} value={newBerita.konten} onChange={e => setNewBerita({...newBerita, konten: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold resize-none" />
                                </div>
                                <button onClick={handleCreateBerita} disabled={saving} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                    <Plus size={18} /> Terbitkan Berita Sekarang
                                </button>
                            </div>
                            <ImageUpload onUploadSuccess={(url) => setNewBerita({...newBerita, gambar: url})} label="Gambar Sampul Berita" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
