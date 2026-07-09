"use client";

import { useState } from "react";
import { FileText, Calendar, Printer, User, Award, Loader2, Sparkles } from "lucide-react";
import { getKesraReportData } from "@/actions/kesra";

export function KesraReportTab({ session }: any) {
  const [reportType, setReportType] = useState("BANSOS");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const [kasiName, setKasiName] = useState(session?.user?.name || "Aldyansyah Permana");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getKesraReportData(reportType, { start: startDate, end: endDate });
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      let reportTitle = "LAPORAN REALISASI BANSOS KELURAHAN / DESA";
      let contentHtml = "";

      if (reportType === "BANSOS") {
        reportTitle = "LAPORAN DETEKSI DINI & CLEANSING BANSOS DTKS";
        const list = data.dtks || [];
        contentHtml = `
          <h3>Data Bersih Penerima Bansos (DTKS)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="border: 1px solid #cbd5e1; padding: 6px;">No</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">NIK</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Nama Kepala Keluarga</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Tanggungan</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Penghasilan</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Bantuan Diterima</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? "<tr><td colspan='7' style='text-align:center;padding:10px;'>Tidak ada data.</td></tr>" : 
                list.map((d: any, idx: number) => `
                  <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: monospace;">${d.nik}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${d.namaKepalaKeluarga}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.jumlahTanggungan} Orang</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">Rp ${d.penghasilan.toLocaleString("id-ID")}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.jenisBantuan}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; color: ${d.statusKelayakan === 'LAYAK' ? '#10b981' : '#ef4444'}">${d.statusKelayakan}</td>
                  </tr>
                `).join("")
              }
            </tbody>
          </table>
        `;
      } else if (reportType === "STUNTING") {
        reportTitle = "LAPORAN EARLY WARNING SYSTEM (EWS) KASUS STUNTING BALITA";
        const list = data.balitas || [];
        contentHtml = `
          <h3>Data Pemantauan Pertumbuhan Balita Stunting</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="border: 1px solid #cbd5e1; padding: 6px;">No</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">NIK Anak</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Nama Lengkap Anak</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">JK</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Nama Orang Tua</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Posyandu</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Status Pertumbuhan</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? "<tr><td colspan='7' style='text-align:center;padding:10px;'>Tidak ada data.</td></tr>" : 
                list.map((d: any, idx: number) => `
                  <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: monospace;">${d.nik || "-"}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${d.namaLengkap}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.jenisKelamin}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.namaOrangTua}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.posyanduName}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${d.statusStunting ? "STUNTING" : "NORMAL"}</td>
                  </tr>
                `).join("")
              }
            </tbody>
          </table>
        `;
      } else {
        reportTitle = "LAPORAN PERTANGGUNGJAWABAN DANA DESA REKAPITULASI INSENTIF KEAGAMAAN";
        const list = data.insentifs || [];
        contentHtml = `
          <h3>Data Penyaluran Insentif Bulanan Guru Ngaji & Marbot</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="border: 1px solid #cbd5e1; padding: 6px;">No</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Nama Petugas</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Kategori</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Tempat Ibadah</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Nomor Rekening</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Jumlah Saluran</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? "<tr><td colspan='6' style='text-align:center;padding:10px;'>Tidak ada data.</td></tr>" : 
                list.map((d: any, idx: number) => {
                  const paymentSum = d.payments?.reduce((s: number, py: any) => s + py.jumlah, 0) || 0;
                  return `
                    <tr>
                      <td style="border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
                      <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${d.namaPetugas}</td>
                      <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.jenisPetugas}</td>
                      <td style="border: 1px solid #cbd5e1; padding: 6px;">${d.tempatIbadah}</td>
                      <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: monospace;">${d.namaBank}: ${d.noRekening}</td>
                      <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">Rp ${paymentSum.toLocaleString("id-ID")}</td>
                    </tr>
                  `;
                }).join("")
              }
            </tbody>
          </table>
        `;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #334155; line-height: 1.5; }
              .header { text-align: center; border-bottom: 3px double #334155; padding-bottom: 15px; margin-bottom: 25px; }
              .header h2 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
              .header p { margin: 4px 0 0; font-size: 11px; color: #64748b; }
              .report-info { margin-bottom: 25px; font-size: 12px; }
              .report-info table { width: 100%; }
              .report-info td { padding: 4px 0; }
              .footer { margin-top: 60px; display: flex; justify-content: flex-end; }
              .sign-box { text-align: center; width: 250px; font-size: 13px; }
              .sign-line { border-bottom: 1px solid #475569; margin-top: 65px; font-weight: bold; padding-bottom: 4px; }
            </style>
          </head>
          <body onload="window.print()">
            <div class="header">
              <h2>PEMERINTAH KABUPATEN BOGOR</h2>
              <h2>KANTOR KEPALA DESA CIMANGGU I</h2>
              <p>Jl. Raya Cimanggu No. 1, Kecamatan Cibungbulang, Kabupaten Bogor, Jawa Barat</p>
            </div>
            
            <h3 style="text-align: center; font-size: 14px; font-weight: 800; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 20px;">
              ${reportTitle}
            </h3>

            <div class="report-info">
              <table>
                <tr>
                  <td style="width: 15%; font-weight: bold;">Periode Laporan</td>
                  <td style="width: 2%;">:</td>
                  <td>${new Date(startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} s/d ${new Date(endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Dibuat Oleh</td>
                  <td>:</td>
                  <td>Kasi Kesejahteraan (Kesra) Desa Cimanggu I</td>
                </tr>
              </table>
            </div>

            ${contentHtml}

            <div class="footer">
              <div class="sign-box">
                <div>Bogor, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div style="font-weight: bold; margin-top: 5px;">Kasi Kesejahteraan (Kesra)</div>
                <div class="sign-line">${kasiName}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Tanda Tangan Elektronik Aktif</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

    } catch (err) {
      console.error(err);
      alert("Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" />
          One-Click Regulasi Report Generator
        </h2>
        <p className="text-slate-500 text-sm mt-1">Kompilasi otomatis kinerja sosial, stunting, dan dana bantuan menjadi dokumen LPJ resmi desa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report configuration form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-1.5"><Sparkles className="text-indigo-500" size={16} /> Pengaturan Dokumen Laporan</h3>
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Format Laporan Regulasi *</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
              >
                <option value="BANSOS">Laporan Cleansing & Realisasi Bansos (DTKS)</option>
                <option value="STUNTING">Laporan Penanggulangan Stunting (EWS)</option>
                <option value="INSENTIF">Laporan Penyaluran Insentif Guru Ngaji (APBDes)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Mulai *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Akhir *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Kasi Kesejahteraan (Penandatangan) *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={kasiName}
                  onChange={e => setKasiName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-black disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-sm mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengompilasi Laporan...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  Kompilasi & Cetak PDF LPJ
                </>
              )}
            </button>
          </form>
        </div>

        {/* Visual guide or template card */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Regulasi</span>
            <h4 className="font-bold text-slate-800 text-sm">Dokumen Terkompilasi Otomatis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seluruh laporan yang dihasilkan mengikuti pedoman naskah dinas resmi pemerintahan desa. Dokumen dilengkapi dengan:
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">✓ Kop Surat Dinas Resmi Desa Cimanggu I</li>
              <li className="flex items-center gap-2">✓ Tabel data yang disaring sesuai rentang periode</li>
              <li className="flex items-center gap-2">✓ Kolom Tanda Tangan Elektronik Kasi Kesra</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-400">
            <Award size={14} className="text-slate-400 shrink-0" />
            Format siap cetak untuk lampiran pertanggungjawaban Dana Desa (DD).
          </div>
        </div>
      </div>
    </div>
  );
}
