"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHargaSatuans(tenantId: string) {
  try {
    const data = await prisma.hargaSatuan.findMany({
      where: { tenantId },
      orderBy: [
        { noUrut: "asc" },
        { kategori: "asc" },
        { createdAt: "asc" },
      ],
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching harga satuan:", error);
    return { success: false, error: error.message };
  }
}

export async function createHargaSatuan(data: {
  tenantId: string;
  kategori: string;
  uraian: string;
  satuan: string;
  harga: number;
  keterangan?: string;
  noUrut?: number;
}) {
  try {
    const newItem = await prisma.hargaSatuan.create({
      data: {
        tenantId: data.tenantId,
        kategori: data.kategori,
        uraian: data.uraian,
        satuan: data.satuan,
        harga: data.harga,
        keterangan: data.keterangan || "",
        noUrut: data.noUrut || 0,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("Error creating harga satuan:", error);
    return { success: false, error: error.message };
  }
}

export async function updateHargaSatuan(id: string, data: {
  kategori?: string;
  uraian?: string;
  satuan?: string;
  harga?: number;
  keterangan?: string;
  noUrut?: number;
}) {
  try {
    const updated = await prisma.hargaSatuan.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating harga satuan:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteHargaSatuan(id: string) {
  try {
    await prisma.hargaSatuan.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting harga satuan:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAllHargaSatuans(tenantId: string) {
  try {
    await prisma.hargaSatuan.deleteMany({
      where: { tenantId },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting all harga satuan:", error);
    return { success: false, error: error.message };
  }
}

export async function seedHargaSatuanFromPdf(tenantId: string) {
  try {
    const { SSH_CIMANGGU_2026_DATA } = await import("@/data/sshCimangguPdfData");
    
    // Clear existing data for tenant
    await prisma.hargaSatuan.deleteMany({
      where: { tenantId },
    });

    // Insert PDF items in bulk
    const dataToCreate = SSH_CIMANGGU_2026_DATA.map((item, idx) => ({
      tenantId,
      kategori: item.kategori,
      uraian: item.uraian,
      satuan: item.satuan,
      harga: item.harga,
      keterangan: item.keterangan || "",
      noUrut: item.noUrut || (idx + 1),
    }));

    await prisma.hargaSatuan.createMany({
      data: dataToCreate,
    });

    revalidatePath("/dashboard");
    return { success: true, count: dataToCreate.length };
  } catch (error: any) {
    console.error("Error seeding harga satuan from PDF:", error);
    return { success: false, error: error.message };
  }
}

export async function importHargaSatuanSmart(tenantId: string) {
  try {
    const { SSH_CIMANGGU_2026_DATA } = await import("@/data/sshCimangguPdfData");
    
    // 1. Ambil data yang sudah ada di database untuk tenant ini
    const existingItems = await prisma.hargaSatuan.findMany({
      where: { tenantId },
      select: { uraian: true, keterangan: true },
    });

    // 2. Buat Set dari uraian + spesifikasi (keterangan) yang sudah ada (normalized lowercase)
    const existingSet = new Set<string>();
    existingItems.forEach((item) => {
      const u = item.uraian.trim().toLowerCase();
      const k = (item.keterangan || "").trim().toLowerCase();
      existingSet.add(`${u}|||${k}`);
    });

    // 3. Filter item kandidat yang belum ada di DB dan hilangkan duplikat internal batch
    const itemsToInsert: Array<{
      tenantId: string;
      kategori: string;
      uraian: string;
      satuan: string;
      harga: number;
      keterangan: string;
      noUrut: number;
    }> = [];

    const seenInBatch = new Set<string>();
    let skippedCount = 0;

    const highestItem = await prisma.hargaSatuan.findFirst({
      where: { tenantId },
      orderBy: { noUrut: "desc" },
      select: { noUrut: true },
    });
    let nextNoUrut = (highestItem?.noUrut || 0) + 1;

    for (const item of SSH_CIMANGGU_2026_DATA) {
      const u = item.uraian.trim().toLowerCase();
      const k = (item.keterangan || "").trim().toLowerCase();
      const compositeKey = `${u}|||${k}`;

      if (existingSet.has(compositeKey) || seenInBatch.has(compositeKey)) {
        skippedCount++;
      } else {
        seenInBatch.add(compositeKey);
        itemsToInsert.push({
          tenantId,
          kategori: item.kategori,
          uraian: item.uraian,
          satuan: item.satuan,
          harga: item.harga,
          keterangan: item.keterangan || "",
          noUrut: item.noUrut || nextNoUrut++,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      await prisma.hargaSatuan.createMany({
        data: itemsToInsert,
      });
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      addedCount: itemsToInsert.length,
      skippedCount,
      totalCandidates: SSH_CIMANGGU_2026_DATA.length,
    };
  } catch (error: any) {
    console.error("Error in smart import harga satuan:", error);
    return { success: false, error: error.message };
  }
}


