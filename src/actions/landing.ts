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
