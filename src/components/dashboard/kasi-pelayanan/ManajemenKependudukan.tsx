"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  RefreshCcw, 
  Search, 
  FileText,
  AlertCircle
} from "lucide-react";

export function ManajemenKependudukan({ session }: { session: any }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Manajemen Kependudukan</h1>
            <p className="text-slate-500 text-sm mt-1">Mutasi warga dan pencatatan peristiwa kependudukan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Kiri */}
          <div className="lg:col-span-1 space-y-4">
              <button className="w-full text-left bg-emerald-600 text-white p-6 rounded-[2rem] shadow-lg shadow-emerald-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
                  <UserPlus size={32} className="mb-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-xl mb-1">Mutasi Masuk</h3>
                  <p className="text-emerald-100 text-sm">Registrasi warga pindahan baru.</p>
              </button>

              <button className="w-full text-left bg-rose-600 text-white p-6 rounded-[2rem] shadow-lg shadow-rose-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
                  <UserMinus size={32} className="mb-4 text-rose-200 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-xl mb-1">Mutasi Keluar</h3>
                  <p className="text-rose-100 text-sm">Pencatatan warga pindah / meninggal.</p>
              </button>

              <button className="w-full text-left bg-indigo-600 text-white p-6 rounded-[2rem] shadow-lg shadow-indigo-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
                  <RefreshCcw size={32} className="mb-4 text-indigo-200 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-xl mb-1">Peristiwa Lainnya</h3>
                  <p className="text-indigo-100 text-sm">Kelahiran, perubahan KK, dll.</p>
              </button>
          </div>

          {/* Form Pencarian Induk Kependudukan */}
          <div className="lg:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
              >
                  <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <Search className="text-indigo-600" />
                      Cari Data Induk Kependudukan
                  </h2>
                  <div className="flex gap-4 mb-8">
                      <input 
                          type="text" 
                          placeholder="Masukkan NIK atau No. KK..." 
                          className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                      <button className="px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                          Cari Data
                      </button>
                  </div>

                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                      <FileText size={48} className="mb-4 text-slate-300" />
                      <p className="font-bold">Data warga akan muncul di sini</p>
                      <p className="text-sm mt-1">Lakukan pencarian terlebih dahulu.</p>
                  </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-50 rounded-[2rem] p-6 border border-amber-200 flex gap-4"
              >
                  <AlertCircle size={24} className="text-amber-600 shrink-0" />
                  <div>
                      <h3 className="font-bold text-amber-800 mb-1">Integrasi Data Induk</h3>
                      <p className="text-amber-700/80 text-sm">
                          Setiap perubahan mutasi (masuk/keluar) yang dilakukan melalui panel ini akan secara otomatis terhubung dan memperbarui master database kependudukan utama desa. Pastikan data sudah valid sebelum disimpan.
                      </p>
                  </div>
              </motion.div>
          </div>
      </div>
    </div>
  );
}
