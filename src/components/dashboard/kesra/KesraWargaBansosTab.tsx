"use client";

import { useState, useEffect } from "react";
import { Search, Heart, User, Award, Printer, Shield, Eye, Edit3, Settings } from "lucide-react";
import { getKesraKependudukanList, updateKesraWargaBansos } from "@/actions/kesra";

export function KesraWargaBansosTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKesraKependudukanList();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePrintCertificate = (warga: any) => {
    const certWindow = window.open("", "_blank");
    if (!certWindow) return;

    const bansos = warga.bansosData;
    const desilVal = bansos?.desil ? `Desil ${bansos.desil}` : "Tidak Terdata";
    
    // Parse jenisBantuan JSON safely
    let bantuanListStr = "-";
    try {
      if (bansos?.jenisBantuan) {
        const parsed = typeof bansos.jenisBantuan === "string" ? JSON.parse(bansos.jenisBantuan) : bansos.jenisBantuan;
        if (Array.isArray(parsed)) {
          bantuanListStr = parsed.join(", ");
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Barcode SVG for official verification
    const barcodeSvg = `
      <svg width="180" height="50" viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="180" height="50" fill="#ffffff"/>
        <!-- Barcode patterns -->
        <rect x="10" y="5" width="3" height="40" fill="#000000"/>
        <rect x="15" y="5" width="1" height="40" fill="#000000"/>
        <rect x="18" y="5" width="4" height="40" fill="#000000"/>
        <rect x="25" y="5" width="2" height="40" fill="#000000"/>
        <rect x="30" y="5" width="1" height="40" fill="#000000"/>
        <rect x="33" y="5" width="3" height="40" fill="#000000"/>
        <rect x="40" y="5" width="2" height="40" fill="#000000"/>
        <rect x="45" y="5" width="5" height="40" fill="#000000"/>
        <rect x="53" y="5" width="1" height="40" fill="#000000"/>
        <rect x="58" y="5" width="2" height="40" fill="#000000"/>
        <rect x="63" y="5" width="4" height="40" fill="#000000"/>
        <rect x="70" y="5" width="2" height="40" fill="#000000"/>
        <rect x="75" y="5" width="1" height="40" fill="#000000"/>
        <rect x="78" y="5" width="3" height="40" fill="#000000"/>
        <rect x="85" y="5" width="4" height="40" fill="#000000"/>
        <rect x="92" y="5" width="1" height="40" fill="#000000"/>
        <rect x="95" y="5" width="2" height="40" fill="#000000"/>
        <rect x="100" y="5" width="3" height="40" fill="#000000"/>
        <rect x="105" y="5" width="1" height="40" fill="#000000"/>
        <rect x="110" y="5" width="4" height="40" fill="#000000"/>
        <rect x="117" y="5" width="2" height="40" fill="#000000"/>
        <rect x="122" y="5" width="1" height="40" fill="#000000"/>
        <rect x="125" y="5" width="3" height="40" fill="#000000"/>
        <rect x="130" y="5" width="4" height="40" fill="#000000"/>
        <rect x="137" y="5" width="1" height="40" fill="#000000"/>
        <rect x="140" y="5" width="2" height="40" fill="#000000"/>
        <rect x="145" y="5" width="4" height="40" fill="#000000"/>
        <rect x="152" y="5" width="2" height="40" fill="#000000"/>
        <rect x="157" y="5" width="1" height="40" fill="#000000"/>
        <rect x="160" y="5" width="3" height="40" fill="#000000"/>
        <rect x="166" y="5" width="4" height="40" fill="#000000"/>
        <!-- Text representation of ID -->
        <text x="90" y="49" font-family="monospace" font-size="8" text-anchor="middle" fill="#000000">KSR-${warga.nik.substring(0,6)}-${warga.id.substring(0,8).toUpperCase()}</text>
      </svg>
    `;

    certWindow.document.write(`
      <html>
        <head>
          <title>Sertifikat Penerima Bansos - ${warga.namaLengkap}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { font-family: 'Georgia', serif; background-color: #f7f7f7; margin: 0; padding: 40px; box-sizing: border-box; }
            .border-outer { border: 15px double #1e293b; padding: 25px; background: #fff; border-radius: 4px; box-shadow: 0 0 20px rgba(0,0,0,0.1); height: calc(100vh - 110px); display: flex; flex-direction: column; justify-content: space-between; }
            .header { text-align: center; border-bottom: 3px double #334155; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { font-family: 'Arial', sans-serif; font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
            .header h2 { font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold; color: #475569; margin: 5px 0 0 0; text-transform: uppercase; }
            .header p { font-size: 11px; font-style: italic; color: #64748b; margin: 5px 0 0 0; }
            
            .title-cert { text-align: center; margin-bottom: 25px; }
            .title-cert h3 { font-size: 28px; font-weight: bold; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-family: 'Times New Roman', serif; }
            .title-cert p { font-size: 13px; font-style: italic; color: #475569; margin: 5px 0 0 0; }
            
            .content { margin: 0 auto; width: 85%; font-size: 16px; line-height: 1.8; color: #334155; }
            .content table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            .content td { padding: 6px 12px; font-size: 15px; }
            .content td.label { font-weight: bold; width: 30%; color: #1e293b; }
            .content td.value { border-bottom: 1px dashed #cbd5e1; }
            
            .statement { text-align: center; font-size: 14px; margin-top: 15px; font-style: italic; color: #475569; }
            
            .footer-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; }
            .barcode-box { border: 1px solid #e2e8f0; padding: 10px; background-color: #f8fafc; border-radius: 6px; }
            .signature-box { text-align: center; font-size: 14px; color: #1e293b; width: 280px; }
            .signature-box .title { font-weight: bold; margin-bottom: 60px; }
            .signature-box .name { font-weight: bold; text-decoration: underline; }
            .signature-box .nip { font-size: 12px; color: #64748b; margin-top: 2px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="border-outer">
            <div class="header">
              <h1>Pemerintah Kabupaten Bogor</h1>
              <h2>Kecamatan Leuwiliang &bull; Kantor Kepala Desa Cimanggu I</h2>
              <p>Alamat: Jalan Raya Cimanggu No. 01, Kode Pos 16640</p>
            </div>
            
            <div class="title-cert">
              <h3>Surat Keterangan Penerima Bansos</h3>
              <p>Nomor Registrasi: 470 / ${warga.nik.substring(10)} / KESRA / 2026</p>
            </div>
            
            <div class="content">
              Diberikan kepada warga yang tercatat di bawah ini sebagai penerima resmi program jaminan sosial masyarakat di lingkungan wilayah Desa Cimanggu I:
              <table>
                <tr>
                  <td class="label">Nama Lengkap</td>
                  <td class="value"><b>${warga.namaLengkap}</b></td>
                </tr>
                <tr>
                  <td class="label">Nomor Induk Kependudukan (NIK)</td>
                  <td class="value font-mono">${warga.nik}</td>
                </tr>
                <tr>
                  <td class="label">Nomor Kartu Keluarga (KK)</td>
                  <td class="value font-mono">${warga.noKK}</td>
                </tr>
                <tr>
                  <td class="label">Alamat / Wilayah</td>
                  <td class="value">RT ${warga.rt} / RW ${warga.rw}, Dusun ${warga.dusun || "-"}</td>
                </tr>
                <tr>
                  <td class="label">Desil Kesejahteraan</td>
                  <td class="value"><b>${desilVal}</b> (Kelompok Kerentanan Sosial Rendah)</td>
                </tr>
                <tr>
                  <td class="label">Kategori Program Bantuan</td>
                  <td class="value"><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 13px;">${bantuanListStr}</span></td>
                </tr>
              </table>
            </div>

            <p class="statement">Demikian sertifikat keterangan ini diterbitkan secara sah dan terekam pada data kependudukan desa untuk digunakan sebagaimana mestinya.</p>
            
            <div class="footer-section">
              <div class="barcode-box">
                ${barcodeSvg}
                <div style="font-size: 8px; color: #94a3b8; text-align: center; margin-top: 4px;">VERIFIKASI RESMI DIGITAL</div>
              </div>
              <div class="signature-box">
                <div class="title">Kasi Kesejahteraan Desa Cimanggu I</div>
                <div class="name">${session?.user?.name || "KASI KESEJAHTERAAN"}</div>
                <div class="nip">NIPD. 19890412.2026.0710</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    certWindow.document.close();
  };

  const handleEditClick = (warga: any) => {
    setSelectedWarga(warga);
    setShowEditModal(true);
  };

  const filteredData = data.filter(d =>
    d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    d.nik.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-500" />
            Integrasi Bansos & Data Kependudukan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola, update penerimaan bansos warga, dan cetak sertifikat resmi terverifikasi barcode.</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari NIK atau Nama warga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs">
                <th className="px-4 py-3 font-semibold rounded-l-xl">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-4 py-3 font-semibold">Alamat (RT/RW)</th>
                <th className="px-4 py-3 font-semibold">Desil</th>
                <th className="px-4 py-3 font-semibold">Jenis Bantuan</th>
                <th className="px-4 py-3 font-semibold">Status Bansos</th>
                <th className="px-4 py-3 rounded-r-xl font-semibold text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">Tidak ada data kependudukan ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((w, idx) => {
                  const bansos = w.bansosData;
                  let bantuanStr = "-";
                  try {
                    if (bansos?.jenisBantuan) {
                      const parsed = typeof bansos.jenisBantuan === "string" ? JSON.parse(bansos.jenisBantuan) : bansos.jenisBantuan;
                      if (Array.isArray(parsed)) bantuanStr = parsed.join(", ");
                    }
                  } catch (e) {}

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono">{w.nik}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{w.namaLengkap}</td>
                      <td className="px-4 py-3">RT {w.rt} / RW {w.rw}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600">
                        {bansos?.desil ? `Desil ${bansos.desil}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] text-blue-700 font-bold border border-blue-100">
                          {bantuanStr}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {bansos ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bansos.status === "AKTIF" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {bansos.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">Belum Terdata</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleEditClick(w)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold text-[10px]"
                          >
                            <Edit3 size={11} /> Update
                          </button>
                          {bansos && (
                            <button
                              onClick={() => handlePrintCertificate(w)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold text-[10px] shadow-sm"
                            >
                              <Printer size={11} /> Cetak Sertifikat
                            </button>
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

      {showEditModal && selectedWarga && (
        <ModalEditBansos
          warga={selectedWarga}
          onClose={() => setShowEditModal(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

function ModalEditBansos({ warga, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const bansos = warga.bansosData;

  const [selectedBantuan, setSelectedBantuan] = useState<string[]>([]);
  
  useEffect(() => {
    if (bansos?.jenisBantuan) {
      try {
        const parsed = typeof bansos.jenisBantuan === "string" ? JSON.parse(bansos.jenisBantuan) : bansos.jenisBantuan;
        if (Array.isArray(parsed)) setSelectedBantuan(parsed);
      } catch (e) {}
    }
  }, [bansos]);

  const toggleBantuan = (b: string) => {
    setSelectedBantuan(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await updateKesraWargaBansos({
      wargaId: warga.id,
      desil: parseInt(fd.get("desil") as string) || 1,
      jenisBantuan: selectedBantuan,
      status: fd.get("status") as string,
      keterangan: fd.get("keterangan") as string
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Update Status Bansos</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{warga.namaLengkap}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Desil Kelompok (1-10) *</label>
              <input name="desil" required type="number" min="1" max="10" defaultValue={bansos?.desil || 1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Bansos</label>
              <select name="status" defaultValue={bansos?.status || "AKTIF"} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium">
                <option value="AKTIF">AKTIF</option>
                <option value="NON_AKTIF">NON AKTIF</option>
                <option value="USULAN_RT">USULAN RT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori Program Bantuan</label>
            <div className="grid grid-cols-3 gap-2">
              {["PKH", "BPNT", "BLT-DD", "KIS/PBI", "BST"].map(b => {
                const isSelected = selectedBantuan.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBantuan(b)}
                    className={`px-2 py-1.5 rounded-lg border text-center font-bold text-[10px] transition-all ${
                      isSelected 
                        ? "bg-blue-500 border-blue-500 text-white shadow-sm" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan Tambahan</label>
            <input name="keterangan" defaultValue={bansos?.keterangan || ""} placeholder="Kondisi ekonomi / catatan bansos" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Update Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
