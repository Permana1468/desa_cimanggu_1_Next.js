"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Banknote, Landmark, CheckSquare, Award, Check, FileText, Loader2, Sparkles } from "lucide-react";
import { getKesraInsentifList, addKesraInsentif, deleteKesraInsentif, payInsentifBulk } from "@/actions/kesra";

export function KesraInsentifTab({ session }: any) {
  const [petugas, setPetugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);

  // Bulk Payment Settings
  const [payMonth, setPayMonth] = useState("Juli");
  const [payYear, setPayYear] = useState("2026");
  const [payAmount, setPayAmount] = useState(500000); // 500k per worker default

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getKesraInsentifList();
      setPetugas(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedIds(petugas.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkPaySubmit = async (e: any) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert("Pilih minimal satu petugas keagamaan untuk dibayar.");
      return;
    }
    setPaying(true);
    const res = await payInsentifBulk(selectedIds, payMonth, payYear, payAmount);
    setPaying(false);
    alert(`Pembayaran massal berhasil dikirim untuk ${res.paid} petugas.`);
    setSelectedIds([]);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data petugas keagamaan ini?")) {
      await deleteKesraInsentif(id);
      fetchData();
    }
  };

  const handlePrintSlip = (petugasObj: any, payment: any) => {
    const slipWindow = window.open("", "_blank");
    if (!slipWindow) return;

    slipWindow.document.write(`
      <html>
        <head>
          <title>Slip Insentif Digital - Desa Cimanggu I</title>
          <style>
            body { font-family: sans-serif; padding: 45px; color: #333; }
            .border-box { border: 2px solid #333; padding: 30px; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: bold; }
            .meta { font-size: 11px; color: #666; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
            .row span:first-child { font-weight: bold; color: #555; }
            .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; display: flex; justify-content: space-between; }
            .footer { margin-top: 40px; text-align: right; font-size: 12px; }
            .sign { margin-top: 50px; text-decoration: underline; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="border-box">
            <div class="header">
              <div class="title">SLIP INSENTIF DIGITAL PETUGAS KEAGAMAAN</div>
              <div class="title">DESA CIMANGGU I</div>
              <div class="meta">Bulan: ${payment.bulan} ${payment.tahun}</div>
            </div>
            <div class="row"><span>Nama Petugas:</span><span>${petugasObj.namaPetugas}</span></div>
            <div class="row"><span>Kategori Petugas:</span><span>${petugasObj.jenisPetugas}</span></div>
            <div class="row"><span>Lembaga / Tempat Ibadah:</span><span>${petugasObj.tempatIbadah}</span></div>
            <div class="row"><span>No Rekening / Bank:</span><span>${petugasObj.noRekening} (${petugasObj.namaBank})</span></div>
            <div class="row"><span>Status Transfer:</span><span style="color: #10b981; font-weight: bold;">SUKSES (REALTIME)</span></div>
            <div class="total"><span>JUMLAH DITERIMA:</span><span>Rp ${payment.jumlah.toLocaleString("id-ID")}</span></div>
            <div class="footer">
              <div>Bogor, ${new Date(payment.createdAt).toLocaleDateString("id-ID")}</div>
              <div>Kasi Kesejahteraan (Kesra)</div>
              <div class="sign">Aldyansyah Permana</div>
            </div>
          </div>
        </body>
      </html>
    `);
    slipWindow.document.close();
  };

  const filteredPetugas = petugas.filter(p =>
    p.namaPetugas.toLowerCase().includes(search.toLowerCase()) ||
    p.tempatIbadah.toLowerCase().includes(search.toLowerCase())
  );

  // Total budget disbursed this month
  const totalDisbursed = petugas.reduce((acc, p) => {
    const paymentSum = p.payments?.reduce((s: number, pm: any) => s + pm.jumlah, 0) || 0;
    return acc + paymentSum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-500" />
            Insentif Guru Ngaji & Petugas Keagamaan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola pencatatan guru ngaji, marbot masjid, pendeta, penyaluran insentif bulanan, dan slip pertanggungjawaban.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Petugas
        </button>
      </div>

      {/* Grid: Bulk Payment & Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bulk Payment settings card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5"><Banknote className="text-emerald-500" size={16} /> Bulk Payment Insentif</h3>
          <form onSubmit={handleBulkPaySubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Periode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <select value={payMonth} onChange={e => setPayMonth(e.target.value)} className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-white">
                  {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select value={payYear} onChange={e => setPayYear(e.target.value)} className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-white">
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Jumlah Insentif (Rp)</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(parseInt(e.target.value) || 0)} className="w-full mt-1 border border-slate-200 rounded-xl px-2 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={paying || selectedIds.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1"
              >
                {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles size={14} />}
                Bayar Massal ({selectedIds.length} terpilih)
              </button>
            </div>
          </form>
        </div>

        {/* Realisasi Anggaran / Stats */}
        <div className="xl:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-900/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider">
              Realisasi Anggaran Insentif
            </span>
            <h2 className="text-4xl font-black tracking-tight mt-4">
              Rp {totalDisbursed.toLocaleString("id-ID")}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              Akumulasi anggaran insentif keagamaan yang telah disalurkan dari Dana Desa.
            </p>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
            <span className="text-[10px] text-emerald-100 font-bold uppercase">Metode Transfer</span>
            <span className="text-[10px] font-bold bg-white text-emerald-600 px-2 py-0.5 rounded">Bulk Bank / E-Wallet</span>
          </div>
        </div>
      </div>

      {/* Insentif Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari petugas atau tempat ibadah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-800 text-xs">
                <th className="px-3 py-3 w-10 text-center rounded-l-xl">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === petugas.length && petugas.length > 0} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                </th>
                <th className="px-3 py-3 font-semibold">Nama Petugas</th>
                <th className="px-3 py-3 font-semibold">Kategori</th>
                <th className="px-3 py-3 font-semibold">Tempat Ibadah</th>
                <th className="px-3 py-3 font-semibold">Bank / Rekening</th>
                <th className="px-3 py-3 font-semibold">Keaktifan</th>
                <th className="px-3 py-3 font-semibold">Total Diterima</th>
                <th className="px-3 py-3 font-semibold">Riwayat Slip</th>
                <th className="px-3 py-3 rounded-r-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredPetugas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-400">Tidak ada data petugas keagamaan.</td>
                </tr>
              ) : (
                filteredPetugas.map((p) => {
                  const totalPaid = p.payments?.reduce((s: number, py: any) => s + py.jumlah, 0) || 0;
                  const isChecked = selectedIds.includes(p.id);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" onChange={(e) => handleSelectOne(p.id, e.target.checked)} checked={isChecked} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{p.namaPetugas}</td>
                      <td className="px-3 py-3 font-bold text-slate-600">{p.jenisPetugas}</td>
                      <td className="px-3 py-3">{p.tempatIbadah}</td>
                      <td className="px-3 py-3 font-mono">{p.namaBank}: {p.noRekening}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.statusKeaktifan === "AKTIF" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {p.statusKeaktifan}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold">Rp {totalPaid.toLocaleString("id-ID")}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          {p.payments && p.payments.length > 0 ? (
                            p.payments.slice(-2).map((pay: any) => (
                              <button
                                key={pay.id}
                                onClick={() => handlePrintSlip(p, pay)}
                                className="text-[8px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline flex items-center gap-0.5 bg-slate-50 px-1 py-0.5 rounded border border-slate-100 transition-colors"
                              >
                                <FileText size={9} /> Slip {pay.bulan} {pay.tahun}
                              </button>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalTambahPetugas onClose={() => setShowModal(false)} onRefresh={fetchData} />
      )}
    </div>
  );
}

function ModalTambahPetugas({ onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addKesraInsentif({
      namaPetugas: fd.get("namaPetugas"),
      jenisPetugas: fd.get("jenisPetugas"),
      tempatIbadah: fd.get("tempatIbadah"),
      noRekening: fd.get("noRekening"),
      namaBank: fd.get("namaBank"),
      statusKeaktifan: "AKTIF"
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
            <h3 className="text-lg font-bold text-slate-800">Tambah Petugas Keagamaan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap penerima insentif bulanan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Petugas Keagamaan *</label>
            <input name="namaPetugas" required placeholder="Ust. Ahmad Fauzi" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori Petugas *</label>
              <select name="jenisPetugas" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="GURU_NGAJI">Guru Ngaji / TPA</option>
                <option value="MARBOT">Marbot Masjid</option>
                <option value="PENDETA">Pendeta</option>
                <option value="PETUGAS_AMIN">Petugas Keagamaan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tempat Ibadah *</label>
              <input name="tempatIbadah" required placeholder="Masjid Al-Ikhlas" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Bank / E-Wallet *</label>
              <input name="namaBank" required placeholder="BRI / DANA" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor Rekening *</label>
              <input name="noRekening" required placeholder="xxxxxxxxxx" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
