"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { 
  DEFAULT_MAINTENANCE_SETTINGS, 
  MaintenanceSettings, 
  ALL_SYSTEM_FEATURES 
} from "@/lib/maintenanceConfig";
import { getMaintenanceSettings } from "@/lib/maintenanceService";

const CONFIG_ID = "feature_maintenance";

/**
 * Security check for Master Admin
 */
async function requireMasterAdmin() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { user: { id: "build", role: "ADMIN_MASTER", name: "System Build" } } as any;
  }
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Akses Ditolak: Hanya Admin Master yang dapat mengelola status pemeliharaan.");
  }
  return session;
}

/**
 * Fetch current maintenance state (for client components)
 */
export async function getMaintenanceStateAction(): Promise<MaintenanceSettings> {
  await requireMasterAdmin();
  return await getMaintenanceSettings();
}

/**
 * Public action to check maintenance status for a feature from client components
 */
export async function checkFeatureMaintenanceAction(featureId: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const { checkFeatureMaintenance } = await import("@/lib/maintenanceService");
  return await checkFeatureMaintenance(featureId, role);
}

/**
 * Toggle a single feature ON/OFF
 */
export async function toggleFeatureAction(
  featureId: string, 
  enabled: boolean, 
  customNotice?: string
) {
  const session = await requireMasterAdmin();
  const current = await getMaintenanceSettings();

  const featureDef = ALL_SYSTEM_FEATURES.find(f => f.id === featureId);
  const currentFeature = current.features[featureId] || {
    enabled: true,
    notice: featureDef?.defaultNotice || "Sedang dalam proses pemeliharaan atau maintenance."
  };

  const updatedFeatures = {
    ...current.features,
    [featureId]: {
      ...currentFeature,
      enabled,
      notice: customNotice !== undefined ? customNotice : currentFeature.notice,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.name || "Admin Master"
    }
  };

  const newSettings: MaintenanceSettings = {
    ...current,
    features: updatedFeatures,
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.name || "Admin Master"
  };

  await prisma.systemSetting.upsert({
    where: { id: CONFIG_ID },
    update: {
      settings: newSettings as any,
      updatedAt: new Date()
    },
    create: {
      id: CONFIG_ID,
      settings: newSettings as any,
      updatedAt: new Date()
    }
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      action: enabled ? "MAINTENANCE_FEATURE_ONLINE" : "MAINTENANCE_FEATURE_OFFLINE",
      entity: "FeatureMaintenance",
      entityId: featureId,
      details: {
        featureId,
        featureName: featureDef?.name || featureId,
        enabled,
        notice: customNotice || currentFeature.notice
      },
      userId: session.user.id,
      tenantId: (session.user as any).tenantId || null,
      category: "SYSTEM"
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/master-admin/maintenance");
  return { success: true, settings: newSettings };
}

/**
 * Toggle Global Maintenance Killswitch
 */
export async function toggleGlobalMaintenanceAction(
  isGlobalMaintenance: boolean, 
  globalNotice?: string
) {
  const session = await requireMasterAdmin();
  const current = await getMaintenanceSettings();

  const newSettings: MaintenanceSettings = {
    ...current,
    isGlobalMaintenance,
    globalNotice: globalNotice || current.globalNotice,
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.name || "Admin Master"
  };

  await prisma.systemSetting.upsert({
    where: { id: CONFIG_ID },
    update: {
      settings: newSettings as any,
      updatedAt: new Date()
    },
    create: {
      id: CONFIG_ID,
      settings: newSettings as any,
      updatedAt: new Date()
    }
  });

  await prisma.auditLog.create({
    data: {
      action: isGlobalMaintenance ? "GLOBAL_MAINTENANCE_ENABLED" : "GLOBAL_MAINTENANCE_DISABLED",
      entity: "FeatureMaintenance",
      entityId: "global",
      details: { isGlobalMaintenance, notice: globalNotice || current.globalNotice },
      userId: session.user.id,
      tenantId: (session.user as any).tenantId || null,
      category: "SYSTEM"
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/master-admin/maintenance");
  return { success: true, settings: newSettings };
}

/**
 * Bulk Toggle Features (e.g., Turn all ON or turn all OFF)
 */
export async function bulkToggleFeaturesAction(
  featureIds: string[], 
  enabled: boolean
) {
  const session = await requireMasterAdmin();
  const current = await getMaintenanceSettings();

  const updatedFeatures = { ...current.features };
  for (const id of featureIds) {
    if (updatedFeatures[id]) {
      updatedFeatures[id] = {
        ...updatedFeatures[id],
        enabled,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.name || "Admin Master"
      };
    }
  }

  const newSettings: MaintenanceSettings = {
    ...current,
    features: updatedFeatures,
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.name || "Admin Master"
  };

  await prisma.systemSetting.upsert({
    where: { id: CONFIG_ID },
    update: {
      settings: newSettings as any,
      updatedAt: new Date()
    },
    create: {
      id: CONFIG_ID,
      settings: newSettings as any,
      updatedAt: new Date()
    }
  });

  await prisma.auditLog.create({
    data: {
      action: enabled ? "BULK_FEATURES_ONLINE" : "BULK_FEATURES_OFFLINE",
      entity: "FeatureMaintenance",
      entityId: "bulk",
      details: { count: featureIds.length, enabled },
      userId: session.user.id,
      tenantId: (session.user as any).tenantId || null,
      category: "SYSTEM"
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/master-admin/maintenance");
  return { success: true, settings: newSettings };
}

/**
 * Update custom notice message for a feature
 */
export async function updateFeatureNoticeAction(featureId: string, notice: string) {
  const session = await requireMasterAdmin();
  const current = await getMaintenanceSettings();

  if (!current.features[featureId]) {
    throw new Error("Fitur tidak ditemukan.");
  }

  const updatedFeatures = {
    ...current.features,
    [featureId]: {
      ...current.features[featureId],
      notice,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.name || "Admin Master"
    }
  };

  const newSettings: MaintenanceSettings = {
    ...current,
    features: updatedFeatures,
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.name || "Admin Master"
  };

  await prisma.systemSetting.upsert({
    where: { id: CONFIG_ID },
    update: {
      settings: newSettings as any,
      updatedAt: new Date()
    },
    create: {
      id: CONFIG_ID,
      settings: newSettings as any,
      updatedAt: new Date()
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/master-admin/maintenance");
  return { success: true, settings: newSettings };
}
