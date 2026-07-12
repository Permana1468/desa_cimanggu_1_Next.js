import Link from "next/link";
import { Search, ShoppingCart, Bell, HelpCircle, Globe, ChevronDown, Facebook, Instagram, Twitter, Camera, MessageSquare, MapPin, ScanLine, Wallet, Maximize, Coins, Home, PlaySquare, User, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function UmkmHomepage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    // Color Theme mappings (Village Blue replacing Shopee Orange)

    // Color Theme mappings (Village Blue replacing Shopee Orange)
    // Primary: #2563eb (blue-600), Secondary: #1e40af (blue-800), Accent: #dbeafe (blue-100)
    
    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans text-sm pb-16 md:pb-0">
            {/* ========================================= */}
            {/* DESKTOP VIEW (Hidden on Mobile) */}
            {/* ========================================= */}
            <div className="hidden md:block">
                {/* Top Navigation Bar */}
                <div className="bg-blue-600 text-white/90 text-xs py-1">
                    <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/umkm/seller" className="hover:text-white">Seller Centre</Link>
                            <span className="opacity-40">|</span>
                            <Link href="#" className="hover:text-white">Mulai Berjualan</Link>
                            <span className="opacity-40">|</span>
                            <Link href="#" className="hover:text-white">Download</Link>
                            <span className="opacity-40">|</span>
                            <div className="flex items-center gap-1">
                                <span>Ikuti kami di</span>
                                <Facebook size={14} className="hover:text-white cursor-pointer" />
                                <Instagram size={14} className="hover:text-white cursor-pointer" />
                                <Twitter size={14} className="hover:text-white cursor-pointer" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="flex items-center gap-1 hover:text-white"><Bell size={14} /> Notifikasi</Link>
                            <Link href="#" className="flex items-center gap-1 hover:text-white"><HelpCircle size={14} /> Bantuan</Link>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                                <Globe size={14} /> Bahasa Indonesia <ChevronDown size={14} />
                            </div>
                            {user ? (
                                <>
                                    <span className="font-medium text-white ml-2">Halo, {user.name}</span>
                                    <span className="opacity-40">|</span>
                                    <Link href="/umkm/seller" className="font-medium text-white hover:opacity-80">Akun Saya</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/umkm/register" className="font-medium text-white ml-2 hover:opacity-80">Daftar</Link>
                                    <span className="opacity-40">|</span>
                                    <Link href="/umkm/login" className="font-medium text-white hover:opacity-80">Log In</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header Main (Search & Logo) */}
                <header className="bg-gradient-to-b from-blue-600 to-blue-500 pt-4 pb-6 sticky top-0 z-50">
                    <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/umkm" className="flex items-center gap-2 text-white">
                            <StoreLogoIconDesktop />
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 flex flex-col relative">
                            <div className="flex bg-white rounded-[2px] p-1 shadow-sm">
                                <input 
                                    type="text" 
                                    placeholder="Daftar & Dapat Voucher Gratis" 
                                    className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none placeholder-gray-500"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-[2px] text-white flex items-center justify-center transition-colors">
                                    <Search size={18} />
                                </button>
                            </div>
                            <div className="flex gap-3 text-xs text-white/90 mt-1 absolute -bottom-5 left-0">
                                <Link href="#" className="hover:text-white">Keripik Pisang</Link>
                                <Link href="#" className="hover:text-white">Kerajinan Tangan</Link>
                                <Link href="#" className="hover:text-white">Batik Tulis</Link>
                            </div>
                        </div>

                        {/* Cart Icon */}
                        <div className="w-16 flex justify-center mt-[-10px]">
                            <Link href="#" className="text-white hover:opacity-80 relative">
                                <ShoppingCart size={28} />
                                <span className="absolute -top-1 -right-2 bg-white text-blue-600 text-[10px] font-bold px-[6px] py-[1px] rounded-full border-2 border-blue-500">0</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Desktop Banner Section */}
                <div className="max-w-[1200px] mx-auto pt-8 pb-4 px-4 flex gap-2">
                    <div className="flex-[2] rounded overflow-hidden shadow-sm aspect-[21/9] bg-gradient-to-r from-blue-400 to-blue-600 flex flex-col justify-center px-12 relative text-white">
                        <h2 className="text-4xl font-bold italic z-10">Desa Pilih Lokal</h2>
                        <p className="text-xl font-medium mt-2 bg-blue-800 w-max px-3 py-1 rounded-sm z-10">Pusat Produk Unggulan Desa</p>
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex-1 rounded overflow-hidden bg-slate-800 flex items-center px-6 relative text-white">
                            <div>
                                <h3 className="font-bold text-xl leading-tight">Desa Mall<br/>100% ORI</h3>
                            </div>
                        </div>
                        <div className="flex-1 rounded overflow-hidden bg-indigo-900 flex items-center px-6 relative text-white">
                            <div className="z-10">
                                <div className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-sm w-max mb-1 font-bold">Produk Halal</div>
                                <h3 className="font-medium text-sm">Semua Kebutuhan Bersertifikat</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Icon Menu Desktop */}
                <div className="max-w-[1200px] mx-auto px-4 py-4 flex justify-between bg-white rounded-sm shadow-sm">
                    {[
                        {name: "Produk Lokal", icon: "🇮🇩"},
                        {name: "Desa Mall", icon: "🛍️"},
                        {name: "Sembako", icon: "🌾"},
                        {name: "Flash Sale", icon: "⚡"},
                        {name: "Kerajinan", icon: "🎨"},
                        {name: "Dikelola BUMDes", icon: "🏢"},
                        {name: "Gratis Ongkir", icon: "🎟️"},
                        {name: "Produk Halal", icon: "☪️"},
                        {name: "Semua Promo", icon: "🎁"}
                    ].map((item, idx) => (
                        <Link href="#" key={idx} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity w-24">
                            <div className="w-11 h-11 border border-gray-200 rounded-[16px] flex items-center justify-center text-2xl bg-gray-50">{item.icon}</div>
                            <span className="text-[11px] text-gray-700 text-center leading-tight">{item.name}</span>
                        </Link>
                    ))}
                </div>

                {/* Categories Desktop */}
                <div className="max-w-[1200px] mx-auto mt-5 bg-white shadow-sm rounded-sm">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-gray-500 font-medium uppercase">Kategori</h2>
                    </div>
                    <div className="grid grid-cols-10 border-t border-l border-gray-100">
                        {["Elektronik", "Komputer", "Handphone", "Pakaian", "Sepatu", "Tas", "Aksesoris", "Jam Tangan", "Kesehatan", "Hobi"].map((cat, idx) => (
                            <div key={idx} className="border-r border-b border-gray-100 flex flex-col items-center justify-center p-3 h-28 hover:shadow-md transition-shadow cursor-pointer bg-white">
                                <div className="text-3xl mb-2">📦</div>
                                <span className="text-[11px] text-gray-700 text-center leading-tight">{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* MOBILE VIEW (Visible only on Mobile) */}
            {/* ========================================= */}
            <div className="block md:hidden bg-slate-50 min-h-screen">
                {/* Mobile Header (Sticky) */}
                <header className="sticky top-0 z-50 bg-gradient-to-b from-blue-600 to-blue-500 pb-2">
                    <div className="flex items-center gap-3 px-3 pt-3 pb-2">
                        {/* Search Bar with Camera */}
                        <div className="flex-1 bg-white rounded-md flex items-center px-3 py-1.5 shadow-sm">
                            <Search size={18} className="text-blue-500 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Kabel HDMI HP Ke TV" 
                                className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400"
                            />
                            <div className="border-l border-slate-200 pl-2 ml-2">
                                <Camera size={20} className="text-slate-400" />
                            </div>
                        </div>
                        
                        {/* Icons */}
                        <Link href="#" className="relative text-white">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-1 -right-2 bg-white text-blue-600 text-[9px] font-bold px-[4px] py-[1px] rounded-full">99+</span>
                        </Link>
                        <Link href="#" className="text-white relative">
                            <MessageSquare size={24} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-blue-500"></span>
                        </Link>
                    </div>
                </header>

                {/* Mobile Wallet & Tools Info Box */}
                <div className="px-3 -mt-2 relative z-10">
                    <div className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center divide-x divide-slate-100 border border-slate-100">
                        {/* QRIS & Saldo */}
                        <div className="flex items-center gap-3 flex-1 pr-2">
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                    Rp0
                                </div>
                                <div className="text-[10px] text-slate-400">Saldo BUMDes</div>
                            </div>
                        </div>

                        {/* Cek-in */}
                        <div className="flex flex-col items-center justify-center flex-1 px-2">
                            <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                <Coins size={14} className="text-yellow-500"/>
                                10
                            </div>
                            <div className="text-[10px] text-blue-600 font-medium">Poin Desa</div>
                        </div>

                        {/* SPinjam */}
                        <div className="flex items-center gap-2 flex-1 pl-2">
                            <div>
                                <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                    Voucher
                                </div>
                                <div className="text-[10px] text-slate-400">Ada 2 Baru!</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">
                                🎟️
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Menus */}
                <div className="bg-white mt-2 py-4 px-1 shadow-sm overflow-x-auto no-scrollbar">
                    <div className="flex w-max px-2 gap-4">
                        {[
                            {name: "Produk Tani", icon: "🌾", color: "text-emerald-500"},
                            {name: "Kerajinan", icon: "🏺", color: "text-amber-600"},
                            {name: "Makanan Lokal", icon: "🥘", color: "text-orange-500"},
                            {name: "Jasa Desa", icon: "🔧", color: "text-blue-600"},
                            {name: "Pariwisata", icon: "⛰️", color: "text-teal-500"},
                            {name: "BUMDes", icon: "🏢", color: "text-blue-800"},
                            {name: "Koperasi", icon: "🤝", color: "text-indigo-500"},
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center w-[72px] shrink-0 gap-2">
                                <div className={`w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${item.color}`}>
                                    {item.icon}
                                </div>
                                <span className="text-[10px] text-slate-700 text-center leading-tight line-clamp-2 h-7">{item.name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-1 mt-3">
                        <div className="w-3 h-1 bg-slate-300 rounded-full"></div>
                        <div className="w-3 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                </div>

                {/* Shopee Live & Video Layout -> Produk Unggulan & Testimoni */}
                <div className="mt-2 grid grid-cols-2 bg-white shadow-sm">
                    <div className="p-3 border-r border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-blue-600 font-medium text-sm flex items-center gap-1">Pilihan Desa <span className="text-[10px]">⭐</span></h3>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 aspect-[3/4] bg-slate-800 rounded relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute top-1 left-1 bg-yellow-400 text-blue-900 text-[8px] font-bold px-1 rounded flex items-center gap-1">
                                    TERLARIS
                                </div>
                                <div className="absolute bottom-1 left-1 right-1 text-white text-[9px] leading-tight line-clamp-2 font-medium drop-shadow-md">
                                    Sayuran Segar Organik
                                </div>
                            </div>
                            <div className="flex-1 aspect-[3/4] bg-slate-800 rounded relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=300" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute top-1 left-1 bg-yellow-400 text-blue-900 text-[8px] font-bold px-1 rounded flex items-center gap-1">
                                    TERLARIS
                                </div>
                                <div className="absolute bottom-1 left-1 right-1 text-white text-[9px] leading-tight line-clamp-2 font-medium drop-shadow-md">
                                    Susu Sapi Murni
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-blue-600 font-medium text-sm flex items-center gap-1">UMKM Kita <span className="text-[10px]">🏪</span></h3>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 aspect-[3/4] bg-slate-800 rounded relative overflow-hidden border border-slate-100">
                                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=300" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute bottom-1 left-1 right-1 text-white text-[9px] leading-tight font-medium drop-shadow-md bg-black/40 px-1 py-0.5 rounded">
                                    Toko Makmur Sejahtera
                                </div>
                            </div>
                            <div className="flex-1 aspect-[3/4] bg-slate-800 rounded relative overflow-hidden border border-slate-100">
                                <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=300" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute bottom-1 left-1 right-1 text-white text-[9px] leading-tight font-medium drop-shadow-md bg-black/40 px-1 py-0.5 rounded">
                                    Kerajinan Tangan Ibu
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================= */}
            {/* SHARED DESKTOP/MOBILE: PRODUCTS SECTION */}
            {/* ========================================= */}
            <div className="max-w-[1200px] mx-auto mt-2 md:mt-5 bg-slate-50 md:bg-transparent px-2 md:px-0">
                <div className="bg-white border-b-4 border-blue-600 sticky md:top-[108px] z-40 hidden md:block">
                    <h2 className="text-blue-600 font-medium uppercase text-center py-4 bg-white">Rekomendasi (Real Database)</h2>
                </div>
                
                {/* Mobile Tab Layout for Rekomendasi */}
                <div className="flex md:hidden bg-white mt-2 border-b border-slate-200">
                    <div className="flex-1 py-3 border-b-2 border-blue-600 text-blue-600 text-center font-medium text-sm">Rekomendasi</div>
                    <div className="flex-1 py-3 text-slate-500 text-center font-medium text-sm">Terbaru</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:mt-2 mt-2">
                    <Suspense fallback={
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white border border-slate-100 transition-all shadow-sm rounded flex flex-col cursor-pointer relative">
                                <div className="aspect-square overflow-hidden relative bg-slate-200 animate-pulse"></div>
                                <div className="p-2 flex flex-col flex-1 gap-2">
                                    <div className="bg-slate-200 h-4 w-3/4 animate-pulse rounded"></div>
                                    <div className="bg-slate-200 h-4 w-1/2 animate-pulse rounded mt-auto"></div>
                                </div>
                            </div>
                        ))
                    }>
                        <ProductList />
                    </Suspense>
                </div>
                <div className="flex justify-center mt-6 pb-6 md:pb-12">
                    <button className="bg-white border border-slate-300 text-slate-600 px-24 md:px-32 py-2 text-sm hover:bg-slate-50 rounded shadow-sm">Lihat Lainnya</button>
                </div>
            </div>

            {/* ========================================= */}
            {/* BOTTOM NAVIGATION BAR (Mobile Only) */}
            {/* ========================================= */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between px-2 pb-safe z-50">
                <Link href="#" className="flex flex-col items-center py-2 flex-1 text-blue-600">
                    <Home size={22} className="fill-blue-600 text-blue-600" />
                    <span className="text-[10px] mt-1 font-medium">Beranda</span>
                </Link>
                <Link href="#" className="flex flex-col items-center py-2 flex-1 text-slate-500">
                    <Tag size={22} />
                    <span className="text-[10px] mt-1">Deals</span>
                </Link>
                <Link href="#" className="flex flex-col items-center py-2 flex-1 text-slate-500">
                    <PlaySquare size={22} />
                    <span className="text-[10px] mt-1">Live & Video</span>
                </Link>
                <Link href="#" className="flex flex-col items-center py-2 flex-1 text-slate-500 relative">
                    <Bell size={22} />
                    <span className="absolute top-1 right-3 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center border border-white">16</span>
                    <span className="text-[10px] mt-1">Notifikasi</span>
                </Link>
                <Link href="/umkm/seller" className="flex flex-col items-center py-2 flex-1 text-slate-500">
                    <User size={22} />
                    <span className="text-[10px] mt-1">Saya</span>
                </Link>
            </div>
        </div>
    );
}

// Simple Logo component for Desktop Header
function StoreLogoIconDesktop() {
    return (
        <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-1.5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-600">
                    <path d="M4 6h16v2H4zm2 4h12v12H6zm3 2v8h6v-8h-6z" />
                </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight">DesaMart</span>
        </div>
    );
}

// Server Component for fetching products
async function ProductList() {
    const products = await prisma.umkmProduct.findMany({
        include: { store: true },
        take: 12,
        orderBy: { createdAt: 'desc' }
    });

    if (products.length === 0) {
        return (
            <>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border border-slate-100 transition-all shadow-sm rounded flex flex-col cursor-pointer relative">
                        <div className="aspect-square overflow-hidden relative bg-slate-200">
                            {/* Static image to avoid hydration error */}
                            <img src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300`} alt="Product" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute top-2 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-sm">Mall</div>
                        </div>
                        <div className="p-2 flex flex-col flex-1">
                            <div className="text-xs text-slate-800 line-clamp-2 leading-tight mb-2 h-8">
                                Produk UMKM Desa {i + 1}
                            </div>
                            <div className="mt-auto flex items-end justify-between">
                                <div className="text-blue-600 font-semibold text-base">
                                    <span className="text-xs">Rp</span>{((i + 1) * 25000).toLocaleString('id-ID')}
                                </div>
                                <div className="text-[10px] text-slate-500">{(i * 123) % 1000} Terjual</div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    return (
        <>
            {products.map((product) => {
                let imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300";
                try {
                    const parsedImages = JSON.parse(product.images);
                    if (parsedImages.length > 0) imageUrl = parsedImages[0];
                } catch(e) {}

                return (
                    <Link href={`/umkm/product/${product.id}`} key={product.id} className="bg-white hover:border-blue-600 md:hover:-translate-y-[1px] border border-slate-100 md:border-transparent transition-all shadow-sm rounded flex flex-col group cursor-pointer relative overflow-hidden block">
                        <div className="aspect-square overflow-hidden relative">
                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-0 right-0 bg-yellow-300 text-blue-800 text-[10px] font-bold px-1 flex flex-col items-center py-1 z-10 w-8">
                                <span>Sale</span>
                            </div>
                            {product.store && (
                                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <MapPin size={8} /> {product.store.storeName}
                                </div>
                            )}
                        </div>
                        <div className="p-2 flex flex-col flex-1">
                            <div className="text-xs text-slate-800 line-clamp-2 leading-tight mb-2 h-8">
                                {product.name}
                            </div>
                            <div className="mt-auto flex items-end justify-between">
                                <div className="text-blue-600 font-semibold text-base">
                                    <span className="text-xs">Rp</span>{product.price.toLocaleString('id-ID')}
                                </div>
                                <div className="text-[10px] text-slate-500">{product.sold} Terjual</div>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </>
    );
}
