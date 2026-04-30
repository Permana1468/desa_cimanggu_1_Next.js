"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getBeritaList() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const tenantId = (session.user as { tenantId: string }).tenantId;

    return await prisma.berita.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    });
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
