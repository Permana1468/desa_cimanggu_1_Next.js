"use client";

import { useState, useEffect } from "react";
import { getPuskesosLaporanRekap } from "@/actions/puskesos";
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Clock, 
  HeartHandshake, 
  ShieldCheck, 
  Users, 
  RefreshCw,
  Building,
  UserCheck
} from "lucide-react";

export function PuskesosLaporanTab({ session }: { session: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"ALL" | "PENGADUAN" | "RUJUKAN" | "UHC" | "TAMU">("ALL");
  const [search, setSearch] = useState("");
  const tenantId = session?.user?.tenantId || "cimanggu-1";

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPuskesosLaporanRekap(tenantId);
      setData(res);
    } catch (err) {
      console.error("Gagal memuat rekap laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const totalPengaduan = data?.pengaduan?.length || 0;
  const totalRujukan = data?.rujukan?.length || 0;
  const totalUhc = data?.uhc?.length || 0;
  const uhcLayak = data?.uhc?.filter((u: any) => u.hasilVerifikasi === "LAYAK").length || 0;
  const totalTamu = data?.bukuTamu?.length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* HEADER ACTION BAR (SCREEN ONLY) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm no-print">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">
            Laporan Kinerja & Akuntabilitas SLRT
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">
            Laporan & Rekapitulasi Puskesos
          </h2>
          <p className="text-slate-500 text-sm">
            Arsip lengkap dokumen pertanggungjawaban penanganan sosial, rujukan kesehatan, dan bantuan warga.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Printer size={16} /> Cetak Laporan / LPJ Resmi
          </button>
        </div>
      </div>

      {/* KPI STATS CARDS (SCREEN ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {[
          { label: "Total Pengaduan", count: totalPengaduan, sub: "Kasus masuk", color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Surat Rujukan SLRT", count: totalRujukan, sub: "Diterbitkan", color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Usulan UHC / BPJS", count: totalUhc, sub: `${uhcLayak} diverifikasi layak`, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Buku Tamu Layanan", count: totalTamu, sub: "Kunjungan warga", color: "text-purple-600 bg-purple-50 border-purple-100" }
        ].map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl border shadow-xs ${card.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{card.label}</span>
            <div className="text-2xl font-black mt-1">{card.count}</div>
            <span className="text-xs font-semibold opacity-80 mt-0.5 block">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* SUBTABS FILTER BAR (SCREEN ONLY) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs no-print">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: "ALL", label: "Ringkasan Terpadu" },
            { id: "PENGADUAN", label: `Pengaduan (${totalPengaduan})` },
            { id: "RUJUKAN", label: `Rujukan SLRT (${totalRujukan})` },
            { id: "UHC", label: `Usulan UHC (${totalUhc})` },
            { id: "TAMU", label: `Buku Tamu (${totalTamu})` }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === t.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter data laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500 bg-slate-50"
          />
        </div>
      </div>

      {/* PRINTABLE AREA (Contains full official LPJ format) */}
      <div className="print-area bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
        {/* KOP SURAT RESMI */}
        <div className="border-b-4 border-double border-slate-800 pb-5 text-center relative">
          <div className="flex items-center justify-center gap-6">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <img src="/images/logo-bogor.png" alt="Kabupaten Bogor" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Pemerintah Kabupaten Bogor</h3>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Kecamatan Cibungbulang</h4>
              <h1 className="text-xl font-black uppercase text-slate-900 tracking-tight">Desa Cimanggu I</h1>
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wide mt-0.5">
                Pusat Kesejahteraan Sosial (Puskesos) — Sistem Layanan Rujukan Terpadu (SLRT)
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Sekretariat: Kantor Desa Cimanggu I, Jl. Raya Cibungbulang Km. 18, Kode Pos 16630
              </p>
            </div>
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <img src="/images/PUSKESOS-1.png" alt="Puskesos SLRT" className="w-14 h-14 object-contain" />
            </div>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
            Laporan Rekapitulasi Pelayanan Puskesos (SLRT)
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Periode Berjalan Tahun {new Date().getFullYear()} — Update Data per {todayStr}
          </p>
        </div>

        {/* REKAP TABEL 1: PENGADUAN & KELUHAN SOSIAL */}
        {(subTab === "ALL" || subTab === "PENGADUAN") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileText size={14} className="text-blue-600" /> A. Rekapitulasi Pengaduan & Keluhan Masuk ({data?.pengaduan?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2 border border-slate-200 w-8 text-center">No</th>
                    <th className="p-2 border border-slate-200">Warga Pelapor / NIK</th>
                    <th className="p-2 border border-slate-200">Wilayah</th>
                    <th className="p-2 border border-slate-200">Kategori</th>
                    <th className="p-2 border border-slate-200">Deskripsi Masalah</th>
                    <th className="p-2 border border-slate-200 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(!data?.pengaduan || data.pengaduan.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">Belum ada pengaduan tercatat.</td>
                    </tr>
                  ) : (
                    data.pengaduan
                      .filter((p: any) => 
                        !search || 
                        p.warga?.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
                        p.deskripsi?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((p: any, idx: number) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-bold">
                            {p.warga?.namaLengkap || "Warga"}
                            <div className="text-[10px] font-normal font-mono text-slate-500">{p.warga?.nik || "-"}</div>
                          </td>
                          <td className="p-2 border border-slate-200 whitespace-nowrap">
                            RT {p.warga?.rt || "-"}/RW {p.warga?.rw || "-"}
                          </td>
                          <td className="p-2 border border-slate-200 font-semibold text-slate-700">{p.jenisPengaduan}</td>
                          <td className="p-2 border border-slate-200 text-slate-600 max-w-xs">{p.deskripsi}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                              p.status === "SELESAI" ? "bg-emerald-100 text-emerald-800" :
                              p.status === "DIPROSES" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REKAP TABEL 2: SURAT RUJUKAN SLRT */}
        {(subTab === "ALL" || subTab === "RUJUKAN") && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <HeartHandshake size={14} className="text-indigo-600" /> B. Rekapitulasi Surat Rujukan SLRT ({data?.rujukan?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2 border border-slate-200 w-8 text-center">No</th>
                    <th className="p-2 border border-slate-200">Nomor Surat</th>
                    <th className="p-2 border border-slate-200">Nama Pasien / Warga</th>
                    <th className="p-2 border border-slate-200">Instansi Tujuan</th>
                    <th className="p-2 border border-slate-200">Alasan Rujukan</th>
                    <th className="p-2 border border-slate-200 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(!data?.rujukan || data.rujukan.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">Belum ada rujukan SLRT diterbitkan.</td>
                    </tr>
                  ) : (
                    data.rujukan
                      .filter((r: any) => 
                        !search || 
                        r.warga?.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
                        r.instansiTujuan?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((r: any, idx: number) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-mono text-[11px] font-bold text-blue-700">{r.nomorSuratRujukan || "-"}</td>
                          <td className="p-2 border border-slate-200 font-bold">
                            {r.warga?.namaLengkap || "Warga"}
                            <div className="text-[10px] font-normal font-mono text-slate-500">NIK: {r.warga?.nik}</div>
                          </td>
                          <td className="p-2 border border-slate-200 font-bold text-slate-800">{r.instansiTujuan}</td>
                          <td className="p-2 border border-slate-200 text-slate-600 max-w-xs">{r.keteranganRujukan}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-indigo-100 text-indigo-800">
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REKAP TABEL 3: USULAN UHC */}
        {(subTab === "ALL" || subTab === "UHC") && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600" /> C. Rekapitulasi Usulan Jaminan Kesehatan UHC / BPJS PBI ({data?.uhc?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-2 border border-slate-200 w-8 text-center">No</th>
                    <th className="p-2 border border-slate-200">Nama Pasien</th>
                    <th className="p-2 border border-slate-200">NIK Pasien</th>
                    <th className="p-2 border border-slate-200">Nama Pemohon</th>
                    <th className="p-2 border border-slate-200">Alamat</th>
                    <th className="p-2 border border-slate-200 text-center">Hasil Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(!data?.uhc || data.uhc.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">Belum ada usulan UHC.</td>
                    </tr>
                  ) : (
                    data.uhc
                      .filter((u: any) => 
                        !search || 
                        u.namaPasien?.toLowerCase().includes(search.toLowerCase()) ||
                        u.nik?.includes(search)
                      )
                      .slice(0, subTab === "ALL" ? 10 : 100)
                      .map((u: any, idx: number) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-bold text-slate-800">{u.namaPasien}</td>
                          <td className="p-2 border border-slate-200 font-mono text-slate-600">{u.nik}</td>
                          <td className="p-2 border border-slate-200 text-slate-700">{u.namaPemohon}</td>
                          <td className="p-2 border border-slate-200 text-slate-600">{u.alamatPasien}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                              u.hasilVerifikasi === "LAYAK" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {u.hasilVerifikasi || "DIPROSES"}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
              {subTab === "ALL" && (data?.uhc?.length || 0) > 10 && (
                <p className="text-[10px] italic text-slate-400 mt-1">
                  * Ditampilkan 10 data teratas. Buka tab &apos;Usulan UHC&apos; untuk melihat seluruh {data.uhc.length} data.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TANDA TANGAN LEGALITAS LPJ */}
        <div className="pt-10 flex justify-between items-start text-center text-xs">
          <div className="w-56 space-y-16">
            <p className="font-medium text-slate-700">
              Mengetahui,<br />
              <strong>Kepala Desa Cimanggu I</strong>
            </p>
            <div>
              <p className="font-bold underline text-slate-900 uppercase">H. ASEP SAEPUDIN</p>
              <p className="text-[10px] text-slate-500">NIPD. 197508122002121003</p>
            </div>
          </div>

          <div className="w-56 space-y-16">
            <p className="font-medium text-slate-700">
              Cimanggu I, {todayStr}<br />
              <strong>Koordinator Puskesos SLRT</strong>
            </p>
            <div>
              <p className="font-bold underline text-slate-900 uppercase">PETUGAS PUSKESOS DESA</p>
              <p className="text-[10px] text-slate-500">SLRT Desa Cimanggu I</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

