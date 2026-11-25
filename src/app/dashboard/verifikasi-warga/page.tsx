import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import VerifikasiWargaClient from "@/components/dashboard/VerifikasiWargaClient";

export default async function VerifikasiWargaPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const userRole = String((session.user as any).role || "").toUpperCase();
    if (!["OPERATOR_DESA", "ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(userRole)) {
        redirect("/dashboard");
    }
    
    // Get all Warga users
    const wargaUsers = await prisma.user.findMany({
        where: { role: "WARGA", tenantId: (session.user as any).tenantId },
        include: { resident: true },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="p-8">
            <VerifikasiWargaClient users={wargaUsers} />
        </div>
    );
}
