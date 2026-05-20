"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fetch all boundaries for a tenant
export async function getBoundaries(tenantId: string) {
  try {
    const boundaries = await prisma.mapBoundary.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: boundaries };
  } catch (error: any) {
    console.error("Error in getBoundaries:", error);
    return { success: false, error: error.message || "Gagal mengambil data batas wilayah" };
  }
}

// 2. Save or update boundary
export async function saveBoundary(payload: {
  id?: string;
  name: string;
  type: "DESA" | "DUSUN" | "RW" | "RT";
  parentName?: string | null;
  coordinates: any;
  color?: string;
  tenantId: string;
}) {
  try {
    const { id, name, type, parentName, coordinates, color, tenantId } = payload;

    if (!name || !type || !coordinates || !tenantId) {
      throw new Error("Data nama, tipe, koordinat, dan tenantId wajib diisi");
    }

    // Validasi Hierarki dengan Turf.js
    if (parentName && (type === "RT" || type === "RW" || type === "DUSUN")) {
      const parentType = type === "RT" ? "RW" : type === "RW" ? "DUSUN" : "DESA";
      
      const parentBoundary = await prisma.mapBoundary.findFirst({
        where: { tenantId, name: parentName, type: parentType }
      });

      if (!parentBoundary) {
         throw new Error(`Batas Induk (${parentType} ${parentName}) tidak ditemukan. Pastikan Induk sudah digambar.`);
      }

      const turf = require("@turf/turf");

      const rawParentCoords = typeof parentBoundary.coordinates === "string" 
         ? JSON.parse(parentBoundary.coordinates) 
         : parentBoundary.coordinates;
      const rawChildCoords = typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;

      // Konversi [lat, lng] ke [lng, lat] untuk GeoJSON, dan pastikan poligon tertutup
      const turfParentCoords = rawParentCoords.map((c: any) => [c[1], c[0]]);
      if (turfParentCoords[0][0] !== turfParentCoords[turfParentCoords.length - 1][0] || turfParentCoords[0][1] !== turfParentCoords[turfParentCoords.length - 1][1]) {
        turfParentCoords.push(turfParentCoords[0]);
      }

      const turfChildCoords = rawChildCoords.map((c: any) => [c[1], c[0]]);
      if (turfChildCoords[0][0] !== turfChildCoords[turfChildCoords.length - 1][0] || turfChildCoords[0][1] !== turfChildCoords[turfChildCoords.length - 1][1]) {
        turfChildCoords.push(turfChildCoords[0]);
      }

      try {
        const turfParent = turf.polygon([turfParentCoords]);
        const turfChild = turf.polygon([turfChildCoords]);
        
        const childCentroid = turf.centroid(turfChild);
        const childBbox = turf.bbox(turfChild);
        const childBboxPoly = turf.bboxPolygon(childBbox);

        const isCentroidInside = turf.booleanPointInPolygon(childCentroid, turfParent);
        const intersects = turf.booleanIntersects(childBboxPoly, turfParent);

        if (!isCentroidInside || !intersects) {
          throw new Error(`Poligon ${type} ${name} terdeteksi berada di luar batas induknya (${parentType} ${parentName}). Pastikan garis tidak saling berlawanan.`);
        }
      } catch (e: any) {
         throw new Error(e.message || "Gagal memvalidasi batas wilayah spasial.");
      }
    }

    if (id) {
      // Update existing boundary
      const updated = await prisma.mapBoundary.update({
        where: { id },
        data: {
          name,
          type,
          parentName: parentName || null,
          coordinates,
          color: color || "#3b82f6",
        },
      });
      revalidatePath("/master-admin/gis");
      return { success: true, data: updated };
    } else {
      // Create new boundary
      const created = await prisma.mapBoundary.create({
        data: {
          tenantId,
          name,
          type,
          parentName: parentName || null,
          coordinates,
          color: color || "#3b82f6",
        },
      });
      revalidatePath("/master-admin/gis");
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error("Error in saveBoundary:", error);
    return { success: false, error: error.message || "Gagal menyimpan batas wilayah" };
  }
}

// 3. Delete boundary
export async function deleteBoundary(id: string, tenantId: string) {
  try {
    await prisma.mapBoundary.delete({
      where: { id },
    });
    revalidatePath("/master-admin/gis");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteBoundary:", error);
    return { success: false, error: error.message || "Gagal menghapus batas wilayah" };
  }
}

// 4. Calculate real-time population stats for a specific boundary
export async function getBoundaryPopulationStats(payload: {
  type: "DESA" | "DUSUN" | "RW" | "RT";
  name: string;
  parentName?: string | null;
  tenantId: string;
}) {
  try {
    const { type, name, parentName, tenantId } = payload;

    // Build filter query for DataKependudukan
    const filter: any = { tenantId };

    if (type === "DESA") {
      // Entire village population
    } else if (type === "DUSUN") {
      filter.dusun = { equals: name, mode: "insensitive" };
    } else if (type === "RW") {
      filter.rw = { equals: name, mode: "insensitive" };
    } else if (type === "RT") {
      filter.rt = { equals: name, mode: "insensitive" };
      if (parentName) {
        filter.rw = { equals: parentName, mode: "insensitive" };
      }
    }

    // A. Query total population
    const totalCount = await prisma.dataKependudukan.count({
      where: filter,
    });

    // B. Query gender breakdown
    const genderGroups = await prisma.dataKependudukan.groupBy({
      by: ["jenisKelamin"],
      where: filter,
      _count: {
        id: true,
      },
    });

    const genderStats = genderGroups.map((g) => ({
      name: g.jenisKelamin === "LAKI_LAKI" || g.jenisKelamin?.toLowerCase().startsWith("laki") ? "Laki-laki" : "Perempuan",
      value: g._count.id,
    }));

    // C. Query marital status breakdown
    const maritalGroups = await prisma.dataKependudukan.groupBy({
      by: ["statusKawin"],
      where: filter,
      _count: {
        id: true,
      },
    });

    const maritalStats = maritalGroups.map((m) => {
      let displayName = m.statusKawin;
      if (m.statusKawin === "KAWIN") displayName = "Kawin";
      else if (m.statusKawin === "BELUM_KAWIN") displayName = "Belum Kawin";
      else if (m.statusKawin === "CERAI_HIDUP") displayName = "Cerai Hidup";
      else if (m.statusKawin === "CERAI_MATI") displayName = "Cerai Mati";
      
      return {
        name: displayName,
        value: m._count.id,
      };
    });

    // D. Fetch birth dates to compute age distribution
    const residents = await prisma.dataKependudukan.findMany({
      where: filter,
      select: {
        tanggalLahir: true,
        pekerjaan: true,
      },
    });

    // E. Calculate age demographics
    let anakCount = 0; // 0-12
    let remajaCount = 0; // 13-17
    let dewasaCount = 0; // 18-59
    let lansiaCount = 0; // 60+

    const now = new Date();
    residents.forEach((r) => {
      if (!r.tanggalLahir) return;
      const dob = new Date(r.tanggalLahir);
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
      }

      if (age <= 12) anakCount++;
      else if (age <= 17) remajaCount++;
      else if (age <= 59) dewasaCount++;
      else lansiaCount++;
    });

    const ageStats = [
      { name: "Anak-anak (0-12)", value: anakCount },
      { name: "Remaja (13-17)", value: remajaCount },
      { name: "Dewasa (18-59)", value: dewasaCount },
      { name: "Lansia (60+)", value: lansiaCount },
    ];

    // F. Top Employments (Pekerjaan)
    const jobMap: Record<string, number> = {};
    residents.forEach((r) => {
      const job = r.pekerjaan || "Tidak Bekerja";
      jobMap[job] = (jobMap[job] || 0) + 1;
    });

    const jobStats = Object.entries(jobMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Take top 5

    // Generate Standardized Alias ID
    let aliasId = `DS-${tenantId.substring(0,4).toUpperCase()}`;
    if (type === "DUSUN") aliasId = `DS-${name.replace(/\s+/g, '-').toUpperCase()}`;
    else if (type === "RW") aliasId = `RW-${name.replace(/\s+/g, '-').toUpperCase()}`;
    else if (type === "RT" && parentName) aliasId = `RW-${parentName.replace(/\s+/g, '-').toUpperCase()}-RT-${name.replace(/\s+/g, '-').toUpperCase()}`;

    return {
      success: true,
      data: {
        aliasId,
        total: totalCount,
        gender: genderStats,
        marital: maritalStats,
        age: ageStats,
        jobs: jobStats,
      },
    };
  } catch (error: any) {
    console.error("Error in getBoundaryPopulationStats:", error);
    return { success: false, error: error.message || "Gagal memuat statistik penduduk" };
  }
}

// 5. Calculate total population for all boundaries for Choropleth mapping
export async function getAllBoundariesDensity(tenantId: string) {
  try {
    const boundaries = await prisma.mapBoundary.findMany({
      where: { tenantId },
      select: { id: true, name: true, type: true, parentName: true }
    });

    const groups = await prisma.dataKependudukan.groupBy({
      by: ["dusun", "rw", "rt"],
      where: { tenantId },
      _count: { id: true }
    });

    // Map counts to boundaries
    const densityMap: Record<string, number> = {};
    
    boundaries.forEach(b => {
      let count = 0;
      if (b.type === "DESA") {
        count = groups.reduce((acc, g) => acc + g._count.id, 0);
      } else if (b.type === "DUSUN") {
        count = groups.filter(g => g.dusun?.toLowerCase() === b.name.toLowerCase()).reduce((acc, g) => acc + g._count.id, 0);
      } else if (b.type === "RW") {
        count = groups.filter(g => g.rw?.toLowerCase() === b.name.toLowerCase()).reduce((acc, g) => acc + g._count.id, 0);
      } else if (b.type === "RT") {
        count = groups.filter(g => g.rt?.toLowerCase() === b.name.toLowerCase() && (!b.parentName || g.rw?.toLowerCase() === b.parentName.toLowerCase())).reduce((acc, g) => acc + g._count.id, 0);
      }
      densityMap[b.id] = count;
    });

    return { success: true, data: densityMap };
  } catch (error: any) {
    return { success: false, error: "Gagal menghitung kepadatan penduduk" };
  }
}
