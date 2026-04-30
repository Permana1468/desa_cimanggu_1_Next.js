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
        // 1. Validasi NIK di DataKependudukan
        const wargaData = await prisma.dataKependudukan.findUnique({
            where: { nik: data.nik },
            include: { tenant: true }
        });

        if (!wargaData) {
            return { error: "NIK tidak terdaftar sebagai warga Desa Cimanggu I." };
        }

        // 2. Cek apakah user sudah terdaftar
        const existingUser = await prisma.user.findUnique({
            where: { nik: data.nik }
        });

        if (existingUser) {
            return { error: "NIK ini sudah memiliki akun. Silakan login." };
        }

        // 3. Hash Password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 4. Create User
        const newUser = await prisma.user.create({
            data: {
                nik: data.nik,
                fullName: wargaData.namaLengkap,
                phoneNumber: data.phoneNumber,
                passwordHash: passwordHash,
                role: "WARGA",
                tenantId: wargaData.tenantId,
                isActive: true,
                isFirstLogin: false // Warga set password sendiri, jadi bukan first login flow pengurus
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
    } catch (error) {
        console.error("Registration Error:", error);
        return { error: "Terjadi kesalahan sistem saat registrasi." };
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
    } catch (error) {
        console.error("Setup Account Error:", error);
        return { error: "Gagal memperbarui akun." };
    }
}
