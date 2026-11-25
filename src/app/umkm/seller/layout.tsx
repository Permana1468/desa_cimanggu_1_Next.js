import Link from "next/link";
import { Package, DollarSign, AlignLeft, Store, ArrowLeft, Receipt } from "lucide-react";

export default function SellerCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-sm flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-xs border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/umkm/seller" className="flex items-center gap-2 text-blue-600">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Store size={20} />
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 block leading-none">Seller Centre</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DesaMart Cimanggu I</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/umkm/orders"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold hidden sm:flex items-center gap-1.5"
            >
              <Receipt size={14} /> Belanjaan Saya
            </Link>
            <Link
              href="/umkm"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Katalog Publik
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] w-full mx-auto px-2 sm:px-4 gap-4">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-60 py-5 shrink-0">
          <nav className="space-y-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-400 px-2 mb-2">
                <AlignLeft size={14} className="text-blue-600" /> Transaksi Toko
              </div>
              <ul className="text-slate-700 space-y-1 text-xs font-bold">
                <li>
                  <Link href="/umkm/seller?tab=pesanan" className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700">
                    Pesanan Masuk
                  </Link>
                </li>
                <li>
                  <Link href="/umkm/seller?tab=keuangan" className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700">
                    Keuangan &amp; Omzet
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-400 px-2 mb-2">
                <Package size={14} className="text-blue-600" /> Etalase Produk
              </div>
              <ul className="text-slate-700 space-y-1 text-xs font-bold">
                <li>
                  <Link href="/umkm/seller?tab=produk" className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700">
                    Daftar Produk &amp; Stok
                  </Link>
                </li>
                <li>
                  <Link href="/umkm/seller?tab=produk&add=1" className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700">
                    + Tambah Produk Baru
                  </Link>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-400 px-2 mb-2">
                <DollarSign size={14} className="text-emerald-600" /> Pembayaran API
              </div>
              <p className="px-2 text-[11px] text-slate-500 leading-relaxed">
                Mendukung QRIS, Transfer Virtual Account Bank, dan COD Kurir Desa secara otomatis.
              </p>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white shadow-xs my-4 rounded-2xl border border-slate-200 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
