"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
    nik: z.string().length(16, "NIK harus 16 digit"),
    phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
    password: z.string().min(6, "Password minimal 6 karakter")
});

export async function registerWarga(rawData: any) {
    try {
        const data = registerSchema.parse(rawData);

        // 1. Validasi NIK di DataKependudukan
        const wargaData = await prisma.dataKependudukan.findUnique({
            where: { nik: data.nik.trim() },
            include: { tenant: true }
        });

        if (!wargaData || wargaData.tenant?.name !== "Desa Cimanggu I") {
            return { error: "NIK tidak terdaftar sebagai warga Desa Cimanggu I. Hubungi Admin untuk verifikasi data." };
        }

        // 2. Cek apakah user sudah terdaftar
        const existingUser = await prisma.user.findUnique({
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
                fullName: wargaData.namaLengkap,
                phoneNumber: data.phoneNumber.trim(),
                passwordHash: passwordHash,
                role: "WARGA",
                tenantId: wargaData.tenantId,
                residentId: wargaData.id, // Automatic Linkage to DataKependudukan
                isActive: true,
                isFirstLogin: false
            }
        });

        // 5. Audit Log
        await prisma.auditLog.create({
            data: {
                action: "REGISTER_WARGA",
                entity: "User",
                entityId: newUser.id,
                details: { nik: data.nik, name: wargaData.namaLengkap },
                tenantId: wargaData.tenantId,
                userId: newUser.id
            }
        });

        return { success: true, name: wargaData.namaLengkap };
    } catch (error: any) {
        // Return more specific error message to UI
        return { error: `Kesalahan Sistem: ${error.message || "Gagal menghubungkan ke database"}` };
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
