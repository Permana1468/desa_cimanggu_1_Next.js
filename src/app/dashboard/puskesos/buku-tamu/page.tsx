"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  getPuskesosBukuTamu, 
  createPuskesosBukuTamu, 
  updatePuskesosBukuTamu, 
  deletePuskesosBukuTamu 
} from "@/actions/puskesos";
import { useSession } from "next-auth/react";
import SignatureCanvas from "react-signature-canvas";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  FileText, Plus, X, Printer, User, CreditCard, 
  MapPin, Phone, MessageSquare, Loader2, Save,
  Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Briefcase
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

  const formatted = [];
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
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const sigCanvas = useRef<any>({});

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    alamat: "",
    jabatan: "",
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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      namaLengkap: "",
      nik: "",
      alamat: "",
      jabatan: "",
      noHp: "",
      keperluan: "",
    });
    setShowForm(true);
    setTimeout(() => clearSignature(), 100);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      namaLengkap: item.namaLengkap || "",
      nik: item.nik || "",
      alamat: item.alamat || "",
      jabatan: item.jabatan || "",
      noHp: item.noHp || "",
      keperluan: item.keperluan || "",
    });
    setShowForm(true);
    setTimeout(() => clearSignature(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.alamat || !formData.keperluan) {
      toast.error("Mohon lengkapi data yang wajib diisi!");
      return;
    }

    const hasSignature = sigCanvas.current && !sigCanvas.current.isEmpty();

    if (!editingItem && !hasSignature) {
      toast.error("Mohon berikan tanda tangan digital Anda!");
      return;
    }

    setSubmitting(true);
    try {
      let tandaTanganBase64: string | undefined = undefined;
      if (hasSignature) {
        tandaTanganBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      }

      if (editingItem) {
        await updatePuskesosBukuTamu(editingItem.id, {
          ...formData,
          tandaTangan: tandaTanganBase64,
        });
        toast.success("Data buku tamu berhasil diperbarui");
      } else {
        await createPuskesosBukuTamu({
          ...formData,
          tenantId,
          tandaTangan: tandaTanganBase64!,
        });
        toast.success("Data buku tamu berhasil disimpan");
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({
        namaLengkap: "",
        nik: "",
        alamat: "",
        jabatan: "",
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

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deletePuskesosBukuTamu(deleteItem.id);
      toast.success("Data buku tamu berhasil dihapus");
      setDeleteItem(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus data buku tamu");
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* CSS Isolasi Cetak (F4 Landscape & A4 Landscape) */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-area-buku-tamu, #print-area-buku-tamu * {
              visibility: visible !important;
            }
            #print-area-buku-tamu {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
            }
            @page {
              size: 330.2mm 215.9mm landscape; /* F4 Landscape */
              margin: 10mm;
            }
          }
        `
      }} />

      {/* Screen Area (Tampilan Dashboard) */}
      <div className="p-6 max-w-7xl mx-auto space-y-6 print:hidden">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <Printer size={16} /> Cetak Laporan (F4)
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm shadow-blue-500/20"
            >
              <Plus size={16} /> Tambah Tamu
            </button>
          </div>
        </div>

        {/* Table Section (Screen - 8 Kolom Resmi + Aksi) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center border-r border-slate-200">NO</th>
                  <th className="px-4 py-3 border-r border-slate-200">HARI</th>
                  <th className="px-4 py-3 border-r border-slate-200">TANGGAL</th>
                  <th className="px-4 py-3 border-r border-slate-200">NAMA</th>
                  <th className="px-4 py-3 border-r border-slate-200">ALAMAT</th>
                  <th className="px-4 py-3 border-r border-slate-200">MAKSUD TUJUAN</th>
                  <th className="px-4 py-3 border-r border-slate-200">NO. HP/TELEPON</th>
                  <th className="px-4 py-3 text-center border-r border-slate-200">TANDA TANGAN</th>
                  <th className="px-4 py-3 text-center">AKSI</th>
                </tr>
                <tr className="bg-slate-200/80 text-[11px] italic text-slate-600 font-semibold border-b border-slate-300">
                  <td className="py-1 text-center border-r border-slate-300">1</td>
                  <td className="py-1 text-center border-r border-slate-300">2</td>
                  <td className="py-1 text-center border-r border-slate-300">3</td>
                  <td className="py-1 text-center border-r border-slate-300">4</td>
                  <td className="py-1 text-center border-r border-slate-300">5</td>
                  <td className="py-1 text-center border-r border-slate-300">6</td>
                  <td className="py-1 text-center border-r border-slate-300">7</td>
                  <td className="py-1 text-center border-r border-slate-300">8</td>
                  <td className="py-1 text-center">-</td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Memuat data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="text-slate-300 mb-2" />
                        <p>Belum ada catatan buku tamu.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 text-center">{ (currentPage - 1) * itemsPerPage + index + 1 }</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                        {format(new Date(item.createdAt), "EEEE", { locale: id })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}<br/>
                        <span className="text-xs text-slate-400">{format(new Date(item.createdAt), "HH:mm")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{item.namaLengkap}</div>
                        {item.nik && <div className="text-xs text-slate-500 font-mono mt-0.5">NIK: {item.nik}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.alamat || item.jabatan || "-"}
                      </td>
                      <td className="px-4 py-3 max-w-[250px]">
                        <p className="text-slate-700 text-sm line-clamp-2">{item.keperluan}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {item.noHp || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-24 h-12 mx-auto flex items-center justify-center overflow-hidden">
                          <img src={item.tandaTangan} alt="TTD" className="max-h-full max-w-full object-contain border-none outline-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                            title="Edit Data"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 bg-slate-50/50">
              <div>
                Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, data.length)}</span> dari <span className="font-semibold text-slate-700">{data.length}</span> data
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                
                <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                  {Array.from({ length: Math.ceil(data.length / itemsPerPage) || 1 }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === (Math.ceil(data.length / itemsPerPage) || 1)}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(data.length / itemsPerPage) || 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Selanjutnya <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form Tambah / Edit Tamu */}
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
                    <User size={18} className="text-blue-600" /> {editingItem ? "Edit Data Buku Tamu" : "Form Buku Tamu"}
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
                          Jabatan / Instansi (Opsional)
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            value={formData.jabatan}
                            onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="Contoh: Pelaksana / Siswa"
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
                          Tanda Tangan Digital {!editingItem && <span className="text-red-500">*</span>}
                        </label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Bersihkan
                        </button>
                      </div>
                      {editingItem && (
                        <p className="text-xs text-slate-500 italic">
                          *Kosongkan jika tidak ingin mengubah tanda tangan digital yang sudah ada.
                        </p>
                      )}
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
                    {submitting ? "Menyimpan..." : editingItem ? "Perbarui Data" : "Simpan Data"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Konfirmasi Hapus */}
        <AnimatePresence>
          {deleteItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4"
              >
                <div className="flex items-center gap-3 text-red-600">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Hapus Data Buku Tamu</h3>
                    <p className="text-sm text-slate-500">Konfirmasi penghapusan data</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  Apakah Anda yakin ingin menghapus data buku tamu dari <strong className="text-slate-800">{deleteItem.namaLengkap}</strong>? Data yang dihapus tidak dapat dikembalikan.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setDeleteItem(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium shadow-sm shadow-red-500/20"
                  >
                    {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    {deleting ? "Menghapus..." : "Hapus Data"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Area Cetak Laporan Terisolasi F4 Landscape (Presisi 8 Kolom Resmi Puskesos) */}
      <div id="print-area-buku-tamu" className="hidden print:block p-4 bg-white text-black font-sans w-full">
        {/* Kop Surat Header Puskesos */}
        <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-2">
          <div className="w-[85px] flex items-center justify-center">
            <img src="/images/PUSKESOS-1.png" alt="Logo Puskesos" className="w-[85px] h-auto object-contain" />
          </div>
          <div className="flex-1 text-center font-serif leading-tight">
            <h2 className="text-[14px] font-semibold uppercase tracking-wide text-gray-800">PEMERINTAH KABUPATEN BOGOR</h2>
            <h3 className="text-[14px] font-semibold uppercase tracking-wide text-gray-800">KECAMATAN CIBUNGBULANG</h3>
            <h3 className="text-[15px] font-bold uppercase tracking-wide text-gray-900">DESA CIMANGGU I</h3>
            <h1 className="text-[19px] font-black uppercase tracking-wider text-black mt-0.5 mb-0.5">PUSAT KESEJAHTERAAN SOSIAL (PUSKESOS)</h1>
            <p className="text-[9.5px] font-sans text-gray-700">
              Kp. Ciaruteun RT.004 RW.008 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor – 16630
            </p>
          </div>
          <div className="w-[85px]"></div>
        </div>

        {/* Sub-header: Bulan & Judul */}
        <div className="flex justify-between items-end mb-2 pt-1 font-sans">
          <div className="text-xs font-semibold">
            Bulan : <span className="font-bold underline">{format(new Date(), "MMMM yyyy", { locale: id })}</span>
          </div>
          <div className="text-center font-extrabold text-sm uppercase tracking-wider">
            BUKU TAMU TAHUN {format(new Date(), "yyyy")}
          </div>
          <div className="w-24"></div>
        </div>

        {/* Tabel Cetak Laporan (Presisi 8 Kolom Resmi Puskesos) */}
        <table className="w-full text-xs text-left border-collapse border border-black">
          <thead className="bg-gray-200 text-black uppercase font-bold text-center border-b-2 border-black">
            <tr>
              <th className="p-2 border border-black w-[4%]">NO</th>
              <th className="p-2 border border-black w-[10%]">HARI</th>
              <th className="p-2 border border-black w-[12%]">TANGGAL</th>
              <th className="p-2 border border-black w-[20%] text-left">NAMA</th>
              <th className="p-2 border border-black w-[15%] text-left">ALAMAT</th>
              <th className="p-2 border border-black w-[20%] text-left">MAKSUD TUJUAN</th>
              <th className="p-2 border border-black w-[12%] text-left">NO. HP/TELEPON</th>
              <th className="p-2 border border-black w-[7%]">TANDA TANGAN</th>
            </tr>
            <tr className="bg-gray-300 text-[10px] italic font-semibold border-b border-black">
              <td className="py-0.5 border border-black">1</td>
              <td className="py-0.5 border border-black">2</td>
              <td className="py-0.5 border border-black">3</td>
              <td className="py-0.5 border border-black">4</td>
              <td className="py-0.5 border border-black">5</td>
              <td className="py-0.5 border border-black">6</td>
              <td className="py-0.5 border border-black">7</td>
              <td className="py-0.5 border border-black">8</td>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500 border border-black">
                  Belum ada catatan buku tamu.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="border border-black">
                  <td className="p-2 border border-black text-center font-semibold">{index + 1}</td>
                  <td className="p-2 border border-black text-center font-medium">
                    {format(new Date(item.createdAt), "EEEE", { locale: id })}
                  </td>
                  <td className="p-2 border border-black whitespace-nowrap">
                    {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                  </td>
                  <td className="p-2 border border-black">
                    <div className="font-bold text-slate-900">{item.namaLengkap}</div>
                    {item.nik && <div className="text-[9px] text-slate-600 font-mono">NIK: {item.nik}</div>}
                  </td>
                  <td className="p-2 border border-black">
                    <div className="text-slate-800">{item.alamat || item.jabatan || "-"}</div>
                  </td>
                  <td className="p-2 border border-black">
                    <p className="text-slate-800">{item.keperluan}</p>
                  </td>
                  <td className="p-2 border border-black whitespace-nowrap">
                    <span className="text-slate-800">{item.noHp || "-"}</span>
                  </td>
                  <td className="p-1 border border-black text-center">
                    <div className="w-16 h-8 mx-auto flex items-center justify-center overflow-hidden">
                      <img src={item.tandaTangan} alt="TTD" className="max-h-full max-w-full object-contain border-none outline-none" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}


