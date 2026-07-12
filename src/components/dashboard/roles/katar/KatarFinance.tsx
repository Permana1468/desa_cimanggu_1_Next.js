"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, ArrowUpRight, ArrowDownRight, Search, X, Trash2, Banknote } from "lucide-react";
import { getKatarFinances, addKatarFinance, deleteKatarFinance } from "@/actions/katar";

interface Finance { id: string; date: Date; description: string; type: string; amount: number; receiptUrl?: string | null; }

export function KatarFinance({ session }: { session: any }) {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"in" | "out">("in");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", receiptUrl: "" });

  const loadData = async () => {
    setLoading(true);
    const data = await getKatarFinances();
    setFinances(data as Finance[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addKatarFinance({ description: form.description, amount: Number(form.amount), type: modalType, receiptUrl: form.receiptUrl || undefined });
      setShowModal(false);
      setForm({ description: "", amount: "", receiptUrl: "" });
      loadData();
    } catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteKatarFinance(id);
    loadData();
  };

  const totalMasuk = finances.filter((f) => f.type === "in").reduce((a, f) => a + f.amount, 0);
  const totalKeluar = finances.filter((f) => f.type === "out").reduce((a, f) => a + f.amount, 0);
  const saldo = totalMasuk - totalKeluar;
  const fmt = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  const filtered = finances.filter((f) => f.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Keuangan</h2>
          <p className="text-slate-500 text-sm">Buku kas digital, pencatatan pemasukan & pengeluaran, dan bukti nota.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setModalType("in"); setShowModal(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0">
            <Plus size={15} /> Pemasukan
          </button>
          <button onClick={() => { setModalType("out"); setShowModal(true); }}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all shrink-0">
            <Plus size={15} /> Pengeluaran
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] p-6 text-white">
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Saldo Kas Aktif</p>
          <p className="text-3xl font-black">{fmt(saldo)}</p>
          <p className="text-indigo-300 text-xs mt-2">{finances.length} transaksi tercatat</p>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight size={18} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pemasukan</span>
          </div>
          <p className="text-xl font-black text-emerald-600">{fmt(totalMasuk)}</p>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
              <ArrowUpRight size={18} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pengeluaran</span>
          </div>
          <p className="text-xl font-black text-rose-500">{fmt(totalKeluar)}</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-800">Riwayat Transaksi</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-48 focus:border-indigo-400 transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 pl-6">Tanggal</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Tipe</th>
                <th className="p-4 text-right">Nominal</th>
                <th className="p-4 text-center">Bukti Nota</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center">
                  <Banknote className="mx-auto text-slate-200 mb-2" size={40} />
                  <p className="text-slate-400 font-medium text-sm">Belum ada transaksi tercatat.</p>
                  <p className="text-slate-300 text-xs mt-1">Klik tombol "Pemasukan" atau "Pengeluaran" untuk mencatat transaksi.</p>
                </td></tr>
              )}
              {!loading && filtered.map((f) => (
                <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 text-slate-500 text-xs">{new Date(f.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="p-4 font-medium text-slate-800">{f.description}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${f.type === "in" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                      {f.type === "in" ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                      {f.type === "in" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-black ${f.type === "in" ? "text-emerald-600" : "text-rose-500"}`}>
                    {f.type === "out" ? "− " : "+ "}{fmt(f.amount)}
                  </td>
                  <td className="p-4 text-center">
                    {f.receiptUrl ? (
                      <a href={f.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">Lihat Nota</a>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
              <h3 className="text-xl font-black text-slate-800">{modalType === "in" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan *</label>
                <input required type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Contoh: Iuran Bulanan" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp) *</label>
                <input required type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="50000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Link Bukti Nota (Opsional)</label>
                <input type="url" value={form.receiptUrl} onChange={e => setForm({ ...form, receiptUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="https://drive.google.com/..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100">Batal</button>
                <button type="submit" disabled={saving} className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 ${modalType === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-500 hover:bg-rose-600"}`}>
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
