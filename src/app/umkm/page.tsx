import Link from "next/link";
import { Search, ShoppingCart, MapPin, Home, User, Sparkles, Store, Receipt, X } from "lucide-react";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ensureUmkmSeedData, getUmkmCatalog } from "@/app/actions/umkm";
import { UmkmSafeImage } from "@/components/umkm/UmkmSafeImage";
import { UmkmCartBadge } from "@/components/umkm/UmkmCartBadge";

export default async function UmkmHomepage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const searchQuery = resolvedSearch?.search?.trim() || "";
  const categoryFilter = resolvedSearch?.category?.trim() || "";
  const sortFilter = (resolvedSearch?.sort as any) || "newest";

  await ensureUmkmSeedData();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const categories = [
    { name: "Hasil Tani", icon: "🌾", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { name: "Kuliner & Snack", icon: "🥘", bg: "bg-orange-50 text-orange-600 border-orange-200" },
    { name: "Kopi Desa", icon: "☕", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "Kerajinan Bambu", icon: "🏺", bg: "bg-amber-50 text-amber-800 border-amber-200" },
    { name: "Batik & Fashion", icon: "👗", bg: "bg-pink-50 text-pink-600 border-pink-200" },
    { name: "Madu & Herbal", icon: "🍯", bg: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { name: "Produk BUMDes", icon: "🏢", bg: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Olahan Sambal", icon: "🌶️", bg: "bg-red-50 text-red-600 border-red-200" },
    { name: "Sayur Segar", icon: "🥬", bg: "bg-green-50 text-green-700 border-green-200" },
    { name: "Wisata Desa", icon: "⛰️", bg: "bg-teal-50 text-teal-700 border-teal-200" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-sm pb-20 md:pb-10">
      {/* ========================================= */}
      {/* DESKTOP VIEW */}
      {/* ========================================= */}
      <div className="hidden md:block">
        {/* Top Navigation Bar */}
        <div className="bg-blue-700 text-white/95 text-xs py-1.5 shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/umkm/seller" className="hover:text-amber-200 font-bold flex items-center gap-1">
                <Store size={14} /> Seller Centre (Toko Saya)
              </Link>
              <span className="opacity-40">|</span>
              <Link href="/umkm/orders" className="hover:text-amber-200 font-bold flex items-center gap-1">
                <Receipt size={14} /> Pesanan &amp; Struk Saya
              </Link>
              <span className="opacity-40">|</span>
              <Link href="/" className="hover:text-amber-200">
                Portal Utama Desa
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="font-bold text-amber-200">Halo, {user.name}</span>
                  <span className="opacity-40">|</span>
                  <Link href="/umkm/seller" className="font-bold text-white hover:text-amber-200">
                    Kelola Toko
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/umkm/register" className="font-bold text-white hover:text-amber-200">
                    Daftar
                  </Link>
                  <span className="opacity-40">|</span>
                  <Link href="/umkm/login" className="font-bold text-white hover:text-amber-200">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Main (Search & Logo) */}
        <header className="bg-gradient-to-b from-blue-700 to-blue-600 pt-4 pb-6 sticky top-0 z-50 shadow-md">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-8">
            <Link href="/umkm" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
              <StoreLogoIconDesktop />
            </Link>

            <div className="flex-1 flex flex-col relative">
              <form action="/umkm" method="GET" className="flex bg-white rounded-md p-1 shadow-md border-2 border-blue-400 focus-within:border-amber-400">
                {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Cari produk lokal, keripik pisang, kopi desa, beras organik..."
                  className="flex-1 px-4 py-2 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-7 py-2 rounded-md text-white font-bold flex items-center justify-center transition-colors cursor-pointer">
                  <Search size={18} />
                </button>
              </form>
              <div className="flex gap-4 text-xs text-blue-100 mt-1.5 font-medium">
                <Link href="/umkm?search=keripik" className="hover:text-amber-200">Keripik Pisang</Link>
                <Link href="/umkm?search=kopi" className="hover:text-amber-200">Kopi Robusta</Link>
                <Link href="/umkm?search=beras" className="hover:text-amber-200">Beras Organik</Link>
                <Link href="/umkm?search=batik" className="hover:text-amber-200">Batik Tulis</Link>
                <Link href="/umkm?search=madu" className="hover:text-amber-200">Madu Hutan</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UmkmCartBadge />
            </div>
          </div>
        </header>

        {/* Hero Banner Section (hanya tampil saat belum memfilter biar hasil langsung terlihat) */}
        {!searchQuery && !categoryFilter && (
          <div className="max-w-[1200px] mx-auto pt-6 pb-4 px-4 flex gap-4">
            <div className="flex-[2] rounded-2xl overflow-hidden shadow-lg aspect-[21/9] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 flex flex-col justify-center px-12 relative text-white border-2 border-blue-400/40">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs w-max uppercase tracking-wider mb-2 flex items-center gap-1 shadow-md">
                <Sparkles size={14} /> PUSAT UMKM DESA CIMANGGU I
              </span>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Bangga Beli Produk Lokal Desa
              </h2>
              <p className="text-sm font-semibold mt-2 text-blue-100 max-w-md">
                Dukung perekonomian warga dengan belanja produk unggulan pertanian, kuliner, dan kerajinan asli Desa Cimanggu I. Pembayaran aman via QRIS, Transfer Bank, &amp; COD.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950 flex items-center px-6 relative text-white border border-slate-700 shadow-md">
                <div>
                  <span className="text-xs font-bold text-amber-400">DesaMall Official</span>
                  <h3 className="font-black text-lg leading-tight mt-0.5">100% Produk Asli Olahan Warga</h3>
                </div>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center px-6 relative text-white border border-emerald-600 shadow-md">
                <div>
                  <div className="bg-emerald-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-md w-max font-black uppercase">
                    BUMDes Verified
                  </div>
                  <h3 className="font-bold text-sm mt-1">Struk Digital Resmi &amp; Pembayaran QRIS / Bank</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Desktop */}
        <div className="max-w-[1200px] mx-auto mt-4 bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-800 font-black uppercase tracking-wider text-sm flex items-center gap-2">
              <Store size={18} className="text-blue-600" /> Kategori Produk Desa
            </h2>
            {categoryFilter ? (
              <Link href="/umkm" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                <X size={13} /> Reset Filter Kategori ({categoryFilter})
              </Link>
            ) : (
              <span className="text-xs font-bold text-blue-600">Terlengkap &amp; Terpercaya</span>
            )}
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 divide-x divide-y divide-slate-100">
            {categories.map((cat, idx) => {
              const isSelected = categoryFilter.toLowerCase() === cat.name.toLowerCase();
              return (
                <Link
                  href={isSelected ? "/umkm" : `/umkm?category=${encodeURIComponent(cat.name)}`}
                  key={idx}
                  className={`flex flex-col items-center justify-center p-3 h-28 transition-colors cursor-pointer group ${
                    isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : "bg-white hover:bg-blue-50/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${cat.bg}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[11px] font-bold text-center leading-tight mt-2 ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE VIEW */}
      {/* ========================================= */}
      <div className="block md:hidden bg-slate-50">
        <header className="sticky top-0 z-50 bg-gradient-to-b from-blue-700 to-blue-600 pb-3 shadow-md">
          <div className="flex items-center gap-3 px-3 pt-3 pb-1">
            <form action="/umkm" method="GET" className="flex-1 bg-white rounded-xl flex items-center px-3 py-2 shadow-sm border border-blue-400">
              <Search size={18} className="text-blue-600 mr-2 shrink-0" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Cari keripik, beras, kopi desa..."
                className="flex-1 text-xs font-medium bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </form>

            <UmkmCartBadge mobile={true} />
          </div>
        </header>

        <div className="bg-white py-3 px-2 shadow-sm border-b border-slate-200 overflow-x-auto">
          <div className="flex w-max gap-3 px-2">
            {categories.map((item, idx) => (
              <Link
                href={`/umkm?category=${encodeURIComponent(item.name)}`}
                key={idx}
                className="flex flex-col items-center w-[76px] shrink-0 gap-1.5"
              >
                <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center text-2xl shadow-sm ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight line-clamp-2">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* SHARED DESKTOP/MOBILE: PRODUCTS SECTION */}
      {/* ========================================= */}
      <div className="max-w-[1200px] mx-auto mt-4 px-3 md:px-4">
        <div className="bg-white border-b-4 border-blue-600 rounded-t-2xl shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-blue-700 font-black uppercase tracking-wider text-sm sm:text-base flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              {searchQuery
                ? `Hasil Pencarian: "${searchQuery}"`
                : categoryFilter
                  ? `Kategori: ${categoryFilter}`
                  : "Katalog Produk UMKM Desa Cimanggu I"}
            </h2>
            {(searchQuery || categoryFilter) && (
              <Link href="/umkm" className="text-xs font-bold text-rose-600 hover:underline mt-0.5 inline-block">
                Tampilkan Semua Produk
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {[
              { key: "newest", label: "Terbaru" },
              { key: "bestseller", label: "Terlaris" },
              { key: "price_asc", label: "Termurah" },
            ].map((opt) => {
              const params = new URLSearchParams();
              if (searchQuery) params.set("search", searchQuery);
              if (categoryFilter) params.set("category", categoryFilter);
              params.set("sort", opt.key);
              const active = sortFilter === opt.key;
              return (
                <Link
                  key={opt.key}
                  href={`/umkm?${params.toString()}`}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
          <Suspense
            fallback={[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-2 animate-pulse h-64" />
            ))}
          >
            <ProductList search={searchQuery} category={categoryFilter} sort={sortFilter} />
          </Suspense>
        </div>
      </div>

      {/* ========================================= */}
      {/* BOTTOM NAVIGATION BAR (Mobile Only) */}
      {/* ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between px-3 py-2 z-50 shadow-lg">
        <Link href="/umkm" className="flex flex-col items-center flex-1 text-blue-600 font-bold">
          <Home size={20} />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </Link>
        <Link href="/umkm/cart" className="flex flex-col items-center flex-1 text-slate-600 font-bold">
          <ShoppingCart size={20} />
          <span className="text-[10px] mt-0.5">Keranjang</span>
        </Link>
        <Link href="/umkm/orders" className="flex flex-col items-center flex-1 text-slate-600 font-bold">
          <Receipt size={20} />
          <span className="text-[10px] mt-0.5">Pesanan</span>
        </Link>
        <Link href="/umkm/seller" className="flex flex-col items-center flex-1 text-slate-600 font-bold">
          <User size={20} />
          <span className="text-[10px] mt-0.5">Toko Saya</span>
        </Link>
      </div>
    </div>
  );
}

function StoreLogoIconDesktop() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="bg-white rounded-2xl p-2 flex items-center justify-center shadow-md">
        <Store size={26} className="text-blue-700" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tight leading-none text-white">DesaMart</span>
        <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase mt-0.5">
          UMKM Cimanggu I
        </span>
      </div>
    </div>
  );
}

async function ProductList({
  search,
  category,
  sort,
}: {
  search?: string;
  category?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "bestseller";
}) {
  const products = await getUmkmCatalog({ search, category, sort, limit: 30 });

  if (products.length === 0) {
    return (
      <div className="col-span-full py-14 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-bold">
          Tidak ditemukan produk yang cocok{search ? ` untuk "${search}"` : ""}.
        </p>
        <Link href="/umkm" className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
          Lihat Semua Produk
        </Link>
      </div>
    );
  }

  return (
    <>
      {products.map((product) => {
        let imageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600";
        try {
          const parsedImages = JSON.parse(product.images);
          if (parsedImages.length > 0 && parsedImages[0]) imageUrl = parsedImages[0];
        } catch {}

        const outOfStock = product.stock <= 0;

        return (
          <Link
            href={`/umkm/product/${product.id}`}
            key={product.id}
            className="bg-white hover:border-blue-500 border border-slate-200 transition-all shadow-sm hover:shadow-md rounded-2xl flex flex-col group cursor-pointer overflow-hidden"
          >
            <div className="aspect-square overflow-hidden relative bg-slate-100">
              <UmkmSafeImage
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                {outOfStock ? "Stok Habis" : "UMKM Desa"}
              </div>
              {product.store && (
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-xl flex items-center gap-1 truncate">
                  <MapPin size={10} className="text-amber-400 shrink-0" />
                  <span className="truncate">{product.store.storeName}</span>
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug mb-2 h-8 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <div className="mt-auto flex items-end justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">
                    Stok: {product.stock}
                  </span>
                  <span className="text-blue-700 font-black text-sm sm:text-base">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {product.sold} Terjual
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}
