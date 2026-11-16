import { Suspense } from "react";
import { ManajemenAsetDesa } from "@/components/dashboard/aset/ManajemenAsetDesa";
import { Boxes } from "lucide-react";

export const metadata = {
  title: "Inventaris & Aset Desa | Desa Cimanggu I",
  description: "Pengelolaan inventaris barang milik desa, registrasi aset, dan pencetakan label barcode resmi Permendagri 1/2016.",
};

export default function AsetDesaPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Inventaris & Aset Desa Cimanggu I</h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Buku Administrasi Inventaris Desa (Permendagri No. 1 Tahun 2016). Registrasi nomor barang, klasifikasi bidang, dan cetak label barcode.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
            Kaur Tata Usaha & Umum
          </span>
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-400">Memuat inventaris aset...</div>}>
        <ManajemenAsetDesa />
      </Suspense>
    </div>
  );
}
