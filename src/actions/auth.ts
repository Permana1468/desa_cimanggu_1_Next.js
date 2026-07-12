"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
    nik: z.string().length(16, "NIK harus 16 digit"),
    phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter")
});

export async function registerWarga(rawData: any) {
    try {
        const data = registerSchema.parse(rawData);

        // 1. Validasi NIK di DataKependudukan
        const wargaData = await prisma.dataKependudukan.findFirst({
            where: { nik: data.nik.trim() }
        });

        if (!wargaData) {
            return { error: "NIK tidak terdaftar sebagai warga. Hanya warga terdata yang dapat mendaftar. Hubungi Admin Desa." };
        }

        const tenantId = wargaData.tenantId;

        // 2. Cek apakah user sudah terdaftar
        const existingUser = await prisma.user.findFirst({
            where: { nik: data.nik.trim() }
        });

        if (existingUser) {
            return { error: "NIK ini sudah memiliki akun. Silakan gunakan menu 'Masuk'." };
        }

        // 3. Hash Password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 4. Create User
        const newUser = await prisma.user.create({
            data: {
                nik: data.nik.trim(),
                fullName: data.fullName.trim(),
                phoneNumber: data.phoneNumber.trim(),
                passwordHash: passwordHash,
                role: "WARGA",
                tenantId: tenantId,
                residentId: wargaData.id, // Automatic Linkage to DataKependudukan
                isActive: false, // Must be verified by Admin
                isFirstLogin: false
            }
        });

        // 5. Audit Log
        await prisma.auditLog.create({
            data: {
                action: "REGISTER_WARGA",
                entity: "User",
                entityId: newUser.id,
                details: { nik: data.nik, name: data.fullName },
                tenantId: tenantId!,
                userId: newUser.id
            }
        });

        return { success: true, name: data.fullName };
    } catch (error: any) {
        // Return more specific error message to UI
        return { error: error?.errors ? error.errors[0].message : `Kesalahan Sistem: ${error.message || "Gagal menghubungkan ke database"}` };
    }
}

const setupSchema = z.object({
    phoneNumber: z.string().min(10),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter untuk akun institusi")
});

export async function setupInstitutionalAccount(rawData: any) {
    try {
        const data = setupSchema.parse(rawData);
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");

        const userId = (session.user as any).id;
        const passwordHash = await bcrypt.hash(data.newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                phoneNumber: data.phoneNumber,
                passwordHash: passwordHash,
                whatsappVerified: true,
                isFirstLogin: false
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "SETUP_INSTITUTIONAL_ACCOUNT",
                entity: "User",
                entityId: userId,
                details: { phoneNumber: data.phoneNumber },
                tenantId: (session.user as any).tenantId,
                userId: userId
            }
        });

        return { success: true };
    } catch (error: any) {
        return { error: `Gagal memperbarui akun: ${error.message}` };
    }
}
