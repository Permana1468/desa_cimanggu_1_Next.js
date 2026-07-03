"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUserSettings() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        include: { resident: true }
    });

    return user;
}

export async function updateProfile(data: { phoneNumber: string, photo: string | null }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const updatedUser = await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                phoneNumber: data.phoneNumber,
                photo: data.photo
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, user: updatedUser };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function linkResidentData(nik: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const tenantId = (session.user as any).tenantId;

        // Cari data kependudukan berdasarkan NIK dan tenantId
        const resident = await prisma.dataKependudukan.findFirst({
            where: { nik, tenantId }
        });

        if (!resident) {
            return { success: false, error: "NIK tidak ditemukan dalam Data Kependudukan." };
        }

        // Cek apakah data ini sudah dipakai oleh user lain
        const existingLink = await prisma.user.findUnique({
            where: { residentId: resident.id }
        });

        if (existingLink && existingLink.id !== (session.user as any).id) {
            return { success: false, error: "NIK ini sudah ditautkan ke akun lain." };
        }

        // Update user: tautkan residentId dan update fullName sesuai data kependudukan
        const updatedUser = await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                residentId: resident.id,
                fullName: resident.namaLengkap,
                nik: resident.nik
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, user: updatedUser, resident };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function changePassword(oldPassword: string, newPassword: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            return { success: false, error: "Password lama tidak sesuai." };
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashed }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
