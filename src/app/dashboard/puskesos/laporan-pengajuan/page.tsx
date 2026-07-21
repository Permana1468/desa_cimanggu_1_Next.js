"use client";

import React, { useState, useEffect } from "react";
import { getPuskesosPengaduan } from "@/actions/puskesos";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Activity, Printer, FileText, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function LaporanPengajuanPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = session?.user?.tenantId || "desa_cimanggu_1";

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPuskesosPengaduan(tenantId);
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data laporan pengajuan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase">Menunggu</span>;
      case "DIPROSES":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Diproses</span>;
      case "SELESAI":
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Selesai</span>;
      case "DITOLAK":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Ditolak</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" /> Laporan Pengajuan & Pengaduan
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Rekapitulasi seluruh pengajuan layanan dan pengaduan dari masyarakat.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
          >
            <Printer size={16} /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase">Laporan Pengajuan & Pengaduan</h1>
        <h2 className="text-xl">Layanan Puskesos Desa Cimanggu 1</h2>
        <p className="text-sm italic mt-2">Dicetak pada: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Tanggal Masuk</th>
                <th className="px-6 py-4">Identitas Warga</th>
                <th className="px-6 py-4">Jenis & Keterangan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Petugas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-slate-300 mb-2" />
                      <p>Belum ada catatan pengajuan atau pengaduan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(item.tanggalMasuk), "dd MMM yyyy", { locale: id })}
                      <div className="text-xs text-slate-400">{format(new Date(item.tanggalMasuk), "HH:mm")}</div>
                      {item.tanggalSelesai && (
                        <div className="text-[10px] text-emerald-600 mt-1">
                          Selesai: {format(new Date(item.tanggalSelesai), "dd/MM/yy")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.warga ? (
                        <>
                          <div className="font-semibold text-slate-800">{item.warga.namaLengkap}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">NIK: {item.warga.nik}</div>
                          <div className="text-xs text-slate-500 mt-0.5">RT {item.warga.rt} / RW {item.warga.rw}</div>
                        </>
                      ) : (
                        <div className="text-slate-500 italic">Data warga dihapus/tidak ditemukan</div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="font-semibold text-blue-700">{item.jenisPengaduan}</div>
                      <p className="text-slate-600 text-xs mt-1 line-clamp-2" title={item.deskripsi}>
                        {item.deskripsi}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      {item.petugas ? (
                        <span className="text-slate-700">{item.petugas.fullName}</span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Belum ditugaskan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
