"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getResidentSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "WARGA") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getResidentProfile() {
    const session = await getResidentSession();
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            resident: true
        }
    });
    return user?.resident || null;
}

export async function getResidentSuratHistory() {
    const session = await getResidentSession();
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user?.residentId) {
        return [];
    }

    return await prisma.surat.findMany({
        where: {
            wargaId: user.residentId,
            tenantId: user.tenantId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function createSuratRequest(data: { jenisSurat: string, keperluan: string }) {
    const session = await getResidentSession();
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user?.residentId) {
        throw new Error("Akun belum ditautkan dengan data kependudukan. Hubungi admin.");
    }

    const surat = await prisma.surat.create({
        data: {
            jenisSurat: data.jenisSurat,
            keperluan: data.keperluan,
            status: "TERTUNDA",
            wargaId: user.residentId,
            adminId: user.id, // Using their own user ID since they requested it themselves
            tenantId: user.tenantId
        }
    });

    revalidatePath("/resident");
    revalidatePath("/resident/surat");
    
    return { success: true, id: surat.id };
}

export async function updateResidentProfile(data: any) {
    const session = await getResidentSession();
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user?.residentId) {
        throw new Error("Akun belum ditautkan dengan data kependudukan.");
    }

    // Warga can only update limited fields like phone, education, occupation. 
    // Usually they shouldn't edit NIK, Name directly without verification.
    const updateData = {
        pendidikan: data.pendidikan,
        pekerjaan: data.pekerjaan,
        golonganDarah: data.golonganDarah,
        updatedAt: new Date()
    };

    const updated = await prisma.dataKependudukan.update({
        where: { id: user.residentId },
        data: updateData
    });

    revalidatePath("/resident/profile");
    return { success: true, data: updated };
}
