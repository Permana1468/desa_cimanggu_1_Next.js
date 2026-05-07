"use server";

import prisma from "@/lib/prisma";

const TENANT_ID = "cimanggu1"; // Default tenant for this project

export async function getVillageStats() {
  try {
    const totalWarga = await prisma.dataKependudukan.count({
      where: { tenantId: TENANT_ID },
    });
    const totalLaki = await prisma.dataKependudukan.count({
      where: { 
        tenantId: TENANT_ID, 
        OR: [
          { jenisKelamin: "Laki-laki" },
          { jenisKelamin: "L" }
        ]
      },
    });
    const totalPerempuan = await prisma.dataKependudukan.count({
      where: { 
        tenantId: TENANT_ID,
        OR: [
          { jenisKelamin: "Perempuan" },
          { jenisKelamin: "P" }
        ]
      },
    });
    
    // Using a more efficient way to count unique KK if supported or groupBy
    const resultKK = await prisma.dataKependudukan.groupBy({
      by: ['noKK'],
      where: { tenantId: TENANT_ID },
    });

    return {
      totalWarga,
      totalLaki,
      totalPerempuan,
      totalKK: resultKK.length,
    };
  } catch (error) {
    console.error("Error fetching village stats:", error);
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
    return await prisma.berita.findMany({
      where: { 
        tenantId: TENANT_ID,
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (error) {
    console.error("Error fetching latest news:", error);
    return [];
  }
}

export async function getOrganizationalStructure() {
  try {
    // Fetch all active aparatur and we can build the tree on the client or server
    // For now, return flat list ordered by level and order
    return await prisma.aparaturDesa.findMany({
      where: { 
        tenantId: TENANT_ID,
        isActive: true,
      },
      orderBy: [
        { level: "asc" },
        { order: "asc" },
      ],
    });
  } catch (error) {
    console.error("Error fetching organizational structure:", error);
    return [];
  }
}

export async function getVillageProfile() {
  try {
    return await prisma.villageProfile.findUnique({
      where: { tenantId: TENANT_ID },
    });
  } catch (error) {
    console.error("Error fetching village profile:", error);
    return null;
  }
}

export async function getLembagaList() {
  try {
    return await prisma.lembaga.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching lembaga list:", error);
    return [];
  }
}

export async function updateVillageProfile(data: any) {
  try {
    return await prisma.villageProfile.upsert({
      where: { tenantId: TENANT_ID },
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
        tenantId: TENANT_ID,
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
  } catch (error) {
    console.error("Error updating village profile:", error);
    throw error;
  }
}

export async function updateAparatur(id: string, data: any) {
  try {
    return await prisma.aparaturDesa.upsert({
      where: { id: id || "new-temp-id" },
      update: {
        name: data.name,
        position: data.position,
        level: data.level,
        photo: data.photo,
        isActive: data.isActive,
      },
      create: {
        tenantId: TENANT_ID,
        name: data.name,
        position: data.position,
        level: data.level,
        photo: data.photo,
        isActive: true,
      }
    });
  } catch (error) {
    console.error("Error updating aparatur:", error);
    throw error;
  }
}

export async function createBerita(data: any) {
  try {
    return await prisma.berita.create({
      data: {
        tenantId: TENANT_ID,
        judul: data.judul,
        slug: data.judul.toLowerCase().replace(/ /g, '-'),
        konten: data.konten,
        gambar: data.gambar,
        kategori: data.kategori || "Umum",
        isPublished: true,
      }
    });
  } catch (error) {
    console.error("Error creating berita:", error);
    throw error;
  }
}


