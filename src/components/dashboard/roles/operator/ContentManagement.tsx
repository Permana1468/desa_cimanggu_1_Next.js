"use client";

import { useState, useEffect } from "react";
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
    hero_video: initialProfile?.hero_video || "",
    about_title: initialProfile?.about_title || "Sekilas Pandang",
    about_text: initialProfile?.about_text || "Desa Cimanggu I merupakan salah satu desa unggulan...",
    
    // Additional Profil Fields
    sambutan_kades: initialProfile?.sambutan_kades || "",
    sejarah: initialProfile?.sejarah || "",
    visi: initialProfile?.visi || "",
    misi: Array.isArray(initialProfile?.misi) ? initialProfile.misi.join('\n') : (initialProfile?.misi || ""),
    
    // Kontak
    kontak_telepon: initialProfile?.kontak_telepon || "",
    kontak_email: initialProfile?.kontak_email || "",
    kontak_alamat: initialProfile?.kontak_alamat || "",

    // Carousel / Gallery
    gallery: Array.isArray(initialProfile?.gallery) ? initialProfile.gallery : [],
  });

  useEffect(() => {
    if (initialProfile && Object.keys(initialProfile).length > 0) {
      setProfileForm({
        title: initialProfile.title || "Desa Cimanggu I",
        hero_title: initialProfile.hero_title || "Pemerintah Desa",
        hero_subtitle: initialProfile.hero_subtitle || "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat.",
        hero_video: initialProfile.hero_video || "",
        about_title: initialProfile.about_title || "Sekilas Pandang",
        about_text: initialProfile.about_text || "Desa Cimanggu I merupakan salah satu desa unggulan...",
        sambutan_kades: initialProfile.sambutan_kades || "",
        sejarah: initialProfile.sejarah || "",
        visi: initialProfile.visi || "",
        misi: Array.isArray(initialProfile.misi) ? initialProfile.misi.join('\n') : (initialProfile.misi || ""),
        kontak_telepon: initialProfile.kontak_telepon || "",
        kontak_email: initialProfile.kontak_email || "",
        kontak_alamat: initialProfile.kontak_alamat || "",
        gallery: Array.isArray(initialProfile.gallery) ? initialProfile.gallery : [],
      });
    }
  }, [initialProfile]);

  const handleAddGalleryItem = () => {
    setProfileForm({
      ...profileForm,
      gallery: [...profileForm.gallery, { url: "", title: "", sub: "" }]
    });
  };

  const handleGalleryChange = (index: number, field: string, value: string) => {
    const newGallery = [...profileForm.gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    setProfileForm({ ...profileForm, gallery: newGallery });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const max_size = 1200;

          if (width > height && width > max_size) {
            height *= max_size / width;
            width = max_size;
          } else if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compress to 70% quality JPEG
        };
      };
    });
  };

  const handleGalleryImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadToast = toast.loading("Mengunggah gambar...");
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        
        if (res.ok && data.url) {
          handleGalleryChange(index, "url", data.url);
          toast.success("Gambar berhasil diunggah!", { id: uploadToast });
        } else {
          throw new Error(data.error || "Gagal mengunggah gambar");
        }
      } catch (err: any) {
        toast.error(err.message || "Gagal mengunggah gambar", { id: uploadToast });
      }
    }
  };

  const handleRemoveGalleryItem = (index: number) => {
    const newGallery = profileForm.gallery.filter((_, i) => i !== index);
    setProfileForm({ ...profileForm, gallery: newGallery });
  };

  // Berita Form State
  const [newsForm, setNewsForm] = useState({
    judul: "",
    konten: "",
    gambar: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsForm({ ...newsForm, gambar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        toast.error("Ukuran video terlalu besar. Maksimal 15MB.");
        return;
      }
      
      const uploadToast = toast.loading("Mengunggah video...");
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        
        if (res.ok && data.url) {
          setProfileForm({ ...profileForm, hero_video: data.url });
          toast.success("Video berhasil diunggah!", { id: uploadToast });
        } else {
          throw new Error(data.error || "Gagal mengunggah video");
        }
      } catch (err: any) {
        toast.error(err.message, { id: uploadToast });
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading("Menyimpan Profil Desa...");
    try {
      const payloadToSave = {
        ...profileForm,
        misi: typeof profileForm.misi === 'string'
          ? profileForm.misi.split('\n').filter((m) => m.trim().length > 0)
          : profileForm.misi
      };

      await updateVillageProfile(payloadToSave);
      toast.success("Profil Desa berhasil diperbarui dan disinkronkan ke Landing Page!", { id: loadingToast });
    } catch (error: any) {
      console.error("Gagal menyimpan profil:", error);
      toast.error(error?.message || "Gagal menyimpan profil.", { id: loadingToast });
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
      setNewsForm({ judul: "", konten: "", gambar: "" });
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

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Sambutan, Sejarah, & Visi Misi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sambutan Kepala Desa</label>
                  <textarea value={profileForm.sambutan_kades} onChange={e => setProfileForm({...profileForm, sambutan_kades: e.target.value})} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sejarah Desa</label>
                  <textarea value={profileForm.sejarah} onChange={e => setProfileForm({...profileForm, sejarah: e.target.value})} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Visi</label>
                  <textarea value={profileForm.visi} onChange={e => setProfileForm({...profileForm, visi: e.target.value})} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Misi (Pisahkan dengan baris baru)</label>
                  <textarea value={profileForm.misi} onChange={e => setProfileForm({...profileForm, misi: e.target.value})} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Kontak Desa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor Telepon / WA</label>
                  <input type="text" value={profileForm.kontak_telepon} onChange={e => setProfileForm({...profileForm, kontak_telepon: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Desa</label>
                  <input type="email" value={profileForm.kontak_email} onChange={e => setProfileForm({...profileForm, kontak_email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alamat Lengkap</label>
                  <textarea value={profileForm.kontak_alamat} onChange={e => setProfileForm({...profileForm, kontak_alamat: e.target.value})} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>
            
            {/* Video Background Section */}
            <div className="space-y-6 lg:col-span-2 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-800">Background Video (Beranda)</h3>
                {profileForm.hero_video && (
                  <button type="button" onClick={() => setProfileForm({ ...profileForm, hero_video: "" })} className="text-xs font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    Hapus Video
                  </button>
                )}
              </div>
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <p className="text-xs text-slate-500 mb-4 font-medium">Jika video diupload, maka Carousel Gambar akan otomatis dinonaktifkan. (Format: MP4/WebM, Maks: 15MB)</p>
                <input type="file" accept="video/mp4,video/webm" onChange={handleVideoChange} className="w-full text-sm mb-4" />
                {profileForm.hero_video && (
                  <div className="mt-4 aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                    <video src={profileForm.hero_video} controls className="object-contain w-full h-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Carousel / Gallery Section */}
            <div className={`space-y-6 lg:col-span-2 ${profileForm.hero_video ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-800">Background Carousel (Beranda)</h3>
                <button type="button" onClick={handleAddGalleryItem} className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                  + Tambah Slide
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileForm.gallery.map((item: any, index: number) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 relative">
                    <button type="button" onClick={() => handleRemoveGalleryItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-md">
                      Hapus
                    </button>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Gambar Slide</label>
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryImageChange(index, e)} className="w-full text-xs" />
                      {item.url && (
                        <div className="mt-2 aspect-video w-full rounded-lg overflow-hidden border border-slate-200">
                          <img src={item.url} alt={`Slide ${index}`} className="object-cover w-full h-full" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Singkat</label>
                      <input type="text" value={item.title || ""} onChange={(e) => handleGalleryChange(index, "title", e.target.value)} placeholder="Misal: PELAYANAN PUBLIK" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subjudul / Deskripsi</label>
                      <textarea value={item.sub || ""} onChange={(e) => handleGalleryChange(index, "sub", e.target.value)} rows={2} placeholder="Deskripsi slide..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                ))}
                {profileForm.gallery.length === 0 && (
                  <div className="col-span-full p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                    Belum ada gambar carousel. Klik "+ Tambah Slide" untuk mulai menambahkan.
                  </div>
                )}
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Gambar / Thumbnail</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  {newsForm.gambar && (
                    <div className="mt-3 relative aspect-video w-48 rounded-xl overflow-hidden border border-slate-200">
                      <img src={newsForm.gambar} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
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
