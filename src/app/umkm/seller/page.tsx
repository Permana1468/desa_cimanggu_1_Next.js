import { Suspense } from "react";
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

  const store = await prisma.umkmStore.findUnique({
    where: { userId: user.id },
    include: {
      products: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        include: {
          buyer: { select: { fullName: true, phoneNumber: true } },
          items: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) {
    return <CreateStoreForm userId={user.id} tenantId={user.tenantId} />;
  }

  if (store.status === "PENDING") {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag size={64} className="text-blue-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800">Toko Sedang Ditinjau</h1>
        <p className="text-slate-600 mt-2 mb-6 max-w-md text-sm">
          Pendaftaran toko <strong>{store.storeName}</strong> sedang menunggu persetujuan dari Pengelola BUMDes atau Admin Desa sebelum produk tampil di katalog publik.
        </p>
        <Link href="/umkm" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
          Kembali ke Katalog DesaMart
        </Link>
      </div>
    );
  }

  if (store.status === "REJECTED" || store.status === "BANNED") {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag size={64} className="text-rose-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800">
          {store.status === "BANNED" ? "Toko Dibekukan Sementara" : "Pendaftaran Toko Ditolak"}
        </h1>
        <p className="text-slate-600 mt-2 mb-6 max-w-md text-sm">
          Silakan hubungi Pengelola BUMDes atau Admin Desa Cimanggu I untuk informasi verifikasi lebih lanjut.
        </p>
        <Link href="/umkm" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-400">Memuat Seller Centre...</div>}>
      <SellerDashboardClient store={store} products={store.products} orders={store.orders} />
    </Suspense>
  );
}
