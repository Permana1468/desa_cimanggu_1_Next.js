"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function submitMusrenbang(data: {
    kegiatanPrioritas: string;
    lokasiRt: string;
    lokasiRw: string;
    lokasiDetail: string;
    volume: string;
    satuan: string;
    anggaran: number;
    keterangan: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;
    const tenantId = (session.user as any).tenantId;

    await prisma.financeProposal.create({
        data: {
            title: data.kegiatanPrioritas.toUpperCase(),
            description: "Usulan Musrenbang", // Default string as description
            amount: data.anggaran,
            category: "PEMBANGUNAN",
            status: "PENDING",
            lokasiRt: data.lokasiRt,
            lokasiRw: data.lokasiRw,
            lokasiDetail: data.lokasiDetail.toUpperCase(),
            volume: data.volume,
            satuan: data.satuan.toUpperCase(),
            keterangan: data.keterangan.toUpperCase(),
            submittedBy: userId,
            tenantId: tenantId,
        }
    });

    return { success: true };
}
