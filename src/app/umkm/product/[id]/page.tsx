import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Store, Receipt } from "lucide-react";
import { UmkmSafeImage } from "@/components/umkm/UmkmSafeImage";
import { UmkmCartBadge } from "@/components/umkm/UmkmCartBadge";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = await prisma.umkmProduct.findUnique({
    where: { id: resolvedParams.id },
    include: { store: true, category: true },
  });

  if (!product) notFound();

  let image = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600";
  try {
    const parsed = JSON.parse(product.images);
    if (parsed.length > 0 && parsed[0]) image = parsed[0];
  } catch {}

  const clientProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    image,
    storeId: product.storeId,
    storeName: product.store.storeName,
    stock: product.stock,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 font-sans">
      {/* Header Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 sticky top-0 z-50 bg-blue-700 text-white shadow-sm">
        <Link href="/umkm" className="p-2 bg-white/15 rounded-xl text-white">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-black text-sm truncate max-w-[180px]">{product.store.storeName}</span>
        <UmkmCartBadge mobile={true} />
      </header>

      {/* Header Desktop */}
      <header className="hidden md:flex bg-blue-700 text-white py-3.5 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
          <Link href="/umkm" className="text-xl font-black flex items-center gap-2">
            <Store size={22} />
            <span>DesaMart Cimanggu I</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/umkm/orders" className="text-xs font-bold hover:text-amber-200 flex items-center gap-1.5">
              <Receipt size={16} /> Pesanan Saya
            </Link>
            <UmkmCartBadge />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-0 md:mt-6 bg-white shadow-sm md:rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Images */}
        <div className="w-full md:w-[440px] shrink-0 p-4 bg-white">
          <div className="aspect-square bg-slate-100 relative rounded-2xl overflow-hidden border border-slate-200">
            <UmkmSafeImage src={image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 md:p-7 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black">
              {product.category?.name || "Produk UMKM Desa"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black">
              BUMDes Verified
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-4 mt-2.5 text-sm">
            <div className="flex text-amber-400">{"★".repeat(5)}</div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-bold">{product.sold} Terjual</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-bold">Stok: {product.stock}</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 mt-4 rounded-2xl flex items-end gap-2">
            <span className="text-3xl font-black text-blue-700">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="hidden md:block mt-6">
            <ProductDetailClient product={clientProduct} />
          </div>

          <div className="mt-7 border-t border-slate-100 pt-5">
            <h2 className="font-black text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider">
              Deskripsi Produk
            </h2>
            <div className="mt-3 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>
          </div>

          <div className="mt-7 border-t border-slate-100 pt-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
              {product.store.storeName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 truncate">{product.store.storeName}</h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {product.store.description || "Toko UMKM Terverifikasi Desa Cimanggu I"}
              </p>
            </div>
            <Link
              href={`/umkm?search=${encodeURIComponent(product.store.storeName)}`}
              className="ml-auto border border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 shrink-0"
            >
              Lihat Produk Toko
            </Link>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex h-14 z-50">
        <Link
          href="/umkm/orders"
          className="w-20 py-2 flex flex-col items-center justify-center border-r border-slate-200 text-slate-600"
        >
          <Receipt size={18} />
          <span className="text-[10px] mt-0.5 font-bold">Pesanan</span>
        </Link>
        <div className="flex-1 flex">
          <ProductDetailClient mobile={true} product={clientProduct} />
        </div>
      </div>
    </div>
  );
}
