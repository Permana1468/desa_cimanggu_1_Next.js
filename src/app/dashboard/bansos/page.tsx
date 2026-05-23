import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BansosClient } from "@/components/dashboard/bansos/BansosClient";
import { redirect } from "next/navigation";

export default async function BansosPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    if (!["KASI", "KADES", "SEKDES", "ADMIN_DESA", "ADMIN_MASTER"].includes(role)) {
        redirect("/dashboard");
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <BansosClient session={session} />
        </div>
    );
}
