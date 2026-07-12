import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SellerDashboardClient from "./SellerDashboardClient";
import CreateStoreForm from "./CreateStoreForm";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function UmkmSellerPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/umkm/login");
    }

    const user = session.user as any;
    
    // Get store
    const store = await prisma.umkmStore.findUnique({
        where: { userId: user.id },
        include: { products: true, orders: true }
    });

    if (!store) {
        return <CreateStoreForm userId={user.id} tenantId={user.tenantId} />;
    }

    if (store.status === "PENDING") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <ShoppingBag size={64} className="text-blue-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Toko Sedang Ditinjau</h1>
                <p className="text-gray-600 mt-2 mb-6">Pendaftaran toko Anda sedang menunggu persetujuan dari Admin Desa.</p>
                <Link href="/umkm" className="text-blue-600 hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }
    
    if (store.status === "REJECTED") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <ShoppingBag size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Toko Ditolak</h1>
                <p className="text-gray-600 mt-2 mb-6">Pendaftaran toko Anda ditolak oleh Admin. Silakan hubungi kantor desa.</p>
                <Link href="/umkm" className="text-blue-600 hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }

    return <SellerDashboardClient store={store} products={store.products} orders={store.orders} />;
}
