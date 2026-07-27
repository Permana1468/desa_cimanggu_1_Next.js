"use client";

import React from "react";

interface SKKMLetterData {
    no_register?: string;
    nama?: string;
    nik?: string;
    jenis_kelamin?: string;
    tempat_lahir?: string;
    tgl_lahir?: string;
    kewarganegaraan?: string;
    agama?: string;
    alamat?: string;
    nama_ayah?: string;
    nama_ibu?: string;
    no_kk?: string;
    rt_rw_pengantar?: string;
    no_tgl_pengantar?: string;
    pendidikan_di?: string;
    tanggal_surat?: string;
    nama_penandatangan?: string;
}

function toTitleCase(str?: string) {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).replace(/Laki-Laki/i, "Laki-Laki");
}

function formatTanggalLahir(tglStr?: string) {
    if (!tglStr) return "";
    if (tglStr.includes("-")) {
        const parts = tglStr.split("-");
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    return tglStr;
}

export default function SKKMLetterPreview({ data }: { data: SKKMLetterData }) {
    const todayStr = data.tanggal_surat || new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    // Formatting Alamat with fixed suffix
    let displayAlamat = data.alamat || "";
    if (displayAlamat && !displayAlamat.toLowerCase().includes("desa cimanggu")) {
        displayAlamat += " Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor";
    }

    const tglLahirFormatted = formatTanggalLahir(data.tgl_lahir);
    const tempatTglLahir = data.tempat_lahir
        ? `${data.tempat_lahir}, ${tglLahirFormatted}`
        : tglLahirFormatted;

    const formattedPendidikan = data.pendidikan_di
        ? data.pendidikan_di.toUpperCase()
        : "....................................................................";

    return (
        <div
            style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
            className="bg-white p-8 sm:p-12 border border-slate-300 rounded-xl shadow-lg max-w-[210mm] mx-auto text-slate-900 leading-relaxed text-sm print:p-0 print:border-none print:shadow-none"
        >
            {/* KOP SURAT */}
            <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-6 relative">
                <div className="w-20 h-24 flex items-center justify-center shrink-0">
                    <img
                        src="/images/logo-bogor.png"
                        alt="Logo Kabupaten Bogor"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                        }}
                    />
                </div>
                <div className="text-center flex-1 px-4">
                    <h4 className="text-base font-bold tracking-wider uppercase m-0 leading-tight">PEMERINTAH KABUPATEN BOGOR</h4>
                    <h4 className="text-base font-bold tracking-wider uppercase m-0 leading-tight">KECAMATAN CIBUNGBULANG</h4>
                    <h3 className="text-2xl font-black tracking-widest uppercase m-0 leading-tight">DESA CIMANGGU I</h3>
                    <p className="text-xs font-sans mt-1 m-0">Jl. Raya Gardu Seri Kp. Ciaruteun RT.004 RW.008 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor - 16630 </p>
                </div>
            </div>

            {/* JUDUL SURAT */}
            <div className="text-center mb-6">
                <u className="text-lg font-bold tracking-wide uppercase block">SURAT KETERANGAN KELUARGA MISKIN</u>
                <span className="text-sm font-bold tracking-wide block mt-1">
                    Nomor : 400.3.8.8/ {data.no_register || "........."} - Kesra
                </span>
            </div>

            {/* PEMBUKA */}
            <p className="text-justify indent-8 mb-4">
                Yang bertanda tangan dibawah ini Kepala Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor, menerangkan bahwa :
            </p>

            {/* ISIAN BIODATA WARGA */}
            <div className="ml-6 sm:ml-12 mb-4 space-y-1">
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">Nama Lengkap</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7 font-bold text-slate-900 uppercase">{data.nama || "..........................................................."}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">Jenis Kelamin</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7">{toTitleCase(data.jenis_kelamin) || "Laki-Laki"}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">Tempat/Tanggal Lahir</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7">{tempatTglLahir || "..........................................................."}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">NIK</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7 font-mono">{data.nik || "..........................................................."}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">Kewarganegaraan</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7">{data.kewarganegaraan || "Indonesia"}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">Agama</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7">{toTitleCase(data.agama) || "Islam"}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 font-semibold">Alamat</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7">{displayAlamat || "Kp. Ciaruteun RT.002 RW.002 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor"}</span>
                </div>
            </div>

            {/* DATA ORANG TUA */}
            <div className="ml-5 sm:ml-12 mb-6 space-y-1">
                <p className="font-bold underline mb-1">Nama Orang Tua</p>
                <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-4 font-semibold">Ayah</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7 font-bold uppercase">{data.nama_ayah || "..........................................................."}</span>
                </div>
                <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-4 font-semibold">Ibu</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7 font-bold uppercase">{data.nama_ibu || "..........................................................."}</span>
                </div>
                <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-4 font-semibold">NO. KK</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7 font-mono">{data.no_kk || "..........................................................."}</span>
                </div>
            </div>

            {/* PENGANTAR RT/RW */}
            <div className="mb-6 space-y-1">
                <p className="leading-relaxed">
                    Berdasarkan Surat Pengantar dari Ketua {data.rt_rw_pengantar ? `RT.${data.rt_rw_pengantar}` : "RT.002 RW.002"}
                </p>
                <div className="grid grid-cols-12 gap-1 pl-4">
                    <span className="col-span-4 font-semibold">Nomor / Tanggal</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-7 font-mono">{data.no_tgl_pengantar || "       /05/06/2026"}</span>
                </div>
            </div>

            {/* BAHWA NAMA TERSEBUT... */}
            <div className="mb-6 space-y-2 text-justify">
                <p>
                    Bahwa Nama Tersebut Diatas Dari Keluarga Tidak Mampu/Pra Sejahtera. Hingga Dibuatkannya Surat Keterangan Ini Untuk Keperluan Administrasi Pendidikan Di :
                </p>
                <div className="text-center font-bold font-sans text-base py-2 border-b border-t border-dashed border-slate-400 tracking-wider">
                    ----------------------- <span className="font-extrabold uppercase text-slate-900 px-2 tracking-wider">{formattedPendidikan}</span> -----------------------
                </div>
            </div>

            {/* PENUTUP */}
            <p className="text-justify indent-8 mb-12">
                Demikian Surat Keterangan Keluarga Miskin ini kami buat agar yang berkepentingan menjadi tahu dan maklum adanya.
            </p>

            {/* TANDA TANGAN */}
            <div className="flex justify-end">
                <div className="text-center w-64 space-y-1">
                    <p>Cimanggu I, {todayStr}</p>
                    <p className="font-bold">Kepala</p>
                    <p className="font-bold text-xs">an. Sekretaris</p>

                    <div className="py-6 my-2 relative flex items-center justify-center">
                        <div className="border border-red-400 text-red-500 text-[10px] italic px-3 py-1 rounded rotate-[-5deg] opacity-70">
                            Materai 10.000
                        </div>
                    </div>

                    <p className="font-black text-base underline tracking-wide uppercase text-slate-900">
                        FAJAR TRI APRIANA
                    </p>
                </div>
            </div>
        </div>
    );
}
