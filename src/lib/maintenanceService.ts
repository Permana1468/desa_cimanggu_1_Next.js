import prisma from "@/lib/prisma";
import { 
  ALL_SYSTEM_FEATURES, 
  DEFAULT_MAINTENANCE_SETTINGS, 
  MaintenanceSettings, 
  FeatureDefinition 
} from "./maintenanceConfig";

const CONFIG_ID = "feature_maintenance";

/**
 * Get current system maintenance settings with fallback to default
 */
export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: CONFIG_ID }
    });

    if (!record || !record.settings) {
      return DEFAULT_MAINTENANCE_SETTINGS;
    }

    const saved = record.settings as unknown as Partial<MaintenanceSettings>;
    
    // Merge saved features with defaults so any newly added feature is always recognized
    const mergedFeatures: Record<string, any> = { ...DEFAULT_MAINTENANCE_SETTINGS.features };
    if (saved.features) {
      for (const [key, val] of Object.entries(saved.features)) {
        mergedFeatures[key] = {
          ...mergedFeatures[key],
          ...val
        };
      }
    }

    return {
      isGlobalMaintenance: Boolean(saved.isGlobalMaintenance),
      globalNotice: saved.globalNotice || DEFAULT_MAINTENANCE_SETTINGS.globalNotice,
      features: mergedFeatures,
      updatedAt: saved.updatedAt || record.updatedAt.toISOString(),
      updatedBy: saved.updatedBy || "Admin Master"
    };
  } catch (error) {
    console.error("Error reading maintenance settings:", error);
    return DEFAULT_MAINTENANCE_SETTINGS;
  }
}

/**
 * Check if a specific feature is currently under maintenance.
 * Admin Master ALWAYS bypasses maintenance mode.
 */
export async function checkFeatureMaintenance(
  featureId: string, 
  userRole?: string
): Promise<{ isMaintenance: boolean; notice: string; feature?: FeatureDefinition; isGlobal: boolean }> {
  // Master Admin can always access everything
  if (userRole === "ADMIN_MASTER") {
    return { isMaintenance: false, notice: "", isGlobal: false };
  }

  const settings = await getMaintenanceSettings();
  const featureDef = ALL_SYSTEM_FEATURES.find(f => f.id === featureId);

  // If global maintenance is active
  if (settings.isGlobalMaintenance) {
    return {
      isMaintenance: true,
      notice: settings.globalNotice,
      feature: featureDef,
      isGlobal: true
    };
  }

  // Check specific feature status
  const featureState = settings.features[featureId];
  if (featureState && featureState.enabled === false) {
    return {
      isMaintenance: true,
      notice: featureState.notice || featureDef?.defaultNotice || "Sedang dalam proses pemeliharaan atau maintenance.",
      feature: featureDef,
      isGlobal: false
    };
  }

  return { isMaintenance: false, notice: "", feature: featureDef, isGlobal: false };
}

/**
 * Check if a specific URL pathname matches any feature under maintenance.
 */
export async function checkPathMaintenance(
  pathname: string, 
  userRole?: string
): Promise<{ isMaintenance: boolean; notice: string; feature?: FeatureDefinition; isGlobal: boolean }> {
  // Master admin is always exempt
  if (userRole === "ADMIN_MASTER") {
    return { isMaintenance: false, notice: "", isGlobal: false };
  }

  // Master admin internal pages themselves never undergo maintenance
  if (pathname.startsWith("/master-admin") || pathname === "/login" || pathname.startsWith("/api/auth")) {
    return { isMaintenance: false, notice: "", isGlobal: false };
  }

  const settings = await getMaintenanceSettings();

  // 1. If global maintenance is enabled
  if (settings.isGlobalMaintenance) {
    return {
      isMaintenance: true,
      notice: settings.globalNotice,
      isGlobal: true
    };
  }

  // 2. Find matching feature for this path
  // Find feature with highest path match length
  let matchedFeature: FeatureDefinition | undefined;
  for (const feature of ALL_SYSTEM_FEATURES) {
    for (const p of feature.paths) {
      if (pathname === p || pathname.startsWith(`${p}/`)) {
        if (!matchedFeature || p.length > (matchedFeature.paths[0]?.length || 0)) {
          matchedFeature = feature;
        }
      }
    }
  }

  if (matchedFeature) {
    const featureState = settings.features[matchedFeature.id];
    if (featureState && featureState.enabled === false) {
      return {
        isMaintenance: true,
        notice: featureState.notice || matchedFeature.defaultNotice,
        feature: matchedFeature,
        isGlobal: false
      };
    }
  }

  return { isMaintenance: false, notice: "", isGlobal: false };
}
