"use client";

import { useState, useEffect } from "react";
import { updateVillageProfile, createBerita, updateBerita, deleteBerita, updateLandingUiConfig } from "@/actions/landing";
import { DEFAULT_LANDING_UI_CONFIG, DEFAULT_PARTNER_LOGOS, LandingUiConfig } from "@/lib/landingUiTypes";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { Globe, Image as ImageIcon, LayoutTemplate, Newspaper, Save, CheckCircle2, AlertCircle, MapPin, Palette, Trash2, Pencil, Eye, Monitor, Smartphone, RefreshCw, X, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

export function ContentManagement({
  session,
  initialProfile,
  initialNews,
  initialUiConfig,
}: {
  session: any;
  initialProfile: any;
  initialNews: any[];
  initialUiConfig?: LandingUiConfig;
}) {
  const [activeTab, setActiveTab] = useState<"profil" | "hero" | "wilayah" | "tampilan" | "berita">("profil");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingUi, setIsSavingUi] = useState(false);
  const [newsList, setNewsList] = useState<any[]>(Array.isArray(initialNews) ? initialNews : []);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    setNewsList(Array.isArray(initialNews) ? initialNews : []);
  }, [initialNews]);

  const [uiForm, setUiForm] = useState<LandingUiConfig>({
    ...DEFAULT_LANDING_UI_CONFIG,
    ...(initialUiConfig || {}),
  });

  useEffect(() => {
    if (initialUiConfig) {
      setUiForm({ ...DEFAULT_LANDING_UI_CONFIG, ...initialUiConfig });
    }
  }, [initialUiConfig]);

  // Profil Form State
  const [profileForm, setProfileForm] = useState({
    title: initialProfile?.title || "Desa Cimanggu I",
    address: initialProfile?.address || "",
    logo: initialProfile?.logo || "",
    about_image: initialProfile?.about_image || "",
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
    
    // Wilayah & Geografis
    luasWilayah: initialProfile?.luasWilayah || "",
    batasUtara: initialProfile?.batasUtara || "",
    batasSelatan: initialProfile?.batasSelatan || "",
    batasTimur: initialProfile?.batasTimur || "",
    batasBarat: initialProfile?.batasBarat || "",

    // Kontak
    kontak_telepon: initialProfile?.kontak_telepon || "",
    kontak_email: initialProfile?.kontak_email || "",
    kontak_alamat: initialProfile?.kontak_alamat || "",

    // Widget Kanan
    agenda_title: initialProfile?.agenda_title || "Penyuluhan Pertanian Digital",
    agenda_date: initialProfile?.agenda_date || "20 OKT 2026 • Balai Desa",
    pengumuman_title: initialProfile?.pengumuman_title || "Pengumuman: Lomba Kebersihan Lingkungan",
    pengumuman_link: initialProfile?.pengumuman_link || "/informasi-publik",
    local_events: Array.isArray(initialProfile?.local_events) ? initialProfile.local_events : [
        { title: "Penyuluhan Digital", date: "20 Okt", color: "amber" },
        { title: "Kegiatan Posyandu", date: "21 Okt", color: "emerald" }
    ],

    // Carousel / Gallery
    gallery: Array.isArray(initialProfile?.gallery) ? initialProfile.gallery : [],
  });

  useEffect(() => {
    if (initialProfile && Object.keys(initialProfile).length > 0) {
      setProfileForm({
        title: initialProfile.title || "Desa Cimanggu I",
        address: initialProfile.address || "",
        logo: initialProfile.logo || "",
        about_image: initialProfile.about_image || "",
        hero_title: initialProfile.hero_title || "Pemerintah Desa",
        hero_subtitle: initialProfile.hero_subtitle || "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat.",
        hero_video: initialProfile.hero_video || "",
        about_title: initialProfile.about_title || "Sekilas Pandang",
        about_text: initialProfile.about_text || "Desa Cimanggu I merupakan salah satu desa unggulan...",
        sambutan_kades: initialProfile.sambutan_kades || "",
        sejarah: initialProfile.sejarah || "",
        visi: initialProfile.visi || "",
        misi: Array.isArray(initialProfile.misi) ? initialProfile.misi.join('\n') : (initialProfile.misi || ""),
        luasWilayah: initialProfile.luasWilayah || "",
        batasUtara: initialProfile.batasUtara || "",
        batasSelatan: initialProfile.batasSelatan || "",
        batasTimur: initialProfile.batasTimur || "",
        batasBarat: initialProfile.batasBarat || "",
        kontak_telepon: initialProfile.kontak_telepon || "",
        kontak_email: initialProfile.kontak_email || "",
        kontak_alamat: initialProfile.kontak_alamat || "",
        
        agenda_title: initialProfile.agenda_title || "Penyuluhan Pertanian Digital",
        agenda_date: initialProfile.agenda_date || "20 OKT 2026 • Balai Desa",
        pengumuman_title: initialProfile.pengumuman_title || "Pengumuman: Lomba Kebersihan Lingkungan",
        pengumuman_link: initialProfile.pengumuman_link || "/informasi-publik",
        local_events: Array.isArray(initialProfile.local_events) ? initialProfile.local_events : [
            { title: "Penyuluhan Digital", date: "20 Okt", color: "amber" },
            { title: "Kegiatan Posyandu", date: "21 Okt", color: "emerald" }
        ],

        gallery: Array.isArray(initialProfile.gallery) ? initialProfile.gallery : [],
      });
    }
  }, [initialProfile]);

  const handleAddEventItem = () => {
    setProfileForm({
      ...profileForm,
      local_events: [...profileForm.local_events, { title: "", date: "", color: "amber" }]
    });
  };

  const handleEventChange = (index: number, field: string, value: string) => {
    const newEvents = [...profileForm.local_events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setProfileForm({ ...profileForm, local_events: newEvents });
  };
  
  const handleRemoveEventItem = (index: number) => {
    const newEvents = profileForm.local_events.filter((_: any, i: number) => i !== index);
    setProfileForm({ ...profileForm, local_events: newEvents });
  };

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
    const newGallery = profileForm.gallery.filter((_: any, i: number) => i !== index);
    setProfileForm({ ...profileForm, gallery: newGallery });
  };

  // Berita Form State
  const [newsForm, setNewsForm] = useState({
    judul: "",
    konten: "",
    gambar: "",
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadToast = toast.loading("Mengunggah gambar berita...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewsForm((prev) => ({ ...prev, gambar: data.url }));
        toast.success("Gambar berita berhasil diunggah!", { id: uploadToast });
      } else {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengunggah gambar", { id: uploadToast });
    }
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadToast = toast.loading("Mengunggah logo mitra...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setUiForm((prev) => ({
          ...prev,
          partnerLogos: [...(prev.partnerLogos || []), data.url],
        }));
        toast.success("Logo mitra berhasil ditambahkan! Jangan lupa klik Simpan Tampilan UI.", { id: uploadToast });
      } else {
        throw new Error(data.error || "Gagal mengunggah logo");
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengunggah logo", { id: uploadToast });
    } finally {
      e.target.value = "";
    }
  };

  const handleRemovePartnerLogo = (index: number) => {
    setUiForm((prev) => ({
      ...prev,
      partnerLogos: (prev.partnerLogos || []).filter((_, i) => i !== index),
    }));
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
    const loadingToast = toast.loading(editingNewsId ? "Memperbarui Berita..." : "Mempublikasikan Berita...");
    try {
      if (editingNewsId) {
        const updated = await updateBerita(editingNewsId, newsForm);
        setNewsList((prev) => prev.map((item) => (item.id === editingNewsId ? updated : item)));
        toast.success("Berita berhasil diperbarui!", { id: loadingToast });
        setEditingNewsId(null);
      } else {
        const created = await createBerita(newsForm);
        if (created) {
          setNewsList((prev) => [created, ...prev]);
        }
        toast.success("Berita berhasil dipublikasikan!", { id: loadingToast });
      }
      setNewsForm({ judul: "", konten: "", gambar: "" });
    } catch (error) {
      toast.error(editingNewsId ? "Gagal memperbarui berita." : "Gagal mempublikasikan berita.", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBeritaClick = (news: any) => {
    setEditingNewsId(news.id);
    setNewsForm({
      judul: news.judul || "",
      konten: news.konten || "",
      gambar: news.gambar || "",
    });
  };

  const handleCancelEditBerita = () => {
    setEditingNewsId(null);
    setNewsForm({ judul: "", konten: "", gambar: "" });
  };

  const handleDeleteBerita = async (id: string, judul: string) => {
    if (!confirm(`Hapus berita "${judul}"?`)) return;
    const loadingToast = toast.loading("Menghapus berita...");
    try {
      await deleteBerita(id);
      setNewsList((prev) => prev.filter((item) => item.id !== id));
      if (editingNewsId === id) {
        handleCancelEditBerita();
      }
      toast.success("Berita berhasil dihapus!", { id: loadingToast });
    } catch (error) {
      toast.error("Gagal menghapus berita.", { id: loadingToast });
    }
  };

  const handleUiConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUi(true);
    const loadingToast = toast.loading("Menyimpan Pengaturan Tampilan UI...");
    try {
      await updateLandingUiConfig(uiForm);
      setPreviewKey((k) => k + 1);
      toast.success("Pengaturan Tampilan UI berhasil disimpan!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error?.message || "Gagal menyimpan pengaturan tampilan UI.", { id: loadingToast });
    } finally {
      setIsSavingUi(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Konten (CMS)</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola seluruh konten, branding, wilayah, tampilan UI, dan berita Landing Page secara terpusat.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPreviewKey((k) => k + 1);
              setShowPreview(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={16} /> Pratinjau Live
          </button>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl flex items-center gap-2 border border-indigo-100">
            <CheckCircle2 size={16} /> Sinkronisasi Aktif
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button 
          type="button"
          onClick={() => setActiveTab("profil")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "profil" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <LayoutTemplate size={18} /> Profil & Branding
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "hero" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <ImageIcon size={18} /> Hero & Galeri
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("wilayah")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "wilayah" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <MapPin size={18} /> Wilayah & Geografis
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("tampilan")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "tampilan" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Palette size={18} /> Widget & Tampilan UI
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("berita")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "berita" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Newspaper size={18} /> Kabar Berita
        </button>
      </div>

      {activeTab === "profil" && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Branding & Identitas Visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <ImageUpload
                    label="Logo Desa / Instansi"
                    defaultValue={profileForm.logo}
                    onUploadSuccess={(url) => setProfileForm({ ...profileForm, logo: url })}
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <ImageUpload
                    label="Foto Kantor / Tentang Desa"
                    defaultValue={profileForm.about_image}
                    onUploadSuccess={(url) => setProfileForm({ ...profileForm, about_image: url })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Identitas & Sekilas Pandang</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Situs / Desa</label>
                  <input type="text" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alamat Singkat (Kecamatan / Kabupaten)</label>
                  <input type="text" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} placeholder="Kecamatan Cibungbulang, Kabupaten Bogor" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
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

            <div className="space-y-6 md:col-span-2">
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
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Profil & Sinkronkan"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "hero" && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Teks Hero Section (Atas)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="space-y-6 pt-6 border-t border-slate-100">
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

          <div className={`space-y-6 pt-6 border-t border-slate-100 ${profileForm.hero_video ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-800">Background Carousel (Beranda)</h3>
              <button type="button" onClick={handleAddGalleryItem} className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                + Tambah Slide
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileForm.gallery.map((item: any, index: number) => (
                <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 relative">
                  <button type="button" onClick={() => handleRemoveGalleryItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-md text-xs font-bold">
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
                  Belum ada gambar carousel. Klik &quot;+ Tambah Slide&quot; untuk mulai menambahkan.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Hero & Galeri"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "wilayah" && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Data Wilayah & Batas Geografis</h3>
          <p className="text-xs text-slate-500">Data ini disinkronkan dengan halaman Profil Desa dan informasi geografis pada Landing Page.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Luas Wilayah</label>
              <input type="text" value={profileForm.luasWilayah} onChange={e => setProfileForm({...profileForm, luasWilayah: e.target.value})} placeholder="Contoh: 325 Ha / 3.25 km²" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Batas Sebelah Utara</label>
              <input type="text" value={profileForm.batasUtara} onChange={e => setProfileForm({...profileForm, batasUtara: e.target.value})} placeholder="Contoh: Desa ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Batas Sebelah Selatan</label>
              <input type="text" value={profileForm.batasSelatan} onChange={e => setProfileForm({...profileForm, batasSelatan: e.target.value})} placeholder="Contoh: Desa ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Batas Sebelah Timur</label>
              <input type="text" value={profileForm.batasTimur} onChange={e => setProfileForm({...profileForm, batasTimur: e.target.value})} placeholder="Contoh: Desa ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Batas Sebelah Barat</label>
              <input type="text" value={profileForm.batasBarat} onChange={e => setProfileForm({...profileForm, batasBarat: e.target.value})} placeholder="Contoh: Desa ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Data Wilayah"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "tampilan" && (
        <div className="space-y-8">
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Widget Informasi (Beranda Kanan)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Globe size={16} className="text-amber-500"/> Agenda Desa</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Agenda</label>
                  <input type="text" value={profileForm.agenda_title} onChange={e => setProfileForm({...profileForm, agenda_title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Penyuluhan Pertanian Digital" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Waktu & Tempat</label>
                  <input type="text" value={profileForm.agenda_date} onChange={e => setProfileForm({...profileForm, agenda_date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="20 OKT 2026 • Balai Desa" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Globe size={16} className="text-blue-500"/> Community Hub (Pengumuman)</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teks Pengumuman</label>
                  <input type="text" value={profileForm.pengumuman_title} onChange={e => setProfileForm({...profileForm, pengumuman_title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Pengumuman: Lomba Kebersihan Lingkungan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link Tautan</label>
                  <input type="text" value={profileForm.pengumuman_link} onChange={e => setProfileForm({...profileForm, pengumuman_link: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="/informasi-publik" />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Globe size={16} className="text-purple-500"/> Local Events (Timeline)</h4>
                  <button type="button" onClick={handleAddEventItem} className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors">
                    + Tambah Event
                  </button>
                </div>
                <div className="space-y-3">
                  {profileForm.local_events.map((ev: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200 items-center">
                      <input type="text" placeholder="Judul Event (Misal: Kegiatan Posyandu)" value={ev.title} onChange={(e) => handleEventChange(index, 'title', e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      <input type="text" placeholder="Waktu (Misal: 21 Okt)" value={ev.date} onChange={(e) => handleEventChange(index, 'date', e.target.value)} className="w-full sm:w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                      <select value={ev.color} onChange={(e) => handleEventChange(index, 'color', e.target.value)} className="w-full sm:w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                        <option value="amber">Kuning (Amber)</option>
                        <option value="emerald">Hijau (Emerald)</option>
                        <option value="blue">Biru (Blue)</option>
                        <option value="purple">Ungu (Purple)</option>
                        <option value="rose">Merah (Rose)</option>
                      </select>
                      <button type="button" onClick={() => handleRemoveEventItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <AlertCircle size={18} />
                      </button>
                    </div>
                  ))}
                  {profileForm.local_events.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-xl border border-dashed border-slate-300">Belum ada event ditambahkan.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Widget Informasi"}
              </button>
            </div>
          </form>

          <form onSubmit={handleUiConfigSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Pengaturan Elemen UI & Tema Default Landing Page</h3>
              <p className="text-xs text-slate-500 mt-2">Sesuaikan teks label, kartu kantor, tombol CTA, copyright footer, serta mode tema default saat pengunjung pertama kali membuka situs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Section Tentang (About Heading)</label>
                <input type="text" value={uiForm.aboutSectionHeading} onChange={e => setUiForm({ ...uiForm, aboutSectionHeading: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teks Tombol CTA Hero</label>
                <input type="text" value={uiForm.heroCtaText} onChange={e => setUiForm({ ...uiForm, heroCtaText: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Kartu Kantor Desa</label>
                <input type="text" value={uiForm.officeCardTitle} onChange={e => setUiForm({ ...uiForm, officeCardTitle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subjudul Kartu Kantor Desa</label>
                <input type="text" value={uiForm.officeCardSubtitle} onChange={e => setUiForm({ ...uiForm, officeCardSubtitle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teks Copyright Footer</label>
                <input type="text" value={uiForm.footerCopyright} onChange={e => setUiForm({ ...uiForm, footerCopyright: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mode Tema Default Pengunjung Baru</label>
                <select value={uiForm.defaultThemeMode} onChange={e => setUiForm({ ...uiForm, defaultThemeMode: e.target.value as LandingUiConfig["defaultThemeMode"] })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all">
                  <option value="day">Siang (Day Mode)</option>
                  <option value="night">Malam (Night Mode)</option>
                  <option value="dual">Dual Mode (Siang & Malam)</option>
                  <option value="auto">Otomatis Sesuai Jam Lokal (06:00 - 18:00 Siang)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deskripsi Singkat Footer</label>
                <textarea value={uiForm.footerDescription} onChange={e => setUiForm({ ...uiForm, footerDescription: e.target.value })} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Latitude Cuaca Live (Open-Meteo)</label>
                <input type="text" value={uiForm.weatherLat} onChange={e => setUiForm({ ...uiForm, weatherLat: e.target.value })} placeholder="-6.5944" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Longitude Cuaca Live (Open-Meteo)</label>
                <input type="text" value={uiForm.weatherLng} onChange={e => setUiForm({ ...uiForm, weatherLng: e.target.value })} placeholder="106.7892" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>

            {/* Banner Pengumuman Mendesak */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Megaphone size={16} className="text-amber-500" /> Banner Pengumuman Mendesak (Running Banner)</h4>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(uiForm.urgentAnnouncementEnabled)}
                    onChange={e => setUiForm({ ...uiForm, urgentAnnouncementEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Aktifkan Banner
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teks Pengumuman Mendesak</label>
                  <input type="text" value={uiForm.urgentAnnouncementText} onChange={e => setUiForm({ ...uiForm, urgentAnnouncementText: e.target.value })} placeholder="Contoh: Pelayanan Kantor Desa tutup sementara tanggal 17 Agustus..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tautan Tujuan (Opsional)</label>
                  <input type="text" value={uiForm.urgentAnnouncementLink} onChange={e => setUiForm({ ...uiForm, urgentAnnouncementLink: e.target.value })} placeholder="/informasi-publik" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>

            {/* Sosial Media Resmi */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-700 text-sm">Tautan Sosial Media Resmi Desa (Footer)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instagram URL</label>
                  <input type="url" value={uiForm.socialLinks?.instagram || ""} onChange={e => setUiForm({ ...uiForm, socialLinks: { ...(uiForm.socialLinks || {}), instagram: e.target.value } })} placeholder="https://instagram.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">YouTube URL</label>
                  <input type="url" value={uiForm.socialLinks?.youtube || ""} onChange={e => setUiForm({ ...uiForm, socialLinks: { ...(uiForm.socialLinks || {}), youtube: e.target.value } })} placeholder="https://youtube.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">TikTok URL</label>
                  <input type="url" value={uiForm.socialLinks?.tiktok || ""} onChange={e => setUiForm({ ...uiForm, socialLinks: { ...(uiForm.socialLinks || {}), tiktok: e.target.value } })} placeholder="https://tiktok.com/@..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp Link</label>
                  <input type="url" value={uiForm.socialLinks?.whatsapp || ""} onChange={e => setUiForm({ ...uiForm, socialLinks: { ...(uiForm.socialLinks || {}), whatsapp: e.target.value } })} placeholder="https://wa.me/62..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Manajemen Logo Mitra / Sponsor Marquee */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Logo Mitra / Lembaga Marquee (Hero)</h4>
                  <p className="text-xs text-slate-500">Logo yang tampil berjalan di bagian bawah Hero Section.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUiForm({ ...uiForm, partnerLogos: DEFAULT_PARTNER_LOGOS })}
                    className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Reset Default
                  </button>
                  <label className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                    + Upload Logo
                    <input type="file" accept="image/*" onChange={handlePartnerLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3">
                {(uiForm.partnerLogos || []).map((logoUrl, idx) => (
                  <div key={`${logoUrl}-${idx}`} className="relative group bg-slate-900 rounded-xl p-2 aspect-square flex items-center justify-center border border-slate-700">
                    <img src={logoUrl} alt={`Logo ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => handleRemovePartnerLogo(idx)}
                      title="Hapus Logo"
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" disabled={isSavingUi} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                <Save size={18} /> {isSavingUi ? "Menyimpan..." : "Simpan Tampilan UI"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "berita" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleNewsSubmit} className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Newspaper size={20} className="text-indigo-500" /> {editingNewsId ? "Edit Berita" : "Tulis Berita Baru"}
                  </h3>
                  {editingNewsId && (
                    <button type="button" onClick={handleCancelEditBerita} className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                      Batal Edit
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Judul Berita</label>
                  <input type="text" value={newsForm.judul} onChange={e => setNewsForm({...newsForm, judul: e.target.value})} placeholder="Contoh: Pembagian Bansos Tahap 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Gambar / Thumbnail (Tersimpan ke Storage)</label>
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
                        <Save size={18} /> {isSaving ? "Memproses..." : (editingNewsId ? "Simpan Perubahan Berita" : "Publikasikan Berita")}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Daftar Berita (Live)</h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        {newsList?.map((news: any, idx: number) => (
                            <div key={news.id || idx} className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-3 group ${editingNewsId === news.id ? "bg-indigo-50 border-indigo-300" : "bg-slate-50 border-slate-100 hover:border-indigo-200"}`}>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 mb-1 line-clamp-2">{news.judul}</h4>
                                  <span className="text-xs text-slate-500">{new Date(news.createdAt).toLocaleDateString('id-ID')}</span>
                                </div>
                                {news.id && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditBeritaClick(news)}
                                      title="Edit Berita"
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBerita(news.id, news.judul)}
                                      title="Hapus Berita"
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                            </div>
                        ))}
                        {(!newsList || newsList.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">Belum ada berita.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Pratinjau Live Landing Page */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 md:p-6">
          <div className="bg-white rounded-t-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-indigo-600" />
              <span className="font-bold text-slate-800 text-sm">Pratinjau Live Landing Page</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${previewMode === "desktop" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <Monitor size={14} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${previewMode === "mobile" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <Smartphone size={14} /> Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={14} /> Muat Ulang
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Tutup Pratinjau"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-900 rounded-b-2xl overflow-hidden flex items-center justify-center p-2 md:p-4">
            <iframe
              key={previewKey}
              src={`/?preview=${previewKey}`}
              title="Pratinjau Landing Page"
              className={`bg-slate-950 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 h-full ${
                previewMode === "mobile" ? "w-[390px] max-w-full" : "w-full"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
