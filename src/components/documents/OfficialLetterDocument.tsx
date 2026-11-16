/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

export type OfficialLetterType = 
  | "sku"
  | "kematian"
  | "skkm_pendidikan"
  | "skkm_bpjs"
  | "kelahiran";

export interface OfficialLetterData {
  letterType: OfficialLetterType;
  nomorSurat: string;
  nomorResi?: string;
  tanggalSurat: string; // e.g. "19 Mei 2026"
  penandatangan: "KADES" | "SEKDES";
  namaPenandatangan?: string;
  showStamp?: boolean;
  showMaterai?: boolean;

  // Data Umum Pemohon / Subjek
  namaLengkap: string;
  nik: string;
  jenisKelamin: "Laki-Laki" | "Perempuan" | string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  kewarganegaraan: string;
  pekerjaan?: string;
  alamat: string;
  statusPerkawinan?: string;

  // Pengantar RT / RW
  rtPengantar?: string;
  rwPengantar?: string;
  kampungPengantar?: string;
  nomorPengantar?: string;
  tanggalPengantar?: string;

  // Khusus SKU
  namaUsaha?: string;
  lokasiUsaha?: string;
  berlakuMulai?: string;
  berlakuSampai?: string;
  keperluan?: string;

  // Khusus Kematian
  hariMeninggal?: string;
  tanggalMeninggal?: string;
  jamMeninggal?: string;
  tempatMeninggal?: string;
  sebabMeninggal?: string;
  umurMeninggal?: string;

  // Khusus SKKM Pendidikan
  namaAyah?: string;
  namaIbu?: string;
  noKK?: string;
  pendidikanDi?: string;

  // Khusus SKKM BPJS PBI
  terdaftarDTKS?: "YA" | "TIDAK" | string;
  tglPenerbitanKTP?: string;
  tglPenerbitanKK?: string;
  namaKepalaKeluarga?: string;

  // Khusus Kelahiran
  namaAnak?: string;
  anakKe?: string;
  anakKeTerbilang?: string;
  ayahNama?: string;
  ayahTTL?: string;
  ayahNIK?: string;
  ayahAgama?: string;
  ayahPekerjaan?: string;
  ayahAlamat?: string;
  ibuNama?: string;
  ibuTTL?: string;
  ibuNIK?: string;
  ibuAgama?: string;
  ibuPekerjaan?: string;
  ibuAlamat?: string;
  hariLahir?: string;
  tanggalLahirAnak?: string;
  jamLahirAnak?: string;
  tempatLahirAnak?: string;
}

export function OfficialLetterDocument({
  data,
  isPrinting = false,
  paperSize = "A4",
}: {
  data: OfficialLetterData;
  isPrinting?: boolean;
  paperSize?: "A4" | "F4" | "Letter";
}) {
  const isSekdes = data.penandatangan === "SEKDES";
  const namaPejabat = isSekdes
    ? "FAJAR TRI APRIANA"
    : "HERNAWAN M. SODIK";

  let sizeClass = "max-w-[210mm] min-h-[297mm]";
  if (paperSize === "F4") {
    sizeClass = "max-w-[215.9mm] min-h-[330.2mm]";
  } else if (paperSize === "Letter") {
    sizeClass = "max-w-[215.9mm] min-h-[279.4mm]";
  }

  return (
    <div
      className={`bg-white text-black leading-normal print:leading-normal font-serif text-[12pt] ${
        isPrinting
          ? "p-4 m-0 w-full shadow-none border-none"
          : `${sizeClass} p-10 md:p-14 mx-auto shadow-2xl border border-slate-300 rounded-sm`
      }`}
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* 1. KOP SURAT RESMI PEMERINTAH DESA CIMANGGU I */}
      <div className="flex items-center justify-between border-b-[3px] border-double border-black pb-3 mb-5 relative">
        <div className="w-20 h-24 shrink-0 flex items-center justify-center">
          <img
            src="/images/letters/logo_bogor.png"
            alt="Logo Kabupaten Bogor"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to local bogor image
              (e.target as HTMLImageElement).src = "/images/logo-bogor.png";
            }}
          />
        </div>
        <div className="text-center flex-1 px-4 leading-tight">
          <h4 className="text-[13pt] font-bold tracking-wider uppercase m-0">
            PEMERINTAH KABUPATEN BOGOR
          </h4>
          <h4 className="text-[13pt] font-bold tracking-wider uppercase m-0 mt-0.5">
            KECAMATAN CIBUNGBULANG
          </h4>
          <h3 className="text-[18pt] font-black tracking-widest uppercase m-0 mt-0.5">
            DESA CIMANGGU I
          </h3>
          <p className="text-[9pt] font-sans m-0 mt-1 italic tracking-normal">
            Jl. Raya Gardu Seri Kp. Ciaruteun RT.004 RW.008 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor - 16630
          </p>
        </div>
      </div>

      {/* 2. FORMAT KONTEN SESUAI DENGAN JENIS SURAT */}

      {/* FORMAT A: SURAT KETERANGAN USAHA (SKU) */}
      {data.letterType === "sku" && (
        <div className="space-y-4 text-justify">
          <div className="text-center my-4">
            <h2 className="text-[14pt] font-bold uppercase underline tracking-wider inline-block">
              SURAT KETERANGAN USAHA
            </h2>
            <p className="text-[11pt] font-bold mt-1">
              Nomor : {data.nomorSurat || "500.3/          - Pem"}
            </p>
          </div>

          <p className="indent-8">
            Yang bertanda dibawah ini Kepala Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, menerangkan bahwa :
          </p>

          <table className="w-full text-[11.5pt] ml-4 my-2 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5 font-normal">Nama lengkap</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaLengkap}</td>
              </tr>
              <tr>
                <td className="py-0.5">Jenis Kelamin</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.jenisKelamin}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tempat/Tanggal lahir</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.tempatLahir}, {data.tanggalLahir}</td>
              </tr>
              <tr>
                <td className="py-0.5">NIK</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono">{data.nik}</td>
              </tr>
              <tr>
                <td className="py-0.5">Agama</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.agama || "Islam"}</td>
              </tr>
              <tr>
                <td className="py-0.5">Kewarganegaraan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.kewarganegaraan || "Indonesia"}</td>
              </tr>
              <tr className="align-top">
                <td className="py-0.5">Alamat</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">
                  {data.alamat || "Kp. Ciaruteun RT.001 RW.003 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor."}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-[11.5pt] ml-4 my-2 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5">Berdasarkan Surat Pengantar</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5">Ketua RT.{data.rtPengantar || "001"} RW.{data.rwPengantar || "003"}</td>
              </tr>
              <tr>
                <td className="py-0.5">Nomor / Tanggal Surat</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.nomorPengantar || "        "}/{data.tanggalPengantar || data.tanggalSurat}</td>
              </tr>
            </tbody>
          </table>

          <p>
            Serta menurut pengakuan yang bersangkutan pada saat ini adalah benar memiliki :
          </p>

          <table className="w-full text-[11.5pt] ml-4 my-2 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5 font-bold">U s a h a</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaUsaha || "WARUNG SEMBAKO"}</td>
              </tr>
              <tr className="align-top">
                <td className="py-0.5">Yang berlokasi</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">
                  {data.lokasiUsaha || data.alamat}
                </td>
              </tr>
              <tr>
                <td className="py-0.5">Berlaku dari Tanggal</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.berlakuMulai || data.tanggalSurat}</td>
              </tr>
              <tr>
                <td className="py-0.5">Sampai dengan Tanggal</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.berlakuSampai || "1 Bulan sejak diterbitkan"}</td>
              </tr>
              <tr className="align-top">
                <td className="py-0.5">Keperluan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-medium">{data.keperluan || "Persyaratan Pengajuan ke Bank BRI"}</td>
              </tr>
            </tbody>
          </table>

          <p className="indent-8">
            Demikian Surat Keterangan Usaha ini kami buat untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>
      )}

      {/* FORMAT B: SURAT KETERANGAN KEMATIAN */}
      {data.letterType === "kematian" && (
        <div className="space-y-4 text-justify">
          <div className="text-center my-4">
            <h2 className="text-[14pt] font-bold uppercase underline tracking-wider inline-block">
              SURAT KETERANGAN KEMATIAN
            </h2>
            <p className="text-[11pt] font-bold mt-1">
              Nomor : {data.nomorSurat || "400.12.3.1/           - Pem"}
            </p>
          </div>

          <p className="indent-8">
            Yang bertanda tangan dibawah Kepala Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, menerangkan bahwa :
          </p>

          <table className="w-full text-[11.5pt] ml-4 my-2 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5">Nama Lengkap</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaLengkap}</td>
              </tr>
              <tr>
                <td className="py-0.5">Jenis Kelamin</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.jenisKelamin}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tempat/Tgl. Lahir</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">
                  {data.umurMeninggal ? `Bogor, ${data.umurMeninggal}` : `${data.tempatLahir}, ${data.tanggalLahir}`}
                </td>
              </tr>
              {data.nik && (
                <tr>
                  <td className="py-0.5">NIK</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono">{data.nik}</td>
                </tr>
              )}
              <tr>
                <td className="py-0.5">Agama/Warganegara</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.agama || "Islam"} / {data.kewarganegaraan || "Indonesia"}</td>
              </tr>
              <tr className="align-top">
                <td className="py-0.5">Alamat</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.alamat}</td>
              </tr>
              <tr>
                <td className="py-0.5">Berdasarkan Surat Pengantar</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">Ketua RT.{data.rtPengantar || "003"} RW.{data.rwPengantar || "004"}</td>
              </tr>
              <tr>
                <td className="py-0.5">Nomor / Tanggal Surat</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.nomorPengantar || "        "}/{data.tanggalPengantar || data.tanggalSurat}</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-3">Telah meninggal dunia pada :</p>

          <table className="w-full text-[11.5pt] ml-4 my-1 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5 font-bold">H a r i</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold">{data.hariMeninggal || "Jumat"}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tanggal</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.tanggalMeninggal}</td>
              </tr>
              {data.jamMeninggal && (
                <tr>
                  <td className="py-0.5">Jam</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.jamMeninggal}</td>
                </tr>
              )}
              <tr className="align-top">
                <td className="py-0.5">Di</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.tempatMeninggal || data.alamat}</td>
              </tr>
              <tr>
                <td className="py-0.5">Disebabkan karena</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.sebabMeninggal || "Sakit"}</td>
              </tr>
              {data.keperluan && (
                <tr>
                  <td className="py-0.5">Keperluan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.keperluan}</td>
                </tr>
              )}
            </tbody>
          </table>

          <p className="indent-8 mt-4">
            Demikian Surat Keterangan ini dibuat atas dasar yang sebenarnya.
          </p>
        </div>
      )}

      {/* FORMAT C: SURAT KETERANGAN KELUARGA MISKIN (PENDIDIKAN) */}
      {data.letterType === "skkm_pendidikan" && (
        <div className="space-y-4 text-justify">
          <div className="text-center my-4">
            <h2 className="text-[14pt] font-bold uppercase underline tracking-wider inline-block">
              SURAT KETERANGAN KELUARGA MISKIN
            </h2>
            <p className="text-[11pt] font-bold mt-1">
              Nomor : {data.nomorSurat || "400.3.8.8/            - Kesra"}
            </p>
          </div>

          <p className="indent-8">
            Yang bertanda tangan dibawah ini Kepala Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, menerangkan bahwa :
          </p>

          <table className="w-full text-[11.5pt] ml-4 my-2 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5">Nama Lengkap</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaLengkap}</td>
              </tr>
              <tr>
                <td className="py-0.5">Jenis Kelamin</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.jenisKelamin}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tempat/Tanggal Lahir</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.tempatLahir}, {data.tanggalLahir}</td>
              </tr>
              <tr>
                <td className="py-0.5">NIK</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono">{data.nik}</td>
              </tr>
              <tr>
                <td className="py-0.5">Kewarganegaraan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.kewarganegaraan || "Indonesia"}</td>
              </tr>
              <tr>
                <td className="py-0.5">Agama</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.agama || "Islam"}</td>
              </tr>
              <tr className="align-top">
                <td className="py-0.5">Alamat</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.alamat}</td>
              </tr>
            </tbody>
          </table>

          <p className="font-bold underline ml-4">Nama Orang Tua</p>
          <table className="w-full text-[11.5pt] ml-8 my-1 border-collapse">
            <tbody>
              <tr>
                <td className="w-44 py-0.5">Ayah</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaAyah}</td>
              </tr>
              <tr>
                <td className="py-0.5">Ibu</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaIbu}</td>
              </tr>
              <tr>
                <td className="py-0.5">NIK KK</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono">{data.noKK}</td>
              </tr>
            </tbody>
          </table>

          <p className="ml-4">
            Berdasarkan Surat Pengantar dari Ketua RT.{data.rtPengantar || "001"} RW.{data.rwPengantar || "006"}
          </p>
          <table className="w-full text-[11.5pt] ml-8 my-1 border-collapse">
            <tbody>
              <tr>
                <td className="w-44 py-0.5">Nomor / Tanggal</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5">{data.nomorPengantar || "       "}/{data.tanggalPengantar || data.tanggalSurat}</td>
              </tr>
            </tbody>
          </table>

          <p>
            Bahwa Nama Tersebut Diatas Dari Keluarga Tidak Mampu/Pra Sejahtera. Hingga Dibuatkannya Surat Keterangan Ini Untuk Keperluan Administrasi Pendidikan Di :
          </p>

          <div className="text-center font-bold text-[12pt] py-2 tracking-wide uppercase border-t border-b border-dashed border-black">
            --------------------------- {data.pendidikanDi || "NAMA SEKOLAH / UNIVERSITAS"} -----------------------
          </div>

          <p className="indent-8 mt-4">
            Demikian Surat Keterangan Keluarga Miskin ini kami buat agar yang berkepentingan menjadi tahu dan maklum adanya.
          </p>
        </div>
      )}

      {/* FORMAT D: SURAT KETERANGAN KELUARGA MISKIN (BPJS PBI APBD/APBN) */}
      {data.letterType === "skkm_bpjs" && (
        <div className="space-y-3 text-justify text-[11pt]">
          <div className="text-center my-3">
            <h2 className="text-[13pt] font-bold uppercase underline tracking-wider inline-block">
              SURAT KETERANGAN KELUARGA MISKIN
            </h2>
            <p className="text-[10.5pt] font-bold mt-0.5">
              Nomor: {data.nomorSurat || "400.7.3.1/         - Kesra"}
            </p>
          </div>

          <p>Yang Bertanda tangan dibawah ini</p>
          <table className="w-full ml-4 border-collapse">
            <tbody>
              <tr>
                <td className="w-36 py-0.5 font-semibold">Nama</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{namaPejabat}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">Jabatan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{isSekdes ? "Sekretaris Desa" : "Kepala Desa"}</td>
              </tr>
            </tbody>
          </table>

          <p className="font-semibold mt-2">Berdasarkan :</p>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Surat Pengantar dari ketua RT.{data.rtPengantar || "001"} RW.{data.rwPengantar || "006"} {data.kampungPengantar || "Kp. Jatake"} Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, tanggal {data.tanggalPengantar || data.tanggalSurat} Perihal BPJS PBI APBD/APBN.
            </li>
            <li>
              Kartu Tanda Penduduk Elektronik (KTP-el) Nomor NIK : <span className="font-mono font-bold">{data.nik}</span> yang diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil Kabupaten Bogor, tanggal {data.tglPenerbitanKTP || "-"}, atas Nama <span className="font-bold uppercase">{data.namaLengkap}</span>.
            </li>
            <li>
              Kartu Keluarga (KK) Nomor : <span className="font-mono font-bold">{data.noKK}</span> yang diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil Kabupaten Bogor, tanggal {data.tglPenerbitanKK || "-"}, atas nama <span className="font-bold uppercase">{data.namaKepalaKeluarga || data.namaLengkap}</span>.
            </li>
          </ol>

          <p className="font-semibold mt-2">Berdasarkan hal tersebut diatas, bersama ini disampaikan</p>
          <table className="w-full ml-4 border-collapse">
            <tbody>
              <tr>
                <td className="w-48 py-0.5">Nomor KK</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-mono">{data.noKK}</td>
              </tr>
              <tr>
                <td className="py-0.5">NIK</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono">{data.nik}</td>
              </tr>
              <tr>
                <td className="py-0.5">Nama Lengkap</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{data.namaLengkap}</td>
              </tr>
              <tr>
                <td className="py-0.5">Jenis Kelamin</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.jenisKelamin}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tempat/Tanggal Lahir</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.tempatLahir}, {data.tanggalLahir}</td>
              </tr>
              <tr>
                <td className="py-0.5">Agama / Kewarganegaraan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.agama || "Islam"}/{data.kewarganegaraan || "Indonesia"}</td>
              </tr>
              <tr>
                <td className="py-0.5">Status Perkawinan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.statusPerkawinan || "Belum Kawin"}</td>
              </tr>
              <tr className="align-top">
                <td className="py-0.5">Alamat</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{data.alamat}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-bold">Terdaftar dalam DTKS</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase text-red-700">{data.terdaftarDTKS || "TIDAK"}</td>
              </tr>
            </tbody>
          </table>

          <p className="indent-8 mt-2">
            Merupakan warga miskin atau orang tidak mampu Kabupaten Bogor yang memenuhi persyaratan sebagai penerima bantuan sebagai calon Peserta Pekerja Bukan Penerima Upah dan Bukan Pekerja yang didaftarkan oleh Pemerintah.
          </p>

          <p className="indent-8">
            Demikian disampaikan, atas perhatian dan kerja samanya diucapkan terima kasih.
          </p>
        </div>
      )}

      {/* FORMAT E: SURAT KETERANGAN KELAHIRAN */}
      {data.letterType === "kelahiran" && (
        <div className="space-y-3 text-justify text-[11pt]">
          <div className="text-center my-3">
            <h2 className="text-[13pt] font-bold uppercase underline tracking-wider inline-block">
              SURAT KETERANGAN KELAHIRAN
            </h2>
            <p className="text-[10.5pt] font-bold mt-0.5">
              Nomor : {data.nomorSurat || "400.12.3.1/             - Pem"}
            </p>
          </div>

          <p className="indent-8">
            Yang bertanda tangan di bawah ini Kepala Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, menerangkan bahwa telah lahir seorang anak {data.jenisKelamin || "Laki-Laki"} yang bernama :
          </p>

          <div className="text-center font-bold text-[12pt] py-1 tracking-wider uppercase border-t border-b border-dashed border-black">
            ---------------------------- {data.namaAnak || "NAMA ANAK"} --------------------------------
          </div>

          <p className="ml-4 font-semibold">
            Anak ke {data.anakKe || "1"} ({data.anakKeTerbilang || "Satu"}) dari pasangan :
          </p>

          {/* DATA AYAH */}
          <div className="ml-4">
            <p className="font-bold tracking-widest text-center border-b border-slate-300 w-32 mb-1">A Y A H</p>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5">Nama lengkap</td>
                  <td className="w-4 py-0.5">:</td>
                  <td className="py-0.5 font-bold uppercase">{data.ayahNama}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tempat Tanggal Lahir</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ayahTTL}</td>
                </tr>
                <tr>
                  <td className="py-0.5">NIK</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono">{data.ayahNIK}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Agama/Warganegara</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ayahAgama || "Islam/Indonesia"}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Pekerjaan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ayahPekerjaan || "Wiraswasta"}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Alamat</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ayahAlamat || data.alamat}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DATA IBU */}
          <div className="ml-4 mt-2">
            <p className="font-bold tracking-widest text-center border-b border-slate-300 w-32 mb-1">I B U</p>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5">Nama lengkap</td>
                  <td className="w-4 py-0.5">:</td>
                  <td className="py-0.5 font-bold uppercase">{data.ibuNama}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tempat Tanggal Lahir</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ibuTTL}</td>
                </tr>
                <tr>
                  <td className="py-0.5">NIK</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-mono">{data.ibuNIK}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Agama/Warganegara</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ibuAgama || "Islam/Indonesia"}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Pekerjaan</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ibuPekerjaan || "Mengurus Rumah Tangga"}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-0.5">Alamat</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{data.ibuAlamat || data.alamat}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-2">
            Nama tersebut benar dilahirkan di : --------------------------- {data.tempatLahirAnak || "KABUPATEN BOGOR"} ----------------------------
          </p>
          <p>
            Pada hari : <span className="font-bold">{data.hariLahir || "Senin"}</span> &nbsp;&nbsp;&nbsp;&nbsp; Tanggal : <span className="font-bold">{data.tanggalLahirAnak || data.tanggalLahir}</span> &nbsp;&nbsp;&nbsp;&nbsp; Pukul : <span className="font-bold">{data.jamLahirAnak || "08:00"}</span> WIB
          </p>
          <p>
            Dan nama tersebut diatas adalah ------------------------------------------ WNI ASLI --------------------------------------------
          </p>

          <p className="indent-8 mt-3">
            Demikian Surat Keterangan ini kami buat dengan sesungguhnya dan penuh tanggung jawab atas kebenarannya.
          </p>
        </div>
      )}

      {/* 3. BAGIAN TANDA TANGAN & STEMPEL CAP RESMI DESA */}
      <div className="flex justify-end mt-8 break-inside-avoid">
        <div className="text-center w-72 space-y-0.5 relative">
          <p className="text-[11pt]">Cimanggu I, {data.tanggalSurat}</p>
          <p className="font-bold text-[11pt]">Kepala</p>
          {isSekdes && <p className="font-bold text-[10pt]">an. Sekretaris</p>}

          {/* Area Tanda Tangan & Stempel / Materai */}
          <div className="h-28 relative flex items-center justify-center my-1">
            {/* Materai jika ada (khusus SKKM Pendidikan) */}
            {data.showMaterai && (
              <div className="absolute left-2 top-2 z-10 w-24">
                <img
                  src="/images/letters/materai_10000.png"
                  alt="Materai 10000"
                  className="w-full object-contain opacity-90 drop-shadow-sm rotate-[-4deg]"
                />
              </div>
            )}

            {/* Stempel & TTD Asli Desa Cimanggu I */}
            {data.showStamp !== false && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <img
                  src={
                    isSekdes
                      ? "/images/letters/stempel_ttd_sekdes.png"
                      : "/images/letters/stempel_ttd_kades.png"
                  }
                  alt="Tanda Tangan & Stempel Resmi"
                  className="h-28 object-contain"
                />
              </div>
            )}
          </div>

          <p className="font-bold text-[12pt] underline uppercase tracking-wider text-black">
            {namaPejabat}
          </p>
        </div>
      </div>
    </div>
  );
}
