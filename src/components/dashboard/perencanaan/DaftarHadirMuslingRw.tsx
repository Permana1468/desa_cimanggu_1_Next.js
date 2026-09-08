import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Printer, Plus, Trash2, Edit3, Check, RefreshCw, Sparkles, X, PenTool } from "lucide-react";
import { UndanganMuslingRwData } from "./UndanganMuslingRw";

export interface PesertaHadir {
  id: string;
  nama: string;
  jabatan: string;
  ttdDataUrl?: string; // Base64 Canvas Drawing
}

interface DaftarHadirMuslingRwProps {
  undanganData: UndanganMuslingRwData;
  onBack?: () => void;
}

const defaultPeserta: PesertaHadir[] = [
  { id: "p-1", nama: "M. Haris", jabatan: "Ketua RT 001" },
  { id: "p-2", nama: "Ahmad Subadri", jabatan: "Ketua RT 002" },
  { id: "p-3", nama: "Drs. H. Mulyadi", jabatan: "Tokoh Agama / DKM" },
  { id: "p-4", nama: "Siti Aminah, S.Pd", jabatan: "Ketua Posyandu Mawar" },
  { id: "p-5", nama: "Randi Kurniawan", jabatan: "Ketua Karang Taruna" },
  { id: "p-6", nama: "Bambang Sujipto", jabatan: "Ketua RT 003" },
  { id: "p-7", nama: "H. Sukatma", jabatan: "Tokoh Masyarakat" },
  { id: "p-8", nama: "Ujang Iskandar", jabatan: "Anggota BPD RW 002" },
];

export function DaftarHadirMuslingRw({ undanganData, onBack }: DaftarHadirMuslingRwProps) {
  const [pesertaList, setPesertaList] = useState<PesertaHadir[]>(defaultPeserta);
  const [activePesertaId, setActivePesertaId] = useState<string | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form input untuk tambah peserta baru
  const [newNama, setNewNama] = useState("");
  const [newJabatan, setNewJabatan] = useState("");

  // Canvas Signature state & refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const openSignModal = (pesertaId: string) => {
    setActivePesertaId(pesertaId);
    setIsSignModalOpen(true);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activePesertaId) return;
    const dataUrl = canvas.toDataURL("image/png");

    setPesertaList((prev) =>
      prev.map((p) => (p.id === activePesertaId ? { ...p, ttdDataUrl: dataUrl } : p))
    );

    setIsSignModalOpen(false);
    setActivePesertaId(null);
  };

  const handleAddPeserta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama) return;
    const newItem: PesertaHadir = {
      id: `pes-${Date.now()}`,
      nama: newNama,
      jabatan: newJabatan || "Warga / Pengurus Lingkungan",
    };
    setPesertaList([...pesertaList, newItem]);
    setNewNama("");
    setNewJabatan("");
  };

  const handleDeletePeserta = (id: string) => {
    setPesertaList(pesertaList.filter((p) => p.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  // Pre-fill min 15 rows for printable document
  const displayRows = [...pesertaList];
  while (displayRows.length < 15) {
    displayRows.push({
      id: `blank-${displayRows.length}`,
      nama: "",
      jabatan: "",
    });
  }

  const renderDaftarHadirContent = (isPortal = false) => (
    <div
      id={isPortal ? "daftar-hadir-print-portal" : "daftar-hadir-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: "215.9mm",
        minHeight: "330.2mm",
        padding: "20mm 22mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "11pt",
        lineHeight: "1.4"
      }}
    >
      {/* JUDUL CENTER BOLD UNDERLINE */}
      <h1 className="text-center font-bold text-[14pt] underline mb-6 tracking-wide text-black uppercase">
        DAFTAR HADIR
      </h1>

      {/* HEADER METADATA */}
      <div className="mb-6 space-y-1 text-[11pt] font-semibold">
        <div className="grid grid-cols-[100px_15px_1fr]">
          <div>HARI</div><div>:</div><div>{undanganData.hariAcara}</div>
        </div>
        <div className="grid grid-cols-[100px_15px_1fr]">
          <div>TANGGAL</div><div>:</div><div>{undanganData.tanggalAcara}</div>
        </div>
        <div className="grid grid-cols-[100px_15px_1fr]">
          <div>WAKTU</div><div>:</div><div>{undanganData.waktuAcara}</div>
        </div>
        <div className="grid grid-cols-[100px_15px_1fr]">
          <div>TEMPAT</div><div>:</div><div>{undanganData.tempatAcara.split("\n")[0]}</div>
        </div>
        <div className="grid grid-cols-[100px_15px_1fr]">
          <div>ACARA</div><div>:</div><div>{undanganData.berkenaanDengan}</div>
        </div>
      </div>

      {/* TABEL DAFTAR HADIR */}
      <table className="w-full border-collapse border border-black text-[10pt] table-fixed">
        <thead>
          <tr className="bg-slate-200 font-bold text-center border-b border-black">
            <th className="border border-black p-1.5 w-[35px] text-center">NO</th>
            <th className="border border-black p-1.5 text-center">NAMA</th>
            <th className="border border-black p-1.5 text-center">JABATAN</th>
            <th className="border border-black p-1.5 w-[160px] text-center">TANDA TANGAN</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <tr key={row.id} className="h-[32px]">
                <td className="border border-black p-1 text-center font-medium">
                  {idx + 1}
                </td>
                <td className="border border-black p-1 font-semibold px-2">
                  {row.nama}
                </td>
                <td className="border border-black p-1 px-2 text-slate-800">
                  {row.jabatan}
                </td>
                <td className="border border-black p-0.5 relative text-left align-middle">
                  {row.ttdDataUrl ? (
                    <img
                      src={row.ttdDataUrl}
                      alt="TTD"
                      className="h-7 mx-auto object-contain"
                    />
                  ) : (
                    <div className={`text-[9pt] font-sans text-slate-400 pl-2 ${isEven ? "text-right pr-4" : "text-left"}`}>
                      {row.nama ? `${idx + 1}. .........` : `${idx + 1}.`}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TANDA TANGAN KETUA RW */}
      <div className="mt-12 flex justify-end text-[11pt]">
        <div className="text-center w-[220px]">
          <div>Ketua Rukun Warga {undanganData.rwNo}</div>
          <div className="h-20"></div>
          <div className="font-bold underline uppercase tracking-wide">
            {undanganData.namaKetuaRw}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* CSS PRINT RULES FOR EXACT F4 CAMBRIA PRINT OUTPUT */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body > *:not(#daftar-hadir-print-portal) {
            display: none !important;
          }

          #daftar-hadir-print-portal {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 215.9mm !important;
            min-height: 330.2mm !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #daftar-hadir-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #daftar-hadir-print-portal .grid {
            display: grid !important;
          }

          #daftar-hadir-print-portal .flex {
            display: flex !important;
          }

          #daftar-hadir-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #daftar-hadir-print-portal tr {
            display: table-row !important;
          }

          #daftar-hadir-print-portal td, #daftar-hadir-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 215.9mm 330.2mm portrait; /* F4 Paper */
            margin: 0;
          }
        }
      `}} />

      {/* TOP TOOLBAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
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
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-1">
              <Sparkles size={12} className="text-blue-600" />
              <span>DAFTAR HADIR SINKRON UNDANGAN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Daftar Hadir Musling RW {undanganData.rwNo}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Data Hari, Tanggal, Waktu, Tempat, Acara & TTD RW Otomatis Terhubung Dengan Surat Undangan
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
        >
          <Printer size={16} />
          <span>Cetak Daftar Hadir (F4)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: MANAGING PARTICIPANTS & DIGITAL SIGNATURE */}
        <div className="lg:col-span-5 space-y-4 no-print">
          {/* SINKRONISASI BADGE SUMMARY */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <RefreshCw size={12} /> Data Ter-Sinkron Dari Surat Undangan
            </h3>
            <div className="text-xs space-y-1 text-slate-300 font-mono">
              <div><strong>HARI / TGL:</strong> {undanganData.hariAcara}, {undanganData.tanggalAcara}</div>
              <div><strong>WAKTU:</strong> {undanganData.waktuAcara}</div>
              <div><strong>TEMPAT:</strong> {undanganData.tempatAcara.split("\n")[0]}</div>
              <div><strong>ACARA:</strong> {undanganData.berkenaanDengan}</div>
              <div><strong>KETUA RW {undanganData.rwNo}:</strong> {undanganData.namaKetuaRw}</div>
            </div>
          </div>

          {/* ADD PARTICIPANT FORM */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Tambah Peserta Hadir Baru</h3>
            <form onSubmit={handleAddPeserta} className="space-y-2">
              <input
                type="text"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                placeholder="Nama Peserta Hadir (Contoh: Budi Santoso)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                value={newJabatan}
                onChange={(e) => setNewJabatan(e.target.value)}
                placeholder="Jabatan / Instansi (Contoh: Ketua RT 001 / Tokoh Agama)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Tambah Ke Daftar Hadir
              </button>
            </form>
          </div>

          {/* LIST OF PARTICIPANTS & SIGN BUTTON */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Daftar Peserta Musling ({pesertaList.length} Orang)
              </h3>
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {pesertaList.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {idx + 1}. {p.nama}
                    </div>
                    <div className="text-[11px] text-slate-500">{p.jabatan}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openSignModal(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        p.ttdDataUrl
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <PenTool size={12} />
                      <span>{p.ttdDataUrl ? "TTD Tersimpan" : "TTD di Layar"}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePeserta(p.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Hapus Peserta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW HASIL CETAK PERSIS GAMBAR KE-1 */}
        <div className="lg:col-span-7">
          <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
            <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              --- Preview Cetak Kertas F4 Cambria (Persis Gambar Ke-1) ---
            </span>

            {/* ON-SCREEN PREVIEW */}
            {renderDaftarHadirContent(false)}
          </div>
        </div>
      </div>

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderDaftarHadirContent(true),
        document.body
      )}

      {/* DIGITAL SIGNATURE CANVAS MODAL */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <PenTool size={18} className="text-emerald-600" />
                <span>Goreskan Tanda Tangan Di Layar</span>
              </h3>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Gunakan jari (Layar Sentuh) atau Mouse untuk menggoreskan TTD di dalam kotak di bawah ini:
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-2 flex justify-center touch-none">
              <canvas
                ref={canvasRef}
                width={340}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white rounded-xl shadow-inner border border-slate-200 cursor-crosshair w-full max-w-[340px] h-[160px]"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Hapus / Ulangi
              </button>
              <button
                type="button"
                onClick={saveSignature}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Check size={14} /> Simpan TTD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
