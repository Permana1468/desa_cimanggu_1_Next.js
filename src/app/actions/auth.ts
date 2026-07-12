"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUmkmUser(nik: string, phone: string, fullName: string, passwordPlain: string) {
    try {
        const passwordHash = await bcrypt.hash(passwordPlain, 10);
        const tenant = await prisma.tenant.findFirst();
        if (!tenant) throw new Error("Tenant not found");

        const user = await prisma.user.create({
            data: {
                nik: nik, 
                phoneNumber: phone,
                fullName,
                passwordHash,
                tenantId: tenant.id,
                role: "WARGA",
                isActive: false // Requires Admin Master verification
            }
        });
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
