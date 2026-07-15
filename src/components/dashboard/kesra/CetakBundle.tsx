"use client";

import { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { CetakUsulanUhc } from "./CetakUsulanUhc";
import { CetakSkkm } from "./CetakSkkm";
import { CetakSptjm } from "./CetakSptjm";

export function CetakBundle({ data, sptjmData, onBack }: { data: any, sptjmData: any, onBack: () => void }) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bundle-container bg-slate-100 min-h-screen py-8 text-slate-800 relative z-50">
      <style dangerouslySetInnerHTML={{
        __html: `
        .bundle-container .no-print {
           display: none !important;
        }
        
        .bundle-toolbar {
           display: flex !important;
        }

        .bundle-container > .flex > div > div {
           min-height: 0 !important;
           padding-top: 0 !important;
           padding-bottom: 0 !important;
           background: transparent !important;
        }

        @media print {
          .bundle-toolbar {
             display: none !important;
          }
          
          /* Isolate bundle from scrollable ancestors to fix 1-page truncation bug */
          body * {
            visibility: hidden;
          }
          .bundle-container, .bundle-container * {
            visibility: visible;
          }
          .bundle-container {
             position: absolute !important;
             left: 0 !important;
             top: 0 !important;
             width: 100% !important;
             background: transparent !important;
             margin: 0 !important;
             padding: 0 !important;
          }

          .bundle-content {
             display: block !important;
          }

          #print-area, #print-area-uhc {
             position: relative !important;
             page-break-after: always;
             box-shadow: none !important;
             margin-left: auto !important;
             margin-right: auto !important;
             top: 0 !important;
             left: 0 !important;
          }
          
          .bundle-content > :last-child #print-area,
          .bundle-content > :last-child #print-area-uhc {
             page-break-after: auto;
          }
          
          @page {
            size: 215.9mm 330.2mm portrait;
            margin: 15mm;
          }
        }
        `
      }} />
      
      <div className="max-w-[215.9mm] mx-auto mb-6 flex justify-between items-center bundle-toolbar">
        <button onClick={onBack} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-xl shadow-sm text-white hover:bg-blue-700 transition-all font-medium">
          <Download className="w-4 h-4" />
          Simpan PDF (Semua)
        </button>
      </div>

      <div className="flex flex-col gap-12 print:gap-0 bundle-content">
        <div>
          <CetakUsulanUhc data={data} isBundle={true} />
        </div>
        <div>
          <CetakSkkm data={data} isBundle={true} />
        </div>
        {sptjmData && (
          <div>
            <CetakSptjm data={sptjmData} isBundle={true} />
          </div>
        )}
      </div>
    </div>
  );
}
