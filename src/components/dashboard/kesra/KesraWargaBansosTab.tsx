"use client";

import { useState, useEffect } from "react";
import { Search, Award, Printer, Edit3 } from "lucide-react";
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
    const bansos = warga.bansosData;
    const desil = parseInt(bansos?.desil || 0);

    // === GATE: Hanya cetak Desil 1-5 ===
    if (!bansos || desil < 1 || desil > 5) {
      alert(
        `Sertifikat hanya dapat dicetak untuk penerima Desil 1–5.\n\nWarga ini memiliki Desil ${bansos?.desil ?? "Tidak Terdata"} dan tidak memenuhi syarat penerima Bansos berdasarkan standar DTKS.`
      );
      return;
    }

    const certWindow = window.open("", "_blank");
    if (!certWindow) return;

    // --- Auto tanggal tanda tangan ---
    const now = new Date();
    const BULAN_ID = [
      "Januari","Februari","Maret","April","Mei","Juni",
      "Juli","Agustus","September","Oktober","November","Desember"
    ];
    const autoDate = `Cimanggu I, ${now.getDate()} ${BULAN_ID[now.getMonth()]} ${now.getFullYear()}`;

    // --- Nomor surat ---
    const nomorRegister = `${warga.nik.substring(12)}${warga.id.substring(0, 4).toUpperCase()}`;

    // --- Desil label ---
    const desilDescMap: Record<number, string> = {
      1: "Sangat Miskin",
      2: "Miskin",
      3: "Hampir Miskin",
      4: "Rentan Miskin",
      5: "Tidak Miskin Rentan",
    };
    const desilDesc = desilDescMap[desil] || `Desil ${desil}`;

    // --- Parse jenisBantuan ---
    let bantuanList: string[] = [];
    try {
      if (bansos?.jenisBantuan) {
        const parsed =
          typeof bansos.jenisBantuan === "string"
            ? JSON.parse(bansos.jenisBantuan)
            : bansos.jenisBantuan;
        if (Array.isArray(parsed)) bantuanList = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const bantuanBadges = bantuanList.length > 0
      ? bantuanList.map(b => `<span class="bantuan-badge">${b}</span>`).join(" ")
      : '<span style="color:#888">—</span>';

    // --- Barcode SVG ---
    const barcodeSvg = `<svg width="200" height="55" viewBox="0 0 200 55" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="55" fill="#ffffff"/>
      <rect x="8" y="4" width="3" height="42" fill="#000"/><rect x="13" y="4" width="1" height="42" fill="#000"/>
      <rect x="16" y="4" width="4" height="42" fill="#000"/><rect x="23" y="4" width="2" height="42" fill="#000"/>
      <rect x="28" y="4" width="1" height="42" fill="#000"/><rect x="31" y="4" width="3" height="42" fill="#000"/>
      <rect x="37" y="4" width="2" height="42" fill="#000"/><rect x="42" y="4" width="5" height="42" fill="#000"/>
      <rect x="50" y="4" width="1" height="42" fill="#000"/><rect x="54" y="4" width="2" height="42" fill="#000"/>
      <rect x="59" y="4" width="4" height="42" fill="#000"/><rect x="66" y="4" width="2" height="42" fill="#000"/>
      <rect x="71" y="4" width="1" height="42" fill="#000"/><rect x="74" y="4" width="3" height="42" fill="#000"/>
      <rect x="80" y="4" width="4" height="42" fill="#000"/><rect x="87" y="4" width="1" height="42" fill="#000"/>
      <rect x="91" y="4" width="2" height="42" fill="#000"/><rect x="96" y="4" width="3" height="42" fill="#000"/>
      <rect x="102" y="4" width="1" height="42" fill="#000"/><rect x="106" y="4" width="4" height="42" fill="#000"/>
      <rect x="113" y="4" width="2" height="42" fill="#000"/><rect x="118" y="4" width="1" height="42" fill="#000"/>
      <rect x="122" y="4" width="3" height="42" fill="#000"/><rect x="128" y="4" width="4" height="42" fill="#000"/>
      <rect x="135" y="4" width="1" height="42" fill="#000"/><rect x="139" y="4" width="2" height="42" fill="#000"/>
      <rect x="144" y="4" width="4" height="42" fill="#000"/><rect x="151" y="4" width="2" height="42" fill="#000"/>
      <rect x="156" y="4" width="1" height="42" fill="#000"/><rect x="160" y="4" width="3" height="42" fill="#000"/>
      <rect x="166" y="4" width="4" height="42" fill="#000"/><rect x="173" y="4" width="2" height="42" fill="#000"/>
      <rect x="178" y="4" width="1" height="42" fill="#000"/><rect x="182" y="4" width="3" height="42" fill="#000"/>
      <text x="100" y="54" font-family="monospace" font-size="7" text-anchor="middle" fill="#000">KSR-${warga.nik.substring(0,6)}-${warga.id.substring(0,8).toUpperCase()}</text>
    </svg>`;

    // --- Logo Kabupaten Bogor (inline SVG representasi) ---
    const logoBogorSvg = `<svg width="82" height="82" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg">
      <!-- Shield shape -->
      <path d="M200 10 L380 80 L380 250 C380 340 200 410 200 410 C200 410 20 340 20 250 L20 80 Z" fill="#FFD700" stroke="#333" stroke-width="8"/>
      <!-- Green inner pentagon -->
      <polygon points="200,55 310,120 310,270 200,340 90,270 90,120" fill="#228B22" stroke="#111" stroke-width="5"/>
      <!-- Black circle -->
      <circle cx="200" cy="195" r="115" fill="#111" stroke="#eee" stroke-width="6"/>
      <!-- Dark green inner -->
      <circle cx="200" cy="195" r="105" fill="#1a6b2a"/>
      <!-- Gold triangle -->
      <polygon points="200,105 290,280 110,280" fill="#FFD700" stroke="#111" stroke-width="5"/>
      <!-- Waves -->
      <path d="M125,265 Q145,250 165,265 Q185,280 205,265 Q225,250 245,265 Q265,280 278,265" fill="none" stroke="#111" stroke-width="3.5"/>
      <path d="M130,248 Q150,235 170,248 Q190,261 210,248 Q230,235 250,248 Q265,260 273,248" fill="none" stroke="#111" stroke-width="3"/>
      <!-- Kujang/leaf center -->
      <ellipse cx="200" cy="190" rx="24" ry="45" fill="white" stroke="#228B22" stroke-width="4"/>
      <path d="M200,152 Q218,172 218,192 Q218,218 200,232 Q182,218 182,192 Q182,172 200,152Z" fill="#228B22"/>
      <!-- Text top arc -->
      <path id="a1" d="M100,195 A100,100 0 0,1 300,195" fill="none"/>
      <text font-family="Arial" font-size="18" font-weight="bold" fill="white" letter-spacing="4">
        <textPath href="#a1" startOffset="5%">PRAYOGA TOHAGA</textPath>
      </text>
      <!-- SAYAGA -->
      <text x="200" y="302" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="3">SAYAGA</text>
      <!-- Bottom arc text -->
      <path id="a2" d="M110,280 A100,100 0 0,0 290,280" fill="none"/>
      <text font-family="Arial" font-size="11" fill="white" letter-spacing="1">
        <textPath href="#a2" startOffset="8%">KUTA UDAYA WANGSA</textPath>
      </text>
      <!-- TEGAR BERIMAN bottom -->
      <text x="200" y="390" font-family="Arial" font-size="30" font-weight="900" fill="#333" text-anchor="middle" letter-spacing="1">TEGAR BERIMAN</text>
    </svg>`;

    certWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Sertifikat Penerima Bansos - ${warga.namaLengkap}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Times New Roman',Times,serif;background:#fff;color:#111;font-size:11.5pt;}

    /* Default: A4 Landscape */
    @page{size:A4 landscape;margin:14mm 18mm;}

    /* Size switch style tag */
    #pgsize{display:none;}

    /* Outer double border */
    .outer{border:10px double #1a3a8f;padding:16px 22px;min-height:auto;display:flex;flex-direction:column;gap:0;}

    /* KOP SURAT */
    .kop{display:flex;align-items:center;gap:16px;border-bottom:3.5px double #111;padding-bottom:10px;margin-bottom:0;}
    .kop-text{flex:1;text-align:center;}
    .kop-gov{font-size:14.5pt;font-weight:900;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px;line-height:1.2;}
    .kop-kec{font-size:11.5pt;font-weight:bold;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.4px;margin-top:2px;}
    .kop-addr{font-size:8.5pt;font-style:italic;color:#333;margin-top:3px;font-family:Arial,sans-serif;}

    /* CERT TITLE */
    .cert-title{text-align:center;margin:11px 0 8px 0;padding-bottom:8px;border-bottom:1.5px solid #555;}
    .cert-title h2{font-size:14pt;font-weight:900;text-transform:uppercase;letter-spacing:2.5px;font-family:Arial,sans-serif;color:#1a3a8f;}
    .cert-title .nomor{font-size:9.5pt;font-family:Arial,sans-serif;color:#333;margin-top:5px;}

    /* OPENING */
    .opening{font-size:10.5pt;margin:9px 0 5px 0;text-align:justify;line-height:1.65;}

    /* DATA TABLE */
    .dtable{width:100%;border-collapse:collapse;margin:5px 0 9px 0;}
    .dtable td{padding:4.5px 7px;font-size:10.5pt;vertical-align:top;line-height:1.5;}
    .dtable td.lbl{font-weight:bold;width:38%;color:#111;white-space:nowrap;}
    .dtable td.sep{width:3%;text-align:center;font-weight:bold;}
    .dtable td.val{border-bottom:1px dashed #aaa;}
    .desil-badge{display:inline-block;background:#dbeafe;color:#1e3a8f;padding:2px 10px;border-radius:4px;font-weight:900;font-size:10.5pt;}
    .bantuan-badge{display:inline-block;background:#dcfce7;color:#14532d;padding:1px 8px;border-radius:4px;font-weight:bold;font-size:9.5pt;margin:1px 2px;}

    /* CLOSING */
    .statement{font-size:9.5pt;font-style:italic;color:#444;text-align:center;margin:7px 0 12px 0;line-height:1.65;}

    /* FOOTER */
    .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:8px;}
    .barcode-box{border:1px solid #ddd;padding:7px 9px;background:#f9fafb;border-radius:4px;text-align:center;}
    .barcode-label{font-size:6.5pt;color:#888;font-family:Arial,sans-serif;margin-top:3px;}
    .sig-block{text-align:center;width:250px;font-family:Arial,sans-serif;}
    .sig-date{font-size:10pt;margin-bottom:3px;}
    .sig-title{font-size:10pt;font-weight:bold;margin-bottom:52px;}
    .sig-name{font-size:10.5pt;font-weight:900;text-decoration:underline;}
    .sig-nip{font-size:8.5pt;color:#555;margin-top:2px;}

    /* PRINT CONTROLS (hidden on print) */
    .pcontrols{position:fixed;top:14px;right:14px;display:flex;flex-wrap:wrap;gap:7px;z-index:999;background:white;padding:9px 13px;border-radius:11px;box-shadow:0 3px 18px rgba(0,0,0,.15);border:1px solid #e2e8f0;}
    .pcontrols button{padding:5px 12px;border-radius:7px;border:1.5px solid #334155;cursor:pointer;font-size:10px;font-weight:bold;font-family:Arial,sans-serif;background:#f8fafc;color:#334155;transition:all .15s;}
    .pcontrols button:hover,.pcontrols button.on{background:#1a3a8f;color:white;border-color:#1a3a8f;}
    @media print{.pcontrols{display:none!important;}}
  </style>
  <style id="pgsize">@page{size:A4 landscape;margin:14mm 18mm;}</style>
</head>
<body>

  <!-- Print Size Controls -->
  <div class="pcontrols">
    <button id="ba4l" class="on" onclick="setSize('A4 landscape','ba4l')">A4 Lanskap</button>
    <button id="ba4p" onclick="setSize('A4 portrait','ba4p')">A4 Potrait</button>
    <button id="bf4l" onclick="setSize('330mm 215mm','bf4l')">F4 Lanskap</button>
    <button id="bf4p" onclick="setSize('215mm 330mm','bf4p')">F4 Potrait</button>
    <button onclick="window.print()" style="background:#1a8c3c;color:white;border-color:#1a8c3c;">&#128438; Cetak</button>
  </div>

  <script>
    function setSize(sz,btnId){
      document.getElementById('pgsize').textContent='@page{size:'+sz+';margin:14mm 18mm;}';
      document.querySelectorAll('.pcontrols button').forEach(function(b){b.classList.remove('on');});
      var el=document.getElementById(btnId);if(el)el.classList.add('on');
    }
  </script>

  <!-- CERTIFICATE -->
  <div class="outer">

    <!-- KOP SURAT -->
    <div class="kop">
      <div class="kop-logo">${logoBogorSvg}</div>
      <div class="kop-text">
        <div class="kop-gov">Pemerintahan Kabupaten Bogor</div>
        <div class="kop-kec">Kecamatan Cibungbulang &mdash; Desa Cimanggu I</div>
        <div class="kop-addr">Alamat&nbsp;: Jl. Gardu Seri Kp. Ciaruteun Rt. 004 Rw. 008 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor &mdash; 16630</div>
      </div>
    </div>

    <!-- CERT TITLE -->
    <div class="cert-title">
      <h2>Surat Keterangan Penerima Bansos</h2>
      <div class="nomor">Nomor : 400.1.2.7/&nbsp;&nbsp;${nomorRegister}&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Kesra</div>
    </div>

    <!-- OPENING -->
    <p class="opening">
      Yang bertanda tangan di bawah ini, Kasi Kesejahteraan Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor,
      dengan ini menerangkan bahwa warga yang tercatat di bawah ini merupakan penerima resmi program jaminan sosial
      masyarakat di lingkungan wilayah Desa Cimanggu I:
    </p>

    <!-- DATA TABLE -->
    <table class="dtable">
      <tr>
        <td class="lbl">Nama Lengkap</td>
        <td class="sep">:</td>
        <td class="val"><b>${warga.namaLengkap}</b></td>
      </tr>
      <tr>
        <td class="lbl">Nomor Induk Kependudukan (NIK)</td>
        <td class="sep">:</td>
        <td class="val" style="font-family:monospace;">${warga.nik}</td>
      </tr>
      <tr>
        <td class="lbl">Nomor Kartu Keluarga (KK)</td>
        <td class="sep">:</td>
        <td class="val" style="font-family:monospace;">${warga.noKK || "&mdash;"}</td>
      </tr>
      <tr>
        <td class="lbl">Alamat / Wilayah</td>
        <td class="sep">:</td>
        <td class="val">RT ${warga.rt} / RW ${warga.rw}${warga.dusun ? ", Dusun " + warga.dusun : ""}, Desa Cimanggu I</td>
      </tr>
      <tr>
        <td class="lbl">Desil Kesejahteraan</td>
        <td class="sep">:</td>
        <td class="val">
          <span class="desil-badge">Desil ${desil}</span>
          &nbsp;<i style="font-size:9.5pt;color:#555;">(${desilDesc})</i>
        </td>
      </tr>
      <tr>
        <td class="lbl">Kategori Program Bantuan</td>
        <td class="sep">:</td>
        <td class="val">${bantuanBadges}</td>
      </tr>
      ${bansos.keterangan ? `<tr>
        <td class="lbl">Keterangan</td>
        <td class="sep">:</td>
        <td class="val" style="font-style:italic;">${bansos.keterangan}</td>
      </tr>` : ""}
    </table>

    <!-- CLOSING -->
    <p class="statement">
      Demikian surat keterangan ini diterbitkan secara sah dan terekam pada data kependudukan desa untuk digunakan sebagaimana mestinya.<br>
      Apabila terdapat kekeliruan dalam surat ini, akan diperbaiki sebagaimana mestinya.
    </p>

    <!-- FOOTER -->
    <div class="footer">
      <div class="barcode-box">
        ${barcodeSvg}
        <div class="barcode-label">VERIFIKASI RESMI DIGITAL</div>
      </div>
      <div class="sig-block">
        <div class="sig-date">${autoDate}</div>
        <div class="sig-title">Kasi Kesejahteraan<br>Desa Cimanggu I</div>
        <div class="sig-name">${session?.user?.name || "KASI KESEJAHTERAAN"}</div>
        <div class="sig-nip">NIPD. 19890412.2026.0710</div>
      </div>
    </div>

  </div>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`);
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
            Integrasi Bansos &amp; Data Kependudukan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola, update penerimaan bansos warga, dan cetak sertifikat resmi terverifikasi barcode (hanya Desil 1–5).</p>
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

                  const desilNum = bansos?.desil ? parseInt(bansos.desil) : null;
                  const canPrint = desilNum !== null && desilNum >= 1 && desilNum <= 5;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono">{w.nik}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{w.namaLengkap}</td>
                      <td className="px-4 py-3">RT {w.rt} / RW {w.rw}</td>
                      <td className="px-4 py-3">
                        {bansos?.desil ? (
                          <span className={`font-bold text-xs px-2 py-0.5 rounded-full border ${
                            canPrint
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-slate-500 bg-slate-100 border-slate-200"
                          }`}>
                            Desil {bansos.desil}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
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
                              title={!canPrint ? "Hanya Desil 1–5 yang dapat dicetak sertifikatnya" : "Cetak Sertifikat"}
                              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold text-[10px] shadow-sm ${
                                canPrint
                                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              <Printer size={11} /> {canPrint ? "Cetak Sertifikat" : "Tidak Layak Cetak"}
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
              <p className="text-[9px] text-slate-400 mt-1">Desil 1–5 = layak bansos &amp; dapat cetak sertifikat</p>
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
