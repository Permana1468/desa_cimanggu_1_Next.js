"use client";

import React, { useState, useEffect, useRef } from "react";
import { getPuskesosBukuTamu, createPuskesosBukuTamu } from "@/actions/puskesos";
import { useSession } from "next-auth/react";
import SignatureCanvas from "react-signature-canvas";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  FileText, Plus, X, Printer, User, CreditCard, 
  MapPin, Phone, MessageSquare, Loader2, Save 
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const formatAlamat = (input: string) => {
  let kp = "";
  let rt = "";
  let rw = "";

  const kpMatch = input.match(/(?:kp|kampung)\.?\s*([a-zA-Z\s]+?)(?=\s+rt|\s+rw|,|desa|kecamatan|kabupaten|$)/i);
  if (kpMatch) {
    kp = kpMatch[1].trim().toUpperCase();
  } else {
    const firstWordMatch = input.match(/^([a-zA-Z\s]+?)(?=\s+rt|\s+rw|,|desa|kecamatan|kabupaten|$)/i);
    if (firstWordMatch && firstWordMatch[1].trim()) {
      kp = firstWordMatch[1].trim().toUpperCase();
    }
  }

  const rtMatch = input.match(/rt\.?\s*(\d+)/i);
  if (rtMatch) {
    rt = rtMatch[1].padStart(3, '0');
  }

  const rwMatch = input.match(/rw\.?\s*(\d+)/i);
  if (rwMatch) {
    rw = rwMatch[1].padStart(3, '0');
  }

  let formatted = [];
  if (kp) formatted.push(`KP. ${kp}`);
  if (rt) formatted.push(`RT. ${rt}`);
  if (rw) formatted.push(`RW. ${rw}`);

  return formatted.join(" ");
};

export default function BukuTamuPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sigCanvas = useRef<any>({});

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    alamat: "",
    noHp: "",
    keperluan: "",
  });

  const tenantId = session?.user?.tenantId || "desa_cimanggu_1";

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPuskesosBukuTamu(tenantId);
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data buku tamu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.alamat || !formData.keperluan) {
      toast.error("Mohon lengkapi data yang wajib diisi!");
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      toast.error("Mohon berikan tanda tangan digital Anda!");
      return;
    }

    setSubmitting(true);
    try {
      const tandaTanganBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      await createPuskesosBukuTamu({
        ...formData,
        tenantId,
        tandaTangan: tandaTanganBase64,
      });
      toast.success("Data buku tamu berhasil disimpan");
      setShowForm(false);
      setFormData({
        namaLengkap: "",
        nik: "",
        alamat: "",
        noHp: "",
        keperluan: "",
      });
      clearSignature();
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Buku Tamu Puskesos
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Catatan kedatangan tamu dan masyarakat di layanan Puskesos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
          >
            <Printer size={16} /> Cetak Laporan
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm shadow-blue-500/20"
          >
            <Plus size={16} /> Tambah Tamu
          </button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase">Buku Tamu Layanan Puskesos</h1>
        <h2 className="text-xl font-bold">Desa Cimanggu 1</h2>
        <p className="text-sm italic mt-2">Dicetak pada: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Nama Lengkap & NIK</th>
                <th className="px-6 py-4">Alamat & Kontak</th>
                <th className="px-6 py-4">Keperluan</th>
                <th className="px-6 py-4 text-center">Tanda Tangan</th>
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
                      <p>Belum ada catatan buku tamu.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}<br/>
                      <span className="text-xs text-slate-400">{format(new Date(item.createdAt), "HH:mm")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{item.namaLengkap}</div>
                      {item.nik && <div className="text-xs text-slate-500 font-mono mt-0.5">NIK: {item.nik}</div>}
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="text-slate-700 truncate">{item.alamat}</div>
                      {item.noHp && <div className="text-xs text-slate-500 mt-0.5">{item.noHp}</div>}
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-slate-700 text-sm line-clamp-2">{item.keperluan}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-12 bg-white rounded border border-slate-200 mx-auto flex items-center justify-center overflow-hidden">
                        <img src={item.tandaTangan} alt="TTD" className="max-h-full max-w-full object-contain" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Tamu */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User size={18} className="text-blue-600" /> Form Buku Tamu
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="bukuTamuForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          required
                          value={formData.namaLengkap}
                          onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value.toUpperCase() })}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        NIK (Opsional)
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={formData.nik}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                          placeholder="16 digit NIK"
                          maxLength={16}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        Alamat <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                        <textarea
                          required
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value.toUpperCase() })}
                          onBlur={(e) => {
                            if (e.target.value) {
                              setFormData({ ...formData, alamat: formatAlamat(e.target.value) });
                            }
                          }}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[80px]"
                          placeholder="Contoh: Kp. Jatake RT. 002 RW. 005"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        No. HP (Opsional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={formData.noHp}
                          onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                          placeholder="08..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      Maksud / Keperluan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                      <textarea
                        required
                        value={formData.keperluan}
                        onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[80px]"
                        placeholder="Jelaskan keperluan kedatangan..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">
                        Tanda Tangan Digital <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Bersihkan
                      </button>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 cursor-crosshair">
                      <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{
                          className: "w-full h-[150px]",
                        }}
                        backgroundColor="rgba(255,255,255,1)"
                        penColor="black"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">Gambarlah tanda tangan Anda di dalam kotak di atas</p>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="bukuTamuForm"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm shadow-blue-500/20"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {submitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
