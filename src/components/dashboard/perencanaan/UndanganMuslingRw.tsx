import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SafePrintPortal } from "./SafePrintPortal";
import { ArrowLeft, Printer, FileText, Sparkles, RefreshCw, Mail, Users, Lightbulb, CheckCircle2 } from "lucide-react";
import { DaftarHadirMuslingRw } from "./DaftarHadirMuslingRw";
import { DraftUsulanRw } from "./DraftUsulanRw";
import { RekapanUsulanRwTab } from "./RekapanUsulanRwTab";

export interface UndanganMuslingRwData {
  rwNo: string;
  noRegister: string;
  bulanRomawi: string;
  tahun: string;
  tempatSurat: string;
  tanggalSurat: string;
  kepadaYth: string;
  berkenaanDengan: string;
  hariAcara: string;
  tanggalAcara: string;
  waktuAcara: string;
  tempatAcara: string;
  namaKetuaRw: string;
}

const defaultData: UndanganMuslingRwData = {
  rwNo: "002",
  noRegister: "005",
  bulanRomawi: "VIII",
  tahun: "2026",
  tempatSurat: "Ciaruteun",
  tanggalSurat: "8 Agustus 2026",
  kepadaYth: "Pengurus RT, Tokoh Agama & Tokoh Masyarakat\nRW 002 Desa Cimanggu I",
  berkenaanDengan: "Verifikasi dan Validasi Calon Penerima BLT-DD Tahun 2026 serta Penyusunan Usulan Musrenbang",
  hariAcara: "MINGGU",
  tanggalAcara: "16 AGUSTUS 2026",
  waktuAcara: "15.30 WIB s/d Selesai",
  tempatAcara: "Masjid Baeturrahman\nKp. Ciaruteun RT.004 RW.002 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor",
  namaKetuaRw: "SAEPULOH"
};

export function UndanganMuslingRw({ 
  onBack, 
  userRw, 
  userRt, 
  userRole, 
  userName 
}: { 
  onBack?: () => void; 
  userRw?: string; 
  userRt?: string; 
  userRole?: string; 
  userName?: string; 
}) {
  const searchParams = useSearchParams();
  const subParam = searchParams ? searchParams.get("sub") : null;
  const isRt = userRole === "RT";

  const [formData, setFormData] = useState<UndanganMuslingRwData>(() => ({
    ...defaultData,
    ...(userRw ? { rwNo: userRw } : {}),
    ...(userName ? { namaKetuaRw: userName } : {})
  }));
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  const [rwSubTab, setRwSubTab] = useState<"rekapan" | "undangan" | "daftar-hadir" | "draft-usulan">(isRt ? "draft-usulan" : "rekapan");
  const [mounted, setMounted] = useState(false);

  const activeRw = (userRw || formData.rwNo || "002").trim();
  const storageKey = `musling_undangan_form_rw_${activeRw}_v1`;

  useEffect(() => {
    try {
      const targetRw = (userRw || activeRw || "002").trim();
      const currentRwKey = `musling_undangan_form_rw_${targetRw}_v1`;
      const savedForm = localStorage.getItem(currentRwKey);

      if (savedForm) {
        setFormData(JSON.parse(savedForm));
      } else {
        // Fallback check old key only if rwNo matches targetRw
        const oldSaved = localStorage.getItem("musling_undangan_form_v1");
        if (oldSaved) {
          const parsedOld = JSON.parse(oldSaved);
          if (parsedOld.rwNo === targetRw) {
            setFormData(parsedOld);
            localStorage.setItem(currentRwKey, JSON.stringify(parsedOld));
            setMounted(true);
            return;
          }
        }
        setFormData({
          ...defaultData,
          rwNo: targetRw,
          ...(userName ? { namaKetuaRw: userName } : {}),
          kepadaYth: `Pengurus RT, Tokoh Agama & Tokoh Masyarakat\nRW ${targetRw} Desa Cimanggu I`,
          tempatAcara: `Masjid Baeturrahman\nKp. Ciaruteun RT.004 RW.${targetRw} Desa Cimanggu I Kec. Cibungbulang Kab. Bogor`
        });
      }
    } catch (err) {
      console.error("Error loading localStorage for Undangan Musling:", err);
    }
    setMounted(true);
  }, [userRw]);

  useEffect(() => {
    if (subParam && ["rekapan", "undangan", "daftar-hadir", "draft-usulan"].includes(subParam)) {
      setRwSubTab(subParam as any);
    }
  }, [subParam]);

  useEffect(() => {
    if (mounted) {
      try {
        const currentRwKey = `musling_undangan_form_rw_${(formData.rwNo || activeRw).trim()}_v1`;
        localStorage.setItem(currentRwKey, JSON.stringify(formData));
      } catch (err) {
        console.error("Error saving formData to localStorage:", err);
      }
    }
  }, [formData, mounted, activeRw]);

  const getTodayFormatted = () => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const today = new Date();
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getRomawiMonth = () => {
    const romawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romawi[new Date().getMonth()];
  };

  const handleSetAutoDate = () => {
    setFormData((prev: UndanganMuslingRwData) => ({
      ...prev,
      tanggalSurat: getTodayFormatted(),
      bulanRomawi: getRomawiMonth(),
      tahun: new Date().getFullYear().toString()
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSuratContent = (isPortal = false) => (
    <div
      id={isPortal ? "undangan-rw-print-portal" : "undangan-rw-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative notranslate"
      translate="no"
      style={{
        width: "215.9mm",
        minHeight: "330.2mm",
        padding: "20mm 22mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "12pt",
        lineHeight: "1.5"
      }}
    >
      {/* KOP SURAT */}
      <div className="text-center font-bold text-[14pt] leading-snug tracking-wide uppercase notranslate" translate="no">
        <div key={`kop-${formData.rwNo}`}>KETUA RUKUN WARGA {formData.rwNo}</div>
        <div className="text-[13pt] font-extrabold">DESA CIMANGGU I KEC. CIBUNGBULANG KAB. BOGOR</div>
        <div className="text-[12pt] font-black tracking-widest mt-0.5">===</div>
      </div>

      <div className="my-8"></div>

      {/* METADATA SURAT */}
      <div className="grid grid-cols-12 gap-2 text-[11pt] mb-8 notranslate" translate="no">
        <div className="col-span-6 space-y-0.5">
          <div className="grid grid-cols-[75px_10px_1fr]">
            <div>Nomor</div><div>:</div>
            <div key={`nomor-${formData.noRegister}-${formData.bulanRomawi}-${formData.tahun}`}>
              {formData.noRegister}/Musling/{formData.bulanRomawi}/{formData.tahun}
            </div>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr]">
            <div>Lampiran</div><div>:</div><div>--</div>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr]">
            <div>Perihal</div><div>:</div><div className="font-bold">Undangan Musyawarah Lingkungan</div>
          </div>
        </div>

        <div className="col-span-6 pl-4 space-y-0.5">
          <div key={`tglsurat-${formData.tempatSurat}-${formData.tanggalSurat}`}>
            {formData.tempatSurat}, {formData.tanggalSurat}
          </div>
          <div>Kepada,</div>
          <div key={`kepada-${formData.kepadaYth}`}>
            Yth. <span className="underline decoration-dotted">{formData.kepadaYth.split("\n")[0]}</span>
          </div>
          {formData.kepadaYth.split("\n").slice(1).map((line: string, i: number) => (
            <div key={i} className="pl-7">{line}</div>
          ))}
          <div>di-</div>
          <div className="pl-10">Tempat</div>
        </div>
      </div>

      {/* SALAM OPENING */}
      <div className="mb-4 text-[11pt] font-bold notranslate" translate="no">
        Assalamu&apos;alaikum Warohmatullohi Wabarokatuh.
      </div>

      {/* PARAGRAF PEMBUKA */}
      <div className="mb-4 text-[11pt] text-justify leading-relaxed notranslate" translate="no">
        Puji syukur kepada Allah Subhanahu Wa Ta&apos;ala atas segala limpahan rahmatnya kepada kita semua baik berupa Kesehatan maupun keberkahan. Sholawat dan Salam juga tak lupa senantiasa kita panjatkan kepada junjungan Nabi Besar Muhammad Salallahu Alaihi Wa Salam.
      </div>

      {/* PARAGRAF ISI */}
      <div className="mb-6 text-[11pt] text-justify leading-relaxed notranslate" translate="no">
        Sehubungan akan dilaksanakannya Musyawarah Lingkungan Berkenaan dengan <strong key={`berkenaan-${formData.berkenaanDengan}`}>{formData.berkenaanDengan}</strong>, maka bersama ini Saya mengundang Bapak/Ibu Pengurus Lingkungan RW.<span key={`rwisi-${formData.rwNo}`}>{formData.rwNo}</span> untuk berkenan hadir di <strong>Acara Musyawarah Lingkungan</strong> yang Insya Allah akan diselenggarakan pada :
      </div>

      {/* RINCIAN ACARA */}
      <div className="my-6 pl-8 text-[11pt] space-y-1.5 notranslate" translate="no">
        <div className="grid grid-cols-[90px_15px_1fr]">
          <div>Hari</div><div>:</div><div key={`hari-${formData.hariAcara}`} className="font-bold">{formData.hariAcara}</div>
        </div>
        <div className="grid grid-cols-[90px_15px_1fr]">
          <div>Tanggal</div><div>:</div><div key={`tglacara-${formData.tanggalAcara}`} className="font">{formData.tanggalAcara}</div>
        </div>
        <div className="grid grid-cols-[90px_15px_1fr]">
          <div>Waktu</div><div>:</div><div key={`waktu-${formData.waktuAcara}`}>{formData.waktuAcara}</div>
        </div>
        <div className="grid grid-cols-[90px_15px_1fr]">
          <div>Tempat</div><div>:</div>
          <div key={`tempat-${formData.tempatAcara}`} className="whitespace-pre-line leading-relaxed">
            {formData.tempatAcara}
          </div>
        </div>
      </div>

      {/* PENUTUP */}
      <div className="my-6 text-[11pt] text-justify leading-relaxed notranslate" translate="no">
        Demikian undangan ini kami sampaikan, atas perhatian dan kehadiranya, kami ucapkan Terimakasi h.
      </div>

      <div className="mb-8 text-[11pt] font-bold italic notranslate" translate="no">
        Wassalamu&apos;alaikum, Wr, Wb.
      </div>

      {/* TANDA TANGAN KETUA RW */}
      <div className="mt-12 flex justify-end text-[11pt] notranslate" translate="no">
        <div className="text-center w-[220px]">
          <div key={`ttdrw-${formData.rwNo}`}>Ketua Rukun Warga {formData.rwNo}</div>
          <div className="h-20"></div>
          <div key={`ttdnama-${formData.namaKetuaRw}`} className="font-bold underline uppercase tracking-wide">
            {formData.namaKetuaRw}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* HEADER TOOLBAR WITH SUB-NAVBAR FOR SURAT-SURAT ALUR MUSLING RW */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer min-w-[44px] min-h-[44px]"
                aria-label="Kembali"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles size={12} className="text-emerald-600" />
                  <span>{isRt ? `DRAFT USULAN RT ${userRt || "001"} / RW ${formData.rwNo}` : `MUSLING TINGKAT RW ${formData.rwNo}`}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  <span>Tersimpan Otomatis</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                {isRt ? `Usulan Musrenbang RT ${userRt || "001"}` : `Musyawarah Lingkungan (Musling) RW ${formData.rwNo}`}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {isRt ? `Form Input & Cetak Usulan Prioritas Pembangunan RT ${userRt || "001"} / RW ${formData.rwNo}` : `Alur Berkas & Surat Resmi Pembangunan RW ${formData.rwNo} Desa Cimanggu I`}
              </p>
            </div>
          </div>

          {rwSubTab === "undangan" && !isRt && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "form" ? "preview" : "form")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px]"
              >
                <FileText size={16} />
                <span>{viewMode === "form" ? "Lihat Preview F4" : "Edit Form Input"}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
              >
                <Printer size={16} />
                <span>Cetak Surat Undangan (F4)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {rwSubTab === "rekapan" && !isRt ? (
        <RekapanUsulanRwTab 
          userRw={userRw} 
          userRole={userRole} 
          userName={userName} 
          undanganData={formData} 
        />
      ) : rwSubTab === "daftar-hadir" && !isRt ? (
        <DaftarHadirMuslingRw undanganData={formData} />
      ) : (rwSubTab === "draft-usulan" || isRt) ? (
        <DraftUsulanRw 
          undanganData={formData} 
          userRt={userRt} 
          userRw={userRw} 
          userRole={userRole} 
          userName={userName} 
        />
      ) : (
        <>
          {/* CSS PRINT RULES FOR EXACT F4 PORTRAIT CAMBRIA FORMAT */}
          <style dangerouslySetInnerHTML={{
            __html: `
        @media screen {
          #undangan-rw-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #undangan-rw-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }
          
          #undangan-rw-print-portal {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 10mm 15mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #undangan-rw-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }

          #undangan-rw-print-portal .grid {
            display: grid !important;
          }

          #undangan-rw-print-portal .flex {
            display: flex !important;
          }

          @page {
            size: portrait;
            margin: 6mm 8mm;
          }
        }
      `}} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: FORM INPUT PERHATIANKAN 8 USER REQUIREMENTS */}
            <div className={`lg:col-span-5 space-y-4 no-print ${viewMode === "preview" ? "hidden lg:block" : ""}`}>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-black text-slate-800 text-sm uppercase border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span>Form Pengisian Surat Undangan</span>
                  <button
                    type="button"
                    onClick={handleSetAutoDate}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    title="Set Tanggal Terkini Otomatis"
                  >
                    <RefreshCw size={12} /> Tanggal Otomatis
                  </button>
                </h2>

                {/* 1. KETUA RUKUN WARGA (Form No. RW) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Nomor RW (Kop Surat & TTD)
                  </label>
                  <input
                    type="text"
                    value={formData.rwNo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rwNo: e.target.value }))}
                    placeholder="Contoh: 002"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    *Otomatis memperbarui Kop Surat, Kalimat Isi, dan Jabatan TTD.
                  </span>
                </div>

                {/* 2. NOMOR REGISTER / BULAN / TAHUN */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    2. Format Nomor Surat <span className="text-slate-400 font-normal">(Lampiran & Perihal Dikunci)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">No. Reg</span>
                      <input
                        type="text"
                        value={formData.noRegister}
                        onChange={(e) => setFormData((prev) => ({ ...prev, noRegister: e.target.value }))}
                        placeholder="005"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Bulan (Romawi)</span>
                      <input
                        type="text"
                        value={formData.bulanRomawi}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bulanRomawi: e.target.value }))}
                        placeholder="IV / VIII"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Tahun</span>
                      <input
                        type="text"
                        value={formData.tahun}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tahun: e.target.value }))}
                        placeholder="2026"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 notranslate" translate="no">
                    Hasil Nomor: <strong key={`hasil-${formData.noRegister}-${formData.bulanRomawi}-${formData.tahun}`}>{formData.noRegister}/Musling/{formData.bulanRomawi}/{formData.tahun}</strong>
                  </div>
                </div>

                {/* 3. TANGGAL SURAT & TEMPAT */}
                <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Tempat Surat
                    </label>
                    <input
                      type="text"
                      value={formData.tempatSurat}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tempatSurat: e.target.value }))}
                      placeholder="Ciaruteun"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Tanggal Pembuatan
                    </label>
                    <input
                      type="text"
                      value={formData.tanggalSurat}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tanggalSurat: e.target.value }))}
                      placeholder="8 Agustus 2026"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* 4. KEPADA YTH */}
                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Kepada Yth. (Tujuan Undangan)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.kepadaYth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kepadaYth: e.target.value }))}
                    placeholder="Pengurus RT, Tokoh Agama & Tokoh Masyarakat..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* 5. BERKENAAN DENGAN */}
                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5. Berkenaan Dengan (Topik Acara)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.berkenaanDengan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, berkenaanDengan: e.target.value }))}
                    placeholder="Verifikasi dan Validasi Calon Penerima BLT-DD Tahun 2026..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* 7. WAKTU, HARI, TANGGAL, TEMPAT ACARA */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    7. Rincian Pelaksanaan Acara (Sejajar Titik Dua)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Hari</span>
                      <input
                        type="text"
                        value={formData.hariAcara}
                        onChange={(e) => setFormData((prev) => ({ ...prev, hariAcara: e.target.value }))}
                        placeholder="MINGGU"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Tanggal Acara</span>
                      <input
                        type="text"
                        value={formData.tanggalAcara}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tanggalAcara: e.target.value }))}
                        placeholder="16 AGUSTUS 2026"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Waktu</span>
                      <input
                        type="text"
                        value={formData.waktuAcara}
                        onChange={(e) => setFormData((prev) => ({ ...prev, waktuAcara: e.target.value }))}
                        placeholder="15.30 WIB s/d Selesai"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Tempat Acara</span>
                      <input
                        type="text"
                        value={formData.tempatAcara}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tempatAcara: e.target.value }))}
                        placeholder="Masjid Baeturrahman..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. NAMA KETUA RW */}
                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    8. Nama Ketua RW (Tanda Tangan)
                  </label>
                  <input
                    type="text"
                    value={formData.namaKetuaRw}
                    onChange={(e) => setFormData((prev) => ({ ...prev, namaKetuaRw: e.target.value }))}
                    placeholder="SAEPULOH"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-black uppercase"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PREVIEW HASIL CETAK PERSIS SERTA KERTAS F4 CAMBRIA */}
            <div className={`lg:col-span-7 ${viewMode === "form" ? "hidden lg:block" : ""}`}>
              <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
                <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  --- Preview Kertas F4 (Font Cambria) ---
                </span>

                {/* ON-SCREEN PREVIEW */}
                {renderSuratContent(false)}
              </div>
            </div>
          </div>

          {/* PRINT CONTAINER */}
          <SafePrintPortal portalId="undangan-rw-print-mount-root">
            {renderSuratContent(true)}
          </SafePrintPortal>
        </>
      )}
    </div>
  );
}
