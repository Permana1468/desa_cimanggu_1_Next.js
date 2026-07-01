"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

async function getAdminSession() {
  const session = await getSession();
  const adminRoles = ["ADMIN_DESA", "KADES", "SEKDES", "OPERATOR_DESA", "ADMIN_MASTER"];
  if (!adminRoles.includes(session.user.role)) {
    throw new Error("Unauthorized: Akses Admin Diperlukan");
  }
  return session;
}

const DEFAULT_TENANT_ID = "cimanggu1";
let cachedTenantId: string | null = null;

async function resolveTenantId() {
  if (cachedTenantId) return cachedTenantId;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: "cimanggu1.desa.id" }
    });
    if (tenant) {
      cachedTenantId = tenant.id;
      return tenant.id;
    }
  } catch (error) {
    console.error("Failed to resolve tenant ID:", error);
  }
  return DEFAULT_TENANT_ID;
}

export async function getVillageStats() {
  try {
    const tenantId = await resolveTenantId();
    const totalWarga = await prisma.dataKependudukan.count({
      where: { tenantId },
    });
    const totalLaki = await prisma.dataKependudukan.count({
      where: { 
        tenantId, 
        OR: [
          { jenisKelamin: "Laki-laki" },
          { jenisKelamin: "L" }
        ]
      },
    });
    const totalPerempuan = await prisma.dataKependudukan.count({
      where: { 
        tenantId,
        OR: [
          { jenisKelamin: "Perempuan" },
          { jenisKelamin: "P" }
        ]
      },
    });
    
    const resultKK = await prisma.dataKependudukan.groupBy({
      by: ['noKK'],
      where: { tenantId },
    });

    return {
      totalWarga,
      totalLaki,
      totalPerempuan,
      totalKK: resultKK.length,
    };
  } catch (error) {
    // Silently handle error
    return {
      totalWarga: 0,
      totalLaki: 0,
      totalPerempuan: 0,
      totalKK: 0,
    };
  }
}

export async function getLatestNews() {
  try {
    const tenantId = await resolveTenantId();
    return await prisma.berita.findMany({
      where: { 
        tenantId,
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (error) {
    // Silently handle error
    return [];
  }
}

export async function getOrganizationalStructure() {
  try {
    const tenantId = await resolveTenantId();
    return await prisma.aparaturDesa.findMany({
      where: { 
        tenantId,
        isActive: true,
      },
      orderBy: [
        { level: "asc" },
        { order: "asc" },
      ],
    });
  } catch (error) {
    // Silently handle error
    return [];
  }
}

export async function getVillageProfile() {
  try {
    const tenantId = await resolveTenantId();
    return await prisma.villageProfile.findUnique({
      where: { tenantId },
    });
  } catch (error) {
    // Silently handle error
    return null;
  }
}

export async function getLembagaList() {
  try {
    const tenantId = await resolveTenantId();
    return await prisma.lembaga.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    // Silently handle error
    return [];
  }
}

export async function updateVillageProfile(data: any) {
  try {
    const session = await getAdminSession();
    const tenantId = (session.user as any).tenantId || DEFAULT_TENANT_ID;

    const result = await prisma.villageProfile.upsert({
      where: { tenantId },
      update: {
        title: data.title,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        about_title: data.about_title,
        about_text: data.about_text,
        about_image: data.about_image,
        logo: data.logo,
        gallery: data.gallery,
      },
      create: {
        tenantId,
        title: data.title,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        about_title: data.about_title,
        about_text: data.about_text,
        about_image: data.about_image,
        logo: data.logo,
        gallery: data.gallery,
      }
    });

    revalidatePath("/");
    revalidatePath("/dashboard/settings/landing");
    return result;
  } catch (error) {
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

    revalidatePath("/");
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

    revalidatePath("/");
    revalidatePath("/dashboard/settings/landing");
    return result;
  } catch (error) {
    throw error;
  }
}
