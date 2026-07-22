"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Printer, Edit2, Trash2, Save, X, Database, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { getHargaSatuans, createHargaSatuan, deleteHargaSatuan, deleteAllHargaSatuans } from "@/actions/hargaSatuan";
import { importHargaSatuanWithAI } from "@/actions/hargaSatuan-ai";
import { CetakHargaSatuan } from "./CetakHargaSatuan";


export function CyberPlanHargaSatuanTab({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [kategori, setKategori] = useState("");
  const [uraian, setUraian] = useState("");
  const [satuan, setSatuan] = useState("");
  const [harga, setHarga] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const tenantId = "f93e947c-1a9b-47a3-913b-2ea2a4290732"; // Desa Cimanggu I

  const fetchData = async () => {
    setLoading(true);
    const res = await getHargaSatuans(tenantId);
    if (res.success) {
      setData(res.data || []);
    } else {
      console.error("Fetch error:", res.error);
      alert("Gagal memuat data: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let submitKategori = kategori.trim();
    if (!submitKategori) {
      if (data.length > 0) {
        submitKategori = data[data.length - 1].kategori;
      } else {
        submitKategori = "TANPA KATEGORI";
      }
    }

    const res = await createHargaSatuan({
      tenantId,
      kategori: submitKategori,
      uraian,
      satuan,
      harga: Number(harga),
      keterangan,
      noUrut: data.length + 1
    });
    
    if (res.success) {
      setShowAddModal(false);
      setKategori("");
      setUraian("");
      setSatuan("");
      setHarga("");
      setKeterangan("");
      fetchData();
    } else {
      setLoading(false);
      console.error("Create error:", res.error);
      alert("Gagal menyimpan data: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Yakin ingin menghapus data ini?")) {
      await deleteHargaSatuan(id);
      fetchData();
    }
  };

  const handleDeleteAll = async () => {
    if(confirm("PERINGATAN: Yakin ingin menghapus SEMUA data Harga Satuan? Tindakan ini tidak dapat dibatalkan!")) {
      setLoading(true);
      await deleteAllHargaSatuans(tenantId);
      fetchData();
    }
  };

  // Grouping Data
  const groupedData = data.reduce((acc: any, curr: any) => {
    if (!acc[curr.kategori]) {
      acc[curr.kategori] = [];
    }
    acc[curr.kategori].push(curr);
    return acc;
  }, {});

  const handleImportAI = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Ingin mengekstrak data dari dokumen ini menggunakan AI?")) {
      e.target.value = "";
      return;
    }

    setAiLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const res = await importHargaSatuanWithAI(tenantId, base64, file.type);
      if (res.success) {
        alert(`Berhasil menambahkan ${res.count} data harga satuan dari dokumen menggunakan AI!`);
        fetchData();
      } else {
        alert(res.error || "Gagal mengekstrak data dengan AI.");
      }
      setAiLoading(false);
    };
    reader.onerror = () => {
      alert("Gagal membaca file.");
      setAiLoading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // reset input
  };

  if (isPrinting) {
    return <CetakHargaSatuan data={groupedData} onBack={() => setIsPrinting(false)} />;
  }

  return (
    <div className="bg-white min-h-[calc(100vh-80px)] rounded-[2.5rem] p-6 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300 relative">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Database className="text-emerald-600" /> Daftar Harga Satuan
            </h2>
            <p className="text-slate-500 text-sm">Standar Harga Satuan (SSH) Desa</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.length > 0 && (
            <button 
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg flex items-center gap-2 text-sm transition-colors border border-rose-200 mr-2"
            >
              <AlertCircle size={16} /> Kosongkan Data
            </button>
          )}
          <input 
            type="file" 
            id="ai-import-upload" 
            className="hidden" 
            accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            onChange={handleImportAI} 
          />
          <button 
            onClick={() => document.getElementById('ai-import-upload')?.click()}
            disabled={aiLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Import Data (AI)
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors"
          >
            <Plus size={16} /> Tambah Data
          </button>
          <button 
            onClick={() => setIsPrinting(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors"
          >
            <Printer size={16} /> Export / Cetak
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-sm">
                  <th className="p-3 border-r border-slate-300 w-12 text-center">NO</th>
                  <th className="p-3 border-r border-slate-300 text-left">URAIAN</th>
                  <th className="p-3 border-r border-slate-300 text-center w-32">SATUAN</th>
                  <th className="p-3 border-r border-slate-300 text-center w-40">HARGA</th>
                  <th className="p-3 border-r border-slate-300 text-center w-40">KETERANGAN</th>
                  <th className="p-3 text-center w-20">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedData).map((kat, katIdx) => (
                  <React.Fragment key={kat}>
                    <tr className="bg-slate-50">
                      <td className="p-3 border-r border-b border-slate-300 text-center font-bold">{katIdx + 1}</td>
                      <td className="p-3 border-r border-b border-slate-300 font-bold" colSpan={5}>{kat.toUpperCase()}</td>
                    </tr>
                    {groupedData[kat].map((item: any, idx: number) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 border-r border-b border-slate-300"></td>
                        <td className="p-3 border-r border-b border-slate-300 pl-6">
                          {idx + 1}. {item.uraian}
                        </td>
                        <td className="p-3 border-r border-b border-slate-300 text-center">{item.satuan}</td>
                        <td className="p-3 border-r border-b border-slate-300 text-right">
                          {item.harga.toLocaleString('id-ID')},-
                        </td>
                        <td className="p-3 border-r border-b border-slate-300">{item.keterangan}</td>
                        <td className="p-3 border-b border-slate-300 text-center">
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                            title="Hapus Data Ini"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 border-b border-slate-300">
                      Belum ada daftar harga satuan. Silakan tambahkan data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Data */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Tambah Harga Satuan</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                <input 
                  type="text" 
                  value={kategori} 
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800"
                  placeholder="Kosongkan jika sama dengan kategori sebelumnya" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Uraian</label>
                <input required type="text" value={uraian} onChange={(e) => setUraian(e.target.value)} placeholder="Contoh: Kepala Desa" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Satuan</label>
                  <input required type="text" value={satuan} onChange={(e) => setSatuan(e.target.value)} placeholder="Contoh: Bulan" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Harga (Rp)</label>
                  <input required type="number" value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="Contoh: 4750000" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Keterangan (Opsional)</label>
                <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Catatan tambahan" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 p-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"><Save size={18}/> Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMO ROBOT MOTION COMPANION */}

    </div>
  );
}
