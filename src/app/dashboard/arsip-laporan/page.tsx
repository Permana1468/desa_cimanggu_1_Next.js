import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArsipLaporanClient } from "@/components/dashboard/arsip-laporan/ArsipLaporanClient";
import prisma from "@/lib/prisma";



export default async function ArsipLaporanPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;

    let whereClause: any = { tenantId };

    // If not Admin/Kades, only show their own generated reports
    if (role !== "ADMIN_MASTER" && role !== "ADMIN_DESA" && role !== "KADES") {
        whereClause.generatedByUserId = session.user.id;
    }

    // Fetch reports for this tenant (filtered by user if not admin)
    const reports = await prisma.arsipLaporan.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });

    return <ArsipLaporanClient initialReports={reports} />;
}
