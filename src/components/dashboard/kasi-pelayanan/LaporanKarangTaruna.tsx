"use client";

import { motion } from "framer-motion";
import { 
  UserCircle,
  Trophy,
  Users,
  Activity,
  Download,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export function LaporanKarangTaruna({ session }: { session: any }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <UserCircle className="text-blue-500" /> 
                Laporan Karang Taruna
            </h1>
            <p className="text-slate-500 text-sm mt-1">Kegiatan kepemudaan, keanggotaan, dan prestasi.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Download size={18} /> Unduh Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
              <Users size={32} className="mb-4 text-blue-100 relative z-10" />
              <h3 className="text-3xl font-black mb-1 relative z-10">145</h3>
              <p className="text-blue-100 text-sm relative z-10">Anggota Aktif</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
              <Activity size={32} className="mb-4 text-emerald-100 relative z-10" />
              <h3 className="text-3xl font-black mb-1 relative z-10">12</h3>
              <p className="text-emerald-100 text-sm relative z-10">Kegiatan (Tahun Ini)</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
              <Trophy size={32} className="mb-4 text-amber-100 relative z-10" />
              <h3 className="text-3xl font-black mb-1 relative z-10">3</h3>
              <p className="text-amber-100 text-sm relative z-10">Prestasi Diraih</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  Kegiatan Terdekat
              </h2>
              <div className="space-y-4">
                  {[
                      { title: "Turnamen Voli Antar RW", date: "12 Agustus 2026", status: "Persiapan" },
                      { title: "Bakti Sosial Bersih Desa", date: "17 Agustus 2026", status: "Terjadwal" },
                      { title: "Pelatihan Wirausaha Muda", date: "05 September 2026", status: "Menunggu Dana" }
                  ].map((kegiatan, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                              <p className="font-bold text-slate-800">{kegiatan.title}</p>
                              <p className="text-xs text-slate-500 font-bold mt-1">{kegiatan.date}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md text-center ${
                              kegiatan.status === 'Persiapan' ? 'bg-indigo-100 text-indigo-700' :
                              kegiatan.status === 'Terjadwal' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                              {kegiatan.status}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <ImageIcon className="text-blue-600" />
                  Dokumentasi Terbaru
              </h2>
              <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-video bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                          <ImageIcon size={24} className="mb-2 text-slate-300" />
                          <span className="text-[10px] font-bold">Foto_{i}.jpg</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
