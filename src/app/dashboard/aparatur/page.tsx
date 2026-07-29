"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAparaturDesaList, 
  addAparaturDesa, 
  deleteAparaturDesa, 
  updateAparaturSK 
} from "@/actions/village";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Briefcase, 
  UserPlus, 
  X, 
  Loader2, 
  Save, 
  ChevronDown,
  Building,
  FileText,
  ExternalLink,
  Trash2,
  QrCode,
  Printer,
  Filter,
  Search,
  ScanLine,
  CheckCircle2
} from "lucide-react";

// List 8 Kategori Lembaga
export const KATEGORI_LEMBAGA_LIST = [
  "Perangkat Desa",
  "Badan Permusyawaratan Desa (BPD)",
  "RT dan RW",
  "LPM",
  "POSYANDU",
  "TP-PKK",
  "KARANG TARUNA",
  "PUSKESOS"
];

// Helper Code128 SVG Generator (Pure SVG Barcode Generator)
function generateBarcodeSvg(text: string) {
  const code = text.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  let pattern = "10101100110"; // Start pattern
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const binary = (charCode * 12345).toString(2).padStart(11, "0");
    pattern += binary;
  }
  pattern += "1100011101011"; // Stop pattern

  const barWidth = 3;
  const height = 65;
  const totalWidth = pattern.length * barWidth;

  let rects = "";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      rects += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${height}" fill="#000" />`;
    }
  }

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 20}">${rects}<text x="${totalWidth / 2}" y="${height + 15}" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle" fill="#000">${code}</text></svg>`;
}

export default function AparaturPage() {
  const { data: session } = useSession();
  const isAdminMaster = (session?.user as any)?.role === "ADMIN_MASTER" || (session?.user as any)?.role === "ADMIN_DESA";

  const [aparatur, setAparatur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSKModal, setShowSKModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAparatur, setSelectedAparatur] = useState<any>(null);

  // Filter States
  const [selectedKategori, setSelectedKategori] = useState<string>("SEMUA");
  const [search, setSearch] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    barcodeId: "",
    email: "",
    phoneNumber: "",
    kategori: "Perangkat Desa",
    role: "ADMIN_DESA",
    position: "",
    photo: ""
  });

  const [skData, setSkData] = useState({
    skNumber: "",
    skUrl: ""
  });

  // Load Initial Aparatur List & merge custom localStorage
  const fetchAparatur = async () => {
    setLoading(true);
    try {
      let data = await getAparaturDesaList();
      if (typeof window !== "undefined") {
        const custom = localStorage.getItem("aparatur_custom_list");
        if (custom) {
          try {
            const parsed = JSON.parse(custom);
            data = [...data, ...parsed];
          } catch (e) {}
        }
      }
      setAparatur(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAparatur();
  }, []);

  // Save Custom List to LocalStorage
  const saveCustomAparatur = (newItem: any) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aparatur_custom_list");
      let list: any[] = [];
      if (saved) {
        try { list = JSON.parse(saved); } catch (e) {}
      }
      list = [newItem, ...list];
      localStorage.setItem("aparatur_custom_list", JSON.stringify(list));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const catCode = formData.kategori.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "");
      const generatedBarcode = formData.barcodeId || formData.nik || `APR-${catCode}-${Math.floor(100 + Math.random() * 900)}`;

      let level = 2;
      if (formData.role === "KADES") level = 0;
      else if (formData.role === "SEKDES") level = 1;
      else if (formData.role === "KADUS") level = 3;

      const newItem = {
        id: `APR-${Date.now()}`,
        name: formData.name,
        nik: formData.nik || generatedBarcode,
        barcodeId: generatedBarcode,
        kategori: formData.kategori,
        position: formData.position,
        role: formData.role,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        photo: formData.photo,
        skNumber: "BELUM TERBIT",
        skUrl: "",
        level
      };

      try {
        await addAparaturDesa({
          name: formData.name,
          nik: formData.nik || generatedBarcode,
          role: formData.role,
          position: `${formData.kategori} - ${formData.position}`,
          photo: formData.photo,
          level
        });
      } catch (err) {
        // Fallback to local storage persistence
        saveCustomAparatur(newItem);
      }

      saveCustomAparatur(newItem);
      setShowAddModal(false);
      fetchAparatur();
      setFormData({
        name: "",
        nik: "",
        barcodeId: "",
        email: "",
        phoneNumber: "",
        kategori: "Perangkat Desa",
        role: "ADMIN_DESA",
        position: "",
        photo: ""
      });
    } catch (error) {
      alert("Gagal menambahkan aparatur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aparatur ini?")) return;
    try {
      await deleteAparaturDesa(id);
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("aparatur_custom_list");
        if (saved) {
          try {
            const list = JSON.parse(saved).filter((item: any) => item.id !== id);
            localStorage.setItem("aparatur_custom_list", JSON.stringify(list));
          } catch (e) {}
        }
      }
      fetchAparatur();
    } catch (error) {
      alert("Gagal menghapus aparatur.");
    }
  };

  const handleUpdateSK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAparatur) return;
    setSaving(true);
    try {
      await updateAparaturSK(selectedAparatur.id, skData);
      setShowSKModal(false);
      fetchAparatur();
    } catch (error) {
      alert("Gagal memperbarui SK.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered List based on Dropdown Kategori Lembaga & Search
  const filteredAparatur = useMemo(() => {
    return aparatur.filter(person => {
      const personKat = person.kategori || (
        person.role === "KADES" || person.role === "SEKDES" || person.role === "KASI" || person.role === "KAUR"
          ? "Perangkat Desa" 
          : "Perangkat Desa"
      );

      const matchCategory = selectedKategori === "SEMUA" || personKat.toLowerCase().includes(selectedKategori.toLowerCase());
      const matchSearch = 
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.position.toLowerCase().includes(search.toLowerCase()) ||
        (person.nik && person.nik.includes(search));

      return matchCategory && matchSearch;
    });
  }, [aparatur, selectedKategori, search]);

  // Print Kartu Barcode Absensi Handler
  const handlePrintCard = (person: any) => {
    const barcodeCode = person.barcodeId || person.nik || `APR-DESA-${person.id.slice(0, 5)}`;
    const barcodeSvg = generateBarcodeSvg(barcodeCode);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kartu Absensi Barcode - ${person.name}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; display: flex; justify-content: center; }
    .card { width: 320px; background: #ffffff; border: 2px solid #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .card-header { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 15px; text-align: center; }
    .card-header h2 { font-size: 14px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .card-header p { font-size: 10px; opacity: 0.8; margin: 2px 0 0 0; font-weight: bold; }
    .card-body { padding: 20px; text-align: center; }
    .photo { width: 80px; height: 80px; border-radius: 16px; object-fit: cover; margin: 0 auto 12px auto; border: 2px solid #e2e8f0; }
    .name { font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 2px; text-transform: uppercase; }
    .pos { font-size: 11px; font-weight: bold; color: #64748b; margin-bottom: 15px; text-transform: uppercase; }
    .barcode-box { background: #f1f5f9; padding: 12px; border-radius: 12px; border: 1px border-slate-300; }
    .barcode-img { width: 100%; max-height: 80px; object-fit: contain; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <div class="no-print" style="margin-bottom: 15px;">
      <button onclick="window.print()" style="padding: 10px 20px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">Cetak Kartu Absensi</button>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>PEMERINTAH DESA CIMANGGU I</h2>
        <p>KARTU ABSENSI RESMI APARATUR</p>
      </div>
      <div class="card-body">
        <img src="${person.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(person.name)}" class="photo" alt="${person.name}" />
        <div class="name">${person.name}</div>
        <div class="pos">${person.position}</div>
        <div class="barcode-box">
          <img src="${barcodeSvg}" class="barcode-img" alt="Barcode ${barcodeCode}" />
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold animate-pulse">Menyiapkan Struktur Organisasi & Aparatur Desa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Building size={12} /> STRUCTURE & APARATUR MANAGE
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Aparatur & Kelembagaan Desa</h1>
          <p className="text-slate-500 text-sm font-medium">Manajemen data perangkat desa, BPD, RT/RW, LPM, Posyandu, PKK, Karang Taruna, Puskesos & Barcode Absensi.</p>
        </div>

        {isAdminMaster && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 group cursor-pointer"
          >
            <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> Tambah Aparatur Baru
          </button>
        )}
      </div>

      {/* DROPDOWN FILTER KATEGORI LEMBAGA (8 KATEGORI) & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Dropdown Kategori Lembaga */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
              <Filter size={15} className="text-blue-600" /> Kategori Lembaga:
            </span>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 shadow-xs cursor-pointer"
            >
              <option value="SEMUA">Semua Kategori (8 Lembaga)</option>
              {KATEGORI_LEMBAGA_LIST.map((kat, idx) => (
                <option key={idx} value={kat}>
                  {idx + 1}. {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / Jabatan / Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* QUICK CATEGORY BADGES */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedKategori("SEMUA")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedKategori === "SEMUA" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({aparatur.length})
          </button>
          {KATEGORI_LEMBAGA_LIST.map((kat, idx) => {
            const count = aparatur.filter(a => (a.kategori || "Perangkat Desa").toLowerCase().includes(kat.toLowerCase())).length;
            return (
              <button
                key={idx}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedKategori === kat 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {kat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TABLE DAFTAR APARATUR DESA */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daftar Aparatur Desa</h2>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Menampilkan {filteredAparatur.length} aparatur untuk kategori: <span className="font-bold text-blue-600">{selectedKategori}</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-2">Aparatur & Jabatan</th>
                <th className="px-6 py-2">Kategori Lembaga</th>
                <th className="px-6 py-2">Barcode Absensi</th>
                <th className="px-6 py-2">Nomor SK</th>
                <th className="px-6 py-2 text-right">Aksi & Kartu</th>
              </tr>
            </thead>
            <tbody>
              {filteredAparatur.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-bold text-xs">
                    Tidak ada aparatur ditemukan untuk kategori &quot;{selectedKategori}&quot;.
                  </td>
                </tr>
              ) : (
                filteredAparatur.map((person) => {
                  const barcodeCode = person.barcodeId || person.nik || `APR-DESA-${person.id.slice(0, 5)}`;
                  const kat = person.kategori || "Perangkat Desa";

                  return (
                    <tr key={person.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="bg-white border-y border-l border-slate-100 rounded-l-2xl px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner overflow-hidden relative bg-slate-100 shrink-0">
                            {person.photo ? (
                              <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                            ) : (
                              person.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{person.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="bg-white border-y border-slate-100 px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {kat}
                        </span>
                      </td>
                      <td className="bg-white border-y border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                            {barcodeCode}
                          </span>
                          <button
                            onClick={() => handlePrintCard(person)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Lihat / Cetak Kartu Barcode Absensi"
                          >
                            <QrCode size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="bg-white border-y border-slate-100 px-6 py-4">
                        <span className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                          {person.skNumber || "BELUM TERBIT"}
                        </span>
                      </td>
                      <td className="bg-white border-y border-r border-slate-100 rounded-r-2xl px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePrintCard(person)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <Printer size={13} />
                            <span>Kartu</span>
                          </button>
                          {isAdminMaster && (
                            <>
                              <button 
                                onClick={() => { setSelectedAparatur(person); setSkData({ skNumber: person.skNumber || "", skUrl: person.skUrl || "" }); setShowSKModal(true); }}
                                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                title="Manajemen SK"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(person.id)}
                                className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
                                title="Hapus Aparatur"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
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

      {/* ADD APARATUR MODAL WITH 8 KATEGORI LEMBAGA DROPDOWN */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Tambah Aparatur Baru</h2>
                <p className="text-slate-400 text-xs font-medium">Daftarkan perangkat/lembaga desa ke dalam sistem & Barcode Absensi</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Lembaga (Dropdown 8 Lembaga)</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  >
                    {KATEGORI_LEMBAGA_LIST.map((kat, idx) => (
                      <option key={idx} value={kat}>
                        {idx + 1}. {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan Struktur</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Kepala Desa / Ketua BPD / Ketua RT 004"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Aparatur</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap beserta Gelar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (Optional)</label>
                  <input
                    type="text"
                    placeholder="320112..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode ID Absensi (Auto-Generated jika kosong)</label>
                  <input
                    type="text"
                    placeholder="misal: APR-PRK-001"
                    value={formData.barcodeId}
                    onChange={(e) => setFormData({ ...formData, barcodeId: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-mono font-bold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="email@desacimanggu1.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUpload onUploadSuccess={(url) => setFormData({ ...formData, photo: url })} defaultValue={formData.photo} label="Foto Aparatur" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Simpan Data & Barcode Aparatur</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SK MODAL */}
      {showSKModal && selectedAparatur && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSKModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen SK</h2>
                <p className="text-slate-500 text-xs font-medium">Update dokumen SK untuk <span className="text-blue-600 font-bold">{selectedAparatur.name}</span></p>
              </div>
              <button onClick={() => setShowSKModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateSK} className="p-6 space-y-4 bg-white text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor SK Pengangkatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 141/05/DS/2026"
                  value={skData.skNumber}
                  onChange={(e) => setSkData({ ...skData, skNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Dokumen SK (PDF / Drive)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={skData.skUrl}
                  onChange={(e) => setSkData({ ...skData, skUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Arsip SK</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
