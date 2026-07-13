"use client";

import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

export function CetakSkkm({ data, onBack }: { data: any; onBack: () => void }) {
  useEffect(() => {
    // Optionally trigger print on load
    // window.print();
  }, []);

  // Use the recorded dates or fallback to current date
  const tglPengantar = data.skkmTanggalPengantar ? new Date(data.skkmTanggalPengantar) : new Date();
  const tglKk = data.skkmTanggalKk ? new Date(data.skkmTanggalKk) : new Date();
  
  // Custom format date "02 Juni 2026"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Custom format DD-MM-YYYY
  const formatShortDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

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
            size: A4 portrait;
            margin: 20mm;
          }
        }
      `}} />

      {/* Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={18} /> Kembali
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
          <Printer size={18} /> Cetak SKKM (A4)
        </button>
      </div>

      {/* Print Area - A4 Layout */}
      <div id="print-area" className="text-black text-[13px] leading-[1.5]" style={{ fontFamily: "Arial, sans-serif" }}>

        <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] print:min-h-0 p-[15mm] print:p-0 mb-8 print:mb-0 print:shadow-none relative">
          
          {/* Header/Kop Surat */}
          <div className="flex items-center justify-between border-b-[3px] border-black pb-2 mb-6">
            <div className="w-[100px] flex items-center justify-center">
              <img src="/images/logo-bogor.png" alt="Logo Bogor" className="w-[90px] h-auto object-contain" />
            </div>
            <div className="flex-1 text-center pr-[20px]">
              <h1 className="text-[20px] font-bold tracking-wider leading-tight">PEMERINTAHAN KABUPATEN BOGOR</h1>
              <h2 className="text-[20px] font-bold tracking-wider leading-tight">KECAMATAN CIBUNGBULANG</h2>
              <h3 className="text-[22px] font-bold tracking-wider leading-tight mb-1">DESA CIMANGGU I</h3>
              <p className="text-[11px]">Raya Gardu Seri Kp. Ciaruteun Rt.004 Rw.008 Desa Cimanggu I Kecamatan Cibungbulang 16630 - Bogor</p>
            </div>
          </div>

          {/* Judul Surat */}
          <div className="text-center mb-6">
            <h4 className="text-[16px] font-bold underline">SURAT KETERANGAN KELUARGA MISKIN</h4>
            <p className="text-[13px] mt-1">Nomor: 400.7.1/ {data.skkmNoRegister ? data.skkmNoRegister : "       "} -Kesra</p>
          </div>

          <div className="mb-4">
            <p>Yang Bertanda tangan dibawah ini :</p>
          </div>

          <div className="ml-10 mb-6">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-[150px] align-top py-0.5">Nama</td>
                  <td className="w-[20px] align-top py-0.5">:</td>
                  <td className="align-top font-bold py-0.5">{data.skkmNamaPenandatangan || "FAJAR TRI APRIANA"}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Jabatan</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">Sekretaris Desa Cimanggu I</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-2 font-bold underline text-blue-800">Berdasarkan :</div>
          <div className="mb-6 pl-2 text-justify">
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Surat Pengantar dari ketua {data.skkmRtRwPengantar || "RT.001 RW.008 Kp.Ciaruteun"} Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, tanggal {formatDate(tglPengantar)}, Perihal BPJS PBI APBD.
              </li>
              <li>
                Kartu Tanda Penduduk Elektronik (KTP-el) Nomor <span className="underline text-blue-800 font-bold">{data.nik}</span>, yang diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil Kabupaten Bogor, atas Nama <span className="font-bold">{data.namaPasien?.toUpperCase()}</span>
              </li>
              <li>
                Kartu Keluarga (KK) <span className="underline text-blue-800 font-bold">Nomor:</span> {data.nomorKk} yang diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil Kabupaten Bogor, Tgl. {formatShortDate(tglKk)}, atas nama {data.skkmNamaKepalaKeluarga?.toUpperCase() || ""}
              </li>
            </ol>
          </div>

          <div className="mb-4">
            <p>Berdasarkan hal tersebut diatas, bersama ini disampaikan</p>
          </div>

          <div className="ml-10 mb-6">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-[200px] align-top py-0.5">Nomor KK</td>
                  <td className="w-[20px] align-top py-0.5">:</td>
                  <td className="align-top py-0.5">{data.nomorKk}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">NIK</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">{data.nik}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Nama Lengkap</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5 font-bold uppercase">{data.namaPasien}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Jenis Kelamin</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">{data.skkmJenisKelamin || ""}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Tempat/Tanggal Lahir</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">{data.skkmTempatTanggalLahir || ""}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Agama / Kewarganegaraan</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">{data.skkmAgamaKewarganegaraan || ""}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Status Perkawinan</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">{data.skkmStatusPerkawinan || ""}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Alamat</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">
                    {data.skkmAlamatJalan || ""}<br/>
                    Kecamatan Cibungbulang Kabupaten Bogor
                  </td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Terdaftar dalam DTKS</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top py-0.5">
                    {data.skkmTerdaftarDtks === "YA" ? "YA / " : <span className="line-through">YA</span>}
                    {data.skkmTerdaftarDtks === "TIDAK" ? "TIDAK" : <span className="line-through"> / TIDAK</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6 text-justify">
            <p>
              Merupakan warga miskin atau orang tidak mampu Kabupaten Bogor yang memenuhi persyaratan sebagai penerima bantuan sebagai calon Peserta Pekerja Bukan Penerima Upah dan Bukan Pekerja yang didaftarkan oleh Pemerintah.
            </p>
            <p className="mt-2">
              Demikian disampaikan, atas perhatian dan kerja samanya diucapkan terima kasih.
            </p>
          </div>

          {/* Signature */}
          <div className="mt-8 flex justify-end">
            <div className="text-center w-[250px]">
              <p className="mb-1">Cimanggu I, {formatDate(new Date())}</p>
              <p className="mb-[80px]">A/n Sekretaris</p>
              <p className="font-bold uppercase underline">{data.skkmNamaPenandatangan || "FAJAR TRI APRIANA"}</p>
            </div>
          </div>

          <div className="mt-8 pt-8">
            <p className="font-bold underline text-blue-800 text-[11px] mb-1">Tembusan :</p>
            <ol className="list-decimal pl-6 text-[11px]">
              <li>Yth. Camat Cibungbulang</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
