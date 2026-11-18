"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Camera, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Wand2, 
  Upload, 
  Download, 
  Eye, 
  X, 
  RefreshCw, 
  Image as ImageIcon,
  Heart,
  Shirt,
  User,
  Building,
  Brush,
  Palette,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Maximize2
} from "lucide-react";

interface KaurStudioFotoTabProps {
  onBack: () => void;
  isHackerTheme?: boolean;
}

type StudioMode = 
  | "product"
  | "fashion"
  | "prewedding"
  | "model"
  | "photographer_passport"
  | "photographer_umrah"
  | "photographer_baby"
  | "architecture_interior"
  | "architecture_exterior"
  | "edit_restore"
  | "art_caricature"
  | "sketch_to_photo"
  | "banner"
  | "combine";

interface ModeConfig {
  id: StudioMode;
  name: string;
  category: string;
  icon: any;
  defaultPrompt: string;
  presets: string[];
  recommendedRatios: string[];
  placeholder: string;
}

const STUDIO_MODES: ModeConfig[] = [
  {
    id: "product",
    name: "Photo Produk & UMKM",
    category: "Bisnis & E-Commerce",
    icon: ImageIcon,
    defaultPrompt: "Foto komersial profesional produk dengan pencahayaan studio mewah dan latar belakang elegan.",
    presets: [
      "Studio Minimalis Putih Bersih",
      "Nuansa Alam Tropis Kayu & Daun",
      "Latar Mewah Marmer & Pantulan Kaca",
      "Pencahayaan Neon Modern Cyber",
      "Panggung Display Produk Podium Akrilik"
    ],
    recommendedRatios: ["1:1", "4:3", "16:9"],
    placeholder: "Contoh: Kemasan keripik singkong khas desa dengan latar kayu jati dan pencahayaan studio hangat."
  },
  {
    id: "fashion",
    name: "Fashion Photoshoot AI",
    category: "Busana & Gaya",
    icon: Shirt,
    defaultPrompt: "Model profesional mengenakan busana elegan dengan pose majalah fashion dan pencahayaan studio berkelas.",
    presets: [
      "Busana Batik Modern Nusantara",
      "Pakaian Formal Perangkat Desa",
      "Hijab Cantik Elegan Kasual",
      "Baju Adat Nusantara Mewah",
      "Streetwear Urban Kekinian"
    ],
    recommendedRatios: ["3:4", "9:16", "1:1"],
    placeholder: "Contoh: Model wanita berhijab mengenakan gamis batik kontemporer dengan latar teras kantor desa modern."
  },
  {
    id: "prewedding",
    name: "Pre+Wedding Nusantara",
    category: "Pernikahan & Pasangan",
    icon: Heart,
    defaultPrompt: "Foto prewedding pasangan pengantin Indonesia yang romantis dengan pakaian adat mewah dan pencahayaan sinematik.",
    presets: [
      "Adat Sunda Siger Mahkota Emas",
      "Adat Jawa Solo / Yogya Klasik",
      "Modern Wedding Luxury Gaun Putih",
      "Pantai Senja Sunset Sinematik",
      "Hutan Pinus Nuansa Kabut Romantis"
    ],
    recommendedRatios: ["3:4", "16:9", "1:1"],
    placeholder: "Contoh: Pasangan mempelai berbusana pengantin adat Sunda lengkap dengan mahkota siger di pelataran rumah joglo."
  },
  {
    id: "model",
    name: "Foto Model AI",
    category: "Model & Karakter",
    icon: User,
    defaultPrompt: "Potret wajah realistis model pria/wanita Indonesia dengan tekstur kulit alami dan pencahayaan 85mm f/1.4.",
    presets: [
      "Wajah Pria Indonesia Karismatik",
      "Wajah Wanita Indonesia Anggun",
      "Model Usia Paruh Baya Berwibawa",
      "Model Muda Generasi Milenial",
      "Ekspresi Senyum Hangat Ramah"
    ],
    recommendedRatios: ["3:4", "1:1", "9:16"],
    placeholder: "Contoh: Potret profesional seorang pemuda desa ramah dan penuh semangat mengenakan kemeja rapi."
  },
  {
    id: "photographer_passport",
    name: "Pas Foto Resmi (KTP/Ijazah)",
    category: "Dokumen Resmi",
    icon: Camera,
    defaultPrompt: "Pas foto formal resmi standar kependudukan dan dinas pemerintah, rapi, tegak, dan tajam.",
    presets: [
      "Latar Merah Resmi (Tahun Ganjil / KTP)",
      "Latar Biru Resmi (Tahun Genap / Dinas)",
      "Latar Putih Bersih (Visa / Paspor)",
      "Kemeja Putih Berkerah Rapi",
      "Pakaian Batik KORPRI / Perangkat Desa"
    ],
    recommendedRatios: ["3:4", "1:1"],
    placeholder: "Contoh: Pas foto formal pria mengenakan kemeja putih berdasi dengan latar belakang merah polos bersih."
  },
  {
    id: "photographer_umrah",
    name: "Dokumentasi Umrah & Haji",
    category: "Ibadah & Spiritual",
    icon: Camera,
    defaultPrompt: "Foto realistis jamaah haji/umrah Indonesia berbusana ihram di pelataran Masjidil Haram dengan latar Ka'bah.",
    presets: [
      "Pelataran Ka'bah Masjidil Haram",
      "Masjid Nabawi Madinah Payung Raksasa",
      "Pakaian Ihram Pria Putih Bersih",
      "Busana Muslimah Putih Anggun",
      "Wajah Berseri Bahagia Penuh Syukur"
    ],
    recommendedRatios: ["3:4", "16:9", "1:1"],
    placeholder: "Contoh: Warga desa tersenyum bahagia mengenakan pakaian ihram di pelataran Masjid Nabawi Madinah."
  },
  {
    id: "photographer_baby",
    name: "Foto Bayi & Newborn",
    category: "Keluarga & Balita",
    icon: Camera,
    defaultPrompt: "Foto studio bayi lucu dan menggemaskan dengan selimut rajut lembut dan pencahayaan pastel hangat.",
    presets: [
      "Newborn Tertidur Damai di Keranjang",
      "Balita Ceria Kostum Hewan Lucu",
      "Nuansa Awan & Bintang Manis",
      "Dekorasi Bunga & Daun Alami"
    ],
    recommendedRatios: ["1:1", "4:3"],
    placeholder: "Contoh: Bayi mungil menggemaskan tertidur pulas dalam bedong rajut wol pastel di atas karpet bulu lembut."
  },
  {
    id: "architecture_exterior",
    name: "Desain Eksterior & Balai Desa",
    category: "Arsitektur & Pembangunan",
    icon: Building,
    defaultPrompt: "Visualisasi arsitektur 3D eksterior fasad bangunan modern tropis kantor balai desa dengan lanskap asri.",
    presets: [
      "Kantor Balai Desa Modern Tropis",
      "Gerbang Masuk / Gapura Desa Ikonik",
      "Hunian Rumah Tinggal Minimalis Asri",
      "Taman Publik Desa & Jalur Pedestrian",
      "Pencahayaan Siang Hari Cerah 8K"
    ],
    recommendedRatios: ["16:9", "4:3", "1:1"],
    placeholder: "Contoh: Fasad kantor balai desa Cimanggu I berlantai 2 bergaya modern tropis dengan taman depan dan tiang bendera."
  },
  {
    id: "architecture_interior",
    name: "Desain Interior Kantor Desa",
    category: "Arsitektur & Pembangunan",
    icon: Building,
    defaultPrompt: "Desain interior 3D ruang pelayanan publik kantor desa yang modern, rapi, bersih, dan berwibawa.",
    presets: [
      "Ruang Pelayanan Terpadu Satu Pintu",
      "Ruang Rapat & Musrenbang Balai Desa",
      "Ruang Kerja Kaur Perencanaan Modern",
      "Aksen Kayu Hangat & Lampu LED Linear",
      "Ruang Tunggu Warga Nyaman & Sejuk"
    ],
    recommendedRatios: ["16:9", "4:3"],
    placeholder: "Contoh: Ruang rapat representatif dengan meja konferensi kayu jati, proyektor digital, dan pencahayaan LED plafon."
  },
  {
    id: "edit_restore",
    name: "Restorasi & Edit Foto Buram",
    category: "Perbaikan Foto",
    icon: Wand2,
    defaultPrompt: "Restorasi foto lama atau buram menjadi sangat tajam, perbaiki detail wajah, kontras warna, dan tekstur asli.",
    presets: [
      "Restorasi Wajah Sangat Tajam (Ultra HD)",
      "Pewarnaan Foto Hitam Putih Klasik",
      "Perbaiki Foto Pecah / Beresolusi Rendah",
      "Pembersihan Bintik & Goresan Arsip Lama"
    ],
    recommendedRatios: ["3:4", "1:1", "4:3"],
    placeholder: "Unggah foto arsip lama desa atau foto profil warga yang buram untuk dipertajam otomatis oleh AI."
  },
  {
    id: "art_caricature",
    name: "Art & Karikatur 3D",
    category: "Seni & Kreatif",
    icon: Palette,
    defaultPrompt: "Ubah foto menjadi karakter karikatur 3D animasi profesional (gaya Pixar/Disney) dengan kemiripan wajah tinggi.",
    presets: [
      "Karikatur 3D Lucu Gaya Animasi Pixar",
      "Lukisan Cat Minyak Klasik Kanvas",
      "Gaya Anime Populer Modern",
      "Ilustrasi Vektor Flat Desain Modern",
      "Patung Lilin Realistis 3D Digital"
    ],
    recommendedRatios: ["1:1", "3:4"],
    placeholder: "Contoh: Karikatur 3D animasi ceria seorang staf perangkat desa dengan seragam dinas lengkap dan senyum lebar."
  },
  {
    id: "sketch_to_photo",
    name: "Sketsa Gambar ke Foto 3D",
    category: "Seni & Kreatif",
    icon: Brush,
    defaultPrompt: "Ubah coretan sketsa denah atau gambar garis tangan menjadi foto bangunan atau objek nyata yang realistis.",
    presets: [
      "Sketsa Fasad Jadi Foto Bangunan Nyata",
      "Sketsa Denah Jadi Render Interior 3D",
      "Sketsa Produk Jadi Foto Produk Asli",
      "Pencahayaan Alami Fotorealistik 8K"
    ],
    recommendedRatios: ["16:9", "4:3", "1:1"],
    placeholder: "Unggah gambar sketsa coretan tangan atau denah rencana pembangunan desa untuk dirender menjadi foto realistis."
  },
  {
    id: "banner",
    name: "Bikin Banner Promosi Desa",
    category: "Publikasi & Media",
    icon: Layers,
    defaultPrompt: "Desain grafis banner baliho pengumuman desa yang modern, komunikatif, dan menarik perhatian warga.",
    presets: [
      "Baliho Transparansi APBDes & Realisasi",
      "Spanduk Musrenbang & Musyawarah Desa",
      "Banner Peringatan Hari Besar Nasional",
      "Promosi Produk UMKM Unggulan Desa"
    ],
    recommendedRatios: ["16:9", "4:3"],
    placeholder: "Contoh: Desain banner formal kegiatan Musrenbang Desa Cimanggu I dengan aksen biru emas dan logo kabupaten."
  }
];

export function KaurStudioFotoTab({ onBack, isHackerTheme }: KaurStudioFotoTabProps) {
  const [selectedMode, setSelectedMode] = useState<StudioMode>("product");
  const [prompt, setPrompt] = useState<string>("");
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  
  // Generation & Engine states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Engine status info
  const [engineStatus, setEngineStatus] = useState<{
    status: string;
    engine: string;
    hasMasterKey: boolean;
    keySource: string;
  }>({
    status: "checking",
    engine: "Python 3.12 AI Engine",
    hasMasterKey: true,
    keySource: "Admin Master"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load engine status on mount
  useEffect(() => {
    fetch("/api/ai/studio-foto")
      .then((res) => res.json())
      .then((data) => {
        setEngineStatus({
          status: data.status || "online",
          engine: data.engine || "Python 3.12 + Google Gemini Engine",
          hasMasterKey: Boolean(data.hasMasterKey),
          keySource: data.keySource || "Admin Master"
        });
      })
      .catch((err) => {
        console.warn("[StudioFoto] Status check:", err);
      });
  }, []);

  // Update prompt when mode changes
  const activeConfig = STUDIO_MODES.find((m) => m.id === selectedMode) || STUDIO_MODES[0];

  useEffect(() => {
    if (activeConfig) {
      setPrompt(activeConfig.defaultPrompt);
      if (!activeConfig.recommendedRatios.includes(aspectRatio)) {
        setAspectRatio(activeConfig.recommendedRatios[0] || "1:1");
      }
    }
  }, [selectedMode]);

  // Handle Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar. Maksimal 10 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageBase64(result);
        setImagePreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64("");
    setImagePreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Generate Image via Python AI Engine
  const handleGenerate = async () => {
    if (!prompt.trim() && !imageBase64) {
      setErrorMsg("Harap masukkan deskripsi prompt atau unggah gambar referensi.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setGenerationStep("1/3 Menyiapkan parameter & optimasi prompt di Python Engine...");

    try {
      setTimeout(() => {
        setGenerationStep("2/3 Menghubungi Google Gemini Multimodal via Python Service...");
      }, 1500);

      setTimeout(() => {
        setGenerationStep("3/3 Merender citra realistis resolusi tinggi...");
      }, 3500);

      const res = await fetch("/api/ai/studio-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          prompt: prompt.trim(),
          customInstruction: customInstruction.trim(),
          aspectRatio: aspectRatio,
          imageBase64: imageBase64,
          mimeType: imageBase64.includes("image/png") ? "image/png" : "image/jpeg"
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.imageUrl) {
        const newResult = {
          imageUrl: data.imageUrl,
          modeName: activeConfig.name,
          aspectRatio: data.aspectRatio || aspectRatio,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          prompt: prompt,
          engineUsed: data.engineUsed || "Google Gemini AI (Vision & Intelegensi Budaya) + Sana Ultra HD Engine"
        };
        setGeneratedResult(newResult);
        setGenerationHistory((prev) => [newResult, ...prev.slice(0, 7)]);
      } else {
        throw new Error(data.error || "Gagal menghasilkan gambar AI.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menghubungi Python AI generator.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  return (
    <div className="space-y-6 font-sans relative pb-16 animate-in fade-in duration-300">
      
      {/* ========================================================= */}
      {/* 1. UNIFIED NATIVE TOP HEADER                              */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer shrink-0"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20 shrink-0">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Instan Studio Foto AI
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs">
                  M.A_Collection v3.0
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Python Engine & Gemini AI Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Generator foto fotorealistik & desain grafis otomatis untuk Kaur Perencanaan dan Perangkat Desa.
              </p>
            </div>
          </div>
        </div>

        {/* Status Kunci Admin Master */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Otorisasi Kunci AI</p>
              <p className="text-xs font-black text-slate-800">Terkoneksi via Admin Master</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CATEGORY & MODULE HORIZONTAL SELECTOR PILLS             */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {STUDIO_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                }`}
              >
                <Icon size={16} className={isSelected ? "text-white" : "text-sky-600"} />
                <span>{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE: STUDIO CONTROLS & LIVE GENERATION       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & PROMPT (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <activeConfig.icon size={18} className="text-sky-600" />
                  {activeConfig.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Kategori: {activeConfig.category}</p>
              </div>
              <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                Preset Siap Pakai
              </span>
            </div>

            {/* Presets Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Pilih Tema & Gaya Cepat:</label>
              <div className="flex flex-wrap gap-2">
                {activeConfig.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      prompt === preset
                        ? "bg-sky-100/80 border-sky-400 text-sky-900 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Deskripsi Citra yang Diinginkan (Prompt):</label>
                <span className="text-[11px] text-slate-400">Dioptimalkan oleh Python Realistic Engine</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={activeConfig.placeholder}
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Optional Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Unggah Foto Referensi / Subjek (Opsional):
              </label>

              {imagePreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 p-2 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Referensi" 
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200" 
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Foto Referensi Siap</p>
                      <p className="text-[11px] text-slate-500">Akan digunakan AI untuk menjaga kemiripan bentuk & wajah</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Hapus foto"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700">Klik atau geser foto ke sini</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Mendukung format JPG, PNG, WEBP (Maksimal 10 MB)</span>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </div>
              )}
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Rasio Aspek Citra:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { ratio: "1:1", label: "1:1 Persegi", sub: "Instagram/Profil" },
                  { ratio: "3:4", label: "3:4 Pas Foto", sub: "Portrait Formal" },
                  { ratio: "4:3", label: "4:3 Katalog", sub: "Standar Produk" },
                  { ratio: "16:9", label: "16:9 Landscape", sub: "Banner/Layar" },
                  { ratio: "9:16", label: "9:16 Story", sub: "Reels/Status" }
                ].map((item) => (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => setAspectRatio(item.ratio)}
                    className={`p-2.5 rounded-2xl text-center border transition-all cursor-pointer ${
                      aspectRatio === item.ratio
                        ? "bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs font-extrabold">{item.ratio}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Extra Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Instruksi Tambahan (Opsional):</label>
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Contoh: Tambahkan pantulan cahaya sore lembut, hindari warna mencolok..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Submit Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                isGenerating
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 active:scale-[0.98]"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Memproses dengan Python AI Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>✨ Generate Foto Realistis (Python AI)</span>
                </>
              )}
            </button>

            {/* Step-by-step progress indicator */}
            {isGenerating && (
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 text-center animate-pulse">
                {generationStep}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: GENERATED RESULT PREVIEW & HISTORY (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={18} className="text-sky-600" />
                Hasil Render AI
              </h3>
              {generatedResult && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Selesai
                </span>
              )}
            </div>

            {/* Result Image Area */}
            {generatedResult ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 group">
                  <img
                    src={generatedResult.imageUrl}
                    alt="Hasil AI"
                    className="w-full h-auto max-h-[460px] object-contain mx-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs font-bold text-white">
                      Rasio: {generatedResult.aspectRatio} • {generatedResult.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomImage(generatedResult.imageUrl)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition-all cursor-pointer"
                      title="Perbesar Tampilan"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Download and Share Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={generatedResult.imageUrl}
                    download={`studio_ai_${selectedMode}_${Date.now()}.png`}
                    className="py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download size={14} />
                    <span>Unduh HD (.PNG)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setZoomImage(generatedResult.imageUrl)}
                    className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Lihat Full HD</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[340px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                  <Wand2 size={26} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Belum Ada Hasil Render</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    Pilih modul di atas, atur deskripsi dan rasio, lalu klik tombol "Generate Foto Realistis" untuk mulai membuat gambar AI.
                  </p>
                </div>
              </div>
            )}

            {/* History of Recent Generations */}
            {generationHistory.length > 1 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Riwayat Generasi Sesi Ini:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {generationHistory.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGeneratedResult(item)}
                      className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-sky-500 transition-all cursor-pointer"
                      title={item.modeName}
                    >
                      <img src={item.imageUrl} alt="Riwayat" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. MODAL ZOOM LIGHTBOX                                    */}
      {/* ========================================================= */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            >
              <X size={24} />
            </button>
            <img 
              src={zoomImage} 
              alt="Zoom Preview" 
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/10" 
            />
            <div className="mt-4 flex gap-3">
              <a
                href={zoomImage}
                download="studio_ai_hd.png"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-lg flex items-center gap-2"
              >
                <Download size={14} /> Unduh Kualitas Asli
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
