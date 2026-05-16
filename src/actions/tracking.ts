"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Finance Proposals
export async function createFinanceProposal(data: { title: string, description: string, amount: number, category: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("Unauthorized");
        const u = session.user as any;

        const result = await prisma.financeProposal.create({
            data: {
                ...data,
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
