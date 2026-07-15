"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildWilayahFilterScope } from "./rt";

export async function getKadusDashboardSummary() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    
    const role = session.user.role as string;
    const tenantId = (session.user as any).tenantId;
    const userRw = (session.user as any).rw; // Dusun Name
    
    if (role !== "KADUS") {
        throw new Error("Access Denied");
    }

    const { filterScope, allowedRws } = await buildWilayahFilterScope(role, "", userRw, tenantId);
    const validRws = allowedRws.length > 0 ? allowedRws : ["_NONE_"];

    const [
        totalKeluarga,
        wargaList,
        totalBansos,
        totalKeamanan,
        totalProyek,
        totalPosyanduStunting
    ] = await Promise.all([
        prisma.rumahWarga.count({ where: { tenantId, rw: { in: validRws } } }),
        prisma.dataKependudukan.findMany({ 
            where: { tenantId, ...filterScope },
            select: { jenisKelamin: true, tanggalLahir: true, pendidikan: true, pekerjaan: true }
        }),
        prisma.bansosData.count({ where: { warga: { tenantId, ...filterScope } } }),
        prisma.rwSecurityLog.count({ where: { rw: { in: validRws } } }), 
        prisma.infrastrukturProject.count({ where: { tenantId, lokasi: { contains: userRw || "" } } }), 
        prisma.posyanduBalita.count({ where: { tenantId, statusStunting: true, rw: { in: validRws } } })
    ]);

    // Aggregate Warga Data
    const totalWarga = wargaList.length;
    let male = 0;
    let female = 0;
    
    // Demographics count
    const educationCounts: Record<string, number> = {};
    const occupationCounts: Record<string, number> = {};
    const ageGroups = { 'Balita (0-4)': 0, 'Anak (5-14)': 0, 'Remaja (15-24)': 0, 'Dewasa (25-59)': 0, 'Lansia (60+)': 0 };

    wargaList.forEach(w => {
        if (w.jenisKelamin === 'LAKI-LAKI') male++;
        else if (w.jenisKelamin === 'PEREMPUAN') female++;

        let age = 0;
        if (w.tanggalLahir) {
            const diff = Date.now() - new Date(w.tanggalLahir).getTime();
            if (!Number.isNaN(diff)) {
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }
        }
        if (Number.isNaN(age)) age = 0;

        if (age <= 4) ageGroups['Balita (0-4)']++;
        else if (age <= 14) ageGroups['Anak (5-14)']++;
        else if (age <= 24) ageGroups['Remaja (15-24)']++;
        else if (age <= 59) ageGroups['Dewasa (25-59)']++;
        else ageGroups['Lansia (60+)']++;

        const edu = w.pendidikan || 'Tidak Diketahui';
        educationCounts[edu] = (educationCounts[edu] || 0) + 1;

        const occ = w.pekerjaan || 'Tidak Diketahui';
        occupationCounts[occ] = (occupationCounts[occ] || 0) + 1;
    });

    const genderData = [
        { name: 'Laki-laki', value: male, color: '#0ea5e9' },
        { name: 'Perempuan', value: female, color: '#ec4899' }
    ];

    const ageData = Object.entries(ageGroups).map(([name, value], i) => ({
        name, value, color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i]
    }));

    const eduData = Object.entries(educationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], i) => ({ name, value, color: ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'][i % 5] }));

    const occData = Object.entries(occupationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], i) => ({ name, value, color: ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'][i % 5] }));

    return {
        totalKeluarga,
        totalWarga,
        totalBansos,
        totalKeamanan,
        totalProyek,
        totalPosyanduStunting,
        dusunName: userRw,
        allowedRws,
        charts: {
            genderData,
            ageData,
            eduData,
            occData
        }
    };
}
