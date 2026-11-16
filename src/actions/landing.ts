"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { LandingUiConfig, invalidateLandingUiCache, DEFAULT_LANDING_UI_CONFIG } from "@/lib/landingUiConfig";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

async function getAdminSession() {
  const session = await getSession();
  const adminRoles = ["ADMIN_DESA", "KADES", "SEKDES", "OPERATOR_DESA", "ADMIN_MASTER", "KAUR", "KASI", "PERANGKAT_DESA"];
  if (!adminRoles.includes(session.user.role)) {
    throw new Error("Unauthorized: Akses Admin Diperlukan");
  }
  return session;
}

const DEFAULT_TENANT_ID = "f93e947c-1a9b-47a3-913b-2ea2a4290732";
let cachedTenantId: string | null = null;
let tenantResolvePromise: Promise<string> | null = null;

async function resolveTenantId() {
  if (cachedTenantId) return cachedTenantId;
  if (!tenantResolvePromise) {
    tenantResolvePromise = (async () => {
      try {
        const tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              { domain: "cimanggu1.desa.id" },
              { id: DEFAULT_TENANT_ID }
            ]
          },
          select: { id: true }
        });
        if (tenant) {
          cachedTenantId = tenant.id;
          return tenant.id;
        }
      } catch (error) {
        console.error("Failed to resolve tenant ID:", error);
      } finally {
        tenantResolvePromise = null;
      }
      return DEFAULT_TENANT_ID;
    })();
  }
  return tenantResolvePromise;
}

// In-memory cache for high-traffic landing queries (60s TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const landingCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = landingCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    landingCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  landingCache.set(key, { data, timestamp: Date.now() });
}

export async function invalidateLandingCache(): Promise<void> {
  landingCache.clear();
}

async function getLandingTenantFilter() {
  const resolved = await resolveTenantId();
  const ids = Array.from(new Set([
    resolved,
    DEFAULT_TENANT_ID,
    "desa_cimanggu_1",
    "cimanggu-1",
    "cimanggu1"
  ]));
  return { tenantId: { in: ids } };
}

function isMaleValue(val?: string | null): boolean {
  if (!val) return false;
  const s = val.trim().toUpperCase().replace(/[-_\s]+/g, "");
  return s === "LAKILAKI" || s === "L" || s === "MALE" || s === "M";
}

function isFemaleValue(val?: string | null): boolean {
  if (!val) return false;
  const s = val.trim().toUpperCase().replace(/[-_\s]+/g, "");
  return s === "PEREMPUAN" || s === "P" || s === "FEMALE" || s === "F";
}

function isKepalaKeluarga(val?: string | null): boolean {
  if (!val) return false;
  const s = val.trim().toUpperCase().replace(/[-_\s]+/g, "");
  return s === "KEPALAKELUARGA";
}

export async function getVillageStats() {
  const cached = getCached<{ totalWarga: number; totalLaki: number; totalPerempuan: number; totalKK: number; }>("village_stats");
  if (cached) return cached;

  try {
    const tenantFilter = await getLandingTenantFilter();
    
    // Single optimized query to eliminate connection pool starvation and timeout
    const residents = await prisma.dataKependudukan.findMany({
      where: tenantFilter,
      select: { jenisKelamin: true, hubunganKeluarga: true, noKK: true }
    });

    const totalWarga = residents.length;
    let totalLaki = 0;
    let totalPerempuan = 0;
    let totalKKCount = 0;
    const uniqueKkSet = new Set<string>();

    residents.forEach(r => {
      if (isMaleValue(r.jenisKelamin)) totalLaki++;
      else if (isFemaleValue(r.jenisKelamin)) totalPerempuan++;

      if (isKepalaKeluarga(r.hubunganKeluarga)) totalKKCount++;
      if (r.noKK) uniqueKkSet.add(r.noKK);
    });

    const totalKK = totalKKCount > 0 ? totalKKCount : uniqueKkSet.size;

    const result = {
      totalWarga,
      totalLaki,
      totalPerempuan,
      totalKK,
    };
    setCached("village_stats", result);
    return result;
  } catch (error) {
    console.error("Error in getVillageStats:", error);
    return {
      totalWarga: 0,
      totalLaki: 0,
      totalPerempuan: 0,
      totalKK: 0,
    };
  }
}

export async function getLatestNews() {
  const cached = getCached<any[]>("latest_news");
  if (cached) return cached;

  try {
    const tenantFilter = await getLandingTenantFilter();
    const result = await prisma.berita.findMany({
      where: { 
        ...tenantFilter,
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    setCached("latest_news", result);
    return result;
  } catch (error) {
    // Silently handle error
    return [];
  }
}

export async function getOrganizationalStructure() {
  const cached = getCached<any[]>("org_structure");
  if (cached) return cached;

  try {
    const tenantFilter = await getLandingTenantFilter();
    const result = await prisma.aparaturDesa.findMany({
      where: { 
        ...tenantFilter,
        isActive: true,
      },
      orderBy: [
        { level: "asc" },
        { order: "asc" },
      ],
    });
    setCached("org_structure", result);
    return result;
  } catch (error) {
    // Silently handle error
    return [];
  }
}

export async function getVillageProfile() {
  try {
    const tenantFilter = await getLandingTenantFilter();
    const result = await prisma.villageProfile.findFirst({
      where: tenantFilter,
      orderBy: { updatedAt: 'desc' }
    });
    return result;
  } catch (error) {
    console.error("Error in getVillageProfile:", error);
    return null;
  }
}

export async function getLembagaList() {
  const cached = getCached<any[]>("lembaga_list");
  if (cached) return cached;

  try {
    const tenantFilter = await getLandingTenantFilter();
    const result = await prisma.lembaga.findMany({
      where: tenantFilter,
      orderBy: { name: "asc" },
    });
    setCached("lembaga_list", result);
    return result;
  } catch (error) {
    // Silently handle error
    return [];
  }
}

export async function updateVillageProfile(data: any) {
  try {
    const session = await getAdminSession();
    const sessionTenantId = (session.user as any)?.tenantId;
    const resolvedId = await resolveTenantId();
    const existingProfile = await prisma.villageProfile.findFirst();
    const tenantId = existingProfile?.tenantId || sessionTenantId || resolvedId || DEFAULT_TENANT_ID;

    let processedVideoUrl = data.hero_video;
    
    // Convert base64 video to file and save to public/uploads if necessary
    if (processedVideoUrl && processedVideoUrl.startsWith("data:video")) {
      try {
        const matches = processedVideoUrl.match(/^data:video\/([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1].split('+')[0].replace(/[^a-zA-Z0-9]/g, '');
          const buffer = Buffer.from(matches[2], "base64");
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const fileName = `hero_video_${Date.now()}.${ext}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          processedVideoUrl = `/uploads/${fileName}`;
        }
      } catch (err) {
        console.error("Error saving video:", err);
      }
    }

    const result = await prisma.villageProfile.upsert({
      where: { tenantId },
      update: {
        title: data.title,
        address: data.address,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        hero_video: processedVideoUrl,
        about_title: data.about_title,
        about_text: data.about_text,
        about_image: data.about_image,
        logo: data.logo,
        luasWilayah: data.luasWilayah,
        batasUtara: data.batasUtara,
        batasSelatan: data.batasSelatan,
        batasTimur: data.batasTimur,
        batasBarat: data.batasBarat,
        gallery: data.gallery,
        sambutan_kades: data.sambutan_kades,
        sejarah: data.sejarah,
        visi: data.visi,
        misi: data.misi,
        kontak_telepon: data.kontak_telepon,
        kontak_email: data.kontak_email,
        kontak_alamat: data.kontak_alamat,
        agenda_title: data.agenda_title,
        agenda_date: data.agenda_date,
        pengumuman_title: data.pengumuman_title,
        pengumuman_link: data.pengumuman_link,
        local_events: data.local_events,
      },
      create: {
        tenantId,
        title: data.title,
        address: data.address,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        hero_video: processedVideoUrl,
        about_title: data.about_title,
        about_text: data.about_text,
        about_image: data.about_image,
        logo: data.logo,
        luasWilayah: data.luasWilayah,
        batasUtara: data.batasUtara,
        batasSelatan: data.batasSelatan,
        batasTimur: data.batasTimur,
        batasBarat: data.batasBarat,
        gallery: data.gallery,
        sambutan_kades: data.sambutan_kades,
        sejarah: data.sejarah,
        visi: data.visi,
        misi: data.misi,
        kontak_telepon: data.kontak_telepon,
        kontak_email: data.kontak_email,
        kontak_alamat: data.kontak_alamat,
        agenda_title: data.agenda_title,
        agenda_date: data.agenda_date,
        pengumuman_title: data.pengumuman_title,
        pengumuman_link: data.pengumuman_link,
        local_events: data.local_events,
      }
    });

    invalidateLandingCache();
    revalidatePath("/", "layout");
    revalidatePath("/profil");
    revalidatePath("/profil/sambutan");
    revalidatePath("/profil/sejarah");
    revalidatePath("/profil/visi-misi");
    revalidatePath("/organisasi/aparatur");
    revalidatePath("/organisasi/kelembagaan");
    revalidatePath("/kontak");
    revalidatePath("/dashboard/cms");
    revalidatePath("/dashboard/profil");
    revalidatePath("/dashboard/settings/landing");
    return result;
  } catch (error) {
    console.error("Error in updateVillageProfile:", error);
    throw error;
  }
}

export async function updateAparatur(id: string, data: any) {
  try {
    const session = await getAdminSession();
    const tenantId = (session.user as any).tenantId || DEFAULT_TENANT_ID;

    const result = await prisma.aparaturDesa.upsert({
      where: { id: id || "new-temp-id" },
      update: {
        name: data.name,
        position: data.position,
        role: data.role,
        level: data.level,
        photo: data.photo,
        isActive: data.isActive,
      },
      create: {
        tenantId,
        name: data.name,
        position: data.position,
        role: data.role,
        level: data.level,
        photo: data.photo,
        isActive: true,
      }
    });

    invalidateLandingCache();
    revalidatePath("/");
    revalidatePath("/dashboard/cms");
    revalidatePath("/dashboard/settings/landing");
    return result;
  } catch (error) {
    throw error;
  }
}

export async function createBerita(data: any) {
  try {
    const session = await getAdminSession();
    const tenantId = (session.user as any).tenantId || DEFAULT_TENANT_ID;

    const result = await prisma.berita.create({
      data: {
        tenantId,
        judul: data.judul,
        slug: data.judul.toLowerCase().replace(/ /g, '-'),
        konten: data.konten,
        gambar: data.gambar,
        kategori: data.kategori || "Umum",
        isPublished: true,
      }
    });

    invalidateLandingCache();
    revalidatePath("/");
    revalidatePath("/dashboard/cms");
    revalidatePath("/dashboard/settings/landing");
    return result;
  } catch (error) {
    throw error;
  }
}

export async function updateBerita(
  id: string,
  data: { judul: string; konten: string; gambar?: string; kategori?: string }
) {
  await getAdminSession();
  try {
    const updated = await prisma.berita.update({
      where: { id },
      data: {
        judul: data.judul,
        konten: data.konten,
        gambar: data.gambar,
        kategori: data.kategori || "Umum",
      },
    });
    invalidateLandingCache();
    revalidatePath("/");
    revalidatePath("/dashboard/cms");
    revalidatePath("/dashboard/settings/landing");
    return updated;
  } catch (error) {
    throw error;
  }
}

export async function deleteBerita(id: string) {
  await getAdminSession();
  try {
    const deleted = await prisma.berita.delete({
      where: { id },
    });
    invalidateLandingCache();
    revalidatePath("/");
    revalidatePath("/dashboard/cms");
    revalidatePath("/dashboard/settings/landing");
    return deleted;
  } catch (error) {
    throw error;
  }
}

export async function updateLandingUiConfig(config: LandingUiConfig) {
  await getAdminSession();
  try {
    const cleanConfig: LandingUiConfig = {
      aboutSectionHeading: config.aboutSectionHeading?.trim() || DEFAULT_LANDING_UI_CONFIG.aboutSectionHeading,
      officeCardTitle: config.officeCardTitle?.trim() || DEFAULT_LANDING_UI_CONFIG.officeCardTitle,
      officeCardSubtitle: config.officeCardSubtitle?.trim() || DEFAULT_LANDING_UI_CONFIG.officeCardSubtitle,
      heroCtaText: config.heroCtaText?.trim() || DEFAULT_LANDING_UI_CONFIG.heroCtaText,
      footerCopyright: config.footerCopyright?.trim() || DEFAULT_LANDING_UI_CONFIG.footerCopyright,
      footerDescription: config.footerDescription?.trim() || DEFAULT_LANDING_UI_CONFIG.footerDescription,
      defaultThemeMode: ["day", "night", "dual", "auto"].includes(config.defaultThemeMode)
        ? config.defaultThemeMode
        : DEFAULT_LANDING_UI_CONFIG.defaultThemeMode,
      partnerLogos:
        Array.isArray(config.partnerLogos) && config.partnerLogos.length > 0
          ? config.partnerLogos.filter((u) => typeof u === "string" && u.trim().length > 0)
          : DEFAULT_LANDING_UI_CONFIG.partnerLogos,
      weatherLat: config.weatherLat?.trim() || DEFAULT_LANDING_UI_CONFIG.weatherLat,
      weatherLng: config.weatherLng?.trim() || DEFAULT_LANDING_UI_CONFIG.weatherLng,
      urgentAnnouncementEnabled: Boolean(config.urgentAnnouncementEnabled),
      urgentAnnouncementText: config.urgentAnnouncementText?.trim() || "",
      urgentAnnouncementLink: config.urgentAnnouncementLink?.trim() || DEFAULT_LANDING_UI_CONFIG.urgentAnnouncementLink,
      socialLinks: {
        instagram: config.socialLinks?.instagram?.trim() || "",
        youtube: config.socialLinks?.youtube?.trim() || "",
        tiktok: config.socialLinks?.tiktok?.trim() || "",
        whatsapp: config.socialLinks?.whatsapp?.trim() || "",
      },
    };

    const result = await prisma.systemSetting.upsert({
      where: { id: "landing_ui_config" },
      update: { settings: cleanConfig as any },
      create: { id: "landing_ui_config", settings: cleanConfig as any },
    });

    invalidateLandingUiCache();
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/cms");
    return result;
  } catch (error) {
    throw error;
  }
}

export async function submitCitizenAspiration(data: {
  nama_warga: string;
  rt_rw?: string;
  kategori: string;
  isi_pesan: string;
  reporterPhone?: string;
}) {
  try {
    const tenantId = await resolveTenantId();
    
    // Parse RT dan RW dari input (contoh: "RT 02 / RW 05", "02/05", "01")
    let rt = "01";
    let rw = "01";
    if (data.rt_rw) {
      const parts = data.rt_rw.split(/[\/\-,]/);
      if (parts.length >= 2) {
        rt = parts[0].replace(/\D/g, "").padStart(2, "0") || "01";
        rw = parts[1].replace(/\D/g, "").padStart(2, "0") || "01";
      } else {
        const num = data.rt_rw.replace(/\D/g, "").padStart(2, "0");
        if (num) rt = num;
      }
    }

    const complaint = await prisma.rtComplaint.create({
      data: {
        tenantId,
        rt,
        rw,
        reporterName: data.nama_warga.trim(),
        reporterPhone: data.reporterPhone?.trim() || null,
        title: `Aspirasi Publik: ${data.kategori.trim() || "Umum"}`,
        content: data.isi_pesan.trim(),
        category: data.kategori.trim() || "Fasilitas Umum",
        status: "PENDING",
      }
    });

    revalidatePath("/dashboard");
    return { success: true, id: complaint.id };
  } catch (error: any) {
    console.error("Error in submitCitizenAspiration:", error);
    return { success: false, error: error.message || "Gagal menyimpan aspirasi warga" };
  }
}
