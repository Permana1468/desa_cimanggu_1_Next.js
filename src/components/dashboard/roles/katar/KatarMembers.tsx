"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, MapPin, Briefcase, Trash2, X, UserCircle } from "lucide-react";
import { getKatarMembers, addKatarMember, deleteKatarMember } from "@/actions/katar";

interface Member {
  id: string;
  name: string;
  role: string;
  rt?: string | null;
  rw?: string | null;
  phone?: string | null;
  skills?: string | null;
  status: string;
}

export function KatarMembers({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Anggota", rt: "", rw: "", phone: "", skills: "", status: "Aktif" });

  const loadData = async () => {
    setLoading(true);
    const data = await getKatarMembers();
    setMembers(data as Member[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addKatarMember(form);
      setShowModal(false);
      setForm({ name: "", role: "Anggota", rt: "", rw: "", phone: "", skills: "", status: "Aktif" });
      loadData();
    } catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus anggota ini?")) return;
    await deleteKatarMember(id);
    loadData();
  };

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Database Keanggotaan</h2>
          <p className="text-slate-500 text-sm">Kelola data pemuda, pemetaan keahlian, dan status keaktifan.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input type="text" placeholder="Cari anggota..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-64 transition-all" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">
            <Plus size={16} /> Tambah Anggota
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 pl-6">Nama Anggota</th>
                <th className="p-4">Domisili</th>
                <th className="p-4">Keahlian</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center">
                  <UserCircle className="mx-auto text-slate-200 mb-2" size={36} />
                  <p className="text-slate-400 font-medium text-sm">Belum ada anggota terdaftar.</p>
                  <p className="text-slate-300 text-xs mt-1">Klik tombol "Tambah Anggota" untuk mendaftarkan anggota baru.</p>
                </td></tr>
              )}
              {!loading && filtered.map((member) => {
                const skills = member.skills ? member.skills.split(",").filter(Boolean) : [];
                return (
                  <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-800">{member.name}</span>
                          <span className="block text-xs font-semibold text-indigo-600">{member.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {member.rt || member.rw ? (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin size={13} className="text-slate-400" />
                          <span className="text-sm">RT {member.rt || "—"} / RW {member.rw || "—"}</span>
                        </div>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {skills.length > 0 ? skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium flex items-center gap-1">
                            <Briefcase size={9} /> {s.trim()}
                          </span>
                        )) : <span className="text-slate-300 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{member.phone || "—"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${member.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Anggota */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Tambah Anggota Baru</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap *</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all" placeholder="Contoh: Ahmad Fauzi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Jabatan/Peran</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Ketua</option><option>Sekretaris</option><option>Bendahara</option>
                    <option>Wakil Ketua</option><option>Anggota</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Aktif</option><option>Pasif</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">RT</label>
                  <input type="text" value={form.rt} onChange={e => setForm({ ...form, rt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="01" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">RW</label>
                  <input type="text" value={form.rw} onChange={e => setForm({ ...form, rw: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="02" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">No. HP / WhatsApp</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Keahlian/Minat (pisahkan dengan koma)</label>
                <input type="text" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Desain Grafis, Public Speaking" />
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
    </div>
  );
}
