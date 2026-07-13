"use client";

import { useState, useEffect } from "react";
import { Search, Plus, FileText, Download, Loader2, Printer, Trash2, Edit2, Activity, CheckCircle } from "lucide-react";
import { getKesraUsulanUhcList, addKesraUsulanUhc, updateKesraUsulanUhc, deleteKesraUsulanUhc, updateKesraUsulanUhcStatus, getKesraKependudukanList } from "@/actions/kesra";
import { CetakUsulanUhc } from "./CetakUsulanUhc";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
                          onClick={() => handlePrint(d)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Cetak Form"
                        >
                          <Printer size={13} />
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
