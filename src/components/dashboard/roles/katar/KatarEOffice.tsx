"use client";

import React, { useState, useEffect } from "react";
import { Mail, Plus, X, Trash2, Inbox, Send } from "lucide-react";
import { getKatarSurats, addKatarSurat, deleteKatarSurat } from "@/actions/katar";

interface Surat { id: string; noSurat: string; type: string; perihal: string; pengirim?: string | null; tujuan?: string | null; tanggal: Date; status: string; }

export function KatarEOffice({ session }: { session: any }) {
  const [surats, setSurats] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"masuk" | "keluar">("masuk");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ noSurat: "", perihal: "", pengirim: "", tujuan: "" });

  const loadData = async () => {
    setLoading(true);
    const data = await getKatarSurats();
    setSurats(data as Surat[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addKatarSurat({ noSurat: form.noSurat, perihal: form.perihal, type: activeTab, pengirim: form.pengirim || undefined, tujuan: form.tujuan || undefined });
      setShowModal(false);
      setForm({ noSurat: "", perihal: "", pengirim: "", tujuan: "" });
      loadData();
    } catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus surat ini?")) return;
    await deleteKatarSurat(id);
    loadData();
  };

  const filtered = surats.filter((s) => s.type === activeTab);

  const statusBadge = (s: string) =>
    s === "Dibaca" || s === "Terkirim" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Administrasi & Persuratan (E-Office)</h2>
          <p className="text-slate-500 text-sm">Pencatatan dan manajemen surat masuk & surat keluar organisasi.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">
          <Plus size={18} /> Buat Surat {activeTab === "masuk" ? "Masuk" : "Keluar"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><Inbox size={18} /></div>
          <div>
            <p className="text-2xl font-black text-indigo-700">{surats.filter(s => s.type === "masuk").length}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Surat Masuk</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Send size={18} /></div>
          <div>
            <p className="text-2xl font-black text-purple-700">{surats.filter(s => s.type === "keluar").length}</p>
            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Surat Keluar</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {(["masuk", "keluar"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab === "masuk" ? "📥 Surat Masuk" : "📤 Surat Keluar"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 pl-6">No. Surat</th>
                <th className="p-4">Perihal</th>
                <th className="p-4">{activeTab === "masuk" ? "Pengirim" : "Tujuan"}</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center">
                  <Mail className="mx-auto text-slate-200 mb-2" size={40} />
                  <p className="text-slate-400 font-medium text-sm">Belum ada surat {activeTab} tercatat.</p>
                  <p className="text-slate-300 text-xs mt-1">Klik tombol di atas untuk menambahkan surat.</p>
                </td></tr>
              )}
              {!loading && filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-mono text-xs text-indigo-600 font-bold">{s.noSurat}</td>
                  <td className="p-4 font-medium text-slate-800">{s.perihal}</td>
                  <td className="p-4 text-slate-600">{s.type === "masuk" ? (s.pengirim || "—") : (s.tujuan || "—")}</td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(s.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Catat Surat {activeTab === "masuk" ? "Masuk" : "Keluar"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Surat *</label>
                <input required type="text" value={form.noSurat} onChange={e => setForm({ ...form, noSurat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm font-mono" placeholder="01/KT-CMG/VII/2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Perihal / Judul Surat *</label>
                <input required type="text" value={form.perihal} onChange={e => setForm({ ...form, perihal: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Undangan Rapat Koordinasi" />
              </div>
              {activeTab === "masuk" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pengirim *</label>
                  <input required type="text" value={form.pengirim} onChange={e => setForm({ ...form, pengirim: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Pemerintah Desa / Kecamatan" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ditujukan Kepada *</label>
                  <input required type="text" value={form.tujuan} onChange={e => setForm({ ...form, tujuan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Yth. Kepala Desa" />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
