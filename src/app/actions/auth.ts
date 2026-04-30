"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function registerWarga(data: {
    nik: string;
    phoneNumber: string;
    password: string;
}) {
    try {
        console.log(`Attempting registration for NIK: ${data.nik}`);

        // 1. Validasi NIK di DataKependudukan
        const wargaData = await prisma.dataKependudukan.findUnique({
            where: { nik: data.nik.trim() },
            include: { tenant: true }
        });

        if (!wargaData) {
            console.log(`Registration failed: NIK ${data.nik} not found in DataKependudukan`);
            return { error: "NIK tidak terdaftar sebagai warga Desa Cimanggu I. Hubungi Admin untuk verifikasi data." };
        }

        // 2. Cek apakah user sudah terdaftar
        const existingUser = await prisma.user.findUnique({
            where: { nik: data.nik.trim() }
        });

        if (existingUser) {
            console.log(`Registration failed: NIK ${data.nik} already registered`);
            return { error: "NIK ini sudah memiliki akun. Silakan gunakan menu 'Masuk'." };
        }

        // 3. Hash Password
        console.log(`Hashing password for NIK: ${data.nik}`);
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 4. Create User
        console.log(`Creating user record for NIK: ${data.nik}`);
        const newUser = await prisma.user.create({
            data: {
                nik: data.nik.trim(),
                fullName: wargaData.namaLengkap,
                phoneNumber: data.phoneNumber.trim(),
                passwordHash: passwordHash,
                role: "WARGA",
                tenantId: wargaData.tenantId,
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

        console.log(`Registration successful for NIK: ${data.nik}`);
        return { success: true, name: wargaData.namaLengkap };
    } catch (error: any) {
        console.error("Critical Registration Error:", error);
        // Return more specific error message to UI
        return { error: `Kesalahan Sistem: ${error.message || "Gagal menghubungkan ke database"}` };
    }
}

export async function setupInstitutionalAccount(data: {
    phoneNumber: string;
    newPassword: string;
}) {
    try {
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
        console.error("Setup Account Error:", error);
        return { error: `Gagal memperbarui akun: ${error.message}` };
    }
}
