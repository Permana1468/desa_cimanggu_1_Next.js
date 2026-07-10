"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Wallet, Plus, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { getPosyanduAnggarans, addPosyanduAnggaran, deletePosyanduAnggaran } from "@/actions/posyandu-baru";

const JENIS_DANA = ["OPERASIONAL", "PMT", "INSENTIF_KADER", "LAINNYA"];
const TIPE = ["PEMASUKAN", "PENGELUARAN"];

export function KesraPmtTab({ session }: any) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduAnggarans();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus catatan anggaran ini?")) {
      setLoading(true);
      await deletePosyanduAnggaran(id);
      await fetchData();
    }
  };

  const filteredData = data.filter(d => 
    d.posyanduName.toLowerCase().includes(search.toLowerCase()) || 
    (d.keterangan && d.keterangan.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPemasukan = data.filter(d => d.tipe === "PEMASUKAN").reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalPengeluaran = data.filter(d => d.tipe === "PENGELUARAN").reduce((acc, curr) => acc + curr.jumlah, 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-500" />
            Manajemen Anggaran & PMT
          </h2>
          <p className="text-slate-500 text-sm mt-1">Lacak pencairan dana desa, insentif kader, dan anggaran PMT (Pemberian Makanan Tambahan).</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Catat Transaksi Baru
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Pemasukan</p>
            <p className="text-xl font-black text-slate-800">{formatRupiah(totalPemasukan)}</p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Total Pengeluaran</p>
            <p className="text-xl font-black text-slate-800">{formatRupiah(totalPengeluaran)}</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Saldo Saat Ini</p>
            <p className="text-xl font-black text-slate-800">{formatRupiah(saldoAkhir)}</p>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari keterangan atau posyandu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Lokasi (Posyandu)</th>
                <th className="px-4 py-3 font-semibold">Jenis Dana</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold text-right">Jumlah (Rp)</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 font-semibold text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Tidak ada transaksi ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{new Date(d.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{d.posyanduName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">{d.jenisDana.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${d.tipe === 'PEMASUKAN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        {d.tipe === 'PEMASUKAN' ? 'IN (+)' : 'OUT (-)'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold text-right ${d.tipe === 'PEMASUKAN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {formatRupiah(d.jumlah)}
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
        <ModalFormAnggaran onClose={() => setShowModal(false)} onRefresh={fetchData} />
      )}
    </div>
  );
}

function ModalFormAnggaran({ onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [tipe, setTipe] = useState("PEMASUKAN");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    // Remove formatting from amount string before saving
    const rawJumlah = fd.get("jumlah")?.toString().replace(/\D/g, '') || "0";
    
    await addPosyanduAnggaran({
      posyanduName: fd.get("posyanduName"),
      jenisDana: fd.get("jenisDana"),
      tipe: fd.get("tipe"),
      jumlah: rawJumlah,
      tanggal: fd.get("tanggal"),
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
            <h3 className="text-lg font-bold text-slate-800">Catat Transaksi</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manajemen Anggaran & PMT</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Transaksi *</label>
              <input type="date" name="tanggal" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi (Posyandu) *</label>
              <input name="posyanduName" required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" placeholder="Cth: Posyandu Melati 1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe Transaksi *</label>
              <select name="tipe" value={tipe} onChange={e => setTipe(e.target.value)} className={`w-full px-3 py-2 border rounded-xl text-sm outline-none font-bold ${tipe === 'PEMASUKAN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                {TIPE.map(t => <option key={t} value={t}>{t === 'PEMASUKAN' ? 'PEMASUKAN (+)' : 'PENGELUARAN (-)'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori Dana *</label>
              <select name="jenisDana" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 bg-white">
                {JENIS_DANA.map(j => <option key={j} value={j}>{j.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah (Rp) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
              <input 
                name="jumlah" 
                required 
                type="text" 
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-mono font-bold text-slate-700" 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  e.target.value = new Intl.NumberFormat('id-ID').format(Number(val));
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Tambahan</label>
            <textarea name="keterangan" rows={3} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" placeholder="Cth: Pencairan dana desa termin 2 untuk operasional posyandu" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl">Batal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-500/30">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
