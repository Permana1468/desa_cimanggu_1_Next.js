"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Folder, 
  FolderArchive, 
  Search, 
  Printer, 
  ArrowRight, 
  Loader2, 
  Filter, 
  Check, 
  X, 
  FileCheck2, 
  Eye, 
  Stamp, 
  FileSignature,
  FileText,
  SlidersHorizontal
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  OfficialLetterDocument, 
  OfficialLetterData, 
  OfficialLetterType 
} from "@/components/documents/OfficialLetterDocument";
import { 
  getAgendaSuratList, 
  createSuratPelayanan, 
  getAgendaRegisterInfoTU,
  AgendaSuratItem,
  getPelayananQueues,
  QueueItem
} from "@/actions/pelayanan";
import { getWargaListForSurat } from "@/actions/documents";

export function PusatPersuratan({ tab }: { session?: any, tab: string }) {
  const [activeSubTab, setActiveSubTab] = useState(tab || "buat-surat");
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  const [mounted, setMounted] = useState(false);
  const [paperSize, setPaperSize] = useState<"A4" | "F4" | "Letter">("A4");
  const [printScale, setPrintScale] = useState<number>(100);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format Surat Terpilih
  const [letterType, setLetterType] = useState<OfficialLetterType>("sku");

  // State Formulir Surat
  const [formData, setFormData] = useState<OfficialLetterData>({
    letterType: "sku",
    nomorSurat: "500.3/047 - Pem",
    nomorResi: "TRK-CMG-202611-047",
    tanggalSurat: "19 Mei 2026",
    penandatangan: "SEKDES",
    namaPenandatangan: "FAJAR TRI APRIANA",
    showStamp: true,
    showMaterai: false,

    // Data Pemohon
    namaLengkap: "SARNAH",
    nik: "3201167010710001",
    jenisKelamin: "Perempuan",
    tempatLahir: "Bogor",
    tanggalLahir: "30-10-1971",
    agama: "Islam",
    kewarganegaraan: "Indonesia",
    alamat: "Kp. Ciaruteun RT.001 RW.003 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor.",
    statusPerkawinan: "Kawin",

    // Pengantar RT / RW
    rtPengantar: "001",
    rwPengantar: "003",
    kampungPengantar: "Kp. Ciaruteun",
    nomorPengantar: "          ",
    tanggalPengantar: "19/05/2026",

    // Khusus SKU
    namaUsaha: "WARUNG SEMBAKO",
    lokasiUsaha: "Kp. Ciaruteun RT.001 RW.003 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor.",
    berlakuMulai: "19 Mei 2026",
    berlakuSampai: "19 Juni 2026",
    keperluan: "Persyaratan Program Bantuan Tenaga Kerja Mandiri Pemula Tahun 2026",

    // Khusus Kematian
    hariMeninggal: "Jumat",
    tanggalMeninggal: "22 Februari 2026",
    jamMeninggal: "01:00",
    tempatMeninggal: "Kp. Ciaruteun RT.003 RW.004 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor.",
    sebabMeninggal: "Sakit",
    umurMeninggal: "59 Tahun",

    // Khusus SKKM Pendidikan
    namaAyah: "SARNA",
    namaIbu: "SITI",
    noKK: "3201161909230025",
    pendidikanDi: "UNIVERSITAS IBN KHALDUN BOGOR",

    // Khusus SKKM BPJS
    terdaftarDTKS: "TIDAK",
    tglPenerbitanKTP: "23-09-2012",
    tglPenerbitanKK: "24-07-2023",
    namaKepalaKeluarga: "SARNAH",

    // Khusus Kelahiran
    namaAnak: "MUHAMMAD ARKAN PRATAMA",
    anakKe: "1",
    anakKeTerbilang: "Satu",
    ayahNama: "USEP JAYA",
    ayahTTL: "Bogor, 12-04-1990",
    ayahNIK: "3201161204900004",
    ayahAgama: "Islam/Indonesia",
    ayahPekerjaan: "Wiraswasta",
    ayahAlamat: "Kp. Cimanggu RT.001 RW.001 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor",
    ibuNama: "SITI ROHMAH",
    ibuTTL: "Bogor, 08-09-1994",
    ibuNIK: "3201164809940003",
    ibuAgama: "Islam/Indonesia",
    ibuPekerjaan: "Mengurus Rumah Tangga",
    ibuAlamat: "Kp. Cimanggu RT.001 RW.001 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor",
    hariLahir: "Senin",
    tanggalLahirAnak: "18 Mei 2026",
    jamLahirAnak: "06:30",
    tempatLahirAnak: "KABUPATEN BOGOR",
  });

  // Mode Penomoran Register Surat
  const [modeNomor, setModeNomor] = useState<"OTOMATIS" | "MANUAL">("OTOMATIS");
  const [manualNomorSurat, setManualNomorSurat] = useState("");
  const [tuRegisterSeq, setTuRegisterSeq] = useState("047");

  // Status Action & Modal
  const [submitting, setSubmitting] = useState(false);
  const [issuedLetterModal, setIssuedLetterModal] = useState<any | null>(null);

  // Agenda List State
  const [agendaList, setAgendaList] = useState<AgendaSuratItem[]>([]);
  const [agendaSearch, setAgendaSearch] = useState("");
  const [loadingAgenda, setLoadingAgenda] = useState(false);

  // Antrean Pemohon Online
  const [onlineApplicants, setOnlineApplicants] = useState<QueueItem[]>([]);

  // Warga Search & Autofill State
  const [showWargaModal, setShowWargaModal] = useState(false);
  const [wargaQuery, setWargaQuery] = useState("");
  const [residentList, setResidentList] = useState<any[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(false);

  useEffect(() => {
    async function loadResidents() {
      setLoadingResidents(true);
      try {
        const list = await getWargaListForSurat();
        setResidentList(list || []);
      } finally {
        setLoadingResidents(false);
      }
    }
    loadResidents();
  }, []);

  const handleSelectResident = (w: any) => {
    let formattedTgl = "";
    if (w.tanggalLahir) {
      try {
        const d = new Date(w.tanggalLahir);
        formattedTgl = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      } catch {
        formattedTgl = String(w.tanggalLahir);
      }
    }
    const rtStr = w.rt ? String(w.rt).padStart(3, "0") : "004";
    const rwStr = w.rw ? String(w.rw).padStart(3, "0") : "008";
    const alamatLengkap = w.alamat || `Kp. Ciaruteun RT.${rtStr} RW.${rwStr} Desa Cimanggu I Kec. Cibungbulang Kab. Bogor`;

    setFormData(prev => ({
      ...prev,
      namaLengkap: w.namaLengkap || prev.namaLengkap,
      nik: w.nik || prev.nik,
      noKK: w.noKK || prev.noKK,
      jenisKelamin: w.jenisKelamin ? (w.jenisKelamin.toLowerCase().includes("laki") ? "Laki-Laki" : "Perempuan") : prev.jenisKelamin,
      tempatLahir: w.tempatLahir || prev.tempatLahir,
      tanggalLahir: formattedTgl || prev.tanggalLahir,
      agama: w.agama || prev.agama,
      alamat: alamatLengkap,
      rtPengantar: rtStr,
      rwPengantar: rwStr,
      ayahNama: w.namaAyah || prev.ayahNama,
      ibuNama: w.namaIbu || prev.ibuNama,
    }));
    setShowWargaModal(false);
  };

  useEffect(() => {
    setActiveSubTab(tab || "buat-surat");
  }, [tab]);

  // Update Nomor Surat based on letter type and TU sequence
  const updateNomorSurat = useCallback((
    type: OfficialLetterType,
    seq: string,
    mode: "OTOMATIS" | "MANUAL",
    manualVal: string
  ) => {
    if (mode === "MANUAL" && manualVal.trim()) {
      setFormData((prev) => ({ ...prev, nomorSurat: manualVal.trim() }));
      return;
    }

    let prefix = "500.3";
    let suffix = "Pem";
    if (type === "sku") {
      prefix = "500.3";
      suffix = "Pem";
    } else if (type === "kematian") {
      prefix = "400.12.3.1";
      suffix = "Pem";
    } else if (type === "skkm_pendidikan") {
      prefix = "400.3.8.8";
      suffix = "Kesra";
    } else if (type === "skkm_bpjs") {
      prefix = "400.7.3.1";
      suffix = "Kesra";
    } else if (type === "kelahiran") {
      prefix = "400.12.3.1";
      suffix = "Pem";
    }

    const generated = `${prefix}/${seq} - ${suffix}`;
    setFormData((prev) => ({
      ...prev,
      letterType: type,
      nomorSurat: generated,
      showMaterai: type === "skkm_pendidikan",
    }));
  }, []);

  // Load TU Register Info
  useEffect(() => {
    async function loadTUInfo() {
      try {
        const regInfo = await getAgendaRegisterInfoTU();
        if (regInfo) {
          setTuRegisterSeq(regInfo.nextSeq);
          updateNomorSurat(letterType, regInfo.nextSeq, modeNomor, manualNomorSurat);
        }
      } catch {
        // Fallback
      }
    }
    loadTUInfo();
  }, [letterType, modeNomor, manualNomorSurat, updateNomorSurat]);

  const handleSelectLetterType = (type: OfficialLetterType) => {
    setLetterType(type);
    updateNomorSurat(type, tuRegisterSeq, modeNomor, manualNomorSurat);
  };

  // Fetch Agenda or Online Applicants
  const fetchAgenda = useCallback(async () => {
    if (activeSubTab === "surat-masuk" || activeSubTab === "surat-keluar") {
      setLoadingAgenda(true);
      const type = activeSubTab === "surat-masuk" ? "masuk" : "keluar";
      const res = await getAgendaSuratList(type, agendaSearch);
      if (res.success) {
        setAgendaList(res.data);
      }
      setLoadingAgenda(false);
    }
  }, [activeSubTab, agendaSearch]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  useEffect(() => {
    async function loadQueues() {
      const res = await getPelayananQueues();
      if (res.success) {
        const waitingOnline = res.queues.filter((q) => q.type === "Online" && q.status === "waiting");
        setOnlineApplicants(waitingOnline);
      }
    }
    loadQueues();
  }, []);

  const handleApplyApplicant = (applicant: QueueItem) => {
    setFormData((prev) => ({
      ...prev,
      namaLengkap: applicant.nama,
      nik: applicant.nik || prev.nik,
      keperluan: applicant.service,
    }));
    if (applicant.service.toLowerCase().includes("sku") || applicant.service.toLowerCase().includes("usaha")) {
      handleSelectLetterType("sku");
    } else if (applicant.service.toLowerCase().includes("kematian")) {
      handleSelectLetterType("kematian");
    } else if (applicant.service.toLowerCase().includes("bpjs")) {
      handleSelectLetterType("skkm_bpjs");
    } else if (applicant.service.toLowerCase().includes("kelahiran")) {
      handleSelectLetterType("kelahiran");
    } else {
      handleSelectLetterType("skkm_pendidikan");
    }
  };

  const handleSubmitSurat = async () => {
    if (!formData.namaLengkap.trim()) {
      alert("Nama pemohon wajib diisi");
      return;
    }

    setSubmitting(true);
    const templateTitles: Record<OfficialLetterType, string> = {
      sku: "Surat Keterangan Usaha (SKU)",
      kematian: "Surat Keterangan Kematian",
      skkm_pendidikan: "Surat Keterangan Keluarga Miskin (Pendidikan)",
      skkm_bpjs: "Surat Keterangan Keluarga Miskin (BPJS PBI)",
      kelahiran: "Surat Keterangan Kelahiran",
    };

    const res = await createSuratPelayanan({
      templateTitle: templateTitles[formData.letterType],
      namaPemohon: formData.namaLengkap,
      nik: formData.nik,
      keperluan: formData.keperluan || templateTitles[formData.letterType],
      penandatangan: formData.penandatangan,
      modeNomor,
      manualNomorSurat: formData.nomorSurat,
      catatanPengambilan: "Surat telah diregistrasikan di TU & dicetak. Silakan pemohon mengambil berkas fisik di Loket Pelayanan Desa Cimanggu I.",
    });
    setSubmitting(false);

    if (res.success && res.item) {
      setIssuedLetterModal(res.item);
      fetchAgenda();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800">Pusat Persuratan Desa Cimanggu I</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
              Format Resmi 100% Sesuai Arsip
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Formulir isian terpadu, live preview hasil cetak A4, dan otomatis tersinkronisasi ke Buku Register Kaur TU.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          {[
            { id: "buat-surat", label: "Buat Surat", icon: Plus },
            { id: "surat-masuk", label: "Surat Masuk", icon: Folder },
            { id: "surat-keluar", label: "Surat Keluar", icon: FolderArchive },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`flex-1 md:px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeSubTab === t.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon size={16} /> <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: BUAT SURAT */}
      {activeSubTab === "buat-surat" && (
        <div className="space-y-6">
          {/* PILIHAN 5 TEMPLATE SURAT RESMI */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-3 print:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileSignature size={18} className="text-blue-600" />
                <span>Pilih Format Surat Resmi Desa Cimanggu I</span>
              </h2>
              <span className="text-xs text-slate-400 font-bold">5 Format Tersedia Sesuai Dokumen</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { type: "sku" as const, title: "Keterangan Usaha (SKU)", code: "500.3 - Pem", color: "blue" },
                { type: "kematian" as const, title: "Keterangan Kematian", code: "400.12.3.1 - Pem", color: "slate" },
                { type: "skkm_pendidikan" as const, title: "SKKM (Pendidikan)", code: "400.3.8.8 - Kesra", color: "indigo" },
                { type: "skkm_bpjs" as const, title: "SKKM (BPJS PBI)", code: "400.7.3.1 - Kesra", color: "emerald" },
                { type: "kelahiran" as const, title: "Keterangan Kelahiran", code: "400.12.3.1 - Pem", color: "amber" },
              ].map((tpl) => (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => handleSelectLetterType(tpl.type)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    letterType === tpl.type
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-500/30"
                      : "bg-slate-50 border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                    letterType === tpl.type ? "text-cyan-200" : "text-blue-600"
                  }`}>
                    {tpl.code}
                  </div>
                  <div className="text-xs font-black leading-snug">{tpl.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* VIEW SWITCHER: FORM vs LIVE PREVIEW */}
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto print:hidden">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("form")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  viewMode === "form"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal size={15} />
                <span>Formulir Pengisian Data</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  viewMode === "preview"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye size={15} />
                <span>Pratinjau Resmi ({paperSize})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pr-2">
              {/* Pilihan Ukuran Kertas */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
                <span className="text-[10px] text-slate-500 pl-1.5 pr-0.5 uppercase tracking-wider">Kertas:</span>
                {(["A4", "F4", "Letter"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPaperSize(sz)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      paperSize === sz
                        ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {sz === "F4" ? "F4 / Folio" : sz}
                  </button>
                ))}
              </div>

              {/* Pilihan Skala Cetak */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
                <span className="text-[10px] text-slate-500 pl-1.5 pr-0.5 uppercase tracking-wider">Skala:</span>
                {[100, 95, 90].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setPrintScale(sc)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
                      printScale === sc
                        ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {sc}%
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Cetak / Print Langsung</span>
              </button>
            </div>
          </div>

          {/* MODE A: FORMULIR INPUT PENGISIAN */}
          {viewMode === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Form Kolom Kiri */}
              <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      Formulir Isian: {formData.nomorSurat}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Input data lengkap pemohon, pengantar RT/RW, dan klausul khusus surat.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                    Auto-Sync ke Preview
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Penomoran Register & Penandatangan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Nomor Register Surat
                        </label>
                        <div className="flex gap-1.5 text-[10px] font-extrabold">
                          <button
                            type="button"
                            onClick={() => {
                              setModeNomor("OTOMATIS");
                              updateNomorSurat(letterType, tuRegisterSeq, "OTOMATIS", "");
                            }}
                            className={`px-2 py-0.5 rounded transition-all ${
                              modeNomor === "OTOMATIS" ? "bg-blue-600 text-white" : "bg-white border text-slate-600"
                            }`}
                          >
                            Otomatis TU
                          </button>
                          <button
                            type="button"
                            onClick={() => setModeNomor("MANUAL")}
                            className={`px-2 py-0.5 rounded transition-all ${
                              modeNomor === "MANUAL" ? "bg-blue-600 text-white" : "bg-white border text-slate-600"
                            }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {modeNomor === "OTOMATIS" ? (
                        <input
                          type="text"
                          disabled
                          value={formData.nomorSurat}
                          className="w-full px-4 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 font-mono font-black text-xs"
                        />
                      ) : (
                        <input
                          type="text"
                          value={manualNomorSurat}
                          placeholder="Ketik: 500.3/XXX - Pem"
                          onChange={(e) => {
                            setManualNomorSurat(e.target.value);
                            updateNomorSurat(letterType, tuRegisterSeq, "MANUAL", e.target.value);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-xs"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Pejabat Penandatangan Manual
                      </label>
                      <select
                        value={formData.penandatangan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            penandatangan: e.target.value as "KADES" | "SEKDES",
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800 outline-none"
                      >
                        <option value="KADES">Kepala Desa (HERNAWAN M. SODIK)</option>
                        <option value="SEKDES">an. Sekretaris Desa (FAJAR TRI APRIANA)</option>
                      </select>
                    </div>
                  </div>

                  {/* Pengantar RT & RW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Ketua RT</label>
                      <input
                        type="text"
                        value={formData.rtPengantar || ""}
                        onChange={(e) => setFormData({ ...formData, rtPengantar: e.target.value })}
                        placeholder="Contoh: 001"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Ketua RW</label>
                      <input
                        type="text"
                        value={formData.rwPengantar || ""}
                        onChange={(e) => setFormData({ ...formData, rwPengantar: e.target.value })}
                        placeholder="Contoh: 003"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Pengantar</label>
                      <input
                        type="text"
                        value={formData.tanggalPengantar || ""}
                        onChange={(e) => setFormData({ ...formData, tanggalPengantar: e.target.value })}
                        placeholder="Contoh: 19/05/2026"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Biodata Subjek / Pemohon */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={15} />
                        <span>Data Identitas Pemohon / Warga</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowWargaModal(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[11px] rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Search size={13} />
                        <span>Cari Data Warga (Autofill NIK)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={formData.namaLengkap}
                          onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">NIK (16 Digit) *</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nik}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Kelamin</label>
                        <select
                          value={formData.jenisKelamin}
                          onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                        >
                          <option value="Perempuan">Perempuan</option>
                          <option value="Laki-Laki">Laki-Laki</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Tempat Lahir</label>
                        <input
                          type="text"
                          value={formData.tempatLahir}
                          onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Lahir / Umur</label>
                        <input
                          type="text"
                          value={formData.tanggalLahir}
                          onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap *</label>
                      <input
                        type="text"
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* KHUSUS ISIAN SKU */}
                  {letterType === "sku" && (
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                      <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                        Klausul Khusus Surat Keterangan Usaha (SKU)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama / Jenis Usaha *</label>
                          <input
                            type="text"
                            value={formData.namaUsaha || ""}
                            onChange={(e) => setFormData({ ...formData, namaUsaha: e.target.value })}
                            placeholder="Contoh: WARUNG SEMBAKO"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Lokasi Tempat Usaha</label>
                          <input
                            type="text"
                            value={formData.lokasiUsaha || ""}
                            onChange={(e) => setFormData({ ...formData, lokasiUsaha: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Berlaku Dari Tanggal</label>
                          <input
                            type="text"
                            value={formData.berlakuMulai || ""}
                            onChange={(e) => setFormData({ ...formData, berlakuMulai: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Sampai Dengan Tanggal</label>
                          <input
                            type="text"
                            value={formData.berlakuSampai || ""}
                            onChange={(e) => setFormData({ ...formData, berlakuSampai: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Keperluan Penggunaan Surat</label>
                        <input
                          type="text"
                          value={formData.keperluan || ""}
                          onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                          placeholder="Contoh: Persyaratan Pengajuan ke Bank BRI"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* KHUSUS ISIAN KEMATIAN */}
                  {letterType === "kematian" && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Klausul Khusus Surat Kematian
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Hari Meninggal</label>
                          <input
                            type="text"
                            value={formData.hariMeninggal || ""}
                            onChange={(e) => setFormData({ ...formData, hariMeninggal: e.target.value })}
                            placeholder="Contoh: Jumat"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Meninggal</label>
                          <input
                            type="text"
                            value={formData.tanggalMeninggal || ""}
                            onChange={(e) => setFormData({ ...formData, tanggalMeninggal: e.target.value })}
                            placeholder="Contoh: 22 Februari 2026"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Penyebab Kematian</label>
                          <input
                            type="text"
                            value={formData.sebabMeninggal || ""}
                            onChange={(e) => setFormData({ ...formData, sebabMeninggal: e.target.value })}
                            placeholder="Contoh: Sakit / Usia Lanjut"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Tempat Meninggal</label>
                          <input
                            type="text"
                            value={formData.tempatMeninggal || ""}
                            onChange={(e) => setFormData({ ...formData, tempatMeninggal: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Keperluan</label>
                          <input
                            type="text"
                            value={formData.keperluan || ""}
                            onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                            placeholder="Contoh: Persyaratan Pembuatan Akta Kematian"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KHUSUS ISIAN SKKM PENDIDIKAN */}
                  {letterType === "skkm_pendidikan" && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                        Klausul Khusus SKKM Administrasi Pendidikan
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Ayah</label>
                          <input
                            type="text"
                            value={formData.namaAyah || ""}
                            onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Ibu</label>
                          <input
                            type="text"
                            value={formData.namaIbu || ""}
                            onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor KK</label>
                          <input
                            type="text"
                            value={formData.noKK || ""}
                            onChange={(e) => setFormData({ ...formData, noKK: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Keperluan Administrasi Pendidikan Di (Nama Sekolah / Universitas) *
                        </label>
                        <input
                          type="text"
                          value={formData.pendidikanDi || ""}
                          onChange={(e) => setFormData({ ...formData, pendidikanDi: e.target.value })}
                          placeholder="Contoh: UNIVERSITAS IBN KHALDUN BOGOR / SMAN 1 CIBUNGBULANG"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {/* KHUSUS ISIAN SKKM BPJS */}
                  {letterType === "skkm_bpjs" && (
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                      <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                        Klausul Khusus SKKM BPJS PBI APBD/APBN
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor KK *</label>
                          <input
                            type="text"
                            value={formData.noKK || ""}
                            onChange={(e) => setFormData({ ...formData, noKK: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Perkawinan</label>
                          <select
                            value={formData.statusPerkawinan || "Belum Kawin"}
                            onChange={(e) => setFormData({ ...formData, statusPerkawinan: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          >
                            <option value="Belum Kawin">Belum Kawin</option>
                            <option value="Kawin">Kawin</option>
                            <option value="Cerai Mati">Cerai Mati</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Terdaftar dalam DTKS *</label>
                          <select
                            value={formData.terdaftarDTKS || "TIDAK"}
                            onChange={(e) => setFormData({ ...formData, terdaftarDTKS: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-red-700"
                          >
                            <option value="TIDAK">TIDAK</option>
                            <option value="YA">YA</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KHUSUS ISIAN KELAHIRAN */}
                  {letterType === "kelahiran" && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                        Klausul Khusus Surat Kelahiran Anak
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Bayi / Anak *</label>
                          <input
                            type="text"
                            value={formData.namaAnak || ""}
                            onChange={(e) => setFormData({ ...formData, namaAnak: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Anak Ke</label>
                          <input
                            type="text"
                            value={formData.anakKe || "1"}
                            onChange={(e) => setFormData({ ...formData, anakKe: e.target.value })}
                            placeholder="Contoh: 1 (Satu)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                          <p className="font-bold text-[11px] text-blue-700 uppercase">Data Ayah Kandung</p>
                          <input
                            type="text"
                            value={formData.ayahNama || ""}
                            onChange={(e) => setFormData({ ...formData, ayahNama: e.target.value })}
                            placeholder="Nama Lengkap Ayah"
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                          />
                          <input
                            type="text"
                            value={formData.ayahNIK || ""}
                            onChange={(e) => setFormData({ ...formData, ayahNIK: e.target.value })}
                            placeholder="NIK Ayah"
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                          <p className="font-bold text-[11px] text-pink-700 uppercase">Data Ibu Kandung</p>
                          <input
                            type="text"
                            value={formData.ibuNama || ""}
                            onChange={(e) => setFormData({ ...formData, ibuNama: e.target.value })}
                            placeholder="Nama Lengkap Ibu"
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                          />
                          <input
                            type="text"
                            value={formData.ibuNIK || ""}
                            onChange={(e) => setFormData({ ...formData, ibuNIK: e.target.value })}
                            placeholder="NIK Ibu"
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className="px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <Eye size={16} />
                      <span>Lihat Live Preview (A4)</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitSurat}
                      className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Mendaftarkan Surat ke TU...</span>
                        </>
                      ) : (
                        <>
                          <Printer size={16} />
                          <span>Cetak & Daftarkan ke Buku Register TU</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Samping: Antrean Online & Opsi Tambahan */}
              <div className="space-y-6">
                {/* Opsi TTD & Materai */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Stamp size={16} className="text-blue-600" />
                    <span>Opsi Cap Stempel & Materai</span>
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="text-xs font-bold text-slate-700">Tampilkan Stempel & TTD Asli</span>
                      <input
                        type="checkbox"
                        checked={formData.showStamp !== false}
                        onChange={(e) => setFormData({ ...formData, showStamp: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="text-xs font-bold text-slate-700">Tampilkan Materai 10.000</span>
                      <input
                        type="checkbox"
                        checked={formData.showMaterai || false}
                        onChange={(e) => setFormData({ ...formData, showMaterai: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Antrean Pemohon Online Terhubung */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                      Warga Menunggu di Loket
                    </h3>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {onlineApplicants.length} Warga
                    </span>
                  </div>

                  <div className="space-y-2">
                    {onlineApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        onClick={() => handleApplyApplicant(applicant)}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-blue-50/60 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-black text-xs text-slate-800">{applicant.nama}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{applicant.service}</p>
                        </div>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                          title="Gunakan Data Warga"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MODE B: LIVE PREVIEW DOKUMEN RESMI A4 (100% PERSIS FORMAT RESMI) */}
          {viewMode === "preview" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-white p-4 rounded-2xl gap-3 print:hidden">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Check size={16} className="text-emerald-400" />
                  <span>Pratinjau Hasil Format Resmi Desa Cimanggu I ({paperSize})</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-700">
                    <span className="text-[10px] text-slate-400 pl-1.5 pr-0.5 uppercase tracking-wider">Kertas:</span>
                    {(["A4", "F4", "Letter"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPaperSize(sz)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                          paperSize === sz
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        {sz === "F4" ? "F4 / Folio" : sz}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-700">
                    <span className="text-[10px] text-slate-400 pl-1.5 pr-0.5 uppercase tracking-wider">Skala:</span>
                    {[100, 95, 90].map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setPrintScale(sc)}
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                          printScale === sc
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        {sc}%
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewMode("form")}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    Kembali ke Form
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-black rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Printer size={15} />
                    <span>Cetak Dokumen Sekarang</span>
                  </button>
                </div>
              </div>

              {/* DOKUMEN FISIK A4/F4 */}
              <div className="bg-slate-200/80 p-4 md:p-8 rounded-3xl overflow-x-auto print:p-0 print:bg-white print:rounded-none">
                <div style={{ transform: printScale !== 100 ? `scale(${printScale / 100})` : undefined, transformOrigin: "top center" }}>
                  <OfficialLetterDocument data={formData} paperSize={paperSize} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* SUBTAB 2 & 3: BUKU AGENDA SURAT MASUK / KELUAR */}
      {(activeSubTab === "surat-masuk" || activeSubTab === "surat-keluar") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Buku Agenda {activeSubTab === "surat-masuk" ? "Surat Masuk" : "Surat Keluar"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sinkronisasi otomatis dengan Kaur Tata Usaha & Seksi Pelayanan Desa Cimanggu I.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari nomor, perihal, atau pengirim..."
                  value={agendaSearch}
                  onChange={(e) => setAgendaSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={() => fetchAgenda()}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-slate-200"
                title="Filter / Refresh"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6">Nomor Register Surat</th>
                  {activeSubTab === "surat-keluar" && <th className="py-4 px-6">No. Resi</th>}
                  <th className="py-4 px-6">{activeSubTab === "surat-masuk" ? "Instansi Pengirim" : "Warga / Penerima"}</th>
                  <th className="py-4 px-6">Perihal</th>
                  <th className="py-4 px-6">Penandatangan</th>
                  <th className="py-4 px-6">Status Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agendaList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap font-bold">
                      {item.tanggal}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.nomorSurat}
                    </td>
                    {activeSubTab === "surat-keluar" && (
                      <td className="py-4 px-6 text-xs font-mono font-extrabold text-blue-600 whitespace-nowrap">
                        {item.nomorResi || "-"}
                      </td>
                    )}
                    <td className="py-4 px-6 text-xs font-bold text-slate-800">
                      {item.pengirimAtauPenerima}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {item.perihal}
                    </td>
                    <td className="py-4 px-6 text-xs whitespace-nowrap">
                      <span className="font-bold text-slate-700">
                        {item.penandatangan === "SEKDES" ? "Sekdes (a.n. Kades)" : "Kades"}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                        item.status.includes("Selesai")
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        <Check size={12} />
                        <span>{item.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {agendaList.length === 0 && !loadingAgenda && (
              <div className="py-20 text-center">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FolderArchive size={26} />
                </div>
                <p className="text-slate-600 font-bold text-sm">Tidak ada arsip surat dalam agenda.</p>
                <p className="text-xs text-slate-400 mt-0.5">Surat yang diterbitkan akan otomatis tercatat di sini.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* POPUP MODAL: SURAT TERBIT & REGISTER RESI */}
      <AnimatePresence>
        {issuedLetterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileCheck2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Dokumen Berhasil Diterbitkan</h3>
                    <p className="text-[11px] text-slate-500">Tercatat di Buku Register Kaur TU & Tracking Desa.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIssuedLetterModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Nomor Register:</span>
                  <span className="font-black text-slate-900">{issuedLetterModal.nomorSurat}</span>
                </div>
                {issuedLetterModal.nomorResi && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Nomor Resi Tracking:</span>
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {issuedLetterModal.nomorResi}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Pemohon:</span>
                  <span className="font-bold text-slate-800 font-sans">{issuedLetterModal.pengirimAtauPenerima}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Penandatangan:</span>
                  <span className="font-bold text-slate-800 font-sans">
                    {issuedLetterModal.penandatangan === "SEKDES" ? "an. Sekretaris Desa" : "Kepala Desa"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("preview");
                    setIssuedLetterModal(null);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span>Lihat Dokumen Siap Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIssuedLetterModal(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL PENCARIAN DATA WARGA (AUTOFILL CEPAT) */}
        {showWargaModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Search size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Cari Data Warga (Autofill)</h3>
                    <p className="text-xs text-slate-500">Pilih warga dari database Desa Cimanggu I untuk mengisi formulir otomatis.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWargaModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Ketik NIK atau Nama warga..."
                  value={wargaQuery}
                  onChange={(e) => setWargaQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-xs font-bold outline-none"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar divide-y divide-slate-100">
                {loadingResidents ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span>Memuat data penduduk...</span>
                  </div>
                ) : residentList
                  .filter((w) => {
                    if (!wargaQuery.trim()) return true;
                    const q = wargaQuery.toLowerCase();
                    return (
                      (w.namaLengkap && w.namaLengkap.toLowerCase().includes(q)) ||
                      (w.nik && w.nik.includes(q)) ||
                      (w.alamat && w.alamat.toLowerCase().includes(q))
                    );
                  })
                  .slice(0, 30)
                  .map((w) => (
                    <div
                      key={w.id}
                      onClick={() => handleSelectResident(w)}
                      className="p-3 hover:bg-blue-50/70 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-blue-700">
                          {w.namaLengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIK: <span className="font-bold text-slate-700">{w.nik}</span> • RT {w.rt ? String(w.rt).padStart(3, "0") : "004"} / RW {w.rw ? String(w.rw).padStart(3, "0") : "008"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {w.alamat || "Desa Cimanggu I, Kec. Cibungbulang"}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Pilih ➔
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PORTAL CETAK RESMI DESA CIMANGGU I (DIJAMIN TIDAK TERPOTONG & SESUAI UKURAN KERTAS) ── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="official-letter-print-portal" className="official-letter-print-portal hidden print:block">
          <style dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page {
                  size: ${paperSize === "F4" ? "215.9mm 330.2mm" : paperSize === "Letter" ? "letter" : "A4"} portrait;
                  margin: 12mm 15mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                body > *:not(#official-letter-print-portal) {
                  display: none !important;
                }
                #official-letter-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                #official-letter-print-portal * {
                  visibility: visible !important;
                }
              }
            `
          }} />
          <div
            style={{
              transform: printScale !== 100 ? `scale(${printScale / 100})` : undefined,
              transformOrigin: "top center",
              width: "100%",
            }}
          >
            <OfficialLetterDocument data={formData} isPrinting={true} paperSize={paperSize} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
