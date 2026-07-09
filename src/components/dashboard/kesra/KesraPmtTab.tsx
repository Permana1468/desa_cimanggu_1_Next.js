"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Trash2, CheckCircle2, Loader2, ArrowRight, Truck, FileText } from "lucide-react";
import { getKesraPmtLogistik, getKesraPmtDistribusi, addKesraPmtLogistik, addKesraPmtDistribusi, updateKesraPmtDistribusiStatus, deleteKesraPmtLogistik } from "@/actions/kesra";

export function KesraPmtTab({ session }: any) {
  const [logistik, setLogistik] = useState<any[]>([]);
  const [distribusi, setDistribusi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogistikModal, setShowLogistikModal] = useState(false);
  const [showDistModal, setShowDistModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [log, dist] = await Promise.all([
        getKesraPmtLogistik(),
        getKesraPmtDistribusi()
      ]);
      setLogistik(log);
      setDistribusi(dist);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    let nextStatus = "PROSES";
    if (currentStatus === "BELUM_DIKIRIM") {
      nextStatus = "PROSES";
    } else if (currentStatus === "PROSES") {
      nextStatus = "DITERIMA";
    } else {
      return;
    }
    await updateKesraPmtDistribusiStatus(id, nextStatus);
    fetchData();
  };

  const handleDeleteLogistik = async (id: string) => {
    if (confirm("Hapus item logistik PMT ini?")) {
      await deleteKesraLogistik(id);
    }
  };

  const deleteKesraLogistik = async (id: string) => {
    await deleteKesraPmtLogistik(id);
    fetchData();
  };

  const handlePrintManifest = (dist: any) => {
    const manifestWindow = window.open("", "_blank");
    if (!manifestWindow) return;
    
    manifestWindow.document.write(`
      <html>
        <head>
          <title>Manifest Pengiriman PMT - Desa Cimanggu I</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #666; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
            .table th { background-color: #f5f5f5; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .sign { text-align: center; width: 200px; }
            .sign-line { border-bottom: 1px solid #333; margin-top: 60px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div class="title">PEMERINTAH KABUPATEN BOGOR</div>
            <div class="title">KANTOR KEPALA DESA CIMANGGU I</div>
            <div class="meta">Jl. Raya Cimanggu No. 1, Kec. Cibungbulang, Kabupaten Bogor</div>
            <div class="meta" style="font-weight: bold; margin-top: 10px; font-size: 14px;">SURAT JALAN / MANIFEST PENGIRIMAN LOGISTIK PMT</div>
          </div>
          <table class="table">
            <tr><th>No Transaksi</th><td>${dist.id.substring(0, 8).toUpperCase()}</td></tr>
            <tr><th>Item Logistik</th><td>${dist.namaItem}</td></tr>
            <tr><th>Jumlah Dikirim</th><td>${dist.jumlah} Unit/Porsi</td></tr>
            <tr><th>Tujuan Posyandu</th><td>${dist.posyanduPenerima}</td></tr>
            <tr><th>Tanggal Pengiriman</th><td>${new Date(dist.tanggalDistribusi).toLocaleDateString("id-ID")}</td></tr>
            <tr><th>Status Kurir</th><td>${dist.status}</td></tr>
          </table>
          <div class="footer">
            <div class="sign">
              <div>Penerima (Kader Posyandu)</div>
              <div class="sign-line"></div>
            </div>
            <div class="sign">
              <div>Kasi Kesejahteraan (Kesra)</div>
              <div class="sign-line"></div>
            </div>
          </div>
        </body>
      </html>
    `);
    manifestWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            Logistik & Distribusi PMT
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola stok persediaan Pemberian Makanan Tambahan (PMT) serta manifest distribusi ke posyandu.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLogistikModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs"
          >
            <Plus className="w-4 h-4" /> Pasok Barang (Stok)
          </button>
          <button
            onClick={() => setShowDistModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
          >
            <Truck className="w-4 h-4" /> Distribusikan PMT
          </button>
        </div>
      </div>

      {/* Grid: Stock logistik cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="md:col-span-3 py-10 flex justify-center"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
        ) : logistik.length === 0 ? (
          <div className="md:col-span-3 text-center py-10 text-slate-400 text-xs">Stok logistik PMT kosong. Pasok barang terlebih dahulu.</div>
        ) : (
          logistik.map(item => {
            // Sisa stok progress bar. Let's assume Max Stock cap is 500 for visualization
            const percentage = Math.min(100, Math.max(0, (item.stok / 500) * 100));
            return (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{item.namaItem}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Anggaran: Rp {item.anggaran.toLocaleString("id-ID")}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLogistik(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Sisa Stok:</span>
                    <span>{item.stok} Porsi</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.stok < 50 ? "bg-red-500 animate-pulse" : item.stok < 150 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Distribution Logs Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-base mb-4">Riwayat Distribusi & Manifest PMT</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-3 py-3 font-semibold rounded-l-xl">No Transaksi</th>
                <th className="px-3 py-3 font-semibold">Nama Item</th>
                <th className="px-3 py-3 font-semibold">Jumlah</th>
                <th className="px-3 py-3 font-semibold">Posyandu Tujuan</th>
                <th className="px-3 py-3 font-semibold">Tanggal Kirim</th>
                <th className="px-3 py-3 font-semibold">Status Pengiriman</th>
                <th className="px-3 py-3 font-semibold text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" /></td>
                </tr>
              ) : distribusi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-400">Belum ada riwayat pengiriman PMT.</td>
                </tr>
              ) : (
                distribusi.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-mono font-bold text-indigo-600">#{d.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{d.namaItem}</td>
                    <td className="px-3 py-3 font-mono">{d.jumlah} Porsi</td>
                    <td className="px-3 py-3 font-semibold">{d.posyanduPenerima}</td>
                    <td className="px-3 py-3 text-slate-500">{new Date(d.tanggalDistribusi).toLocaleDateString("id-ID")}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleUpdateStatus(d.id, d.status)}
                        disabled={d.status === "DITERIMA"}
                        className={`px-2.5 py-1 rounded-full font-bold text-[9px] transition-all ${
                          d.status === "BELUM_DIKIRIM" 
                            ? "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200" 
                            : d.status === "PROSES"
                            ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                        }`}
                      >
                        {d.status === "BELUM_DIKIRIM" ? "Kirim Barang" : d.status === "PROSES" ? "Selesaikan" : "Diterima"}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handlePrintManifest(d)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Cetak Surat Jalan"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLogistikModal && (
        <ModalPasokLogistik onClose={() => setShowLogistikModal(false)} onRefresh={fetchData} />
      )}

      {showDistModal && (
        <ModalDistribusiPmt onClose={() => setShowDistModal(false)} onRefresh={fetchData} logistikItems={logistik} />
      )}
    </div>
  );
}

function ModalPasokLogistik({ onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addKesraPmtLogistik({
      namaItem: fd.get("namaItem"),
      stok: parseInt(fd.get("stok") as string) || 0,
      anggaran: parseFloat(fd.get("anggaran") as string) || 0
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pasok Logistik PMT</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tambah stok persediaan PMT baru</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Item Logistik *</label>
            <input name="namaItem" required placeholder="Biskuit Balita / Susu Bumil" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Stok *</label>
              <input name="stok" required type="number" min="1" placeholder="porsi/unit" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Anggaran (Rp) *</label>
              <input name="anggaran" required type="number" min="0" placeholder="1500000" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Pasok Stok"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalDistribusiPmt({ onClose, onRefresh, logistikItems }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const res = await addKesraPmtDistribusi({
      namaItem: fd.get("namaItem"),
      jumlah: parseInt(fd.get("jumlah") as string) || 0,
      posyanduPenerima: fd.get("posyanduPenerima"),
      tanggalDistribusi: fd.get("tanggalDistribusi")
    });
    setLoading(false);
    if (!res.success) {
      alert(res.error);
    } else {
      onRefresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Kirim Distribusi PMT</h3>
            <p className="text-xs text-slate-500 mt-0.5">Kirim item logistik PMT ke Posyandu sasaran</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Item Logistik PMT *</label>
            <select name="namaItem" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {logistikItems.map((item: any) => (
                <option key={item.id} value={item.namaItem}>{item.namaItem} (Sisa Stok: {item.stok})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Porsi *</label>
              <input name="jumlah" required type="number" min="1" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Distribusi</label>
              <input name="tanggalDistribusi" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Posyandu Penerima *</label>
            <select name="posyanduPenerima" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              <option value="Posyandu Melati 1">Posyandu Melati 1</option>
              <option value="Posyandu Melati 2">Posyandu Melati 2</option>
              <option value="Posyandu Melati 3">Posyandu Melati 3</option>
              <option value="Posyandu Mawar 1">Posyandu Mawar 1</option>
              <option value="Posyandu Mawar 2">Posyandu Mawar 2</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Mengirim..." : "Kirim PMT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
