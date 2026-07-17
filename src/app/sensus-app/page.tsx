import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SensusAppRoot() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/sensus-app/login");
    }

    // Role-based routing for Sensus App
    // Let's assume ADMIN_MASTER and maybe a specific GIS role goes to admin panel
    if (session.user.role === "ADMIN_MASTER" || session.user.email === "petagis@cimanggu1.desa.id") {
        redirect("/sensus-app/admin");
    }

    // Default to surveyor page for PETUGAS_SENSUS and others
    redirect("/sensus-app/surveyor");
}
