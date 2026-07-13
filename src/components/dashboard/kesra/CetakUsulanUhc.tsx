"use client";

import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Image from "next/image";

const RUJUKAN_HOSPITALS: Record<string, string> = {
  "PUSKESMAS CIBUNGBULANG": "Jl. Kapten Dasuki Bakri Rt.002 Rw.003 Cibatok I Kecamatan Cibungbulang, 16630",
  "RSUD. LEUWILIANG": "Jl. Raya Cibeber No.1 Cibeber, Kecamatan Leuwiliang, Kabupaten bogor, 16640",
  "RS. ASYSYIFAA": "Jl. Raya Leuwiliang, Cibeber I, Kecamatan Leuwiliang, Kabupaten bogor, 16640",
  "RS. KARYA BHAKTI PRATIWI": "Jl. Raya Dramaga Km.7 Dramaga, Kecamatan Dramaga, Kab. Bogor, 16880",
  "RS. MEDIKA DRAMAGA": "Jl. Raya Dramaga Km.7 Rt.01/07 , Margajaya, Kec. Bogor Barat Kota Bogor, 16680",
  "RSUD. KOTA BOGOR": "Jl. DR.Semeru No.120, Rt.03/20, Menteng, Kec. Bogor barat, Kota Bogor, 16112",
};

const PARAM_OPTIONS = {
  param1: ["> Rp6.000.000,-", "<= Rp6.000.000,-", "<= Rp5.000.000", "<= Rp4.000.000", "<= Rp3.000.000", "<= Rp2.000.000", "< Rp1.000.000"],
  param2: ["Tidak Ada", "1 (satu) Jiwa", "2 (dua) Jiwa", "3 (tiga) Jiwa", "4 (empat) Jiwa", "5 (lima) Jiwa", "> 5 (lima) Jiwa"],
  param3: ["Milik Sendiri", "Menumpang", "Kontrak/Sewa"],
  param4: ["Tidak ada Anggota Keluarga yang Putus Sekolah", "Bersekolah tetapi tidak mampu membayar biaya pendidikan", "Ada Anggota Keluarga yang Putus Sekolah (SD,SMP dan SMA sederajat)"],
  param5: ["Memiliki kendaraan roda 4 (empat)", "Memiliki > 1 (satu) kendaraan roda 2 (dua)", "Memiliki 1 (satu) kendaraan roda 2 (dua) ≥ 150 cc", "Memiliki 1 (satu) kendaraan roda 2 (dua) < 150 cc", "Tidak Memiliki kendaraan roda 2 (dua)"],
  param6: ["Marmer/Granit", "Keramik", "Parket/Vinil/Permadani", "Ubin/Legel/Teraso", "Kayu/Papan Kualitas Tinggi", "Semen/Bata Merah", "Bambu", "Kayu/Papan Kualitas Rendah", "Tanah", "Lainnya"],
  param7: ["Tembok Bagus(Kualitas Tinggi)", "Kayu/Anyaman Bambu/Batang Kayu/Triplek/Seng", "Tembok Jelek (Kualitas Rendah)"],
  param8: ["Beton/Genteng", "Genteng Keramik", "Genteng Metal", "Genteng Tanah Liat", "Asbes", "Seng", "Sirap", "Bambu", "Jerami/Ijuk/Daun-daun/Rumbia", "Lainnya"],
  param9: ["Air Kemasan bermerek", "Air Isi Ulang", "Ledeng/Meteran", "Sumur Tak Terlindungi", "Sumur bor/pompa/mata air terlindungi", "Air Sungai/Danau/Waduk/Air Hujan"],
  param10: ["≥ 1.300 W", "900 W", "450 W", "Tanpa Meteran/Bukan Listrik"],
  param11: ["Sendiri", "Bersama", "Tidak Ada"],
  param12: ["Septic Tank", "Septic Tank Komunal", "Lubang Tanah", "Kolam/Sawah/Sungai/Danau", "Tanah Lapang/Kebun"],
  param13: ["Ada", "Tidak Ada"],
  param14: ["Mampu membayar Iuran JKN terendah secara mandiri", "Iuran JKN dibayarkan pihak lain", "Tidak Mampu membayar Iuran JKN/Tidak Memiliki JKN"]
};

const CheckMark = ({ condition }: { condition: boolean }) => (
  <span className="font-bold">{condition ? "●" : ""}</span>
);

export function CetakUsulanUhc({ data, onBack }: { data: any; onBack: () => void }) {
  useEffect(() => {
    // Optionally trigger print on load
    // window.print();
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen py-8">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto !important;
            padding: 0;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: 215.9mm 330.2mm portrait; /* F4 Size */
            margin: 15mm;
          }
        }
      `}} />

      {/* Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={18} /> Kembali
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
          <Printer size={18} /> Cetak Form (F4)
        </button>
      </div>

      {/* Print Area - F4 Layout */}
      <div id="print-area" className="text-black text-[11px] leading-tight" style={{ fontFamily: "Cambria, serif" }}>

        {/* Lembar Formulir */}
        <div className="max-w-[215.9mm] mx-auto bg-white shadow-xl min-h-[330.2mm] print:min-h-0 p-[10mm] print:p-0 mb-8 print:mb-0 print:shadow-none relative">

          {/* Header */}
          <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-4">
            <div className="w-[100px] flex items-center justify-center">
              <img src="/images/logo-bogor.png" alt="Logo Bogor" className="w-[85px] h-auto object-contain" />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-[15px] font-bold">PEMERINTAH KABUPATEN BOGOR PUSAT</h1>
              <h2 className="text-[16px] font-bold mt-1">KESEJAHTERAAN SOSIAL</h2>
              <h3 className="text-[17px] font-bold mt-1">PEMERINTAHAN DESA CIMANGGU I</h3>
              <p className="text-[9px] mt-1">KP. CIARUTEUN RT. 004/008 DESA CIMANGGU I KECAMATAN CIBUNGBULANG KABUPATEN BOGOR- 16630</p>
            </div>
            <div className="w-[80px]"></div>
          </div>

          {/* Title */}
          <div className="text-center font-bold text-[13px] mb-3 border border-black p-1 bg-gray-100">
            LEMBAR VERIFIKASI 14 PARAMETER KEMISKINAN
          </div>

          {/* Identitas Table */}
          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-1 w-[20%] font-semibold">Kecamatan</td>
                <td className="border border-black p-1 w-[30%] uppercase">: {data.kecamatan}</td>
                <td className="border border-black p-1 w-[20%] font-semibold">Nama Pasien</td>
                <td className="border border-black p-1 w-[30%] uppercase">: {data.namaPasien}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-semibold">Desa/Kelurahan</td>
                <td className="border border-black p-1 uppercase">: {data.desaKelurahan}</td>
                <td className="border border-black p-1 font-semibold">Nomor KK</td>
                <td className="border border-black p-1 uppercase">: {data.nomorKk}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-semibold">Nama Pemohon</td>
                <td className="border border-black p-1 uppercase">: {data.namaPemohon}</td>
                <td className="border border-black p-1 font-semibold">NIK</td>
                <td className="border border-black p-1 uppercase">: {data.nik}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-semibold">Alamat</td>
                <td className="border border-black p-1 uppercase">: {data.alamatPemohon}</td>
                <td className="border border-black p-1 font-semibold">Alamat Pasien</td>
                <td className="border border-black p-1 uppercase">: {data.alamatPasien}</td>
              </tr>
            </tbody>
          </table>

          {/* 14 Parameter Table */}
          <div className="text-center font-bold text-[13px] mb-1 border border-black border-b-0 p-1 bg-gray-100">
            14 PARAMETER KEMISKINAN
          </div>
          <table className="w-full border-collapse border border-black border-b-0 table-fixed">
            <tbody>
              {/* Param 1 */}
              <tr>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }} rowSpan={3}>1</td>
                <td className="border border-black p-1" style={{ width: "29%" }} rowSpan={3}>Penghasilan Rata-rata/bulan</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.param1 === "> Rp6.000.000,-"} /></td>
                <td className="border border-black p-1" style={{ width: "18.33%" }}>{"> Rp6.000.000,-"}</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.param1 === "<= Rp4.000.000"} /></td>
                <td className="border border-black p-1" style={{ width: "18.33%" }}>{"<= Rp4.000.000"}</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.param1 === "< Rp1.000.000"} /></td>
                <td className="border border-black p-1" style={{ width: "18.34%" }}>{"< Rp1.000.000"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param1 === "<= Rp6.000.000,-"} /></td>
                <td className="border border-black p-1">{"<= Rp6.000.000,-"}</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param1 === "<= Rp3.000.000"} /></td>
                <td className="border border-black p-1">{"<= Rp3.000.000"}</td>
                <td className="border border-black p-1 border-r-0"></td>
                <td className="border border-black p-1 border-l-0"></td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param1 === "<= Rp5.000.000"} /></td>
                <td className="border border-black p-1">{"<= Rp5.000.000"}</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param1 === "<= Rp2.000.000"} /></td>
                <td className="border border-black p-1">{"<= Rp2.000.000"}</td>
                <td className="border border-black p-1 border-r-0"></td>
                <td className="border border-black p-1 border-l-0"></td>
              </tr>

              {/* Param 2 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>2</td>
                <td className="border border-black p-1" rowSpan={3}>Jumlah Tanggungan Keluarga</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "Tidak Ada"} /></td>
                <td className="border border-black p-1">Tidak Ada</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "3 (tiga) Jiwa"} /></td>
                <td className="border border-black p-1">3 (tiga) Jiwa</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "> 5 (lima) Jiwa"} /></td>
                <td className="border border-black p-1">{"> 5 (lima) Jiwa"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "1 (satu) Jiwa"} /></td>
                <td className="border border-black p-1">1 (satu) Jiwa</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "4 (empat) Jiwa"} /></td>
                <td className="border border-black p-1">4 (empat) Jiwa</td>
                <td className="border border-black p-1 border-r-0"></td>
                <td className="border border-black p-1 border-l-0"></td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "2 (dua) Jiwa"} /></td>
                <td className="border border-black p-1">2 (dua) Jiwa</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param2 === "5 (lima) Jiwa"} /></td>
                <td className="border border-black p-1">5 (lima) Jiwa</td>
                <td className="border border-black p-1 border-r-0"></td>
                <td className="border border-black p-1 border-l-0"></td>
              </tr>

              {/* Param 3 */}
              <tr>
                <td className="border border-black p-1 text-center">3</td>
                <td className="border border-black p-1">Status Tempat Tinggal</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param3 === "Milik Sendiri"} /></td>
                <td className="border border-black p-1">Milik Sendiri</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param3 === "Menumpang"} /></td>
                <td className="border border-black p-1">Menumpang</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param3 === "Kontrak/Sewa"} /></td>
                <td className="border border-black p-1">Kontrak/Sewa</td>
              </tr>

              {/* Param 4 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>4</td>
                <td className="border border-black p-1" rowSpan={3}>Kemampuan akses pendidikan</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param4 === "Tidak ada Anggota Keluarga yang Putus Sekolah"} /></td>
                <td className="border border-black p-1" colSpan={5}>Tidak ada Anggota Keluarga yang Putus Sekolah</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param4 === "Bersekolah tetapi tidak mampu membayar biaya pendidikan"} /></td>
                <td className="border border-black p-1" colSpan={5}>Bersekolah tetapi tidak mampu membayar biaya pendidikan</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param4 === "Ada Anggota Keluarga yang Putus Sekolah (SD,SMP dan SMA sederajat)"} /></td>
                <td className="border border-black p-1" colSpan={5}>Ada Anggota Keluarga yang Putus Sekolah (SD,SMP dan SMA sederajat)</td>
              </tr>

              {/* Param 5 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={5}>5</td>
                <td className="border border-black p-1" rowSpan={5}>Kepemilikan Kendaraan</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param5 === "Memiliki kendaraan roda 4 (empat)"} /></td>
                <td className="border border-black p-1" colSpan={5}>Memiliki kendaraan roda 4 (empat)</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param5 === "Memiliki > 1 (satu) kendaraan roda 2 (dua)"} /></td>
                <td className="border border-black p-1" colSpan={5}>Memiliki {"> 1"} (satu) kendaraan roda 2 (dua)</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param5 === "Memiliki 1 (satu) kendaraan roda 2 (dua) ≥ 150 cc"} /></td>
                <td className="border border-black p-1" colSpan={5}>Memiliki 1 (satu) kendaraan roda 2 (dua) ≥ 150 cc</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param5 === "Memiliki 1 (satu) kendaraan roda 2 (dua) < 150 cc"} /></td>
                <td className="border border-black p-1" colSpan={5}>Memiliki 1 (satu) kendaraan roda 2 (dua) {"< 150 cc"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param5 === "Tidak Memiliki kendaraan roda 2 (dua)"} /></td>
                <td className="border border-black p-1" colSpan={5}>Tidak Memiliki kendaraan roda 2 (dua)</td>
              </tr>

              {/* Param 6 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={5}>6</td>
                <td className="border border-black p-1" rowSpan={5}>Jenis Lantai</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Marmer/Granit"} /></td>
                <td className="border border-black p-1">Marmer/Granit</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Semen/Bata Merah"} /></td>
                <td className="border border-black p-1" colSpan={3}>Semen/Bata Merah</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Keramik"} /></td>
                <td className="border border-black p-1">Keramik</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Bambu"} /></td>
                <td className="border border-black p-1" colSpan={3}>Bambu</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Parket/Vinil/Permadani"} /></td>
                <td className="border border-black p-1">Parket/Vinil/Permadani</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Kayu/Papan Kualitas Rendah"} /></td>
                <td className="border border-black p-1" colSpan={3}>Kayu/Papan Kualitas Rendah</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Ubin/Legel/Teraso"} /></td>
                <td className="border border-black p-1">Ubin/Legel/Teraso</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Tanah"} /></td>
                <td className="border border-black p-1" colSpan={3}>Tanah</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Kayu/Papan Kualitas Tinggi"} /></td>
                <td className="border border-black p-1">Kayu/Papan Kualitas Tinggi</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param6 === "Lainnya"} /></td>
                <td className="border border-black p-1" colSpan={3}>Lainnya</td>
              </tr>

              {/* Param 7 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>7</td>
                <td className="border border-black p-1" rowSpan={3}>Jenis dan Kondisi Dinding</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param7 === "Tembok Bagus(Kualitas Tinggi)"} /></td>
                <td className="border border-black p-1" colSpan={5}>Tembok Bagus(Kualitas Tinggi)</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param7 === "Kayu/Anyaman Bambu/Batang Kayu/Triplek/Seng"} /></td>
                <td className="border border-black p-1" colSpan={5}>Kayu/Anyaman Bambu/Batang Kayu/Triplek/Seng</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param7 === "Tembok Jelek (Kualitas Rendah)"} /></td>
                <td className="border border-black p-1" colSpan={5}>Tembok Jelek (Kualitas Rendah)</td>
              </tr>

              {/* Param 8 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={5}>8</td>
                <td className="border border-black p-1" rowSpan={5}>Jenis dan Kondisi Atap</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Beton/Genteng"} /></td>
                <td className="border border-black p-1">Beton/Genteng</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Seng"} /></td>
                <td className="border border-black p-1" colSpan={3}>Seng</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Genteng Keramik"} /></td>
                <td className="border border-black p-1">Genteng Keramik</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Sirap"} /></td>
                <td className="border border-black p-1" colSpan={3}>Sirap</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Genteng Metal"} /></td>
                <td className="border border-black p-1">Genteng Metal</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Bambu"} /></td>
                <td className="border border-black p-1" colSpan={3}>Bambu</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Genteng Tanah Liat"} /></td>
                <td className="border border-black p-1">Genteng Tanah Liat</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Jerami/Ijuk/Daun-daun/Rumbia"} /></td>
                <td className="border border-black p-1" colSpan={3}>Jerami/Ijuk/Daun-daun/Rumbia</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Asbes"} /></td>
                <td className="border border-black p-1">Asbes</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param8 === "Lainnya"} /></td>
                <td className="border border-black p-1" colSpan={3}>Lainnya</td>
              </tr>

              {/* Param 9 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>9</td>
                <td className="border border-black p-1" rowSpan={3}>Sumber Air Minum</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param9 === "Air Kemasan bermerek"} /></td>
                <td className="border border-black p-1">Air Kemasan bermerek</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param9 === "Sumur Tak Terlindungi"} /></td>
                <td className="border border-black p-1" colSpan={3}>Sumur Tak Terlindungi</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param9 === "Air Isi Ulang"} /></td>
                <td className="border border-black p-1">Air Isi Ulang</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param9 === "Sumur bor/pompa/mata air terlindungi"} /></td>
                <td className="border border-black p-1" colSpan={3}>Sumur bor/pompa/mata air terlindungi</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param9 === "Ledeng/Meteran"} /></td>
                <td className="border border-black p-1">Ledeng/Meteran</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param9 === "Air Sungai/Danau/Waduk/Air Hujan"} /></td>
                <td className="border border-black p-1" colSpan={3}>Air Sungai/Danau/Waduk/Air Hujan</td>
              </tr>

              {/* Param 10 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={2}>10</td>
                <td className="border border-black p-1" rowSpan={2}>Sumber dan Daya Listrik Terpasang</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param10 === "≥ 1.300 W"} /></td>
                <td className="border border-black p-1">≥ 1.300 W</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param10 === "450 W"} /></td>
                <td className="border border-black p-1" colSpan={3}>450 W</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param10 === "900 W"} /></td>
                <td className="border border-black p-1">900 W</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param10 === "Tanpa Meteran/Bukan Listrik"} /></td>
                <td className="border border-black p-1" colSpan={3}>Tanpa Meteran/Bukan Listrik</td>
              </tr>

              {/* Param 11 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>11</td>
                <td className="border border-black p-1" rowSpan={3}>Kepemilikan dan Penggunaan<br />Kamar Mandi Cuci Kakus</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param11 === "Sendiri"} /></td>
                <td className="border border-black p-1" colSpan={5}>Sendiri</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param11 === "Bersama"} /></td>
                <td className="border border-black p-1" colSpan={5}>Bersama</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param11 === "Tidak Ada"} /></td>
                <td className="border border-black p-1" colSpan={5}>Tidak Ada</td>
              </tr>

              {/* Param 12 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>12</td>
                <td className="border border-black p-1" rowSpan={3}>Fasilitas Tempat Pembuangan<br />Akhir Tinja</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param12 === "Septic Tank"} /></td>
                <td className="border border-black p-1">Septic Tank</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param12 === "Kolam/Sawah/Sungai/Danau"} /></td>
                <td className="border border-black p-1" colSpan={3}>Kolam/Sawah/Sungai/Danau</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param12 === "Septic Tank Komunal"} /></td>
                <td className="border border-black p-1">Septic Tank Komunal</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param12 === "Tanah Lapang/Kebun"} /></td>
                <td className="border border-black p-1" colSpan={3}>Tanah Lapang/Kebun</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param12 === "Lubang Tanah"} /></td>
                <td className="border border-black p-1">Lubang Tanah</td>
                <td className="border border-black p-1 border-r-0"></td>
                <td className="border border-black p-1 border-l-0" colSpan={3}></td>
              </tr>

              {/* Param 13 */}
              <tr>
                <td className="border border-black p-1 text-center">13</td>
                <td className="border border-black p-1">Memiliki anggota keluarga<br />yang Lanjut Usia/Disabilitas</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param13 === "Ada"} /></td>
                <td className="border border-black p-1">Ada</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param13 === "Tidak Ada"} /></td>
                <td className="border border-black p-1" colSpan={3}>Tidak Ada</td>
              </tr>

              {/* Param 14 */}
              <tr>
                <td className="border border-black p-1 text-center" rowSpan={3}>14</td>
                <td className="border border-black p-1" rowSpan={3}>Kesanggupan Biaya Pengobatan</td>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param14 === "Mampu membayar Iuran JKN terendah secara mandiri"} /></td>
                <td className="border border-black p-1" colSpan={5}>Mampu membayar Iuran JKN terendah secara mandiri</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param14 === "Iuran JKN dibayarkan pihak lain"} /></td>
                <td className="border border-black p-1" colSpan={5}>Iuran JKN dibayarkan pihak lain</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center"><CheckMark condition={data.param14 === "Tidak Mampu membayar Iuran JKN/Tidak Memiliki JKN"} /></td>
                <td className="border border-black p-1" colSpan={5}>Tidak Mampu membayar Iuran JKN/Tidak Memiliki JKN</td>
              </tr>
            </tbody>
          </table>

          {/* Hasil Verifikasi Section */}
          <div className="break-inside-avoid">
            <table className="w-full border-collapse border border-black mb-1 table-fixed">
            <tbody>
              <tr>
                <td className="border border-black p-1 font-bold text-[10px]" style={{ width: "33%" }}>HASIL VERIFIKASI</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.hasilVerifikasi === "SANGAT MISKIN"} /></td>
                <td className="border border-black p-1 text-[10px]" style={{ width: "12.75%" }}>SANGAT MISKIN</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.hasilVerifikasi === "MISKIN"} /></td>
                <td className="border border-black p-1 text-[10px]" style={{ width: "12.75%" }}>MISKIN</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.hasilVerifikasi === "RENTAN MISKIN"} /></td>
                <td className="border border-black p-1 text-[10px]" style={{ width: "12.75%" }}>RENTAN MISKIN</td>
                <td className="border border-black p-1 text-center" style={{ width: "4%" }}><CheckMark condition={data.hasilVerifikasi === "TIDAK MISKIN"} /></td>
                <td className="border border-black p-1 text-[10px]" style={{ width: "12.75%" }}>TIDAK MISKIN</td>
              </tr>
              <tr>
                <td className="border border-black p-2 h-[50px] align-top text-[11px]" colSpan={9}>
                  {data.keterangan || ""}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 h-[40px] align-top text-[11px]" colSpan={9}>
                  {data.rujukan ? (
                    data.rujukan.startsWith("CUSTOM|") ? (
                      <>
                        <span className="font-bold uppercase">RUJUKAN : {data.rujukan.split("|")[1]}</span>
                        <br />
                        <span className="font-normal">{data.rujukan.split("|")[2]}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold uppercase">RUJUKAN : {data.rujukan}</span>
                        {RUJUKAN_HOSPITALS[data.rujukan] && (
                          <>
                            <br />
                            <span className="font-normal">{RUJUKAN_HOSPITALS[data.rujukan]}</span>
                          </>
                        )}
                      </>
                    )
                  ) : (
                    <span className="font-bold">RUJUKAN : -</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature */}
          <div className="mt-8 flex justify-end">
            <div className="text-center w-[200px]">
              <p className="text-[12px] mb-1">Cimanggu I, {new Date(data.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-[12px] mb-[60px]">KASI KESEJAHTERAAN</p>
              <p className="font-bold text-[12px] underline">( ABDUL AZIZ )</p>
            </div>
          </div>
        </div> {/* Tutup wrapper break-inside-avoid */}

        </div> {/* Tutup Lembar Formulir */}

        {/* Halaman Lampiran Foto */}
        {data.fotoDepan && (
          <div style={{ pageBreakBefore: "always" }} className="max-w-[215.9mm] mx-auto bg-white p-[10mm] print:p-0 shadow-lg print:shadow-none min-h-[330mm] print:min-h-0 mb-8 print:mb-0">
            <div className="text-center font-bold text-lg mb-4">-1-</div>
            <div className="border border-black h-[280mm] flex flex-col">
              <div className="border-b border-black p-2 text-center text-[13px] font-semibold">
                FOTO TAMPAK DEPAN DAN KOORDINAT TEMPAT TINGGAL
              </div>
              <div className="flex-1 p-2 flex items-center justify-center bg-slate-50/50">
                <img src={data.fotoDepan} className="w-full h-full object-contain object-center" alt="Tampak Depan" />
              </div>
            </div>
          </div>
        )}

        {data.fotoSamping && (
          <div style={{ pageBreakBefore: "always" }} className="max-w-[215.9mm] mx-auto bg-white p-[10mm] print:p-0 shadow-lg print:shadow-none min-h-[330mm] print:min-h-0 mb-8 print:mb-0">
            <div className="text-center font-bold text-lg mb-4">-2-</div>
            <div className="border border-black h-[280mm] flex flex-col">
              <div className="border-b border-black p-2 text-center text-[13px] font-semibold">
                FOTO TAMPAK SAMPING DAN KOORDINAT TEMPAT TINGGAL
              </div>
              <div className="flex-1 p-2 flex items-center justify-center bg-slate-50/50">
                <img src={data.fotoSamping} className="w-full h-full object-contain object-center" alt="Tampak Samping" />
              </div>
            </div>
          </div>
        )}

        {data.fotoDalam && (
          <div style={{ pageBreakBefore: "always" }} className="max-w-[215.9mm] mx-auto bg-white p-[10mm] print:p-0 shadow-lg print:shadow-none min-h-[330mm] print:min-h-0 mb-8 print:mb-0">
            <div className="text-center font-bold text-lg mb-4">-3-</div>
            <div className="border border-black h-[280mm] flex flex-col">
              <div className="border-b border-black p-2 text-center text-[13px] font-semibold">
                FOTO TAMPAK DALAM DAN KOORDINAT TEMPAT TINGGAL
              </div>
              <div className="flex-1 p-2 flex items-center justify-center bg-slate-50/50">
                <img src={data.fotoDalam} className="w-full h-full object-contain object-center" alt="Tampak Dalam" />
              </div>
            </div>
          </div>
        )}

        {data.fotoKamarMandi && (
          <div style={{ pageBreakBefore: "always" }} className="max-w-[215.9mm] mx-auto bg-white p-[10mm] print:p-0 shadow-lg print:shadow-none min-h-[330mm] mb-8 print:mb-0">
            <div className="text-center font-bold text-lg mb-4">-4-</div>
            <div className="border border-black h-[280mm] flex flex-col">
              <div className="border-b border-black p-2 text-center text-[13px] font-semibold">
                FOTO KAMAR MANDI DAN KOORDINAT TEMPAT TINGGAL
              </div>
              <div className="flex-1 p-2 flex items-center justify-center bg-slate-50/50">
                <img src={data.fotoKamarMandi} className="w-full h-full object-contain object-center" alt="Kamar Mandi" />
              </div>
            </div>
          </div>
        )}

      </div> {/* Tutup print-area */}
    </div>
  );
}
