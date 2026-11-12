export interface LandingSocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface LandingUiConfig {
  aboutSectionHeading: string;
  officeCardTitle: string;
  officeCardSubtitle: string;
  heroCtaText: string;
  footerCopyright: string;
  footerDescription: string;
  defaultThemeMode: "day" | "night" | "dual" | "auto";
  partnerLogos: string[];
  weatherLat: string;
  weatherLng: string;
  urgentAnnouncementEnabled: boolean;
  urgentAnnouncementText: string;
  urgentAnnouncementLink: string;
  socialLinks: LandingSocialLinks;
}

export const DEFAULT_PARTNER_LOGOS: string[] = [
  "/images/logo-bogor.png",
  "/images/PUSKESOS-1.png",
  "/images/logo-katar.png",
  "/images/dinsos.png",
  "/images/pokmas.png",
  "/images/PSM_v2.png",
  "/images/ASTA_v2.png",
  "/images/BPBD_v2.png",
  "/images/DINKES_v2.png",
  "/images/DPMD.png",
];

export const DEFAULT_LANDING_UI_CONFIG: LandingUiConfig = {
  aboutSectionHeading: "About us",
  officeCardTitle: "KANTOR KEPALA DESA CIMANGGU I",
  officeCardSubtitle: "Pusat Integrasi Data & Pelayanan Warga Berbasis WebGIS Digital.",
  heroCtaText: "Jelajahi WebGIS Desa",
  footerCopyright: "© 2026 PEMDES CIMANGGU I. ALL RIGHTS RESERVED.",
  footerDescription:
    "Platform digitalisasi layanan dan informasi terpadu Sistem Digitalisasi Desa (SDD) Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.",
  defaultThemeMode: "day",
  partnerLogos: DEFAULT_PARTNER_LOGOS,
  weatherLat: "-6.5944",
  weatherLng: "106.7892",
  urgentAnnouncementEnabled: false,
  urgentAnnouncementText: "",
  urgentAnnouncementLink: "/informasi-publik",
  socialLinks: {
    instagram: "",
    youtube: "",
    tiktok: "",
    whatsapp: "",
  },
};
