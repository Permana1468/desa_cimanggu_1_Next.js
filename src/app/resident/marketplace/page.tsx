import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MarketplaceRedirectPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    
    // Check if user has an approved store
    const store = await prisma.umkmStore.findUnique({
        where: { userId }
    });

    if (store && store.status === "APPROVED") {
        // Terdaftar dan terverifikasi -> masuk ke dashboard UMKM (Seller Centre)
        redirect("/umkm/seller");
    } else {
        // Belum terdaftar atau belum diverifikasi -> masuk ke public marketplace
        redirect("/umkm");
    }
}
