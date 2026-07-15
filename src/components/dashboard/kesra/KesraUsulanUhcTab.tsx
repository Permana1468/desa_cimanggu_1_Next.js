"use client";

import { useState, useEffect } from "react";
import { Search, Plus, FileText, Download, Loader2, Printer, Trash2, Edit2, Activity, CheckCircle } from "lucide-react";
import { getKesraUsulanUhcList, addKesraUsulanUhc, updateKesraUsulanUhc, deleteKesraUsulanUhc, updateKesraUsulanUhcStatus, getKesraKependudukanList } from "@/actions/kesra";
import { CetakUsulanUhc } from "./CetakUsulanUhc";
import { CetakSkkm } from "./CetakSkkm";
import { CetakSptjm } from "./CetakSptjm";
import { CetakBundle } from "./CetakBundle";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

const PARAM_OPTIONS = {
    param1: ["> Rp6.000.000,-", "<= Rp6.000.000,-", "<= Rp5.000.000", "<= Rp4.000.000", "<= Rp3.000.000", "<= Rp2.000.000", "< Rp1.000.000"],
    param2: ["Tidak Ada", "1 (satu) Jiwa", "2 (dua) Jiwa", "3 (tiga) Jiwa", "4 (empat) Jiwa", "5 (lima) Jiwa", "> 5 (lima) Jiwa"],
    param3: ["Milik Sendiri", "Menumpang", "Kontrak/Sewa"],
    param4: ["Tidak ada Anggota Keluarga yang Putus Sekolah", "Bersekolah tetapi tidak mampu membayar biaya pendidikan", "Ada Anggota Keluarga yang Putus Sekolah (SD,SMP dan SMA sederajat)"],
    param5: ["Memiliki kendaraan roda 4 (empat)", "Memiliki > 1 (satu) kendaraan roda 2 (dua)", "Memiliki 1 (satu) kendaraan roda 2 (dua) ≥ 150 cc", "Memiliki 1 (satu) kendaraan roda 2 (dua) < 150 cc", "Tidak Memiliki kendaraan roda 2 (dua)"],
    param6: ["Marmer/Granit", "Keramik", "Parket/Vinil/Permadani", "Ubin/Legel/Teraso", "Kayu/Papan Kualitas Tinggi", "Semen/Bata Merah", "Bambu", "Kayu/Papan Kualitas Rendah", "Tanah", "Lainnya"],
    param7: ["Tembok Bagus(Kualitas Tinggi)", "Kayu/Anyaman Bambu/Batang Kayu/Triplek/Seng", "Tembok Jelek (Kualitas Rendah)"],
    param8: ["Beton/Genteng", "Genteng Keramik", "Genteng Metal", "Genteng Tanah Liat", "Asbes", "Seng", "Sirap", "Bambu", "Jerami/Ijuk/Daun-daun/Rumbia", "Lainnya"],
    param9: ["Air Kemasan bermerek", "Air Isi Ulang", "Ledeng/Meteran", "Sumur Tak Terlindungi", "Sumur bor/pompa/mata air terlindungi", "Air Sungai/Danau/Waduk/Air Hujan"],
    param10: ["≥ 1.300 W", "900 W", "450 W", "Tanpa Meteran/Bukan Listrik"],
    param11: ["Sendiri", "Bersama", "Tidak Ada"],
    param12: ["Septic Tank", "Septic Tank Komunal", "Lubang Tanah", "Kolam/Sawah/Sungai/Danau", "Tanah Lapang/Kebun"],
    param13: ["Ada", "Tidak Ada"],
    param14: ["Mampu membayar Iuran JKN terendah secara mandiri", "Iuran JKN dibayarkan pihak lain", "Tidak Mampu membayar Iuran JKN/Tidak Memiliki JKN"]
};

export function KesraUsulanUhcTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [kependudukan, setKependudukan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  
  const [showSkkmModal, setShowSkkmModal] = useState(false);
  const [selectedSkkmData, setSelectedSkkmData] = useState<any>(null);
  const [showPrintSkkm, setShowPrintSkkm] = useState(false);
  const [printSkkmData, setPrintSkkmData] = useState<any>(null);

  const [showSptjmModal, setShowSptjmModal] = useState(false);
  const [selectedSptjmData, setSelectedSptjmData] = useState<any>(null);
  const [showPrintSptjm, setShowPrintSptjm] = useState(false);
  const [printSptjmData, setPrintSptjmData] = useState<any>(null);

  const [showPrintBundle, setShowPrintBundle] = useState(false);
  const [bundleData, setBundleData] = useState<any>(null);
  const [isBundleMode, setIsBundleMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [list, kep] = await Promise.all([
        getKesraUsulanUhcList(),
        getKesraKependudukanList()
      ]);
      setData(list);
      setKependudukan(kep);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus usulan UHC ini?")) return;
    setLoading(true);
    await deleteKesraUsulanUhc(id);
    fetchData();
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "AKTIF" ? "Proses Verifikasi" : "AKTIF";
    if (!confirm(`Ubah status BPJS menjadi ${newStatus}?`)) return;
    setLoading(true);
    await updateKesraUsulanUhcStatus(id, newStatus);
    fetchData();
  };

  const handleEdit = (d: any) => {
    setSelectedData(d);
    setShowModal(true);
  };

  const handlePrint = (d: any) => {
    setPrintData(d);
    setShowPrint(true);
  };

  const filteredData = data.filter(d =>
    d.namaPemohon.toLowerCase().includes(search.toLowerCase()) ||
    d.namaPasien.toLowerCase().includes(search.toLowerCase()) ||
    d.nik.includes(search)
  );

  if (showPrint && printData) {
      return <CetakUsulanUhc data={printData} onBack={() => setShowPrint(false)} />;
  }

  if (showPrintSkkm && printSkkmData) {
    return <CetakSkkm data={printSkkmData} onBack={() => setShowPrintSkkm(false)} />;
  }

  if (showPrintSptjm && printSptjmData) {
    return <CetakSptjm data={printSptjmData} onBack={() => setShowPrintSptjm(false)} />;
  }

  if (showPrintBundle && bundleData) {
    return <CetakBundle data={bundleData.main} sptjmData={bundleData.sptjm} onBack={() => setShowPrintBundle(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" />
            Arsip Usulan UHC
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola dan cetak formulir 14 Parameter Kemiskinan untuk pengajuan UHC.</p>
        </div>
        <button
          onClick={() => { setSelectedData(null); setShowModal(true); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Usulan UHC
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pemohon, pasien, atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200">
                <th className="px-3 py-3 font-semibold rounded-tl-xl">No</th>
                <th className="px-3 py-3 font-semibold">Tgl Usulan</th>
                <th className="px-3 py-3 font-semibold">Nama Pemohon</th>
                <th className="px-3 py-3 font-semibold">Nama Pasien</th>
                <th className="px-3 py-3 font-semibold">NIK Pasien</th>
                <th className="px-3 py-3 font-semibold">Hasil Verifikasi</th>
                <th className="px-3 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-400">Tidak ada data usulan UHC.</td>
                </tr>
              ) : (
                filteredData.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono">{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{d.namaPemohon}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{d.namaPasien}</td>
                    <td className="px-3 py-3 font-mono text-slate-600">{d.nik}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.hasilVerifikasi === "SANGAT MISKIN" ? "bg-red-50 text-red-700 border border-red-200" :
                        d.hasilVerifikasi === "MISKIN" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                        d.hasilVerifikasi === "RENTAN MISKIN" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {d.hasilVerifikasi}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => {
                            const useSptjm = window.confirm("Apakah Anda ingin menyertakan form SPTJM ke dalam cetakan PDF gabungan?");
                            if (useSptjm) {
                              setSelectedSptjmData(d);
                              setIsBundleMode(true);
                              setShowSptjmModal(true);
                            } else {
                              setBundleData({ main: d, sptjm: null });
                              setShowPrintBundle(true);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Download PDF (Gabungan)"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => handlePrint(d)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Cetak Form UHC"
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSkkmData(d);
                            setShowSkkmModal(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lengkapi & Cetak SKKM"
                        >
                          <FileText size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSptjmData(d);
                            setShowSptjmModal(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Cetak SPTJM"
                        >
                          <FileText size={13} />
                        </button>
                        <button
                          onClick={() => handleEdit(d)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Update"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(d.id, d.statusTracking)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            d.statusTracking === 'AKTIF'
                              ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                              : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                          title={d.statusTracking === 'AKTIF' ? 'Ubah ke Proses' : 'Aktifkan BPJS'}
                        >
                          {d.statusTracking === 'AKTIF' ? <CheckCircle size={13} /> : <Activity size={13} />}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
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

      {showModal && (
        <ModalUsulanUhc 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchData} 
          kependudukan={kependudukan} 
          initialData={selectedData} 
        />
      )}

      {showSkkmModal && (
        <ModalSkkm 
          onClose={() => setShowSkkmModal(false)} 
          onRefresh={fetchData} 
          onPrint={(data: any) => {
            setShowSkkmModal(false);
            setPrintSkkmData(data);
            setShowPrintSkkm(true);
          }}
          initialData={selectedSkkmData} 
        />
      )}

      {showSptjmModal && selectedSptjmData && (
        <ModalSptjm 
          onClose={() => {
            setShowSptjmModal(false);
            setIsBundleMode(false);
          }}
          onPrint={(data: any) => {
            setShowSptjmModal(false);
            if (isBundleMode) {
              setBundleData({ main: selectedSptjmData, sptjm: data });
              setShowPrintBundle(true);
              setIsBundleMode(false);
            } else {
              setPrintSptjmData(data);
              setShowPrintSptjm(true);
            }
          }}
          initialData={selectedSptjmData} 
        />
      )}
    </div>
  );
}

export function ModalUsulanUhc({ onClose, onRefresh, kependudukan, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const isCustomInitial = initialData?.rujukan?.startsWith("CUSTOM|");
  const initialRujukan = isCustomInitial ? "LAINNYA" : (initialData?.rujukan || "");
  const initialCustomNama = isCustomInitial ? initialData.rujukan.split("|")[1] : "";
  const initialCustomAlamat = isCustomInitial ? initialData.rujukan.split("|")[2] : "";

  const [customNama, setCustomNama] = useState(initialCustomNama);
  const [customAlamat, setCustomAlamat] = useState(initialCustomAlamat);

  const [formData, setFormData] = useState<any>(initialData ? { ...initialData, rujukan: initialRujukan } : {
    kecamatan: "CIBUNGBULANG",
    desaKelurahan: "CIMANGGU I",
    namaPemohon: "ABDUL AZIZ",
    alamatPemohon: "KP. CIARUTEUN RT.001 RW.008",
    namaPasien: "",
    nomorKk: "",
    nik: "",
    alamatPasien: "",
    param1: PARAM_OPTIONS.param1[0],
    param2: PARAM_OPTIONS.param2[0],
    param3: PARAM_OPTIONS.param3[0],
    param4: PARAM_OPTIONS.param4[0],
    param5: PARAM_OPTIONS.param5[0],
    param6: PARAM_OPTIONS.param6[0],
    param7: PARAM_OPTIONS.param7[0],
    param8: PARAM_OPTIONS.param8[0],
    param9: PARAM_OPTIONS.param9[0],
    param10: PARAM_OPTIONS.param10[0],
    param11: PARAM_OPTIONS.param11[0],
    param12: PARAM_OPTIONS.param12[0],
    param13: PARAM_OPTIONS.param13[0],
    param14: PARAM_OPTIONS.param14[0],
    hasilVerifikasi: "RENTAN MISKIN",
    keterangan: "",
    rujukan: "",
    fotoDepan: "",
    fotoSamping: "",
    fotoDalam: "",
    fotoKamarMandi: ""
  });

  const handleChange = (e: any) => {
      const { name, value, type } = e.target;
      // Jangan kapitalisasi opsi dropdown (select), hanya text input
      const finalValue = type === "select-one" ? value : value.toUpperCase();
      setFormData({ ...formData, [name]: finalValue });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const submitData = { ...formData };
    if (submitData.rujukan === "LAINNYA") {
        submitData.rujukan = `CUSTOM|${customNama}|${customAlamat}`;
    }

    try {
        if (initialData) {
            await updateKesraUsulanUhc(initialData.id, submitData);
        } else {
            await addKesraUsulanUhc(submitData);
        }
        onRefresh();
        onClose();
    } catch (error: any) {
        alert("Gagal menyimpan data: " + (error.message || "Terjadi kesalahan"));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 sticky top-0 bg-white pb-4 border-b border-slate-100 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{initialData ? "Update" : "Tambah"} Usulan UHC</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi 14 Parameter Kemiskinan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Section */}
          <div>
              <h4 className="font-bold text-slate-700 text-sm mb-3">Identitas Pemohon & Pasien</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Pemohon *</label>
                    <input name="namaPemohon" required value={formData.namaPemohon} onChange={handleChange} type="text" readOnly className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 cursor-not-allowed text-slate-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Pemohon *</label>
                    <input name="alamatPemohon" required value={formData.alamatPemohon} onChange={handleChange} type="text" readOnly className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 cursor-not-allowed text-slate-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Pasien *</label>
                    <input name="namaPasien" required value={formData.namaPasien} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor KK *</label>
                    <input name="nomorKk" required value={formData.nomorKk} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK Pasien *</label>
                    <input name="nik" required value={formData.nik} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Pasien *</label>
                    <input name="alamatPasien" required value={formData.alamatPasien} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
          </div>

          <hr className="border-slate-100" />

          {/* 14 Parameter Section */}
          <div>
              <h4 className="font-bold text-slate-700 text-sm mb-3">14 Parameter Kemiskinan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                      { key: "param1", label: "1. Penghasilan Rata-rata/bulan" },
                      { key: "param2", label: "2. Jumlah Tanggungan Keluarga" },
                      { key: "param3", label: "3. Status Tempat Tinggal" },
                      { key: "param4", label: "4. Kemampuan akses pendidikan" },
                      { key: "param5", label: "5. Kepemilikan Kendaraan" },
                      { key: "param6", label: "6. Jenis Lantai" },
                      { key: "param7", label: "7. Jenis dan Kondisi Dinding" },
                      { key: "param8", label: "8. Jenis dan Kondisi Atap" },
                      { key: "param9", label: "9. Sumber Air Minum" },
                      { key: "param10", label: "10. Sumber dan Daya Listrik" },
                      { key: "param11", label: "11. Kepemilikan Kamar Mandi/WC" },
                      { key: "param12", label: "12. Fasilitas Pembuangan Tinja" },
                      { key: "param13", label: "13. Anggota Lanjut Usia/Disabilitas" },
                      { key: "param14", label: "14. Kesanggupan Biaya Pengobatan" },
                  ].map((p) => (
                      <div key={p.key}>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">{p.label}</label>
                          <select name={p.key} value={formData[p.key]} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                              {(PARAM_OPTIONS as any)[p.key].map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                              ))}
                          </select>
                      </div>
                  ))}
              </div>
          </div>

          <hr className="border-slate-100" />

          {/* Hasil Section */}
          <div>
              <h4 className="font-bold text-slate-700 text-sm mb-3">Hasil Verifikasi & Catatan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hasil Verifikasi</label>
                    <select name="hasilVerifikasi" value={formData.hasilVerifikasi} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-bold">
                        <option value="SANGAT MISKIN">SANGAT MISKIN</option>
                        <option value="MISKIN">MISKIN</option>
                        <option value="RENTAN MISKIN">RENTAN MISKIN</option>
                        <option value="TIDAK MISKIN">TIDAK MISKIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan</label>
                    <input name="keterangan" value={formData.keterangan || ""} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Isi keterangan bila perlu" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rujukan</label>
                    <select name="rujukan" value={formData.rujukan || ""} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                        <option value="">Pilih Rujukan...</option>
                        <option value="PUSKESMAS CIBUNGBULANG">PUSKESMAS CIBUNGBULANG</option>
                        <option value="RSUD. LEUWILIANG">RSUD. LEUWILIANG</option>
                        <option value="RS. ASYSYIFAA">RS. ASYSYIFAA</option>
                        <option value="RS. KARYA BHAKTI PRATIWI">RS. KARYA BHAKTI PRATIWI</option>
                        <option value="RS. MEDIKA DRAMAGA">RS. MEDIKA DRAMAGA</option>
                        <option value="RSUD. KOTA BOGOR">RSUD. KOTA BOGOR</option>
                        <option value="LAINNYA">LAINNYA</option>
                    </select>

                    {formData.rujukan === "LAINNYA" && (
                        <div className="mt-3 space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Rumah Sakit/Rujukan</label>
                                <input value={customNama} onChange={e => setCustomNama(e.target.value.toUpperCase())} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: RS. MARJUKI MAHDI" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Rujukan</label>
                                <input value={customAlamat} onChange={e => setCustomAlamat(e.target.value.toUpperCase())} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Isi alamat lengkap..." />
                            </div>
                        </div>
                    )}
                  </div>
              </div>
          </div>

          <hr className="border-slate-100" />

          {/* Upload Foto Rumah Section */}
          <div>
              <h4 className="font-bold text-slate-700 text-sm mb-3">Dokumentasi Foto Rumah (Opsional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                      <ImageUpload 
                          localOnly={true}
                          label="Foto Tampak Depan" 
                          defaultValue={formData.fotoDepan} 
                          onUploadSuccess={(url) => setFormData({ ...formData, fotoDepan: url })} 
                      />
                  </div>
                  <div>
                      <ImageUpload 
                          localOnly={true}
                          label="Foto Tampak Samping" 
                          defaultValue={formData.fotoSamping} 
                          onUploadSuccess={(url) => setFormData({ ...formData, fotoSamping: url })} 
                      />
                  </div>
                  <div>
                      <ImageUpload 
                          localOnly={true}
                          label="Foto Tampak Dalam" 
                          defaultValue={formData.fotoDalam} 
                          onUploadSuccess={(url) => setFormData({ ...formData, fotoDalam: url })} 
                      />
                  </div>
                  <div>
                      <ImageUpload 
                          localOnly={true}
                          label="Foto Kamar Mandi" 
                          defaultValue={formData.fotoKamarMandi} 
                          onUploadSuccess={(url) => setFormData({ ...formData, fotoKamarMandi: url })} 
                      />
                  </div>
              </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Usulan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalSkkm({ onClose, onRefresh, onPrint, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    nik: initialData?.nik || "",
    namaPasien: initialData?.namaPasien || "",
    skkmNoRegister: initialData?.skkmNoRegister || "",
    skkmRtRwPengantar: initialData?.skkmRtRwPengantar || "",
    skkmTanggalPengantar: initialData?.skkmTanggalPengantar ? new Date(initialData.skkmTanggalPengantar).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    skkmTanggalKk: initialData?.skkmTanggalKk ? new Date(initialData.skkmTanggalKk).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    skkmTanggalKtp: initialData?.skkmTanggalKtp ? new Date(initialData.skkmTanggalKtp).toISOString().split('T')[0] : "",
    skkmNamaKepalaKeluarga: initialData?.skkmNamaKepalaKeluarga || "",
    skkmJenisKelamin: initialData?.skkmJenisKelamin || "Laki-laki",
    skkmTempatTanggalLahir: initialData?.skkmTempatTanggalLahir || "Kabupaten Bogor, ",
    skkmAgamaKewarganegaraan: initialData?.skkmAgamaKewarganegaraan || "Islam / Indonesia",
    skkmStatusPerkawinan: initialData?.skkmStatusPerkawinan || "Belum Kawin",
    skkmAlamatJalan: initialData?.skkmAlamatJalan || "Kp. Ciaruteun RT.001 RW.008",
    skkmTerdaftarDtks: initialData?.skkmTerdaftarDtks || "TIDAK",
    skkmNamaPenandatangan: initialData?.skkmNamaPenandatangan || "FAJAR TRI APRIANA"
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass as ISO strings to avoid React serialization bugs with Date objects
      const payload = {
        ...formData,
        skkmTanggalPengantar: formData.skkmTanggalPengantar ? new Date(formData.skkmTanggalPengantar).toISOString() : null,
        skkmTanggalKk: formData.skkmTanggalKk ? new Date(formData.skkmTanggalKk).toISOString() : null,
        skkmTanggalKtp: formData.skkmTanggalKtp ? new Date(formData.skkmTanggalKtp).toISOString() : null
      };
      
      const result = await updateKesraUsulanUhc(initialData.id, payload);
      
      if (result && !result.success) {
        alert("Gagal menyimpan SKKM: " + result.error);
        setLoading(false);
        return;
      }
      
      const mergedData = { ...initialData, ...payload };
      onRefresh();
      onPrint(mergedData);
    } catch (error: any) {
      console.error(error);
      alert("Terjadi kesalahan sistem: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-lg text-slate-800">Lengkapi Data SKKM</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="skkmForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
              <h4 className="font-bold text-blue-800 text-sm">Data Pengantar & Register</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">No Register (misal: 123)</label>
                  <input name="skkmNoRegister" value={formData.skkmNoRegister} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pengantar RT/RW</label>
                  <input name="skkmRtRwPengantar" value={formData.skkmRtRwPengantar} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" placeholder="RT.001 RW.008 Kp.Ciaruteun" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Pengantar</label>
                  <input name="skkmTanggalPengantar" value={formData.skkmTanggalPengantar} onChange={handleChange} type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Penandatangan (Sekdes)</label>
                  <input name="skkmNamaPenandatangan" value={formData.skkmNamaPenandatangan} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" required />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-700 text-sm">Data Pemohon (Keluarga)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Kepala Keluarga (di KK)</label>
                  <input name="skkmNamaKepalaKeluarga" value={formData.skkmNamaKepalaKeluarga} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal KK Diterbitkan</label>
                  <input name="skkmTanggalKk" value={formData.skkmTanggalKk} onChange={handleChange} type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal KTP-el Diterbitkan</label>
                  <input name="skkmTanggalKtp" value={formData.skkmTanggalKtp} onChange={handleChange} type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm">Detail Pasien UHC</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK (Pasien)</label>
                  <input name="nik" value={formData.nik} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap (Pasien)</label>
                  <input name="namaPasien" value={formData.namaPasien} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin</label>
                  <select name="skkmJenisKelamin" value={formData.skkmJenisKelamin} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tempat/Tanggal Lahir</label>
                  <input name="skkmTempatTanggalLahir" value={formData.skkmTempatTanggalLahir} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Kabupaten Bogor, 01-01-2000" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Agama / Kewarganegaraan</label>
                  <select name="skkmAgamaKewarganegaraan" value={formData.skkmAgamaKewarganegaraan} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="Islam / Indonesia">Islam / Indonesia</option>
                    <option value="Kristen / Indonesia">Kristen / Indonesia</option>
                    <option value="Katolik / Indonesia">Katolik / Indonesia</option>
                    <option value="Hindu / Indonesia">Hindu / Indonesia</option>
                    <option value="Buddha / Indonesia">Buddha / Indonesia</option>
                    <option value="Konghucu / Indonesia">Konghucu / Indonesia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Perkawinan</label>
                  <select name="skkmStatusPerkawinan" value={formData.skkmStatusPerkawinan} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat Lengkap Pasien (Jalan/RT/RW)</label>
                  <input name="skkmAlamatJalan" value={formData.skkmAlamatJalan} onChange={handleChange} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Kp. Ciaruteun RT.001 RW.008" required />
                  <p className="text-[10px] text-slate-400 mt-1">*Desa, Kecamatan & Kabupaten otomatis tertulis di sistem.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Terdaftar dalam DTKS?</label>
                  <select name="skkmTerdaftarDtks" value={formData.skkmTerdaftarDtks} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="YA">YA</option>
                    <option value="TIDAK">TIDAK</option>
                  </select>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl sticky bottom-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl font-medium">Batal</button>
          <button type="submit" form="skkmForm" disabled={loading} className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 font-bold flex items-center gap-2 shadow-sm">
            {loading ? "Menyimpan..." : "Simpan & Cetak SKKM"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalSptjm({ onClose, onPrint, initialData }: any) {
  const [noRegister, setNoRegister] = useState("");
  const [members, setMembers] = useState([{ nik: initialData?.nik || "", nama: initialData?.namaPasien || "" }]);

  const handleAddMember = () => {
    setMembers([...members, { nik: "", nama: "" }]);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = [...members];
      newMembers.splice(index, 1);
      setMembers(newMembers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const printData = {
      nomorKk: initialData?.nomorKk || "",
      alamat: initialData?.alamatPasien || "",
      noRegister: noRegister,
      members: members
    };
    onPrint(printData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-lg text-slate-800">Lengkapi Data SPTJM</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="sptjmForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
              <h4 className="font-bold text-blue-800 text-sm">Data Pengantar & Register</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">No Register SPTJM (misal: 123)</label>
                  <input value={noRegister} onChange={(e) => setNoRegister(e.target.value)} type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none uppercase" required />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-700 text-sm">Daftar Warga (Anggota Keluarga)</h4>
                <button type="button" onClick={handleAddMember} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors">
                  <Plus className="w-3 h-3" /> Tambah Jiwa
                </button>
              </div>
              
              {members.map((member, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">NIK</label>
                    <input value={member.nik} onChange={(e) => handleMemberChange(idx, "nik", e.target.value)} type="text" className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-indigo-500" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">NAMA LENGKAP</label>
                    <input value={member.nama} onChange={(e) => handleMemberChange(idx, "nama", e.target.value)} type="text" className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-indigo-500 uppercase" required />
                  </div>
                  {members.length > 1 && (
                    <button type="button" onClick={() => handleRemoveMember(idx)} className="h-8 w-8 shrink-0 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl sticky bottom-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl font-medium">Batal</button>
          <button type="submit" form="sptjmForm" className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm">
            Cetak SPTJM
          </button>
        </div>
      </div>
    </div>
  );
}
