"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getBeritaList() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
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
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as { tenantId: string }).tenantId;

    if (data.id) {
        const { id, ...updateData } = data;
        return await prisma.berita.update({
            where: { id },
            data: { ...updateData, tenantId }
        });
    }

    return await prisma.berita.create({
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

export async function deleteBerita(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.berita.delete({
        where: { id }
    });
}
import mammoth from "mammoth";

export async function smartImportProfile(base64File: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

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
