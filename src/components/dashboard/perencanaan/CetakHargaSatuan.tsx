"use client";

import React, { useEffect } from "react";
import { Printer, ArrowLeft } from "lucide-react";

interface CetakHargaSatuanProps {
  data: any;
  onBack: () => void;
}

export function CetakHargaSatuan({ data, onBack }: CetakHargaSatuanProps) {
  useEffect(() => {
    document.title = "DAFTAR HARGA SATUAN DESA";
    return () => {
      document.title = "Aplikasi Desa";
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-200 min-h-screen py-8">
      {/* Tombol Aksi (Sembunyi saat print) */}
      <div className="max-w-[215.9mm] mx-auto mb-4 flex justify-between print:hidden px-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 rounded-lg shadow-sm font-bold text-white hover:bg-emerald-700 transition-colors"
        >
          <Printer size={16} /> Cetak Dokumen
        </button>
      </div>

      {/* Lembar F4 (Portrait) */}
      <div className="bg-white mx-auto shadow-xl print:shadow-none print:m-0" 
           style={{
             width: '215.9mm',
             minHeight: '330.2mm',
             padding: '20mm',
             fontFamily: '"Times New Roman", Times, serif',
             boxSizing: 'border-box'
           }}>
        
        {/* Header Dokumen (Opsional) */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-bold underline mb-1">DAFTAR STANDAR HARGA SATUAN (SSH)</h2>
          <p className="text-xs font-bold">PEMERINTAH DESA CIMANGGU I</p>
          <p className="text-xs font-bold">TAHUN ANGGARAN 2026</p>
        </div>

        {/* Tabel */}
        <table className="w-full border-collapse border border-black text-[12px] leading-tight">
          <thead>
            <tr>
              <th className="border border-black p-2 font-bold w-10 text-center">NO</th>
              <th className="border border-black p-2 font-bold text-center">URAIAN</th>
              <th className="border border-black p-2 font-bold w-24 text-center">SATUAN</th>
              <th className="border border-black p-2 font-bold w-32 text-center">HARGA</th>
              <th className="border border-black p-2 font-bold w-24 text-center">KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map((kategori, katIdx) => (
              <React.Fragment key={kategori}>
                {/* Baris Kategori */}
                <tr>
                  <td className="border border-black p-2 text-center align-top font-bold text-sm">
                    {katIdx + 1}
                  </td>
                  <td className="border border-black p-2 font-bold text-sm" colSpan={4}>
                    {kategori.toUpperCase()}
                  </td>
                </tr>
                {/* Baris Item */}
                {data[kategori].map((item: any, idx: number) => (
                  <tr key={item.id}>
                    <td className="border border-black p-2 align-top text-center"></td>
                    <td className="border border-black p-2 align-top">
                      <div className="flex">
                        <span className="w-6 shrink-0">{idx + 1}.</span>
                        <span>{item.uraian}</span>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top text-center">
                      {item.satuan}
                    </td>
                    <td className="border border-black p-2 align-top text-right">
                      {item.harga.toLocaleString('id-ID')},-
                    </td>
                    <td className="border border-black p-2 align-top">
                      {item.keterangan}
                    </td>
                  </tr>
                ))}
                {/* Baris Kosong Pemisah antar Kategori (seperti di gambar) */}
                <tr>
                  <td className="border border-black p-3 align-top"></td>
                  <td className="border border-black p-3 align-top"></td>
                  <td className="border border-black p-3 align-top"></td>
                  <td className="border border-black p-3 align-top"></td>
                  <td className="border border-black p-3 align-top"></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Tanda Tangan */}
        <div className="mt-12 flex justify-end pr-8">
          <div className="text-center w-64 text-[12px]">
            <p className="mb-1">Cimanggu I, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mb-20 font-bold">Kepala Desa Cimanggu I</p>
            <p className="font-bold underline">H. M A K A H</p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: 215.9mm 330.2mm; /* F4 size */
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
