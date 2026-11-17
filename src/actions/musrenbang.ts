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

/**
 * AI MCDM TOPSIS Musrenbang Prioritizer Engine
 */
export async function rankMusrenbangProposalsAction(customProposals?: import("@/lib/musrenbangBridge").MusrenbangProposalInput[]) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            throw new Error("Unauthorized");
        }
        const tenantId = (session.user as any).tenantId;

        let inputList = customProposals;
        if (!inputList || inputList.length === 0) {
            // Ambil dari DB financeProposal
            const dbProposals = await prisma.financeProposal.findMany({
                where: { tenantId, category: "PEMBANGUNAN" },
                orderBy: { createdAt: "desc" },
                take: 50,
            });

            inputList = dbProposals.map((p) => ({
                id: p.id,
                kegiatanPrioritas: p.title,
                lokasiRw: p.lokasiRw || "001",
                lokasiRt: p.lokasiRt || "001",
                lokasiDetail: p.lokasiDetail || "-",
                volume: p.volume || "-",
                satuan: p.satuan || "-",
                anggaran: Number(p.amount) || 10000000,
                penerimaManfaat: 250, // default estimasi warga per RT/RW
                urgensiBencana: 7.0,
                keselarasanRpjm: 8.0,
                kerentananWilayah: 7.0,
            }));
        }

        const { executePythonMusrenbangEngine } = await import("@/lib/musrenbangBridge");
        const result = await executePythonMusrenbangEngine(inputList);
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error in rankMusrenbangProposalsAction:", error);
        return { success: false, error: error.message };
    }
}

