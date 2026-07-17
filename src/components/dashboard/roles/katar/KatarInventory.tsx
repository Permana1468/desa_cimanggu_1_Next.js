"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Plus, X, Trash2 } from "lucide-react";
import { getKatarInventories, addKatarInventory, deleteKatarInventory } from "@/actions/katar";

interface Inventory { id: string; name: string; category: string; quantity: number; condition: string; status: string; loans?: any[]; }

export function KatarInventory({ session }: { session: any }) {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Peralatan Event", quantity: 1, condition: "Baik", status: "Tersedia" });

  const loadData = async () => {
    setLoading(true);
    const data = await getKatarInventories();
    setItems(data as Inventory[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addKatarInventory(form);
      setShowModal(false);
      setForm({ name: "", category: "Peralatan Event", quantity: 1, condition: "Baik", status: "Tersedia" });
      loadData();
    } catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus barang ini dari inventaris?")) return;
    await deleteKatarInventory(id);
    loadData();
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const conditionBadge = (c: string) =>
    c === "Baik" ? "bg-emerald-100 text-emerald-700" :
    c === "Rusak Ringan" ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sistem Inventaris</h2>
          <p className="text-slate-500 text-sm">Katalog aset barang organisasi beserta status ketersediaan dan kondisinya.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input type="text" placeholder="Cari barang..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none w-52 focus:border-indigo-400 transition-all" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">
            <Plus size={16} /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Item", value: items.length, color: "indigo" },
          { label: "Tersedia", value: items.filter(i => i.status === "Tersedia").length, color: "emerald" },
          { label: "Dipinjam", value: items.filter(i => i.status === "Dipinjam").length, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-2xl p-4 text-center`}>
            <span className={`text-2xl font-black text-${stat.color}-700`}>{stat.value}</span>
            <p className={`text-[10px] font-bold text-${stat.color}-500 uppercase tracking-widest mt-1`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 pl-6">Nama Barang</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-center">Jumlah</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center">
                  <Package className="mx-auto text-slate-200 mb-2" size={40} />
                  <p className="text-slate-400 font-medium text-sm">Belum ada barang terdaftar.</p>
                  <p className="text-slate-300 text-xs mt-1">Klik &quot;Tambah Barang&quot; untuk mendaftarkan aset pertama.</p>
                </td></tr>
              )}
              {!loading && filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Package size={16} />
                      </div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 text-center font-black text-slate-700">{item.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${conditionBadge(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === "Tersedia" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
              <h3 className="text-xl font-black text-slate-800">Tambah Barang Inventaris</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Barang *</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Tenda Pleton 5x5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Peralatan Event</option><option>Olahraga</option><option>Sound System</option>
                    <option>Dekorasi</option><option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah</label>
                  <input required type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kondisi</label>
                  <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Tersedia</option><option>Dipinjam</option>
                  </select>
                </div>
              </div>
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
