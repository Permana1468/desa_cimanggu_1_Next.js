"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Users, X } from "lucide-react";
import { getWargaList, addWarga, updateWarga } from "@/actions/village";
import { getFullVillageStructure as getVillageStructure } from "@/actions/rt";
import { WARGA_FIELDS, DEFAULT_WARGA_FORM } from "@/lib/wargaSchema";

export function KesraKependudukanTab({ session }: any) {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
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

  const filteredWarga = warga.filter(w => 
    w.namaLengkap?.toLowerCase().includes(search.toLowerCase()) || 
    w.nik?.includes(search) || 
    w.noKK?.includes(search)
  );

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
        <button 
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Plus size={18} /> Tambah Warga
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
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
              ) : filteredWarga.length === 0 ? (
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
                filteredWarga.map((w, idx) => (
                  <tr key={w.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{w.noKK || "-"}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{w.nik || "-"}</div>
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
                        RT {w.rt || "-"} / RW {w.rw || "-"} {w.dusun ? `- Dusun ${w.dusun}` : ""}
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
                        {/* Cetak button intentionally omitted as per requirement */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                            <option key={d.name} value={d.name}>{d.name}</option>
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
