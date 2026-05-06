import { 
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  CreditCard,
  Building,
  Plus
} from "lucide-react";
import Link from "next/link";
import { StatusSurat } from "@prisma/client";

export function WargaDashboard({ session, stats, latestSurat }: { session: any, stats: any, latestSurat: any[] }) {
  // Only show the user's own letters. (Assume latestSurat is already filtered by the server action or we just show a static view for now).
  // For proof of concept, we'll map the latestSurat if available, otherwise show empty state.

  return (
    <div className="space-y-6">
      {/* HEADER CARD - BLUE (Citizen Theme) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <Building size={14} /> Pelayanan Mandiri Warga
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Halo, {session?.user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-blue-100 max-w-xl leading-relaxed">
                    Selamat datang di Portal Desa Cimanggu I. Ajukan surat, bayar tagihan, dan dapatkan informasi terbaru dari genggaman Anda.
                </p>
                
                <div className="pt-4 flex gap-3">
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl text-xs font-bold shadow-lg hover:shadow-white/20 hover:-translate-y-1 transition-all flex items-center gap-2">
                        <Plus size={16} /> Buat Pengajuan Baru
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-blue-100 mb-1 uppercase">Pengajuan Aktif</span>
                    <span className="block text-3xl font-black text-white">1</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CENTER COLUMN: TRACKING SURAT */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Riwayat Pengajuan Saya</h2>
                        <p className="text-slate-500 text-sm">Lacak status dokumen yang Anda ajukan ke desa.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Dummy Data for Warga */}
                    <UserRequestCard 
                        jenis="Surat Keterangan Usaha"
                        tanggal="12 Mei 2026"
                        status="TERTUNDA"
                        step="Menunggu Tanda Tangan RT"
                    />
                    <UserRequestCard 
                        jenis="Surat Pengantar Pembuatan KTP"
                        tanggal="05 April 2026"
                        status="DISETUJUI"
                        step="Selesai. Silakan ambil di Balai Desa."
                    />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ANNOUNCEMENTS & QUICK LINKS */}
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Megaphone size={18} className="text-rose-500" /> Pengumuman Desa
                </h2>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors cursor-pointer">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                        <h4 className="text-xs font-bold text-slate-800 mb-1">Jadwal Posyandu Balita</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Pelaksanaan Posyandu bulan ini akan diadakan pada tanggal 15 di Balai Desa.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors cursor-pointer">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <h4 className="text-xs font-bold text-slate-800 mb-1">Pembayaran PBB 2026</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Pajak Bumi dan Bangunan sudah bisa dibayarkan melalui kolektor desa.</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <CreditCard size={20} className="text-blue-400" />
                </div>
                <h3 className="text-base font-black mb-1">Bayar Tagihan Desa</h3>
                <p className="text-slate-400 text-[10px] leading-relaxed mb-4">Bayar iuran sampah, keamanan, dan PBB langsung dari aplikasi.</p>
                <button className="w-full bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
                    Cek Tagihan
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

function UserRequestCard({ jenis, tanggal, status, step }: any) {
    const isSuccess = status === "DISETUJUI";
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
            <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-800">{jenis}</h4>
                    <span className="text-[10px] text-slate-400 block mb-2">Diajukan: {tanggal}</span>
                    <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{step}</span>
                    </div>
                </div>
            </div>
            <div>
                <button className="w-full sm:w-auto px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all">
                    Lacak Detail
                </button>
            </div>
        </div>
    )
}
