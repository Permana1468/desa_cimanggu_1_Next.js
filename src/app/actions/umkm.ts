"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createUmkmStore(userId: string, tenantId: string, storeName: string, description: string) {
    try {
        const store = await prisma.umkmStore.create({
            data: {
                userId,
                tenantId,
                storeName,
                description,
                status: "APPROVED" // Auto approve for smooth workflow
            }
        });
        revalidatePath('/umkm/seller');
        revalidatePath('/master-admin/umkm');
        return { success: true, store };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStoreByUserId(userId: string) {
    return await prisma.umkmStore.findUnique({
        where: { userId }
    });
}

export async function addProduct(storeId: string, data: { name: string, description: string, price: number, stock: number, images: string[] }) {
    try {
        const product = await prisma.umkmProduct.create({
            data: {
                storeId,
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                images: JSON.stringify(data.images),
                status: "LIVE"
            }
        });
        revalidatePath('/umkm');
        revalidatePath('/umkm/seller');
        return { success: true, product };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProduct(productId: string) {
    try {
        await prisma.umkmProduct.delete({
            where: { id: productId }
        });
        revalidatePath('/umkm');
        revalidatePath('/umkm/seller');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveStore(storeId: string) {
    try {
        await prisma.umkmStore.update({
            where: { id: storeId },
            data: { status: "APPROVED" }
        });
        revalidatePath('/master-admin/umkm');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createCheckout(storeId: string, buyerId: string, totalAmount: number, address: string, items: { productId: string, quantity: number, price: number }[]) {
    try {
        const order = await prisma.umkmOrder.create({
            data: {
                storeId,
                buyerId,
                totalAmount,
                address,
                status: "UNPAID",
                items: {
                    create: items
                }
            }
        });
        revalidatePath('/umkm');
        return { success: true, order };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Ensure Authentic Village UMKM Products Exist in DB
export async function ensureUmkmSeedData() {
  try {
    const count = await prisma.umkmProduct.count();
    if (count > 0) return { success: true };

    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: "Desa Cimanggu I", domain: "cimanggu1.desa.id" }
      });
    }

    let sellerUser = await prisma.user.findFirst({
      where: { email: "sensus@cimanggu1.desa.id" }
    });
    if (!sellerUser) {
      sellerUser = await prisma.user.findFirst();
    }
    if (!sellerUser) return { success: false, error: "No user available" };

    let store = await prisma.umkmStore.findFirst({
      where: { userId: sellerUser.id }
    });

    if (!store) {
      store = await prisma.umkmStore.create({
        data: {
          userId: sellerUser.id,
          tenantId: tenant.id,
          storeName: "BUMDes Cimanggu Mandiri",
          description: "Pusat Produk Unggulan & Hasil Bumi Desa Cimanggu I",
          status: "APPROVED"
        }
      });
    } else if (store.status !== "APPROVED") {
      await prisma.umkmStore.update({
        where: { id: store.id },
        data: { status: "APPROVED" }
      });
    }

    const authenticProducts = [
      {
        name: "Keripik Pisang Renyah Khas Cimanggu I (250g)",
        description: "Keripik pisang pilihan hasil olahan UMKM warga Desa Cimanggu I. Renyah, gurih, dan dibuat tanpa bahan pengawet.",
        price: 15000,
        stock: 50,
        sold: 142,
        images: JSON.stringify(["https://images.unsplash.com/photo-1621996346565-e3def6164286?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Beras Organik Pandan Wangi Cimanggu I (5kg)",
        description: "Beras asli panen persawahan Desa Cimanggu I. Bebas pestisida kimia, wangi alami, pulen, dan diproses langsung oleh Kelompok Tani Desa.",
        price: 75000,
        stock: 30,
        sold: 89,
        images: JSON.stringify(["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Kopi Robusta Cimanggu I Origin (200g)",
        description: "Kopi olahan biji kopi pilihan dari perkebunan lokal Desa. Aromanya mantap dengan cita rasa khas kopi Bogor yang tebal dan wangi.",
        price: 35000,
        stock: 40,
        sold: 210,
        images: JSON.stringify(["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Kerajinan Anyaman Bambu Tradisional Desa",
        description: "Tampah dan bakul bambu buatan tangan perajin Desa Cimanggu I. Halus, awet, dan ramah lingkungan.",
        price: 45000,
        stock: 20,
        sold: 56,
        images: JSON.stringify(["https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Madu Hutan Murni Asli Cimanggu I (350ml)",
        description: "Madu murni alami hasil ternak lebah warga desa. Kaya nutrisi dan khasiat untuk menjaga imunitas tubuh keluarga.",
        price: 85000,
        stock: 25,
        sold: 178,
        images: JSON.stringify(["https://images.unsplash.com/photo-1587049352847-4a222e784d38?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Batik Tulis Motif Khas Cimanggu I",
        description: "Kain batik buatan tangan dengan motif khas alam Desa Cimanggu I. Bahan katun halus prima, nyaman dan elegan.",
        price: 150000,
        stock: 15,
        sold: 34,
        images: JSON.stringify(["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Sambal Terasi & Roa Dapur Ibu Desa (150g)",
        description: "Sambal botol rumahan resep keluarga khas desa. Gurih, pedas pas, diproses higienis dan tahan lama tanpa pengawet buatan.",
        price: 25000,
        stock: 60,
        sold: 312,
        images: JSON.stringify(["https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"]),
        status: "LIVE"
      },
      {
        name: "Minyak Kelapa Murni (VCO) Herbal (250ml)",
        description: "Virgin Coconut Oil hasil olahan tradisi kelapa segar desa. Sangat baik untuk kesehatan kulit, rambut, dan konsumsi harian.",
        price: 50000,
        stock: 35,
        sold: 95,
        images: JSON.stringify(["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600"]),
        status: "LIVE"
      }
    ];

    for (const prod of authenticProducts) {
      await prisma.umkmProduct.create({
        data: {
          storeId: store.id,
          ...prod
        }
      });
    }

    revalidatePath('/umkm');
    return { success: true };
  } catch (error: any) {
    console.error("Error seeding UMKM data:", error);
    return { success: false, error: error.message };
  }
}
