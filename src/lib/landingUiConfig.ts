import prisma from "@/lib/prisma";
import { DEFAULT_LANDING_UI_CONFIG, DEFAULT_PARTNER_LOGOS, LandingUiConfig } from "@/lib/landingUiTypes";

export { DEFAULT_LANDING_UI_CONFIG, DEFAULT_PARTNER_LOGOS };
export type { LandingUiConfig };

const LANDING_UI_CONFIG_ID = "landing_ui_config";
const CACHE_TTL_MS = 60 * 1000;

let cachedUiConfig: LandingUiConfig | null = null;
let cacheTimestamp = 0;

export function invalidateLandingUiCache() {
  cachedUiConfig = null;
  cacheTimestamp = 0;
}

export async function getLandingUiConfig(): Promise<LandingUiConfig> {
  const now = Date.now();
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: LANDING_UI_CONFIG_ID },
    });

    if (!record || !record.settings) {
      cachedUiConfig = DEFAULT_LANDING_UI_CONFIG;
      cacheTimestamp = now;
      return DEFAULT_LANDING_UI_CONFIG;
    }

    const saved = record.settings as Partial<LandingUiConfig>;
    const merged: LandingUiConfig = {
      aboutSectionHeading: saved.aboutSectionHeading || DEFAULT_LANDING_UI_CONFIG.aboutSectionHeading,
      officeCardTitle: saved.officeCardTitle || DEFAULT_LANDING_UI_CONFIG.officeCardTitle,
      officeCardSubtitle: saved.officeCardSubtitle || DEFAULT_LANDING_UI_CONFIG.officeCardSubtitle,
      heroCtaText: saved.heroCtaText || DEFAULT_LANDING_UI_CONFIG.heroCtaText,
      footerCopyright: saved.footerCopyright || DEFAULT_LANDING_UI_CONFIG.footerCopyright,
      footerDescription: saved.footerDescription || DEFAULT_LANDING_UI_CONFIG.footerDescription,
      defaultThemeMode:
        saved.defaultThemeMode === "night" ||
        saved.defaultThemeMode === "dual" ||
        saved.defaultThemeMode === "auto"
          ? saved.defaultThemeMode
          : "day",
      partnerLogos:
        Array.isArray(saved.partnerLogos) && saved.partnerLogos.length > 0
          ? saved.partnerLogos
          : DEFAULT_PARTNER_LOGOS,
      weatherLat: saved.weatherLat || DEFAULT_LANDING_UI_CONFIG.weatherLat,
      weatherLng: saved.weatherLng || DEFAULT_LANDING_UI_CONFIG.weatherLng,
      urgentAnnouncementEnabled: Boolean(saved.urgentAnnouncementEnabled),
      urgentAnnouncementText: saved.urgentAnnouncementText || "",
      urgentAnnouncementLink: saved.urgentAnnouncementLink || DEFAULT_LANDING_UI_CONFIG.urgentAnnouncementLink,
      socialLinks: {
        instagram: saved.socialLinks?.instagram || "",
        youtube: saved.socialLinks?.youtube || "",
        tiktok: saved.socialLinks?.tiktok || "",
        whatsapp: saved.socialLinks?.whatsapp || "",
      },
    };

    cachedUiConfig = merged;
    cacheTimestamp = now;
    return merged;
  } catch (error) {
    console.warn("Failed to fetch landing_ui_config, using defaults:", error);
    return cachedUiConfig || DEFAULT_LANDING_UI_CONFIG;
  }
}

