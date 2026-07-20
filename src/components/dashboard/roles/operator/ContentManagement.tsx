"use client";

import { useState } from "react";
import { updateVillageProfile, createBerita } from "@/actions/landing";
import { Globe, Image as ImageIcon, LayoutTemplate, Newspaper, Save, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export function ContentManagement({ session, initialProfile, initialNews }: { session: any, initialProfile: any, initialNews: any[] }) {
  const [activeTab, setActiveTab] = useState<"profil" | "berita">("profil");
  const [isSaving, setIsSaving] = useState(false);

  // Profil Form State
  const [profileForm, setProfileForm] = useState({
    title: initialProfile?.title || "Desa Cimanggu I",
    hero_title: initialProfile?.hero_title || "Pemerintah Desa",
    hero_subtitle: initialProfile?.hero_subtitle || "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat.",
    about_title: initialProfile?.about_title || "Sekilas Pandang",
    about_text: initialProfile?.about_text || "Desa Cimanggu I merupakan salah satu desa unggulan...",
  });

  // Berita Form State
  const [newsForm, setNewsForm] = useState({
    judul: "",
    konten: "",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const loadingToast = toast.loading("Menyimpan Profil Desa...");
      await updateVillageProfile(profileForm);
      toast.success("Profil Desa berhasil diperbarui dan disinkronkan ke Landing Page!", { id: loadingToast });
    } catch (error) {
      toast.error("Gagal menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const loadingToast = toast.loading("Mempublikasikan Berita...");
      await createBerita(newsForm);
      toast.success("Berita berhasil dipublikasikan!", { id: loadingToast });
      setNewsForm({ judul: "", konten: "" });
    } catch (error) {
      toast.error("Gagal mempublikasikan berita.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Konten (CMS)</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola konten yang akan tampil langsung di *Landing Page* utama.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl flex items-center gap-2 border border-indigo-100">
            <CheckCircle2 size={16} /> Sinkronisasi Aktif
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button 
          onClick={() => setActiveTab("profil")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "profil" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <LayoutTemplate size={18} /> Profil & Beranda
        </button>
        <button 
          onClick={() => setActiveTab("berita")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "berita" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Newspaper size={18} /> Kabar Berita
        </button>
      </div>

      {activeTab === "profil" && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Hero Section (Atas)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Situs / Desa</label>
                  <input type="text" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Hero</label>
                  <input type="text" value={profileForm.hero_title} onChange={e => setProfileForm({...profileForm, hero_title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subjudul Hero</label>
                  <textarea value={profileForm.hero_subtitle} onChange={e => setProfileForm({...profileForm, hero_subtitle: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Sekilas Pandang (Tentang)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Tentang Desa</label>
                  <input type="text" value={profileForm.about_title} onChange={e => setProfileForm({...profileForm, about_title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deskripsi Tentang Desa</label>
                  <textarea value={profileForm.about_text} onChange={e => setProfileForm({...profileForm, about_text: e.target.value})} rows={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Profil & Sinkronkan"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "berita" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleNewsSubmit} className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6 flex items-center gap-2">
                    <Newspaper size={20} className="text-indigo-500" /> Tulis Berita Baru
                </h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Berita</label>
                  <input type="text" value={newsForm.judul} onChange={e => setNewsForm({...newsForm, judul: e.target.value})} placeholder="Contoh: Pembagian Bansos Tahap 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Konten Berita</label>
                  <textarea value={newsForm.konten} onChange={e => setNewsForm({...newsForm, konten: e.target.value})} rows={10} placeholder="Tulis detail berita di sini..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                        <Save size={18} /> {isSaving ? "Memproses..." : "Publikasikan Berita"}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Berita Terakhir (Live)</h3>
                    <div className="space-y-4">
                        {initialNews?.slice(0, 3).map((news: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                                <h4 className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 mb-1 line-clamp-1">{news.judul}</h4>
                                <span className="text-xs text-slate-500">{new Date(news.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                        ))}
                        {(!initialNews || initialNews.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">Belum ada berita.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
