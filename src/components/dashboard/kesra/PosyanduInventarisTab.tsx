"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Package, Plus, PackageCheck, Archive, AlertTriangle } from "lucide-react";
import { getPosyanduInventaris, addPosyanduInventaris, deletePosyanduInventaris, updatePosyanduInventaris } from "@/actions/posyandu-baru";

const KATEGORI = ["ANTROPOMETRI", "MEDIS", "UMUM", "KONSUMSI", "LAINNYA"];
const KONDISI = ["BAIK", "RUSAK_RINGAN", "RUSAK_BERAT"];

export function PosyanduInventarisTab({ session, selectedPosyandu }: any) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getPosyanduInventaris();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus barang ini dari inventaris?")) {
      setLoading(true);
      await deletePosyanduInventaris(id);
      await fetchData();
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const filteredData = data.filter(d => 
    d.namaBarang.toLowerCase().includes(search.toLowerCase()) || 
    d.posyanduName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-500" />
            Manajemen Inventaris Posyandu
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola aset, alat antropometri, dan perlengkapan posyandu.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Barang
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm">
            <Archive size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Total Aset</p>
            <p className="text-2xl font-black text-slate-800">{data.length} <span className="text-sm font-normal text-slate-500">Item</span></p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
            <PackageCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Kondisi Baik</p>
            <p className="text-2xl font-black text-slate-800">{data.filter(d => d.kondisi === "BAIK").length} <span className="text-sm font-normal text-slate-500">Item</span></p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Barang Rusak</p>
            <p className="text-2xl font-black text-slate-800">{data.filter(d => d.kondisi !== "BAIK").length} <span className="text-sm font-normal text-slate-500">Item</span></p>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama barang atau posyandu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Nama Barang</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Lokasi (Posyandu)</th>
                <th className="px-4 py-3 font-semibold text-center">Jumlah</th>
                <th className="px-4 py-3 font-semibold">Kondisi</th>
                <th className="px-4 py-3 font-semibold">Sumber Dana</th>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Tidak ada barang yang ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{d.namaBarang}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">{d.kategori}</span>
                    </td>
                    <td className="px-4 py-3">{d.posyanduName}</td>
                    <td className="px-4 py-3 text-center font-bold text-teal-600">{d.jumlah}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${d.kondisi === 'BAIK' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        {d.kondisi.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{d.sumberDana || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(d)} className="text-blue-500 hover:text-blue-700 font-bold px-2 py-1 bg-blue-50 rounded text-[10px]">Edit</button>
                        <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded text-[10px]">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalFormInventaris 
          item={selectedItem} 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchData} 
        />
      )}
    </div>
  );
}

function ModalFormInventaris({ item, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    const dataObj = {
      posyanduName: fd.get("posyanduName"),
      namaBarang: fd.get("namaBarang"),
      kategori: fd.get("kategori"),
      jumlah: fd.get("jumlah"),
      kondisi: fd.get("kondisi"),
      tanggalMasuk: fd.get("tanggalMasuk"),
      sumberDana: fd.get("sumberDana")
    };

    if (item) {
      await updatePosyanduInventaris(item.id, dataObj);
    } else {
      await addPosyanduInventaris(dataObj);
    }
    
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{item ? "Edit Barang" : "Tambah Barang Baru"}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Formulir Manajemen Aset</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Barang *</label>
            <input name="namaBarang" defaultValue={item?.namaBarang} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Timbangan Dacin" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori *</label>
              <select name="kategori" defaultValue={item?.kategori || KATEGORI[0]} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 bg-white">
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kondisi *</label>
              <select name="kondisi" defaultValue={item?.kondisi || KONDISI[0]} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 bg-white">
                {KONDISI.map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah *</label>
              <input type="number" name="jumlah" defaultValue={item?.jumlah || 1} min={1} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Masuk *</label>
              <input type="date" name="tanggalMasuk" defaultValue={item ? new Date(item.tanggalMasuk).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi (Posyandu) *</label>
            <input name="posyanduName" defaultValue={item?.posyanduName} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Posyandu Melati 1" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sumber Dana</label>
            <input name="sumberDana" defaultValue={item?.sumberDana} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Dana Desa 2026" />
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
