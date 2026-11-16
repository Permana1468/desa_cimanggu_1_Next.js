import { 
  ClipboardList, 
  Printer, 
  MonitorSmartphone,
  BookOpen,
  Stamp,
  CheckCircle2,
  Boxes
} from "lucide-react";
import Link from "next/link";
import { PhysicalMutationAlertBanner } from "@/components/dashboard/mutasi/PhysicalMutationAlertBanner";
import { getAgendaSuratList, getAgendaRegisterInfoTU } from "@/actions/pelayanan";

export async function PelayananDashboard({ session, stats }: { session: any, stats: any }) {
  const email = session?.user?.email || "";
  const baseRole = session?.user?.role || "";
  let displayRole = "Tata Usaha & Pelayanan Administrasi";
  const isKaurTU = baseRole === "KAUR_TU" || (baseRole === "KAUR" && (email.includes("tu") || email.includes("umum")));

  if (baseRole === "KASI_PEMERINTAHAN" || (baseRole === "KASI" && email.includes("pemerintahan"))) {
    displayRole = "Seksi Pemerintahan Desa";
  } else if (isKaurTU) {
    displayRole = "Kaur Tata Usaha & Umum";
  } else if (baseRole === "PETUGAS_SENSUS") {
    displayRole = "Petugas Registrasi & Sensus Desa";
  } else if (baseRole === "PERANGKAT_DESA") {
    displayRole = "Perangkat Administrasi Desa";
  }

  // Ambil data live register TU
  const [registerInfo, suratKeluarRes] = await Promise.all([
    getAgendaRegisterInfoTU(),
    getAgendaSuratList("keluar"),
  ]);

  const recentLetters = suratKeluarRes.data || [];

  return (
    <div className="space-y-6">
      {/* HEADER CARD - INDIGO & NAVY */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-indigo-900/15 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[60px] -ml-32 -mb-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-widest text-cyan-200">
              <MonitorSmartphone size={13} />
              <span>Tata Usaha & Administrasi Persuratan</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              {displayRole}
            </h1>
            <p className="text-indigo-100/90 max-w-xl text-xs md:text-sm leading-relaxed">
              Halo, <strong className="text-white font-bold">{session?.user?.name}</strong>. Buku Register Surat Keluar & Masuk otomatis tersinkronisasi dengan Seksi Pelayanan dan Pengajuan TTD Kades/Sekdes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md flex flex-col justify-between text-white">
              <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">Total Surat Keluar</span>
              <span className="text-3xl font-black text-white mt-2">{registerInfo.totalSuratKeluar}</span>
              <span className="text-[10px] text-cyan-200 font-semibold mt-1">Register TU Terpadu</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md flex flex-col justify-between text-white">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">No. Reg Berikutnya</span>
              <span className="text-2xl font-black text-white mt-2 font-mono">{registerInfo.nextSeq}</span>
              <span className="text-[10px] text-blue-200 font-semibold mt-1 truncate">Urutan Terkini</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER NOTIFIKASI MUTASI BERKAS FISIK */}
      <PhysicalMutationAlertBanner role="KAUR_TU" />

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: BUKU REGISTER SURAT KELUAR TU (LIVE) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-600" />
                  <span>Buku Register Surat Keluar Desa</span>
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Tersinkronisasi otomatis dengan penerbitan persuratan di Seksi Pelayanan.
                </p>
              </div>

              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Register TU Real-Time
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Nomor Register Surat</th>
                    <th className="py-3.5 px-4">Pemohon / Penerima</th>
                    <th className="py-3.5 px-4">Perihal</th>
                    <th className="py-3.5 px-4">Penandatangan</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLetters.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                        {item.tanggal}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-black text-slate-900 whitespace-nowrap">
                        {item.nomorSurat}
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-slate-800">
                        {item.pengirimAtauPenerima}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {item.perihal}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {item.penandatangan === "SEKDES" ? "Sekdes (a.n. Kades)" : "Kades"}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          item.status.includes("Selesai")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          <CheckCircle2 size={11} />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recentLetters.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">
                  Belum ada register surat keluar hari ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COL: SOP REGISTER & PINTASAN */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Stamp size={16} />
              <span>SOP Register & Penomoran</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kaur TU & Umum memegang kendali buku register nomor surat desa. Setiap nomor surat yang diterbitkan otomatis mencatat perihal dan penandatangan (<strong>Kades</strong> atau <strong>Sekdes</strong>) untuk memastikan tidak terjadi nomor lompat atau ganda.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-cyan-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">Format Klasifikasi Resmi:</div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">SKU:</span>
                <span className="font-mono text-cyan-200">500.3/[SEQ] - Pem</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Kematian / Lahir:</span>
                <span className="font-mono text-cyan-200">400.12.3.1/[SEQ] - Pem</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">SKKM Kesra:</span>
                <span className="font-mono text-cyan-200">400.3.8.8/[SEQ] - Kesra</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-800">Pintasan Tata Usaha</h3>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/dashboard/surat"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all border border-slate-200 flex flex-col items-center justify-center gap-1.5"
              >
                <Printer size={18} className="text-blue-600" />
                <span className="text-[10px] font-black text-center">Buku Agenda</span>
              </Link>
              <Link
                href="/dashboard/aset"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all border border-slate-200 flex flex-col items-center justify-center gap-1.5"
              >
                <Boxes size={18} className="text-indigo-600" />
                <span className="text-[10px] font-black text-center">Aset Desa</span>
              </Link>
              <Link
                href="/dashboard?tab=buku-tamu"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all border border-slate-200 flex flex-col items-center justify-center gap-1.5"
              >
                <ClipboardList size={18} className="text-emerald-600" />
                <span className="text-[10px] font-black text-center">Buku Tamu</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
