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
