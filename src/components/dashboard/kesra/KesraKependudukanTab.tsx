"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getWargaList, addWarga, updateWarga } from "@/actions/village";
import { getFullVillageStructure as getVillageStructure } from "@/actions/rt";
import { WARGA_FIELDS, DEFAULT_WARGA_FORM } from "@/lib/wargaSchema";
import { formatWilayah, formatDusun } from "@/lib/formatters";

function HoverMask({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  if (!value) return <span>-</span>;
  const getMasked = (val: string) => {
      if (val.length <= 6) return "*".repeat(val.length);
      return val.substring(0, 6) + "*".repeat(val.length - 6);
  };
  return (
      <span 
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="cursor-help relative group"
      >
          {visible ? value : getMasked(value)}
      </span>
  );
}

export function KesraKependudukanTab({ _session }: any) {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(DEFAULT_WARGA_FORM);
  const [saving, setSaving] = useState(false);
  const [villageStructure, setVillageStructure] = useState<{ dusun: { name: string, rw: { name: string, rt: string[] }[] }[] } | null>(null);

  useEffect(() => {
    fetchData();
    fetchVillageStructure();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function fetchVillageStructure() {
    try {
      const data = await getVillageStructure();
      setVillageStructure(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getWargaList();
      setWarga(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const handleOpenAdd = () => {
    setFormData(DEFAULT_WARGA_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (w: any) => {
    setFormData({ ...w });
    setEditingId(w.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateWarga(editingId, formData);
      } else {
        await addWarga(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert("Gagal menyimpan data: " + error.message);
    }
    setSaving(false);
  };

  const filteredWarga = useMemo(() => {
    return warga.filter(w => 
      w.namaLengkap?.toLowerCase().includes(search.toLowerCase()) || 
      w.nik?.includes(search) || 
      w.noKK?.includes(search)
    );
  }, [warga, search]);

  const totalItems = filteredWarga.length;
  const effectiveLimit = itemsPerPage === "ALL" ? totalItems : itemsPerPage;
  const totalPages = Math.ceil(totalItems / (effectiveLimit || 1));

  const paginatedWarga = useMemo(() => {
    if (itemsPerPage === "ALL") return filteredWarga;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWarga.slice(start, start + itemsPerPage);
  }, [filteredWarga, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Data Kependudukan (Kesra)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data warga untuk keperluan kesejahteraan sosial (Tanpa akses Cetak).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-100/80">
            Total Terintegrasi: {warga.length} Jiwa
          </span>
          <button 
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 text-sm"
          >
            <Plus size={18} /> Tambah Warga
          </button>
        </div>
      </div>

      {/* Search & Limit Control */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari NIK, No KK, atau Nama Lengkap..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className="text-xs font-bold text-slate-500">Tampilkan:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const val = e.target.value === "ALL" ? "ALL" : Number(e.target.value);
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value={10}>10 Data</option>
            <option value={25}>25 Data</option>
            <option value={50}>50 Data</option>
            <option value={100}>100 Data</option>
            <option value="ALL">Semua Data</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">No KK / NIK</th>
                <th className="px-6 py-4">Identitas Warga</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat data kependudukan...</td>
                </tr>
              ) : paginatedWarga.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Users size={48} className="mb-4 text-slate-200" />
                      <p className="text-base font-medium text-slate-600">Tidak ada data warga</p>
                      <p className="text-sm">Gunakan pencarian lain atau tambahkan warga baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedWarga.map((w, idx) => (
                  <tr key={w.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800"><HoverMask value={w.noKK || ""} /></div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5"><HoverMask value={w.nik || ""} /></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 uppercase">{w.namaLengkap}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex gap-2">
                        <span>{w.jenisKelamin}</span>
                        <span>•</span>
                        <span>{w.tempatLahir}, {w.tanggalLahir ? new Date(w.tanggalLahir).toLocaleDateString("id-ID") : "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{w.alamat || w.kampung || "-"}</div>
                      <div className="text-xs font-bold text-emerald-600 mt-0.5">
                        {formatWilayah(w.rt, w.rw, w.dusun)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(w)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Edit size={16} />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
          <div className="text-slate-500 font-bold">
            {totalItems === 0
              ? "Tidak ada data warga."
              : itemsPerPage === "ALL"
              ? `Menampilkan seluruh ${totalItems} data warga terintegrasi.`
              : `Menampilkan ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)} dari ${totalItems} data warga terintegrasi.`}
          </div>

          {itemsPerPage !== "ALL" && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (currentPage > 3 && totalPages > 5) {
                  if (currentPage + 2 <= totalPages) {
                    pageNum = currentPage - 3 + i + 1;
                  } else {
                    pageNum = totalPages - 5 + i + 1;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                      currentPage === pageNum
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Update Data Kependudukan" : "Tambah Warga Baru"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WARGA_FIELDS.map((field) => {
                  if (field.key === "dusun") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{field.label}</label>
                        <select
                          required={field.required}
                          value={formData.dusun}
                          onChange={e => setFormData({...formData, dusun: e.target.value, rw: "", rt: ""})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                        >
                          <option value="">- Pilih Dusun -</option>
                          {villageStructure?.dusun?.map(d => (
                            <option key={d.name} value={d.name}>{formatDusun(d.name)}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (field.key === "rw") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{field.label}</label>
                        <select
                          required={field.required}
                          value={formData.rw}
                          onChange={e => setFormData({...formData, rw: e.target.value, rt: ""})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                          disabled={!formData.dusun}
                        >
                          <option value="">- Pilih RW -</option>
                          {villageStructure?.dusun?.find(d => d.name === formData.dusun)?.rw.map(r => (
                            <option key={r.name} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (field.key === "rt") {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{field.label}</label>
                        <select
                          required={field.required}
                          value={formData.rt}
                          onChange={e => setFormData({...formData, rt: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                          disabled={!formData.rw}
                        >
                          <option value="">- Pilih RT -</option>
                          {villageStructure?.dusun?.find(d => d.name === formData.dusun)?.rw.find(r => r.name === formData.rw)?.rt.map(rt => (
                            <option key={rt} value={rt}>{rt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        required={field.required}
                        value={formData[field.key] || ""}
                        onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">- Pilih -</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === "date" ? (
                      <input
                        type="date"
                        required={field.required}
                        value={formData[field.key] ? new Date(formData[field.key]).toISOString().split('T')[0] : ""}
                        onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ""}
                        onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    )}
                  </div>
                )})}
              </div>
              
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                  {saving ? "Menyimpan..." : (editingId ? "Update Data" : "Simpan Warga")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
