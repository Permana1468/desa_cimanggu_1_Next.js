"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, CalendarClock, Plus, CheckCircle2, UserX } from "lucide-react";
import { getPosyanduAbsensi, addPosyanduAbsensi, deletePosyanduAbsensi } from "@/actions/posyandu-baru";

const PERAN = ["KADER_POSYANDU", "BIDAN", "PETUGAS_PUSKESMAS", "LAINNYA"];
const STATUS = ["HADIR", "IZIN", "SAKIT", "ALPA"];

export function PosyanduJadwalAbsensiTab({ session }: any) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getPosyanduAbsensi();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus catatan absensi ini?")) {
      setLoading(true);
      await deletePosyanduAbsensi(id);
      await fetchData();
    }
  };

  const filteredData = data.filter(d => 
    d.namaKader.toLowerCase().includes(search.toLowerCase()) || 
    d.posyanduName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-teal-500" />
            Kehadiran & Absensi Petugas
          </h2>
          <p className="text-slate-500 text-sm mt-1">Lacak kehadiran kader dan petugas pada hari buka posyandu.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Input Kehadiran
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Kehadiran</p>
            <p className="text-2xl font-black text-slate-800">{data.filter(d => d.status === "HADIR").length} <span className="text-sm font-normal text-slate-500">Kader</span></p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm">
            <UserX size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Tidak Hadir (Izin/Sakit/Alpa)</p>
            <p className="text-2xl font-black text-slate-800">{data.filter(d => d.status !== "HADIR").length} <span className="text-sm font-normal text-slate-500">Kader</span></p>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kader atau posyandu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Posyandu</th>
                <th className="px-4 py-3 font-semibold">Nama Petugas/Kader</th>
                <th className="px-4 py-3 font-semibold">Peran</th>
                <th className="px-4 py-3 font-semibold">Status Kehadiran</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 font-semibold text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-500" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Belum ada catatan absensi.</td>
                </tr>
              ) : (
                filteredData.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{new Date(d.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3">{d.posyanduName}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{d.namaKader}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">{d.peran.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${d.status === 'HADIR' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{d.keterangan || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-lg text-[10px]">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalFormAbsensi onClose={() => setShowModal(false)} onRefresh={fetchData} />
      )}
    </div>
  );
}

function ModalFormAbsensi({ onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    await addPosyanduAbsensi({
      posyanduName: fd.get("posyanduName"),
      namaKader: fd.get("namaKader"),
      peran: fd.get("peran"),
      tanggal: fd.get("tanggal"),
      status: fd.get("status"),
      keterangan: fd.get("keterangan")
    });
    
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Catat Kehadiran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Absensi Kader Posyandu</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal *</label>
              <input type="date" name="tanggal" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi (Posyandu) *</label>
              <input name="posyanduName" required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Posyandu Melati" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kader/Petugas *</label>
            <input name="namaKader" required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Siti Aminah" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Peran *</label>
              <select name="peran" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 bg-white">
                {PERAN.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status *</label>
              <select name="status" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 bg-white">
                {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan (Opsional)</label>
            <input name="keterangan" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Sedang ada pelatihan di kecamatan" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl">Batal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl flex items-center gap-2 shadow-sm shadow-teal-500/30">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
