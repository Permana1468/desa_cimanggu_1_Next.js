"use client";

import { useRef } from "react";
import { Printer, X, Download, ShieldCheck, FileText } from "lucide-react";

interface ModalCetakRujukanProps {
  rujukan: any;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function ModalCetakRujukan({ rujukan, onClose, onStatusUpdated }: ModalCetakRujukanProps) {
  const todayStr = new Date(rujukan?.tanggal || Date.now()).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const handlePrint = () => {
    window.print();
  };

  if (!rujukan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <style>{`
        @media print {
          @page {
            size: 215.9mm 330.2mm portrait; /* Standar Surat Resmi F4 Portrait */
            margin: 12mm;
          }
          /* Netralkan overlay modal agar tidak menutupi atau memotong cetak */
          .fixed, [class*="bg-slate-900"], [class*="backdrop-blur"] {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
          }
          .max-h-\\[90vh\\], .overflow-y-auto, .rounded-3xl, .shadow-2xl {
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .print-rujukan-area {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-rujukan-area * {
            visibility: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* TOP MODAL BAR (NO PRINT) */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Pratinjau Surat Rujukan Resmi SLRT</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <Printer size={15} /> Cetak Lembar Rujukan
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center text-lg leading-none transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* PRINTABLE LETTER CONTENT */}
        <div className="print-rujukan-area p-10 overflow-y-auto space-y-6 text-slate-900 font-sans text-xs sm:text-sm bg-white">
          {/* KOP RESMI */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-center gap-6">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <img src="/images/logo-bogor.png" alt="Kabupaten Bogor" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Pemerintah Kabupaten Bogor</h3>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Kecamatan Cibungbulang</h4>
                <h1 className="text-lg font-black uppercase text-slate-900 tracking-tight">Pemerintah Desa Cimanggu I</h1>
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mt-0.5">
                  Pusat Kesejahteraan Sosial (Puskesos) — Sekretariat SLRT
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Alamat: Jl. Raya Cibungbulang Km. 18, Desa Cimanggu I, Kec. Cibungbulang, Kab. Bogor 16630
                </p>
              </div>
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <img src="/images/PUSKESOS-1.png" alt="Puskesos SLRT" className="w-14 h-14 object-contain" />
              </div>
            </div>
          </div>

          {/* NOMOR & JUDUL SURAT */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-black uppercase underline tracking-wide">
              Surat Pengantar Rujukan Terpadu (SLRT)
            </h2>
            <p className="font-mono text-xs font-bold text-slate-700">
              Nomor: {rujukan.nomorSuratRujukan || "460/SLRT-CMG1/001/2026"}
            </p>
          </div>

          {/* TUJUAN RUJUKAN */}
          <div className="space-y-1 pt-2">
            <p className="font-semibold text-slate-800">Kepada Yth:</p>
            <p className="font-bold text-slate-900 uppercase">
              Pimpinan / Petugas Pelayanan: {rujukan.instansiTujuan}
            </p>
            <p className="text-xs text-slate-600">di Tempat</p>
          </div>

          <p className="leading-relaxed text-justify text-slate-700">
            Dengan hormat, bersama surat ini Pusat Kesejahteraan Sosial (Puskesos) Sistem Layanan Rujukan Terpadu (SLRT) Desa Cimanggu I menerangkan bahwa warga masyarakat berikut:
          </p>

          {/* TABEL IDENTITAS PASIEN / WARGA */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <table className="w-full text-xs space-y-2">
              <tbody>
                <tr className="border-b border-slate-200/60 pb-1.5">
                  <td className="w-40 font-bold py-1.5 text-slate-700">Nama Lengkap</td>
                  <td className="w-4 py-1.5">:</td>
                  <td className="font-bold text-slate-900 py-1.5 uppercase">{rujukan.warga?.namaLengkap || "Warga Desa"}</td>
                </tr>
                <tr className="border-b border-slate-200/60 pb-1.5">
                  <td className="font-bold py-1.5 text-slate-700">NIK</td>
                  <td className="py-1.5">:</td>
                  <td className="font-mono font-bold text-slate-800 py-1.5">{rujukan.warga?.nik || "-"}</td>
                </tr>
                <tr className="border-b border-slate-200/60 pb-1.5">
                  <td className="font-bold py-1.5 text-slate-700">Alamat Kependudukan</td>
                  <td className="py-1.5">:</td>
                  <td className="text-slate-800 py-1.5">
                    {rujukan.warga?.alamat || "Desa Cimanggu I"} RT {rujukan.warga?.rt || "-"}/RW {rujukan.warga?.rw || "-"}, Kec. Cibungbulang, Kab. Bogor
                  </td>
                </tr>
                <tr className="border-b border-slate-200/60 pb-1.5">
                  <td className="font-bold py-1.5 text-slate-700">Status Penanganan</td>
                  <td className="py-1.5">:</td>
                  <td className="text-blue-700 font-bold py-1.5 uppercase">
                    Pemerlu Pelayanan Kesejahteraan Sosial (PPKS)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ALASAN & KETERANGAN RUJUKAN */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">
              Maksud / Alasan Rekomendasi Rujukan:
            </h4>
            <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl text-slate-800 leading-relaxed font-medium">
              {rujukan.keteranganRujukan || "Rujukan pemenuhan hak jaminan sosial / kesehatan terpadu bagi warga rentan dan membutuhkan pendampingan medis / administratif sesuai regulasi SLRT."}
            </div>
          </div>

          <p className="leading-relaxed text-justify text-slate-700">
            Demikian surat rujukan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya untuk mendapatkan penanganan, fasilitas, serta pelayanan sesuai dengan ketentuan yang berlaku. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
          </p>

          {/* TANDA TANGAN LEGALITAS */}
          <div className="pt-8 flex justify-between items-end text-center text-xs">
            <div className="space-y-2 text-left">
              <div className="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white flex flex-col items-center justify-center text-[8px] text-center font-mono">
                <span className="font-black text-blue-700">SLRT CMG1</span>
                <span className="text-slate-400">QR Valid</span>
                <span className="text-[7px] text-slate-500 font-mono mt-1">{rujukan.id?.substring(0, 8)}</span>
              </div>
              <p className="text-[10px] text-slate-400">Verifikasi Dokumen Elektronik</p>
            </div>

            <div className="w-64 space-y-16">
              <p className="text-slate-700 font-medium">
                Cimanggu I, {todayStr}<br />
                <strong>Front Office / Fasilitator SLRT</strong>
              </p>
              <div>
                <p className="font-bold underline uppercase text-slate-900">PETUGAS PUSKESOS DESA</p>
                <p className="text-[10px] text-slate-500">Pusat Kesejahteraan Sosial Cimanggu I</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

