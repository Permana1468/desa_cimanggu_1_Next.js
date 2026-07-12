"use client";

import React, { useState, useEffect } from "react";
import { Store, Briefcase, Plus, TrendingUp, MapPin, X, Trash2 } from "lucide-react";
import { getKatarUmkms, addKatarUmkm, deleteKatarUmkm, getKatarLokers, addKatarLoker, deleteKatarLoker } from "@/actions/katar";

interface Umkm { id: string; name: string; owner: string; category: string; income?: string | null; address?: string | null; phone?: string | null; status: string; }
interface Loker { id: string; title: string; company: string; type: string; location?: string | null; description?: string | null; salary?: string | null; }

export function KatarEconomy({ session }: { session: any }) {
  const [umkms, setUmkms] = useState<Umkm[]>([]);
  const [lokers, setLokers] = useState<Loker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUmkmModal, setShowUmkmModal] = useState(false);
  const [showLokerModal, setShowLokerModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [umkmForm, setUmkmForm] = useState({ name: "", owner: "", category: "F&B", income: "", address: "", phone: "", status: "Aktif" });
  const [lokerForm, setLokerForm] = useState({ title: "", company: "", type: "Full-time", location: "", description: "", salary: "" });

  const loadData = async () => {
    setLoading(true);
    const [u, l] = await Promise.all([getKatarUmkms(), getKatarLokers()]);
    setUmkms(u as Umkm[]);
    setLokers(l as Loker[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddUmkm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await addKatarUmkm(umkmForm); setShowUmkmModal(false); setUmkmForm({ name: "", owner: "", category: "F&B", income: "", address: "", phone: "", status: "Aktif" }); loadData(); }
    catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleAddLoker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await addKatarLoker(lokerForm); setShowLokerModal(false); setLokerForm({ title: "", company: "", type: "Full-time", location: "", description: "", salary: "" }); loadData(); }
    catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pemberdayaan Ekonomi (UEP)</h2>
          <p className="text-slate-500 text-sm">Direktori Usaha Ekonomi Produktif (UEP) pemuda dan informasi lowongan kerja.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUmkmModal(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all shrink-0">
            <Plus size={16} /> Daftar UMKM
          </button>
          <button onClick={() => setShowLokerModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">
            <Plus size={16} /> Posting Loker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UMKM Panel */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Store className="text-amber-500" size={18} /> Direktori UMKM Pemuda</h3>
          </div>
          <div className="p-4 space-y-3">
            {loading && <p className="text-slate-400 text-sm text-center py-6">Memuat...</p>}
            {!loading && umkms.length === 0 && (
              <div className="text-center py-8">
                <Store className="mx-auto text-slate-200 mb-2" size={36} />
                <p className="text-slate-400 text-sm">Belum ada UMKM terdaftar.</p>
              </div>
            )}
            {!loading && umkms.map((umkm) => (
              <div key={umkm.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{umkm.name}</h4>
                    <p className="text-xs text-slate-500">Pemilik: {umkm.owner} • {umkm.category}</p>
                    {umkm.address && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {umkm.address}</p>}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="block px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold uppercase">{umkm.status}</span>
                  {umkm.income && <span className="text-xs font-black text-slate-600">{umkm.income}</span>}
                  <button onClick={() => { if(confirm("Hapus UMKM ini?")) deleteKatarUmkm(umkm.id).then(loadData); }}
                    className="text-red-400 hover:text-red-600 mt-1"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loker Panel */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Briefcase className="text-indigo-500" size={18} /> Lowongan Kerja Lokal</h3>
          </div>
          <div className="p-4 space-y-3">
            {loading && <p className="text-slate-400 text-sm text-center py-6">Memuat...</p>}
            {!loading && lokers.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="mx-auto text-slate-200 mb-2" size={36} />
                <p className="text-slate-400 text-sm">Belum ada lowongan kerja.</p>
              </div>
            )}
            {!loading && lokers.map((job) => (
              <div key={job.id} className="p-4 border border-slate-100 rounded-2xl bg-indigo-50/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-sm">{job.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold uppercase">{job.type}</span>
                    <button onClick={() => { if(confirm("Hapus loker ini?")) deleteKatarLoker(job.id).then(loadData); }}
                      className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">{job.company}</span>
                  {job.location && <><span>•</span><span className="flex items-center gap-1"><MapPin size={11}/> {job.location}</span></>}
                  {job.salary && <><span>•</span><span className="text-emerald-600 font-semibold">{job.salary}</span></>}
                </div>
                {job.description && <p className="text-xs text-slate-500 leading-relaxed">{job.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal UMKM */}
      {showUmkmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Daftar UMKM Baru</h3>
              <button onClick={() => setShowUmkmModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddUmkm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Usaha *</label>
                <input required type="text" value={umkmForm.name} onChange={e => setUmkmForm({ ...umkmForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-sm" placeholder="Kopi Pemuda Cimanggu" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pemilik *</label>
                  <input required type="text" value={umkmForm.owner} onChange={e => setUmkmForm({ ...umkmForm, owner: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-sm" placeholder="Nama Pemilik" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                  <select value={umkmForm.category} onChange={e => setUmkmForm({ ...umkmForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-sm">
                    <option>F&B</option><option>Fashion</option><option>Jasa</option><option>Kerajinan</option><option>Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Estimasi Omzet/Bulan</label>
                <input type="text" value={umkmForm.income} onChange={e => setUmkmForm({ ...umkmForm, income: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-sm" placeholder="Rp 3.5 Juta" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Alamat Usaha</label>
                <input type="text" value={umkmForm.address} onChange={e => setUmkmForm({ ...umkmForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-sm" placeholder="RT 03 / RW 02" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowUmkmModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Loker */}
      {showLokerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Posting Lowongan Kerja</h3>
              <button onClick={() => setShowLokerModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddLoker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Posisi/Jabatan *</label>
                <input required type="text" value={lokerForm.title} onChange={e => setLokerForm({ ...lokerForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Barista Part-time" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Perusahaan *</label>
                  <input required type="text" value={lokerForm.company} onChange={e => setLokerForm({ ...lokerForm, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Nama UMKM" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tipe</label>
                  <select value={lokerForm.type} onChange={e => setLokerForm({ ...lokerForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>Full-time</option><option>Part-time</option><option>Magang</option><option>Freelance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lokasi</label>
                <input type="text" value={lokerForm.location} onChange={e => setLokerForm({ ...lokerForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="RT 03/02" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Gaji / Upah</label>
                <input type="text" value={lokerForm.salary} onChange={e => setLokerForm({ ...lokerForm, salary: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="UMK / Negotiable" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Pekerjaan</label>
                <textarea value={lokerForm.description} onChange={e => setLokerForm({ ...lokerForm, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm resize-none" placeholder="Persyaratan, jobdesk, dsb..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowLokerModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100">Batal</button>
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
