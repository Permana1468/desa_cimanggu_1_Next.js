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

export async function getBeritaList() {
    try {
        const session = await getSession();
        const tenantId = (session.user as { tenantId: string }).tenantId;

        return await prisma.berita.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Berita List Error:", error);
        return [];
    }
}

export async function upsertBerita(data: {
    id?: string;
    judul: string;
    slug: string;
    konten: string;
    gambar?: string;
    kategori?: string;
    isPublished?: boolean;
}) {
    try {
        const session = await getAdminSession();
        const tenantId = (session.user as { tenantId: string }).tenantId;

        let result;
        if (data.id) {
            const { id, ...updateData } = data;
            result = await prisma.berita.update({
                where: { id },
                data: { ...updateData, tenantId }
            });
        } else {
            result = await prisma.berita.create({
                data: {
                    judul: data.judul,
                    slug: data.slug,
                    konten: data.konten,
                    gambar: data.gambar,
                    kategori: data.kategori,
                    isPublished: data.isPublished,
                    tenantId: tenantId
                }
            });
        }

        revalidatePath("/");
        revalidatePath("/dashboard/settings/landing");
        return result;
    } catch (error) {
        console.error("Upsert Berita Error:", error);
        throw error;
    }
}

export async function deleteBerita(id: string) {
    try {
        await getAdminSession();

        const result = await prisma.berita.delete({
            where: { id }
        });

        revalidatePath("/");
        revalidatePath("/dashboard/settings/landing");
        return result;
    } catch (error) {
        console.error("Delete Berita Error:", error);
        throw error;
    }
}

import mammoth from "mammoth";

export async function smartImportProfile(base64File: string) {
    try {
        await getAdminSession();

        const buffer = Buffer.from(base64File, "base64");
        
        // Convert .docx to HTML
        const result = await mammoth.convertToHtml({ buffer });
        const html = result.value; // The generated HTML
        const messages = result.messages; // Any warnings

        return { 
            success: true, 
            html, 
            warnings: messages.map(m => m.message)
        };
    } catch (error: any) {
        console.error("Smart Import Error:", error);
        return { success: false, error: error.message || "Gagal mengimpor file." };
    }
}
