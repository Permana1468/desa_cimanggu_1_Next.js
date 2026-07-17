"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Users, CalendarDays, TrendingUp } from "lucide-react";
import { getKatarPrograms, addKatarProgram, updateKatarProgramProgress, deleteKatarProgram } from "@/actions/katar";

interface Program {
  id: string;
  title: string;
  description?: string | null;
  panitia: number;
  progress: number;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export function KatarPrograms({ session }: { session: any }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", panitia: 0, progress: 0, status: "Persiapan", startDate: "", endDate: "" });
  const [updateForm, setUpdateForm] = useState({ progress: 0, status: "Persiapan" });

  const loadData = async () => {
    setLoading(true);
    const data = await getKatarPrograms();
    setPrograms(data as Program[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addKatarProgram(form);
      setShowModal(false);
      setForm({ title: "", description: "", panitia: 0, progress: 0, status: "Persiapan", startDate: "", endDate: "" });
      loadData();
    } catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUpdateModal) return;
    setSaving(true);
    try {
      await updateKatarProgramProgress(showUpdateModal.id, updateForm.progress, updateForm.status);
      setShowUpdateModal(null);
      loadData();
    } catch { alert("Gagal memperbarui data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus program kerja ini?")) return;
    await deleteKatarProgram(id);
    loadData();
  };

  const statusColor = (s: string) =>
    s === "Selesai" ? "bg-emerald-100 text-emerald-700" :
    s === "Berjalan" ? "bg-blue-100 text-blue-700" :
    "bg-amber-100 text-amber-700";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pemantauan Program Kerja</h2>
          <p className="text-slate-500 text-sm">Daftar rencana kegiatan, pembagian kepanitiaan, dan indikator status acara.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">
          <Plus size={18} /> Rencanakan Proker
        </button>
      </div>

      {loading && <p className="text-slate-400 text-center py-12">Memuat data...</p>}

      {!loading && programs.length === 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
          <CalendarDays className="mx-auto text-slate-200 mb-3" size={44} />
          <p className="text-slate-400 font-medium">Belum ada program kerja.</p>
          <p className="text-slate-300 text-xs mt-1">Klik tombol &quot;Rencanakan Proker&quot; untuk memulai.</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((proker) => (
            <div key={proker.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${statusColor(proker.status)}`}>
                  {proker.status}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users size={13} /> <span className="text-xs font-bold">{proker.panitia} Panitia</span>
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{proker.title}</h3>
              {proker.description && <p className="text-xs text-slate-500 mb-2">{proker.description}</p>}
              {(proker.startDate || proker.endDate) && (
                <p className="text-xs text-slate-400 font-medium mb-4">
                  {proker.startDate && new Date(proker.startDate).toLocaleDateString("id-ID")} 
                  {proker.startDate && proker.endDate ? " – " : ""}
                  {proker.endDate && new Date(proker.endDate).toLocaleDateString("id-ID")}
                </p>
              )}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Progres</span>
                  <span className={proker.progress === 100 ? "text-emerald-600" : "text-blue-600"}>{proker.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${proker.progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${proker.progress}%` }} />
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                <button onClick={() => { setShowUpdateModal(proker); setUpdateForm({ progress: proker.progress, status: proker.status }); }}
                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                  <TrendingUp size={13} /> Update Status
                </button>
                <button onClick={() => handleDelete(proker.id)} className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Proker */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Rencanakan Program Kerja</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Program Kerja *</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Turnamen Voli Antar RW" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Kegiatan</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm resize-none" placeholder="Deskripsi singkat program kerja..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah Panitia</label>
                  <input type="number" min="0" value={form.panitia} onChange={e => setForm({ ...form, panitia: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status Awal</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Persiapan</option><option>Berjalan</option><option>Selesai</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Mulai</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Selesai</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-all">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Progress */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800">Update Progres</h3>
              <button onClick={() => setShowUpdateModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4 font-medium">{showUpdateModal.title}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Progres ({updateForm.progress}%)</label>
                <input type="range" min="0" max="100" step="5" value={updateForm.progress} onChange={e => setUpdateForm({ ...updateForm, progress: +e.target.value })}
                  className="w-full accent-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                <select value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                  <option>Persiapan</option><option>Berjalan</option><option>Selesai</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowUpdateModal(null)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
