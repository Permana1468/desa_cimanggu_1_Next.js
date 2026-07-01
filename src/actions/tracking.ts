"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Finance Proposals
export async function createFinanceProposal(data: { 
    title: string, 
    description: string, 
    amount: number, 
    category: string,
    volume?: string,
    kubikasi?: number,
    rab?: any
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        const result = await prisma.financeProposal.create({
            data: {
                title: data.title,
                description: data.description,
                amount: data.amount,
                category: data.category,
                volume: data.volume || null,
                kubikasi: data.kubikasi || null,
                rab: data.rab ? JSON.parse(JSON.stringify(data.rab)) : null,
                submittedBy: u.id,
                tenantId: u.tenantId,
                status: "PENDING"
            }
        });

        // Add initial tracking
        await prisma.tracking.create({
            data: {
                entityType: "FINANCE_PROPOSAL",
                entityId: result.id,
                status: "PENDING",
                notes: "Pengajuan baru dibuat",
                updatedBy: u.id
            }
        });

        revalidatePath("/dashboard");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getFinanceProposals() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        return await prisma.financeProposal.findMany({
            where: { tenantId: u.tenantId },
            include: { user: { select: { fullName: true, role: true } }, trackings: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function updateProposalStatus(proposalId: string, status: string, notes?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        const result = await prisma.financeProposal.update({
            where: { id: proposalId },
            data: { status }
        });

        await prisma.tracking.create({
            data: {
                entityType: "FINANCE_PROPOSAL",
                entityId: proposalId,
                status,
                notes: notes || `Status diperbarui menjadi ${status}`,
                updatedBy: u.id
            }
        });

        revalidatePath("/dashboard");
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteFinanceProposal(proposalId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        if (u.role !== "LPM") {
            throw new Error("Hanya LPM yang dapat menghapus usulan pembangunan");
        }

        // 1. Delete associated tracking records first to prevent foreign key errors
        await prisma.tracking.deleteMany({
            where: {
                entityType: "FINANCE_PROPOSAL",
                entityId: proposalId
            }
        });

        // 2. Delete the proposal
        const result = await prisma.financeProposal.delete({
            where: {
                id: proposalId,
                tenantId: u.tenantId
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/infrastruktur");
        revalidatePath("/dashboard/finance");
        return { success: true, result };
    } catch (error: any) {
        throw new Error(error.message || "Gagal menghapus usulan");
    }
}

// 2. Document/Surat Tracking
export async function addSuratTracking(suratId: string, status: string, notes?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        return await prisma.tracking.create({
            data: {
                entityType: "SURAT",
                entityId: suratId,
                status,
                notes,
                updatedBy: u.id
            }
        });
    } catch (error) {
        throw error;
    }
}

// 3. Convert Verified/Approved Proposal to active InfrastrukturProject
export async function convertProposalToInfrastrukturProject(proposalId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        // 1. Get the proposal
        const proposal = await prisma.financeProposal.findUnique({
            where: { id: proposalId }
        });

        if (!proposal) throw new Error("Proposal tidak ditemukan");

        // 2. Parse volume details
        let dimensiPanjang = null;
        let dimensiLebar = null;
        let dimensiTinggi = null;
        let volumeTotal = proposal.kubikasi || null;

        if (proposal.volume) {
            // format: "100 x 1 x 0.10 m" or similar
            const cleanVol = proposal.volume.replace(" m", "").trim();
            const parts = cleanVol.split("x").map(p => parseFloat(p.trim()));
            if (parts.length === 3) {
                dimensiPanjang = parts[0];
                dimensiLebar = parts[1];
                dimensiTinggi = parts[2];
                if (!volumeTotal) {
                    volumeTotal = dimensiPanjang * dimensiLebar * dimensiTinggi;
                }
            }
        }

        // 3. Create InfrastrukturProject
        const project = await prisma.infrastrukturProject.create({
            data: {
                namaProyek: proposal.title,
                jenisPekerjaan: "PEMBANGUNAN FISIK (LPM)",
                lokasi: "Desa Cimanggu I",
                dimensiPanjang,
                dimensiLebar,
                dimensiTinggi,
                volumeTotal,
                satuanVolume: "m³",
                anggaran: proposal.amount,
                sumberDana: "Dana Usulan LPM",
                status: "PERENCANAAN",
                userId: u.id,
                tenantId: u.tenantId
            }
        });

        // 4. Update Proposal status to APPROVED and add tracking log
        await prisma.financeProposal.update({
            where: { id: proposalId },
            data: { status: "APPROVED" }
        });

        await prisma.tracking.create({
            data: {
                entityType: "FINANCE_PROPOSAL",
                entityId: proposalId,
                status: "APPROVED",
                notes: `Dikonversi menjadi Proyek Fisik: ${project.namaProyek}`,
                updatedBy: u.id
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/infrastruktur");
        revalidatePath("/dashboard/finance");
        return { success: true, project };
    } catch (error) {
        throw error;
    }
}
