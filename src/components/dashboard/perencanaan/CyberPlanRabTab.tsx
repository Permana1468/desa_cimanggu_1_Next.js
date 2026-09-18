"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Printer, Edit2, FileText, X, Sparkles, RefreshCw, Calculator } from "lucide-react";
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
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  desa?: string;
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

export const createDptRabPreset = (): RabFormData => ({
  id: "rab-dpt-pdf-preset-04",
  provinsi: "Jawa Barat",
  kabupaten: "Bogor",
  kecamatan: "Cibungbulang",
  desa: "Cimanggu I",
  kategoriRab: "BANKEU",
  lokasi: "Kp. Jatake Rt. 001 Rw. 005",
  noRab: "04",
  program: "Bantuan Keuangan Infrastruktur Desa",
  jenisKegiatan: "Pembuatan Dinding Penahan Tanah (DPT)",
  ukuranDimensi: "Panjang : 30 m' x Tinggi : 6 m'",
  kadesName: "HERNAWAN M. SODIK",
  tpkName: "SANA SULAEMAN",
  bahanList: [
    { id: uuidv4(), uraian: "Batu Belah", volumeSwadaya: 0, volumeApbd: 112, satuan: "m3", kategori: "", hargaSatuan: 330000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Pasir Pasang", volumeSwadaya: 0, volumeApbd: 49, satuan: "m3", kategori: "", hargaSatuan: 420000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Semen PC (50 Kg)", volumeSwadaya: 0, volumeApbd: 634, satuan: "Zak", kategori: "", hargaSatuan: 90000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Pipa PVC dia. 2\"", volumeSwadaya: 0, volumeApbd: 27, satuan: "btg", kategori: "", hargaSatuan: 67000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Tanah Biasa untuk Timbunan", volumeSwadaya: 0, volumeApbd: 45, satuan: "m3", kategori: "", hargaSatuan: 114000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Pasir Beton", volumeSwadaya: 0, volumeApbd: 19, satuan: "m3", kategori: "", hargaSatuan: 458000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Batu Pecah 1-2 cm", volumeSwadaya: 0, volumeApbd: 30, satuan: "m3", kategori: "", hargaSatuan: 360000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Papan Cor", volumeSwadaya: 0, volumeApbd: 6, satuan: "btg", kategori: "", hargaSatuan: 38000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Besi Φ 12", volumeSwadaya: 0, volumeApbd: 132, satuan: "btg", kategori: "", hargaSatuan: 187000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Besi Φ 8", volumeSwadaya: 0, volumeApbd: 116, satuan: "btg", kategori: "", hargaSatuan: 97000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Papan Nama Kegiatan", volumeSwadaya: 0, volumeApbd: 1, satuan: "Ls", kategori: "", hargaSatuan: 150000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Prasasti", volumeSwadaya: 0, volumeApbd: 1, satuan: "Ls", kategori: "", hargaSatuan: 350000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
  ],
  alatList: [
    { id: uuidv4(), uraian: "Cangkul", volumeSwadaya: 0, volumeApbd: 15, satuan: "bh", kategori: "", hargaSatuan: 83000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Pengki", volumeSwadaya: 0, volumeApbd: 15, satuan: "bh", kategori: "", hargaSatuan: 15000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Ember Adukan", volumeSwadaya: 0, volumeApbd: 30, satuan: "bh", kategori: "", hargaSatuan: 17000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Sendok Semen", volumeSwadaya: 0, volumeApbd: 15, satuan: "bh", kategori: "", hargaSatuan: 39000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Benang Nilon", volumeSwadaya: 0, volumeApbd: 20, satuan: "bh", kategori: "", hargaSatuan: 5000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Meteran", volumeSwadaya: 0, volumeApbd: 2, satuan: "bh", kategori: "", hargaSatuan: 25000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Palu Ghodam", volumeSwadaya: 0, volumeApbd: 2, satuan: "bh", kategori: "", hargaSatuan: 167000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Linggis", volumeSwadaya: 0, volumeApbd: 2, satuan: "bh", kategori: "", hargaSatuan: 66000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Sewa Mesin Molen", volumeSwadaya: 0, volumeApbd: 10, satuan: "hari", kategori: "", hargaSatuan: 400000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
  ],
  upahList: [
    { id: uuidv4(), uraian: "Pekerja", volumeSwadaya: 0, volumeApbd: 144, satuan: "hok", kategori: "", hargaSatuan: 120000, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "Tukang", volumeSwadaya: 0, volumeApbd: 37, satuan: "hok", kategori: "", hargaSatuan: 150000, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "Mandor", volumeSwadaya: 0, volumeApbd: 26, satuan: "hok", kategori: "", hargaSatuan: 200000, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
  ],
  operasionalList: [
    { id: uuidv4(), uraian: "Honor TPK", volumeSwadaya: 0, volumeApbd: 0, satuan: "", kategori: "", hargaSatuan: 0, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "1.1. Ketua", volumeSwadaya: 0, volumeApbd: 10, satuan: "Hok", kategori: "", hargaSatuan: 200000, hasPpn: false, hasPph21: true, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "1.2. Sekretaris", volumeSwadaya: 0, volumeApbd: 10, satuan: "Hok", kategori: "", hargaSatuan: 150000, hasPpn: false, hasPph21: true, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "1.3. Anggota (3 orang x 100.000)", volumeSwadaya: 0, volumeApbd: 10, satuan: "Hok", kategori: "", hargaSatuan: 300000, hasPpn: false, hasPph21: true, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "Biaya survei awal", volumeSwadaya: 0, volumeApbd: 1, satuan: "paket", kategori: "", hargaSatuan: 1000000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Biaya Survei Akhir", volumeSwadaya: 0, volumeApbd: 1, satuan: "paket", kategori: "", hargaSatuan: 1000000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Alat tulis kantor", volumeSwadaya: 0, volumeApbd: 1, satuan: "paket", kategori: "", hargaSatuan: 846235, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Biaya transportasi", volumeSwadaya: 0, volumeApbd: 1, satuan: "paket", kategori: "", hargaSatuan: 1000000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Biaya Cetak dan Dokumentasi", volumeSwadaya: 0, volumeApbd: 1, satuan: "paket", kategori: "", hargaSatuan: 1000000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Biaya Pelaporan dan Penggandaan kegiatan", volumeSwadaya: 0, volumeApbd: 1, satuan: "paket", kategori: "", hargaSatuan: 1000000, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "BPJS Ketenagakerjaan", volumeSwadaya: 0, volumeApbd: 1, satuan: "kegiatan", kategori: "", hargaSatuan: 429765, hasPpn: false, hasPph21: false, hasPph22: false, hasPph23: false },
    { id: uuidv4(), uraian: "Papan Nama Kegiatan", volumeSwadaya: 0, volumeApbd: 1, satuan: "Ls", kategori: "", hargaSatuan: 150000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
    { id: uuidv4(), uraian: "Prasasti", volumeSwadaya: 0, volumeApbd: 1, satuan: "Ls", kategori: "", hargaSatuan: 350000, hasPpn: true, hasPph21: false, hasPph22: true, hasPph23: false },
  ]
});

const emptyForm = (): RabFormData => ({
  id: "",
  provinsi: "Jawa Barat",
  kabupaten: "Bogor",
  kecamatan: "Cibungbulang",
  desa: "Cimanggu I",
  kategoriRab: "BANKEU",
  lokasi: "",
  noRab: "",
  program: "",
  jenisKegiatan: "",
  ukuranDimensi: "",
  kadesName: "HERNAWAN M. SODIK",
  tpkName: "SANA SULAEMAN",
  bahanList: [],
  alatList: [],
  upahList: [],
  operasionalList: [...defaultOperasional]
});

export function CyberPlanRabTab({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<"list" | "form" | "print">("list");
  const [isSynced, setIsSynced] = useState(false);
  
  const [rabList, setRabList] = useState<RabFormData[]>([
    createDptRabPreset()
  ]);

  const [currentForm, setCurrentForm] = useState<RabFormData>(emptyForm());
  const [printData, setPrintData] = useState<RabFormData | null>(null);

  // Auto-sync TOS DPT calculated volumes on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawSync = localStorage.getItem("tos_dpt_sync_data");
        if (rawSync) {
          const syncObj = JSON.parse(rawSync);
          if (syncObj.dptP && syncObj.dptT) {
            setRabList(prev => prev.map(rab => {
              if (rab.noRab === "04" || rab.jenisKegiatan.includes("DPT")) {
                const updatedBahan = rab.bahanList.map(item => {
                  if (item.uraian.includes("Batu Belah") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Batu Belah"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Pasir Pasang") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Pasir Pasang"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Semen PC") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("TOTAL SEMEN PC"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Pipa PVC") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Pipa PVC"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Timbunan") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Volume Timbunan"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Pasir Beton") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Pasir Beton"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Batu Pecah") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Batu Pecah"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Papan Cor") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Bekisting Papan Cor"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Besi Φ 12") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Besi Ø12"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Besi Φ 8") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("Besi Ø8"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  return item;
                });

                const updatedUpah = rab.upahList.map(item => {
                  if (item.uraian.includes("Pekerja") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("TOTAL PEKERJA"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Tukang") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("TOTAL TUKANG"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  if (item.uraian.includes("Mandor") && syncObj.items) {
                    const found = syncObj.items.find((i: any) => i.name.includes("TOTAL MANDOR"));
                    if (found) return { ...item, volumeApbd: Math.ceil(found.volume) };
                  }
                  return item;
                });

                return {
                  ...rab,
                  ukuranDimensi: `Panjang : ${syncObj.dptP} m' x Tinggi : ${syncObj.dptT} m'`,
                  kadesName: syncObj.metaKades || rab.kadesName,
                  tpkName: syncObj.metaPelaksana || rab.tpkName,
                  bahanList: updatedBahan,
                  upahList: updatedUpah
                };
              }
              return rab;
            }));
            setIsSynced(true);
          }
        }
      } catch (err) {}
    }
  }, []);

  const handleCreateNew = () => {
    setCurrentForm({ ...emptyForm(), id: uuidv4() });
    setView("form");
  };

  const handleCreateDptPreset = () => {
    const preset = createDptRabPreset();
    preset.id = uuidv4();
    setCurrentForm(preset);
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

  // Sync SHT prices standard mapping
  const syncHargaSatuansSht = () => {
    const shtPriceMap: Record<string, number> = {
      "batu belah": 330000,
      "pasir pasang": 420000,
      "semen pc (50 kg)": 90000,
      "semen pc": 90000,
      "pipa pvc dia. 2\"": 67000,
      "pipa pvc 2\"": 67000,
      "tanah biasa untuk timbunan": 114000,
      "pasir beton": 458000,
      "batu pecah 1-2 cm": 360000,
      "papan cor": 38000,
      "besi φ 12": 187000,
      "besi ø12": 187000,
      "besi φ 8": 97000,
      "besi ø8": 97000,
      "cangkul": 83000,
      "pengki": 15000,
      "ember adukan": 17000,
      "sendok semen": 39000,
      "benang nilon": 5000,
      "meteran": 25000,
      "palu ghodam": 167000,
      "linggis": 66000,
      "sewa mesin molen": 400000,
      "pekerja": 120000,
      "tukang": 150000,
      "mandor": 200000,
    };

    const updateSection = (items: RabItem[]) => {
      return items.map(item => {
        const key = item.uraian.trim().toLowerCase();
        if (shtPriceMap[key]) {
          return { ...item, hargaSatuan: shtPriceMap[key] };
        }
        return item;
      });
    };

    setCurrentForm(prev => ({
      ...prev,
      bahanList: updateSection(prev.bahanList),
      alatList: updateSection(prev.alatList),
      upahList: updateSection(prev.upahList),
    }));

    alert("Harga Satuan berhasil disinkronkan dengan SHT!");
  };

  // Sync volumes from TOS DPT calculation
  const syncVolumeFromTosDpt = () => {
    const dptPreset = createDptRabPreset();
    setCurrentForm(prev => ({
      ...prev,
      bahanList: dptPreset.bahanList,
      upahList: dptPreset.upahList,
    }));
    alert("Volume Material & Upah HOK berhasil diimpor dari TOS DPT!");
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
            <p className="text-sm text-slate-500 mt-1 ml-10">Kelola dan cetak dokumen Rancangan Anggaran Belanja Desa</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleCreateDptPreset} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-sm shadow-sm transition-all">
              <Sparkles size={16} /> Load Preset RAB DPT (No. 04)
            </button>
            <button onClick={handleCreateNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
              <Plus size={16} /> Buat RAB Baru
            </button>
          </div>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
             <h2 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
               <FileText size={18} className="text-slate-400" /> Arsip Dokumen RAB Desa
             </h2>
             <span className="text-xs text-slate-500 font-medium">{rabList.length} Dokumen Tersedia</span>
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
                     <td className="p-4 font-semibold">{rab.jenisKegiatan || "Tanpa Judul"}</td>
                     <td className="p-4 text-slate-500">{rab.lokasi || "-"}</td>
                     <td className="p-4 flex justify-end gap-2">
                       <button onClick={() => handleEdit(rab)} className="p-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-lg transition-all shadow-sm flex items-center gap-1 text-xs font-bold" title="Edit RAB">
                         <Edit2 size={14} /> Edit
                       </button>
                       <button onClick={() => handlePrint(rab)} className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-all shadow-sm flex items-center gap-1 text-xs font-black" title="Cetak F4 PDF">
                         <Printer size={14} /> Cetak RAB PDF
                       </button>
                       <button onClick={() => handleDelete(rab.id)} className="p-2 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition-all shadow-sm" title="Hapus">
                         <Trash2 size={14} />
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

  const getVolLabel = (kategoriRab: string) => {
    const upper = (kategoriRab || "").toUpperCase();
    if (upper.includes("DANA DESA") || upper === "DD") return "Vol Dana Desa";
    if (upper.includes("ADD")) return "Vol ADD";
    if (upper.includes("BHPRD")) return "Vol BHPRD";
    return "Vol APBD";
  };

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
          {list.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 p-4 bg-white rounded-lg border border-slate-200 relative group hover:border-blue-300 transition-colors shadow-sm">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Uraian</label>
                <input type="text" value={item.uraian} onChange={e => updateItem(listName, item.id, "uraian", e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold" placeholder="Nama Barang / Kegiatan" />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-[11px] text-blue-700 mb-1 font-semibold">{getVolLabel(currentForm.kategoriRab)}</label>
                <input type="number" value={item.volumeApbd || ""} onChange={e => updateItem(listName, item.id, "volumeApbd", parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold text-blue-900" placeholder="0" />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Vol Swadaya</label>
                <input type="number" value={item.volumeSwadaya || ""} onChange={e => updateItem(listName, item.id, "volumeSwadaya", parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0" />
              </div>
              <div className="col-span-4 md:col-span-1">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Satuan</label>
                <input type="text" value={item.satuan} onChange={e => updateItem(listName, item.id, "satuan", e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium" placeholder="m3" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">Harga Satuan (Rp)</label>
                <div className="flex gap-2">
                  <input type="number" value={item.hargaSatuan || ""} onChange={e => updateItem(listName, item.id, "hargaSatuan", parseFloat(e.target.value) || 0)} className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono font-bold" placeholder="0" />
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
          <p className="text-sm text-slate-500 mt-1 ml-10">Isi rincian anggaran untuk membuat dokumen cetak F4</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={syncVolumeFromTosDpt} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
            <Calculator size={15} /> Impor Volume TOS DPT
          </button>
          <button onClick={syncHargaSatuansSht} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
            <RefreshCw size={15} /> Sinkronkan SHT
          </button>
          <button onClick={() => setView("list")} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm">
            <X size={16} /> Batal
          </button>
          <button onClick={handleSaveForm} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all">
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
                    <input type="text" name="provinsi" value={currentForm.provinsi || "Jawa Barat"} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Kabupaten</label>
                    <input type="text" name="kabupaten" value={currentForm.kabupaten || "Bogor"} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Kecamatan</label>
                    <input type="text" name="kecamatan" value={currentForm.kecamatan || "Cibungbulang"} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">Desa</label>
                    <input type="text" name="desa" value={currentForm.desa || "Cimanggu I"} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 outline-none" />
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
                  <input type="text" name="noRab" value={currentForm.noRab} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Program</label>
                  <input type="text" name="program" value={currentForm.program} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Jenis Kegiatan</label>
                  <input type="text" name="jenisKegiatan" value={currentForm.jenisKegiatan} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold" />
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
                  <input type="text" name="kadesName" value={currentForm.kadesName} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase font-semibold" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Nama Pelaksana Kegiatan</label>
                  <input type="text" name="tpkName" value={currentForm.tpkName} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase font-semibold" />
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

