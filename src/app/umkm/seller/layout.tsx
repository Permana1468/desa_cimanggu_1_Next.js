import Link from "next/link";
import { Bell, HelpCircle, User, Grid, Package, TrendingUp, DollarSign, Settings, Megaphone, ChevronDown, AlignLeft } from "lucide-react";

export default function SellerCenterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f6f6f6] font-sans text-sm flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                        <Link href="/umkm" className="flex items-center gap-2 text-blue-600">
                            {/* Seller Centre Logo */}
                            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-600">
                                <path d="M4 6h16v2H4zm2 4h12v12H6zm3 2v8h6v-8h-6z" />
                            </svg>
                            <span className="text-xl font-medium text-gray-700 ml-1">Seller Centre</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6 text-gray-500">
                        <Link href="#" className="flex items-center gap-1 hover:text-blue-600"><Bell size={18} /></Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-blue-600"><HelpCircle size={18} /></Link>
                        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <span className="font-medium">Toko UMKM Desa</span>
                        </div>
                        <Link href="#" className="hover:text-blue-600">
                            <Grid size={18} />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-[1400px] w-full mx-auto">
                {/* Sidebar */}
                <aside className="w-64 bg-transparent py-4 pr-4">
                    <nav className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 font-bold text-gray-800 px-4 mb-2">
                                <AlignLeft size={18} className="text-blue-600" /> Pesanan
                            </div>
                            <ul className="text-gray-600 space-y-1">
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Pesanan Saya</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Pengiriman Massal</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Pengembalian</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 font-bold text-gray-800 px-4 mb-2">
                                <Package size={18} className="text-blue-600" /> Produk
                            </div>
                            <ul className="text-gray-600 space-y-1">
                                <li><Link href="/umkm/seller" className="block px-10 py-1.5 text-blue-600 font-medium bg-white/50 rounded-r-full">Produk Saya</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Tambah Produk Baru</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Manajemen Merek</Link></li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 font-bold text-gray-800 px-4 mb-2">
                                <Megaphone size={18} className="text-blue-600" /> Promosi
                            </div>
                            <ul className="text-gray-600 space-y-1">
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Iklan Desa</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Promo Toko</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Voucher</Link></li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 font-bold text-gray-800 px-4 mb-2">
                                <DollarSign size={18} className="text-blue-600" /> Keuangan
                            </div>
                            <ul className="text-gray-600 space-y-1">
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Saldo Saya</Link></li>
                                <li><Link href="#" className="block px-10 py-1.5 hover:text-blue-600">Rekening Bank</Link></li>
                            </ul>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white shadow-sm my-4 rounded-sm border border-gray-200 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
