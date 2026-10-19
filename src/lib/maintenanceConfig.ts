export interface FeatureDefinition {
  id: string;
  name: string;
  category: "publik" | "desa" | "resident" | "integrasi";
  categoryLabel: string;
  description: string;
  iconName: string;
  paths: string[];
  defaultNotice: string;
}

export const ALL_SYSTEM_FEATURES: FeatureDefinition[] = [
  // ── 1. LAYANAN PUBLIK & WARGA ──────────────────────────────────────────────
  {
    id: "layanan_surat",
    name: "Layanan Persuratan Online",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Pengajuan dan pembuatan berkas administrasi persuratan warga secara online.",
    iconName: "FileText",
    paths: ["/resident/surat", "/dashboard/surat", "/surat"],
    defaultNotice: "Layanan persuratan online sedang dalam proses pemeliharaan atau maintenance. Mohon menunggu beberapa saat."
  },
  {
    id: "marketplace_umkm",
    name: "Marketplace & Katalog UMKM",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Katalog promosi produk usaha warga desa, etalase UMKM, dan transaksi pesanan.",
    iconName: "Store",
    paths: ["/umkm", "/resident/marketplace"],
    defaultNotice: "Katalog UMKM dan marketplace desa sedang dalam pemeliharaan sistem. Pembelian dinonaktifkan sementara."
  },
  {
    id: "webgis",
    name: "Peta WebGIS Interaktif",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Pemetaan spasial batas desa, sarana publik, zonasi RT/RW, dan geolokasi potensi desa.",
    iconName: "Map",
    paths: ["/gis-dashboard", "/dashboard/map"],
    defaultNotice: "Layanan server peta WebGIS sedang dalam sinkronisasi data spasial berkala."
  },
  {
    id: "e_absensi",
    name: "Kiosk Presensi & E-Absensi",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Kiosk absensi perangkat desa, pengenalan wajah (Face API), dan pencatatan presensi digital.",
    iconName: "QrCode",
    paths: ["/absensi", "/dashboard/e-absensi"],
    defaultNotice: "Sistem Kiosk E-Absensi sedang dalam kalibrasi perangkat dan pemeliharaan server."
  },
  {
    id: "cek_bansos",
    name: "Informasi & Verifikasi Bansos",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Pengecekan penerima bantuan sosial, usulan DTKS, dan verifikasi kuota bansos warga.",
    iconName: "HeartHandshake",
    paths: ["/dashboard/bansos", "/informasi-publik/bansos"],
    defaultNotice: "Layanan data bantuan sosial sedang dalam proses pemutakhiran data bersama kementerian terkait."
  },
  {
    id: "informasi_profil",
    name: "Informasi Publik & Berita Desa",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Portal keterbukaan informasi, berita kegiatan desa, galeri, dan profil kelembagaan.",
    iconName: "Monitor",
    paths: ["/informasi-publik", "/profil", "/organisasi"],
    defaultNotice: "Modul informasi publik desa sedang dalam proses pembaruan konten dan sistem."
  },
  {
    id: "kontak_pengaduan",
    name: "Layanan Pengaduan & Kontak",
    category: "publik",
    categoryLabel: "Layanan Publik",
    description: "Kanal penyampaian aspirasi warga, pelaporan kendala, dan saluran aduan desa.",
    iconName: "Megaphone",
    paths: ["/kontak"],
    defaultNotice: "Layanan pengaduan online sedang dalam pemeliharaan. Silakan hubungi langsung kantor desa untuk keadaan darurat."
  },

  // ── 2. MODUL DASHBOARD OPERASIONAL DESA ───────────────────────────────────
  {
    id: "kependudukan",
    name: "Data Kependudukan & NIK",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Pengelolaan master database warga, kepala keluarga, demografi, dan statistik penduduk.",
    iconName: "Database",
    paths: ["/dashboard/warga"],
    defaultNotice: "Database kependudukan sedang dalam proses backup dan pemeliharaan integritas data."
  },
  {
    id: "keuangan_apbdes",
    name: "Keuangan APBDes & Anggaran",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Pencatatan realisasi APBDes, anggaran pendapatan, pos belanja, dan transparansi keuangan.",
    iconName: "PieChart",
    paths: ["/dashboard/apbdes", "/dashboard/finance"],
    defaultNotice: "Modul pelaporan keuangan APBDes sedang dalam proses tutup buku berkala / maintenance."
  },
  {
    id: "verifikasi_warga",
    name: "Verifikasi Akun & Warga",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Kurasi pendaftaran akun warga, verifikasi KTP/KK, dan pemberian hak akses penduduk.",
    iconName: "ShieldCheck",
    paths: ["/dashboard/verifikasi-warga"],
    defaultNotice: "Panel verifikasi warga sedang dalam pemeliharaan antrean data."
  },
  {
    id: "infrastruktur",
    name: "Infrastruktur & Pembangunan",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Pendataan proyek pembangunan fisik, jembatan, jalan desa, dan sarana prasarana.",
    iconName: "HardHat",
    paths: ["/dashboard/infrastruktur"],
    defaultNotice: "Modul pemantauan proyek infrastruktur sedang dalam proses kalibrasi progress fisik."
  },
  {
    id: "kelembagaan",
    name: "Kelembagaan & Aparatur",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Struktur organisasi desa, data RT/RW, BPD, PKK, Posyandu, dan LPM.",
    iconName: "Building2",
    paths: ["/dashboard/kelembagaan", "/dashboard/aparatur", "/kelembagaan"],
    defaultNotice: "Modul administrasi kelembagaan desa sedang dalam pemutakhiran susunan pengurus."
  },
  {
    id: "bumdes",
    name: "Manajemen Unit Usaha BUMDes",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Pengelolaan unit bisnis desa, laporan omset, inventaris, dan kinerja BUMDes.",
    iconName: "Briefcase",
    paths: ["/dashboard/bumdes"],
    defaultNotice: "Panel pelaporan unit BUMDes sedang dalam proses rekonsiliasi keuangan."
  },
  {
    id: "arsip_digital",
    name: "Arsip Dokumen & Laporan",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Repositori berkas SK, Perdes, dokumen arsip sejarah, dan template surat dinas.",
    iconName: "Archive",
    paths: ["/dashboard/arsip", "/dashboard/arsip-laporan", "/dashboard/format-dokumen"],
    defaultNotice: "Arsip digital sedang dalam proses sinkronisasi cold storage cadangan."
  },
  {
    id: "monitoring_layanan",
    name: "Monitoring & Tracking Layanan",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Pelacakan nomor registrasi surat, KPI kecepatan layanan aparatur, dan log audit.",
    iconName: "Activity",
    paths: ["/dashboard/monitoring", "/dashboard/tracking", "/dashboard/sistem"],
    defaultNotice: "Sistem analitik pelacakan sedang dalam proses pemeliharaan database time-series."
  },
  {
    id: "cms_konten",
    name: "Manajemen Konten (CMS)",
    category: "desa",
    categoryLabel: "Dashboard Desa",
    description: "Editor berita desa, pengumuman agenda, banner informasi, dan publikasi transparansi.",
    iconName: "FileCheck",
    paths: ["/dashboard/cms"],
    defaultNotice: "Panel redaksi CMS sedang dalam pemeliharaan editor konten."
  },

  // ── 3. PORTAL MANDIRI WARGA ───────────────────────────────────────────────
  {
    id: "portal_warga",
    name: "Portal Mandiri Warga",
    category: "resident",
    categoryLabel: "Portal Warga",
    description: "Akses dashboard mandiri warga untuk layanan kependudukan dan biodata keluarga.",
    iconName: "Users",
    paths: ["/resident"],
    defaultNotice: "Portal mandiri warga sedang dalam pemeliharaan server. Mohon login kembali nanti."
  },
  {
    id: "profil_warga",
    name: "Biodata & Profil Warga",
    category: "resident",
    categoryLabel: "Portal Warga",
    description: "Kartu keluarga digital, update nomor HP, dan verifikasi biometrik warga.",
    iconName: "UserCog",
    paths: ["/resident/profile", "/resident/settings"],
    defaultNotice: "Fitur pembaruan profil sedang dalam proses pemeliharaan keamanan data."
  },

  // ── 4. INTEGRASI SISTEM & EKSTERNAL ──────────────────────────────────────
  {
    id: "gateway_whatsapp",
    name: "Gateway Notifikasi WhatsApp",
    category: "integrasi",
    categoryLabel: "Integrasi",
    description: "Pengiriman notifikasi otomatis nomor resi surat, pengumuman bansos, dan OTP WA.",
    iconName: "MessageSquare",
    paths: ["/api/whatsapp"],
    defaultNotice: "Server gateway WhatsApp sedang dalam pembaruan koneksi API."
  },
  {
    id: "kecerdasan_buatan",
    name: "Kecerdasan Buatan (AI Assistant)",
    category: "integrasi",
    categoryLabel: "Integrasi",
    description: "Bot konsultasi warga, AI pengolahan data dokumen otomatis, dan asisten pintar desa.",
    iconName: "Sparkles",
    paths: ["/api/ai"],
    defaultNotice: "Layanan asisten cerdas AI sedang dalam pembaruan model dan kapasitas komputasi."
  }
];

export interface MaintenanceSettings {
  isGlobalMaintenance: boolean;
  globalNotice: string;
  features: Record<string, {
    enabled: boolean;
    notice?: string;
    updatedAt?: string;
    updatedBy?: string;
  }>;
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_MAINTENANCE_SETTINGS: MaintenanceSettings = {
  isGlobalMaintenance: false,
  globalNotice: "Sistem sedang dalam proses pemeliharaan atau maintenance. Mohon menunggu beberapa saat.",
  features: ALL_SYSTEM_FEATURES.reduce((acc, feat) => {
    acc[feat.id] = {
      enabled: true,
      notice: feat.defaultNotice,
      updatedAt: new Date().toISOString()
    };
    return acc;
  }, {} as Record<string, any>),
  updatedAt: new Date().toISOString(),
  updatedBy: "System"
};
