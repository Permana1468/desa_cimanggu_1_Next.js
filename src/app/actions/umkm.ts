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
                status: "PENDING"
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
