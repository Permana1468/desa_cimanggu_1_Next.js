"use client";

import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, Printer, Edit2, FileText, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { CetakRabDesa } from "./CetakRabDesa";

export type RabItem = {
  id: string;
  uraian: string;
  volumeSwadaya: number;
  volumeApbd: number;
  satuan: string;
  kategori: string;
  hargaSatuan: number;
  hasPpn: boolean;
  hasPph21: boolean;
  hasPph22: boolean;
  hasPph23: boolean;
};

export type RabFormData = {
  id: string;
  kategoriRab: string;
  lokasi: string;
  noRab: string;
  program: string;
  jenisKegiatan: string;
  ukuranDimensi: string;
  kadesName: string;
  tpkName: string;
  bahanList: RabItem[];
  alatList: RabItem[];
  upahList: RabItem[];
  operasionalList: RabItem[];
};

const defaultOperasional = [
  { id: uuidv4(), uraian: "Honor TPK", volumeSwadaya: 0, volumeApbd: 0, satuan: "", kategori: "", hargaSatuan: 0, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
  { id: uuidv4(), uraian: "1.1. Ketua", volumeSwadaya: 0, volumeApbd: 10, satuan: "Hok", kategori: "", hargaSatuan: 200000, hasPpn: false, hasPph21: true, hasPph22: false, hasPph23: false },
  { id: uuidv4(), uraian: "1.2. Sekretaris", volumeSwadaya: 0, volumeApbd: 10, satuan: "Hok", kategori: "", hargaSatuan: 150000, hasPpn: false, hasPph21: true, hasPph22: false, hasPph23: false },
  { id: uuidv4(), uraian: "1.3. Anggota (3 orang x 100.000)", volumeSwadaya: 0, volumeApbd: 10, satuan: "Hok", kategori: "", hargaSatuan: 300000, hasPpn: false, hasPph21: true, hasPph22: false, hasPph23: false },
];

const emptyForm = (): RabFormData => ({
  id: "",
  kategoriRab: "BANKEU",
  lokasi: "",
  noRab: "",
  program: "",
  jenisKegiatan: "",
  ukuranDimensi: "",
  kadesName: "",
  tpkName: "",
  bahanList: [],
  alatList: [],
  upahList: [],
  operasionalList: [...defaultOperasional]
});

export function CyberPlanRabTab({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<"list" | "form" | "print">("list");
  
  const [rabList, setRabList] = useState<RabFormData[]>([
    {
      id: uuidv4(),
      kategoriRab: "BANKEU",
      lokasi: "Kp. Jatake Rt. 003 Rw. 007",
      noRab: "01",
      program: "Bantuan Keuangan Infrastruktur Desa",
      jenisKegiatan: "Betonisasi Jalan Desa dan Pelengkapnya",
      ukuranDimensi: "Betonosai = 170 x 2,3 x 0,15 m' | TPT = 37 x 1 x 0,30 m'",
      kadesName: "HERNAWAN M. SODIK",
      tpkName: "FERRY GUNAWAN",
      bahanList: [
        { id: uuidv4(), uraian: "Pasir Beton", volumeSwadaya: 0, volumeApbd: 31, satuan: "m3", kategori: "", hargaSatuan: 458000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false }
      ],
      alatList: [],
      upahList: [],
      operasionalList: [...defaultOperasional]
    }
  ]);

  const [currentForm, setCurrentForm] = useState<RabFormData>(emptyForm());
  const [printData, setPrintData] = useState<RabFormData | null>(null);

  const handleCreateNew = () => {
    setCurrentForm({ ...emptyForm(), id: uuidv4() });
    setView("form");
  };

  const handleEdit = (rab: RabFormData) => {
    setCurrentForm({ ...rab });
    setView("form");
  };

  const handleDelete = (id: string) => {
    if(confirm("Yakin ingin menghapus RAB ini?")) {
      setRabList(prev => prev.filter(r => r.id !== id));
    }
  };

  const handlePrint = (rab: RabFormData) => {
    setPrintData(rab);
    setView("print");
  };

  const handleSaveForm = () => {
    setRabList(prev => {
      const exists = prev.find(r => r.id === currentForm.id);
      if (exists) {
        return prev.map(r => r.id === currentForm.id ? currentForm : r);
      } else {
        return [...prev, currentForm];
      }
    });
    alert("RAB Berhasil Disimpan!");
    setView("list");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCurrentForm({ ...currentForm, [e.target.name]: e.target.value });
  };

  const updateListField = (listName: keyof RabFormData, newList: RabItem[]) => {
    setCurrentForm({ ...currentForm, [listName]: newList });
  };

  const addItem = (listName: keyof RabFormData) => {
    const list = currentForm[listName] as RabItem[];
    updateListField(listName, [...list, {
      id: uuidv4(), uraian: "", volumeSwadaya: 0, volumeApbd: 0, satuan: "", kategori: "", hargaSatuan: 0,
      hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false
    }]);
  };

  const updateItem = (listName: keyof RabFormData, id: string, field: keyof RabItem, value: any) => {
    const list = currentForm[listName] as RabItem[];
    updateListField(listName, list.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (listName: keyof RabFormData, id: string) => {
    const list = currentForm[listName] as RabItem[];
    updateListField(listName, list.filter(item => item.id !== id));
  };

  if (view === "print" && printData) {
    return <CetakRabDesa 
      formData={printData}
      bahanList={printData.bahanList}
      alatList={printData.alatList}
      upahList={printData.upahList}
      operasionalList={printData.operasionalList}
      onBack={() => setView("list")} 
    />;
  }

  if (view === "list") {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-80px)] p-6 md:p-8 rounded-[2rem] font-sans text-slate-800 shadow-inner">
        {/* HEADER STANDARD ADMIN */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-white shadow-sm rounded-lg border border-slate-200">
                <ArrowLeft size={20} />
              </button>
              Manajemen RAB Desa
            </h1>
            <p className="text-sm text-slate-500 mt-1 ml-10">Kelola dan cetak dokumen Rancangan Anggaran Belanja</p>
          </div>
          <button onClick={handleCreateNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors">
            <Plus size={16} /> Buat RAB Baru
          </button>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-200 bg-slate-50/50">
             <h2 className="font-semibold text-slate-700 flex items-center gap-2">
               <FileText size={18} className="text-slate-400" /> Arsip Dokumen RAB
             </h2>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                   <th className="p-4 font-medium">Kategori</th>
                   <th className="p-4 font-medium">No. RAB</th>
                   <th className="p-4 font-medium">Kegiatan</th>
                   <th className="p-4 font-medium">Lokasi</th>
                   <th className="p-4 font-medium text-right">Aksi</th>
                 </tr>
               </thead>
               <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                 {rabList.length === 0 && (
                   <tr>
                     <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada dokumen RAB yang dibuat.</td>
                   </tr>
                 )}
                 {rabList.map(rab => (
                   <tr key={rab.id} className="hover:bg-slate-50/80 transition-colors">
                     <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${rab.kategoriRab === "BANKEU" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                          RAB {rab.kategoriRab}
                        </span>
                     </td>
                     <td className="p-4 font-medium">{rab.noRab || "-"}</td>
                     <td className="p-4">{rab.jenisKegiatan || "Tanpa Judul"}</td>
                     <td className="p-4 text-slate-500">{rab.lokasi || "-"}</td>
                     <td className="p-4 flex justify-end gap-2">
                       <button onClick={() => handleEdit(rab)} className="p-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-500 hover:text-blue-600 rounded-md transition-all shadow-sm" title="Edit">
                         <Edit2 size={15} />
                       </button>
                       <button onClick={() => handlePrint(rab)} className="p-2 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-500 hover:text-emerald-600 rounded-md transition-all shadow-sm" title="Cetak F4">
                         <Printer size={15} />
                       </button>
                       <button onClick={() => handleDelete(rab.id)} className="p-2 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-md transition-all shadow-sm" title="Hapus">
                         <Trash2 size={15} />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  // === FORM VIEW ===
  const renderTable = (title: string, listName: keyof RabFormData) => {
    const list = currentForm[listName] as RabItem[];
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
          <button onClick={() => addItem(listName)} className="bg-white hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-slate-200 shadow-sm flex items-center gap-1">
            <Plus size={14} /> Tambah Item
          </button>
        </div>
        <div className="p-4 space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs italic">Belum ada data {title.toLowerCase()}.</div>
          )}
          {list.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 p-4 bg-white rounded-lg border border-slate-200 relative group hover:border-blue-300 transition-colors shadow-sm">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Uraian</label>
                <input type="text" value={item.uraian} onChange={e => updateItem(listName, item.id, "uraian", e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Nama Barang / Kegiatan" />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Vol APBD</label>
                <input type="number" value={item.volumeApbd || ""} onChange={e => updateItem(listName, item.id, "volumeApbd", parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Vol Swadaya</label>
                <input type="number" value={item.volumeSwadaya || ""} onChange={e => updateItem(listName, item.id, "volumeSwadaya", parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
              </div>
              <div className="col-span-4 md:col-span-1">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Satuan</label>
                <input type="text" value={item.satuan} onChange={e => updateItem(listName, item.id, "satuan", e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="m3" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Harga Satuan (Rp)</label>
                <div className="flex gap-2">
                  <input type="number" value={item.hargaSatuan || ""} onChange={e => updateItem(listName, item.id, "hargaSatuan", parseFloat(e.target.value) || 0)} className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
                  <button onClick={() => removeItem(listName, item.id)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-rose-50 text-rose-600 rounded-md border border-rose-200 hover:bg-rose-500 hover:text-white transition-colors" title="Hapus">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="col-span-12 border-t border-slate-100 pt-3 mt-1 flex flex-wrap gap-4">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                  <input type="checkbox" checked={item.hasPpn} onChange={e => updateItem(listName, item.id, "hasPpn", e.target.checked)} className="accent-blue-600 w-3.5 h-3.5 rounded border-slate-300" />
                  + PPN 11%
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                  <input type="checkbox" checked={item.hasPph21} onChange={e => updateItem(listName, item.id, "hasPph21", e.target.checked)} className="accent-blue-600 w-3.5 h-3.5 rounded border-slate-300" />
                  + PPH 21 5%
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                  <input type="checkbox" checked={item.hasPph22} onChange={e => updateItem(listName, item.id, "hasPph22", e.target.checked)} className="accent-blue-600 w-3.5 h-3.5 rounded border-slate-300" />
                  + PPH 22 1.5%
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                  <input type="checkbox" checked={item.hasPph23} onChange={e => updateItem(listName, item.id, "hasPph23", e.target.checked)} className="accent-blue-600 w-3.5 h-3.5 rounded border-slate-300" />
                  + PPH 23 2%
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] p-6 md:p-8 rounded-[2rem] font-sans text-slate-800 shadow-inner">
      {/* HEADER FORM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <button onClick={() => setView("list")} className="text-slate-500 hover:text-slate-800 transition-colors p-1.5 bg-slate-100 rounded-md">
              <ArrowLeft size={18} />
            </button>
            Form Input RAB Desa
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-10">Isi rincian anggaran untuk membuat dokumen cetak</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView("list")} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
            <X size={16} /> Batal
          </button>
          <button onClick={handleSaveForm} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
            <Save size={16} /> Simpan RAB
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* IDENTITAS RAB */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
             <h2 className="font-semibold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100">Identitas RAB</h2>
             
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Provinsi</label>
                    <input type="text" value="Jawa Barat" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Kabupaten</label>
                    <input type="text" value="Bogor" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Kecamatan</label>
                    <input type="text" value="Cibungbulang" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Desa</label>
                    <input type="text" value="Cimanggu I" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-4"></div>
                
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Kategori RAB</label>
                  <select name="kategoriRab" value={currentForm.kategoriRab} onChange={e => handleChange(e as any)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold">
                    <option value="BANKEU">RAB BANKEU</option>
                    <option value="DANA DESA">RAB DANA DESA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">No. RAB</label>
                  <input type="text" name="noRab" value={currentForm.noRab} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Program</label>
                  <input type="text" name="program" value={currentForm.program} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Jenis Kegiatan</label>
                  <input type="text" name="jenisKegiatan" value={currentForm.jenisKegiatan} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Lokasi</label>
                  <input type="text" name="lokasi" value={currentForm.lokasi} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Ukuran / Dimensi</label>
                  <input type="text" name="ukuranDimensi" value={currentForm.ukuranDimensi} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Nama Kepala Desa</label>
                  <input type="text" name="kadesName" value={currentForm.kadesName} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Nama Pelaksana Kegiatan</label>
                  <input type="text" name="tpkName" value={currentForm.tpkName} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase" />
                </div>
             </div>
          </div>
        </div>

        {/* DATA ITEM RAB */}
        <div className="lg:col-span-8 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
           {renderTable("I. BAHAN", "bahanList")}
           {renderTable("II. ALAT", "alatList")}
           {renderTable("III. UPAH", "upahList")}
           {renderTable("IV. BIAYA OPERASIONAL", "operasionalList")}
        </div>
      </div>
    </div>
  );
}
