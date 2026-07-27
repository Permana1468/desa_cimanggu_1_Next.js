

import { ArrowLeft, Printer } from "lucide-react";

export function ServerCetakSptjm({ data, onBack, isBundle }: { data: any; onBack?: () => void; isBundle?: boolean }) {

  const formatAlamat = (alamat: string) => {
    if (!alamat) return "-";
    let formatted = alamat.toUpperCase();
    formatted = formatted.replace(/KP\.?\s*/i, "Kp. ");
    formatted = formatted.replace(/CIMANGGU/i, "Cimanggu");
    formatted = formatted.replace(/CIARUTEUN/i, "Ciaruteun");
    return formatted;
  };

  // Custom format date "06 April 2026"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const toRoman = (num: number) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return roman[num - 1] || "";
  };

  const currentDate = new Date();
  const romanMonth = toRoman(currentDate.getMonth() + 1);
  const currentYear = currentDate.getFullYear();

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
            padding: 0 !important;
            margin: 0 !important;
            background: white;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: 215.9mm 330.2mm; /* F4 Size */
            margin: 15mm;
          }
        }
        .font-arial-narrow {
          font-family: 'Arial Narrow', Arial, sans-serif;
        }
        .font-times {
          font-family: 'Times New Roman', Times, serif;
        }
      `}} />

      {/* Control Actions (No Print) */}
      <div className="max-w-[215.9mm] mx-auto mb-6 flex justify-between items-center no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-all font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-xl shadow-sm text-white hover:bg-blue-700 transition-all font-medium"
        >
          <Printer className="w-4 h-4" />
          Cetak SPTJM
        </button>
      </div>

      {/* Print Document */}
      <div
        id="print-area"
        className="mx-auto bg-white shadow-xl overflow-hidden text-black font-arial-narrow"
        style={{ maxWidth: "215.9mm", padding: "10mm 15mm" }}
      >
        <div className="px-2 py-4">

          {/* Header */}
          <div className="flex items-start border-b-[3px] border-double border-black pb-4 mb-8">
            <div className="w-[100px] shrink-0">
              <img src="/images/logo-bogor.png" alt="Logo" className="w-[85px] h-auto" />
            </div>
            <div className="flex-1 text-center pr-[50px]">
              <h1 className="text-[22px] font-bold tracking-wider leading-tight font-times">PEMERINTAHAN KABUPATEN BOGOR</h1>
              <h2 className="text-[20px] font-bold tracking-wider leading-tight font-times">KECAMATAN CIBUNGULANG</h2>
              <h3 className="text-[22px] font-bold tracking-wider leading-tight mb-1 font-times">DESA CIMANGGU I</h3>
              <p className="text-[9.5px] font-arial-narrow">Jl. Raya Gardu Seri Kp. Ciaruteun Rt.004 Rw.008 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor - 16630</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h4 className="text-[16px] font-bold underline mb">SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK</h4>
            <p className="text-[16px]">
              Nomor: 400.7.1/2007/
              <span className="inline min-w-[40px] text-center mx-1">
                {data.noRegister || ""}
              </span>
              /{romanMonth}/{currentYear}
            </p>
          </div>

          {/* Intro */}
          <div className="mb-6 text-[14px]">
            <p className="mb-4">Yang Bertanda tangan dibawah ini</p>

            <table className="w-full ml-8 mb-6">
              <tbody>
                <tr>
                  <td className="w-[100px] py-1">Nama</td>
                  <td className="w-[10px] py-1">:</td>
                  <td className="py-1">FAJAR TRI APRIANA</td>
                </tr>
                <tr>
                  <td className="py-1">Jabatan</td>
                  <td className="py-1">:</td>
                  <td className="py-1">Sekretaris Desa Cimanggu I</td>
                </tr>
              </tbody>
            </table>

            <p className="mb-4">Bersama ini <span className="text-700 decoration-700">disampaikan :</span></p>

            <table className="w-full ml-8 mb-6">
              <tbody>
                <tr>
                  <td className="w-[100px] align-top py-1">Nomor KK</td>
                  <td className="w-[10px] align-top py-1">:</td>
                  <td className="align-top py-1">{data.nomorKk || "-"}</td>
                </tr>
                <tr>
                  <td className="align-top py-1">Alamat</td>
                  <td className="align-top py-1">:</td>
                  <td className="align-top py-1">
                    {formatAlamat(data.alamat)} Desa Cimanggu I<br />
                    Kecamatan Cibungbulang Kabupaten Bogor
                  </td>
                </tr>

                {data.members && data.members.map((member: any, idx: number) => (
                  <tr key={idx}>
                    <td colSpan={3} className="py-2">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="w-[100px] py-0.5">NIK</td>
                            <td className="w-[10px] py-0.5">:</td>
                            <td className="py-0.5">{member.nik}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5">NAMA</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5">{member.nama?.toUpperCase()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Content Body */}
          <div className="mb-12 text-justify text-[14px]">
            <p>
              Merupakan Warga Miskin atau Orang Tidak mampu Kabupaten Bogor, yang memenuhi Persyaratan untuk Pemberian Bantuan Pembiayaan Pelayanan Kesehatan dan sedang dalam proses pengusulan ke Data Terpadu Kesejahteraan Sosial (<span className="font-bold text-blue-700">DTKS</span>).
            </p>
          </div>

          {/* Signature */}
          <div className="flex justify-end mb-16 text-[14px]">
            <div className="text-center w-[250px]">
              <p>Cimanggu I, {formatDate(currentDate)}</p>
              <p>A/n Kepala Desa</p>
              <br /><br /><br /><br />
              <p className="font-bold">FAJAR TRI APRIANA</p>
            </div>
          </div>

          {/* Footer / Tembusan */}
          <div className="text-[12px]">
            <p className="font-bold text-700 decoration-blue-700">Tembusan :</p>
            <p>Yth. Camat Cibungbulang</p>
          </div>

        </div>
      </div>
    </div>
  );
}
