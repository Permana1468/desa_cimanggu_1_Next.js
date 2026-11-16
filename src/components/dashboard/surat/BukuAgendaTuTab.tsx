/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Send, 
  Inbox, 
  FileText, 
  X, 
  Loader2,
  Tag,
  Users
} from "lucide-react";
import { 
  getAgendaSuratList, 
  getAgendaRegisterInfoTU, 
  createSuratMasukTU, 
  AgendaSuratItem,
  getBukuEkspedisiList,
  createBukuEkspedisi,
  updateBukuEkspedisiStatus,
  BukuEkspedisiItem,
  getBukuTamuList,
  createBukuTamu,
  BukuTamuItem
} from "@/actions/pelayanan";

export function BukuAgendaTuTab() {
  const [mounted, setMounted] = useState(false);
  const [subTab, setSubTab] = useState<"keluar" | "masuk" | "ekspedisi" | "tamu">("keluar");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [agendaList, setAgendaList] = useState<AgendaSuratItem[]>([]);
  const [ekspedisiList, setEkspedisiList] = useState<BukuEkspedisiItem[]>([]);
  const [tamuList, setTamuList] = useState<BukuTamuItem[]>([]);

  const [registerStats, setRegisterStats] = useState({
    nextSeq: "047",
    nextAutoNomor: "500.3/047 - Pem",
    totalSuratKeluar: 0,
    totalSuratMasuk: 0,
  });

  // Modal Input Surat Masuk
  const [showAddMasukModal, setShowAddMasukModal] = useState(false);
  const [savingMasuk, setSavingMasuk] = useState(false);
  const [formMasuk, setFormMasuk] = useState({
    nomorSurat: "",
    tanggalSurat: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    pengirim: "",
    perihal: "",
    disposisiKades: "Tindak lanjuti dan buatkan telaahan staf",
    lokasiArsip: "Bantex Masuk 2026 / Rak TU",
  });

  // Modal Input Ekspedisi
  const [showAddEkspedisiModal, setShowAddEkspedisiModal] = useState(false);
  const [savingEkspedisi, setSavingEkspedisi] = useState(false);
  const [formEkspedisi, setFormEkspedisi] = useState({
    tanggalKirim: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    tanggalDanNomorSurat: "",
    perihal: "",
    ditujukanKepada: "",
    petugasPengirim: "Kaur TU & Umum",
    namaPenerima: "",
    keterangan: "",
  });

  // Modal Input Buku Tamu
  const [showAddTamuModal, setShowAddTamuModal] = useState(false);
  const [savingTamu, setSavingTamu] = useState(false);
  const [formTamu, setFormTamu] = useState({
    nama: "",
    instansi: "",
    keperluan: "",
    nomorHp: "",
    penerima: "Kaur TU & Umum",
  });

  // Modals Detail & Pratinjau Cetak
  const [selectedItem, setSelectedItem] = useState<AgendaSuratItem | null>(null);
  const [disposisiItem, setDisposisiItem] = useState<AgendaSuratItem | null>(null);
  const [showPrintAgendaModal, setShowPrintAgendaModal] = useState(false);
  const [showPrintEkspedisiModal, setShowPrintEkspedisiModal] = useState(false);
  const [showPrintTamuModal, setShowPrintTamuModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (subTab === "masuk" || subTab === "keluar") {
        const [listRes, statsRes] = await Promise.all([
          getAgendaSuratList(subTab, search),
          getAgendaRegisterInfoTU(),
        ]);
        if (listRes.success) setAgendaList(listRes.data);
        if (statsRes) setRegisterStats(statsRes);
      } else if (subTab === "ekspedisi") {
        const res = await getBukuEkspedisiList(search);
        if (res.success) setEkspedisiList(res.data);
      } else if (subTab === "tamu") {
        const res = await getBukuTamuList(search);
        if (res.success) setTamuList(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, [subTab, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSaveSuratMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMasuk.nomorSurat || !formMasuk.pengirim || !formMasuk.perihal) {
      alert("Harap lengkapi nomor surat, pengirim, dan perihal.");
      return;
    }
    setSavingMasuk(true);
    try {
      const res = await createSuratMasukTU(formMasuk);
      if (res.success) {
        setShowAddMasukModal(false);
        setFormMasuk({
          nomorSurat: "",
          tanggalSurat: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          pengirim: "",
          perihal: "",
          disposisiKades: "Tindak lanjuti dan buatkan telaahan staf",
          lokasiArsip: "Bantex Masuk 2026 / Rak TU",
        });
        loadData();
      } else {
        alert(res.error || "Gagal mencatat surat masuk.");
      }
    } finally {
      setSavingMasuk(false);
    }
  };

  const handleSaveEkspedisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEkspedisi.tanggalDanNomorSurat || !formEkspedisi.ditujukanKepada || !formEkspedisi.perihal) {
      alert("Harap lengkapi nomor surat, instansi tujuan, dan perihal.");
      return;
    }
    setSavingEkspedisi(true);
    try {
      const res = await createBukuEkspedisi(formEkspedisi);
      if (res.success) {
        setShowAddEkspedisiModal(false);
        setFormEkspedisi({
          tanggalKirim: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          tanggalDanNomorSurat: "",
          perihal: "",
          ditujukanKepada: "",
          petugasPengirim: "Kaur TU & Umum",
          namaPenerima: "",
          keterangan: "",
        });
        loadData();
      } else {
        alert(res.error || "Gagal mencatat ekspedisi.");
      }
    } finally {
      setSavingEkspedisi(false);
    }
  };

  const handleSaveTamu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTamu.nama || !formTamu.instansi || !formTamu.keperluan) {
      alert("Harap lengkapi nama tamu, instansi, dan keperluan.");
      return;
    }
    setSavingTamu(true);
    try {
      const res = await createBukuTamu(formTamu);
      if (res.success) {
        setShowAddTamuModal(false);
        setFormTamu({
          nama: "",
          instansi: "",
          keperluan: "",
          nomorHp: "",
          penerima: "Kaur TU & Umum",
        });
        loadData();
      } else {
        alert(res.error || "Gagal menyimpan tamu.");
      }
    } finally {
      setSavingTamu(false);
    }
  };

  const handleUpdatePenerimaEkspedisi = async (id: string) => {
    const nama = prompt("Masukkan nama pejabat/petugas penerima surat:");
    if (!nama || !nama.trim()) return;
    const res = await updateBukuEkspedisiStatus(id, nama.trim(), "Diterima");
    if (res.success) {
      loadData();
    } else {
      alert(res.error || "Gagal update status.");
    }
  };

  const triggerBrowserPrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* 1. KARTU STATISTIK REGISTER TU TERPADU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Surat Keluar Terdaftar</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{registerStats.totalSuratKeluar}</h4>
            <span className="text-[10px] font-semibold text-blue-600 mt-0.5 inline-block">Real-time Register Desa</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Send size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Surat Masuk Tercatat</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{registerStats.totalSuratMasuk}</h4>
            <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 inline-block">Disposisi Terarsip</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Inbox size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No. Urut Register Berikutnya</span>
            <h4 className="text-2xl font-black text-blue-700 font-mono mt-1">{registerStats.nextSeq}</h4>
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5 inline-block">Otomatis Terkunci di TU</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Tag size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-5 rounded-3xl text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Permendagri 47/2016</span>
            <h5 className="text-sm font-black text-white mt-1">Buku Administrasi Ketatausahaan</h5>
            <span className="text-[10px] text-slate-300 mt-0.5 inline-block">Desa Cimanggu I Cibungbulang</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center shrink-0 border border-white/10">
            <BookOpen size={22} />
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR SUBTAB & AKSI */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        {/* Sub-tab Pill 4 Menu Administrasi Umum */}
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto gap-1">
          {[
            { id: "keluar", label: "Agenda Surat Keluar", icon: Send },
            { id: "masuk", label: "Agenda Surat Masuk", icon: Inbox },
            { id: "ekspedisi", label: "Buku Ekspedisi", icon: FileText },
            { id: "tamu", label: "Buku Tamu Dinas", icon: Users },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                subTab === t.id
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <t.icon size={14} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari data berkas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          {subTab === "masuk" && (
            <button
              type="button"
              onClick={() => setShowAddMasukModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Catat Surat Masuk</span>
            </button>
          )}

          {subTab === "ekspedisi" && (
            <button
              type="button"
              onClick={() => setShowAddEkspedisiModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Catat Ekspedisi</span>
            </button>
          )}

          {subTab === "tamu" && (
            <button
              type="button"
              onClick={() => setShowAddTamuModal(true)}
              className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Catat Tamu Dinas</span>
            </button>
          )}

          {/* Cetak Sesuai Tab Aktif */}
          {subTab === "ekspedisi" ? (
            <button
              type="button"
              onClick={() => setShowPrintEkspedisiModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Buku Ekspedisi</span>
            </button>
          ) : subTab === "tamu" ? (
            <button
              type="button"
              onClick={() => setShowPrintTamuModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Buku Tamu</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowPrintAgendaModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Buku Register</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TABEL DATA ADMINISTRASI UMUM */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden print:hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              <span>
                {subTab === "keluar" 
                  ? "Buku Agenda Surat Keluar (Tersinkron dengan Seksi Pelayanan)"
                  : subTab === "masuk"
                  ? "Buku Agenda Surat Masuk & Disposisi Kepala Desa"
                  : subTab === "ekspedisi"
                  ? "Buku Ekspedisi Pengiriman Surat Dinas (Permendagri 47/2016)"
                  : "Buku Tamu Dinas & Monitoring Kantor Desa"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Standar Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {subTab === "ekspedisi" ? ekspedisiList.length : subTab === "tamu" ? tamuList.length : agendaList.length} Berkas
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-xs font-bold">Memuat data administrasi...</span>
            </div>
          ) : subTab === "ekspedisi" ? (
            /* TABEL BUKU EKSPEDISI */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">Tanggal Kirim</th>
                  <th className="py-3 px-4 w-48">Tanggal & Nomor Surat</th>
                  <th className="py-3 px-4">Isi Ringkas / Perihal</th>
                  <th className="py-3 px-4 w-44">Ditujukan Kepada</th>
                  <th className="py-3 px-4 w-32">Pengirim</th>
                  <th className="py-3 px-4 w-36">Tanda Terima / Paraf</th>
                  <th className="py-3 px-4 text-center w-28">Status</th>
                  <th className="py-3 px-4 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ekspedisiList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {item.tanggalKirim}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.tanggalDanNomorSurat}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium max-w-xs">
                      {item.perihal}
                      {item.keterangan && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">{item.keterangan}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-900">
                      {item.ditujukanKepada}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.petugasPengirim}
                    </td>
                    <td className="py-3 px-4">
                      {item.namaPenerima ? (
                        <div className="font-bold text-emerald-800">
                          ✍️ {item.namaPenerima}
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-700 italic">Belum ada paraf</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        item.status === "Diterima"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!item.namaPenerima && (
                        <button
                          type="button"
                          onClick={() => handleUpdatePenerimaEkspedisi(item.id)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg transition-colors border border-blue-200 cursor-pointer"
                        >
                          Paraf Penerima
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : subTab === "tamu" ? (
            /* TABEL BUKU TAMU DINAS */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-32">Waktu Kunjungan</th>
                  <th className="py-3 px-4 w-44">Nama Tamu</th>
                  <th className="py-3 px-4 w-44">Instansi / Lembaga</th>
                  <th className="py-3 px-4">Maksud & Keperluan</th>
                  <th className="py-3 px-4 w-32">No. HP</th>
                  <th className="py-3 px-4 w-36">Pejabat Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tamuList.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
                      <div>{t.tanggal}</div>
                      <span className="text-[10px] text-slate-400">{t.jam}</span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {t.nama}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-900">
                      {t.instansi}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {t.keperluan}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {t.nomorHp || "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {t.penerima || "Kaur TU & Umum"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* TABEL AGENDA SURAT MASUK / KELUAR */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4">No.</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nomor Surat Resmi</th>
                  <th className="py-3 px-4">
                    {subTab === "masuk" ? "Instansi Pengirim" : "Pemohon / Tujuan"}
                  </th>
                  <th className="py-3 px-4">Perihal / Keterangan</th>
                  <th className="py-3 px-4">
                    {subTab === "masuk" ? "Disposisi / Catatan" : "Penandatangan"}
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agendaList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                      {item.nomorSurat}
                      {item.nomorResi && (
                        <div className="text-[10px] font-sans font-normal text-blue-600">
                          Resi: {item.nomorResi}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.pengirimAtauPenerima}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <p className="line-clamp-2">{item.perihal}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {subTab === "masuk" ? (
                        <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {item.catatanPengambilan || "Belum ada disposisi"}
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">
                            {item.penandatangan === "SEKDES" ? "Sekdes (a.n. Kades)" : "Kepala Desa"}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Metode: {item.metodeTTD === "TTD_BASAH" ? "Tanda Tangan Basah" : "TTE"}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        item.status.includes("Selesai") || item.status.includes("Diterima") || item.status.includes("Diterbitkan")
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        <CheckCircle2 size={11} />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {subTab === "masuk" && (
                          <button
                            type="button"
                            onClick={() => setDisposisiItem(item)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-[11px] rounded-lg transition-colors border border-amber-200 flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Printer size={12} />
                            <span>Disposisi</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] rounded-lg transition-colors border border-slate-200 cursor-pointer"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. MODAL CATAT SURAT MASUK */}
      {showAddMasukModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Catat Surat Masuk Baru</h3>
                <p className="text-xs text-slate-500">Pencatatan surat masuk ke Buku Agenda Kaur TU & Umum.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMasukModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSuratMasuk} className="space-y-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-slate-600">Nomor Surat Asli Masuk *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 005/124/Kec.Cbg/XI/2026"
                  value={formMasuk.nomorSurat}
                  onChange={(e) => setFormMasuk({ ...formMasuk, nomorSurat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Tanggal Surat *</label>
                  <input
                    type="text"
                    required
                    value={formMasuk.tanggalSurat}
                    onChange={(e) => setFormMasuk({ ...formMasuk, tanggalSurat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Instansi Pengirim *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kantor Camat Cibungbulang"
                    value={formMasuk.pengirim}
                    onChange={(e) => setFormMasuk({ ...formMasuk, pengirim: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Perihal / Isi Ringkas Surat *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ringkasan perihal surat masuk..."
                  value={formMasuk.perihal}
                  onChange={(e) => setFormMasuk({ ...formMasuk, perihal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Draf Awal Disposisi Kepala Desa</label>
                <input
                  type="text"
                  value={formMasuk.disposisiKades}
                  onChange={(e) => setFormMasuk({ ...formMasuk, disposisiKades: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMasukModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingMasuk}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {savingMasuk ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan ke Agenda Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL CATAT EKSPEDISI BARU */}
      {showAddEkspedisiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Catat Pengiriman Buku Ekspedisi</h3>
                <p className="text-xs text-slate-500">Pencatatan pengiriman surat resmi desa ke instansi luar/warga.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEkspedisiModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEkspedisi} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Tanggal Pengiriman *</label>
                  <input
                    type="text"
                    required
                    value={formEkspedisi.tanggalKirim}
                    onChange={(e) => setFormEkspedisi({ ...formEkspedisi, tanggalKirim: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Petugas Pengirim</label>
                  <input
                    type="text"
                    value={formEkspedisi.petugasPengirim}
                    onChange={(e) => setFormEkspedisi({ ...formEkspedisi, petugasPengirim: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Tanggal dan Nomor Surat yang Dikirim *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 15 Nov 2026 / 500.3/048 - Pem"
                  value={formEkspedisi.tanggalDanNomorSurat}
                  onChange={(e) => setFormEkspedisi({ ...formEkspedisi, tanggalDanNomorSurat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Ditujukan Kepada *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Camat Cibungbulang C.q. Kasi Trantib"
                  value={formEkspedisi.ditujukanKepada}
                  onChange={(e) => setFormEkspedisi({ ...formEkspedisi, ditujukanKepada: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Perihal / Isi Ringkas Surat *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Isi ringkas surat dinas..."
                  value={formEkspedisi.perihal}
                  onChange={(e) => setFormEkspedisi({ ...formEkspedisi, perihal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Nama Penerima & Paraf (Opsional, jika sudah diterima)</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Kurniawan (Staf PATEN)"
                  value={formEkspedisi.namaPenerima}
                  onChange={(e) => setFormEkspedisi({ ...formEkspedisi, namaPenerima: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEkspedisiModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEkspedisi}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {savingEkspedisi ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan ke Buku Ekspedisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL CATAT TAMU DINAS */}
      {showAddTamuModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Catat Tamu Dinas Kantor Desa</h3>
                <p className="text-xs text-slate-500">Pencatatan tamu dinas dan monitoring wilayah.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTamuModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTamu} className="space-y-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-slate-600">Nama Tamu / Pejabat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Agus Hendra, S.Sos"
                  value={formTamu.nama}
                  onChange={(e) => setFormTamu({ ...formTamu, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Instansi / Lembaga *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: DPMD Kab. Bogor"
                    value={formTamu.instansi}
                    onChange={(e) => setFormTamu({ ...formTamu, instansi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812-..."
                    value={formTamu.nomorHp}
                    onChange={(e) => setFormTamu({ ...formTamu, nomorHp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Maksud / Keperluan Kunjungan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Tujuan kunjungan..."
                  value={formTamu.keperluan}
                  onChange={(e) => setFormTamu({ ...formTamu, keperluan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Pejabat / Petugas yang Ditemui</label>
                <input
                  type="text"
                  value={formTamu.penerima}
                  onChange={(e) => setFormTamu({ ...formTamu, penerima: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTamuModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTamu}
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {savingTamu ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan Buku Tamu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL DETAIL BERKAS */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Detail Arsip Surat</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedItem.nomorSurat}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Perihal Surat</span>
                <p className="font-bold text-slate-900">{selectedItem.perihal}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tanggal</span>
                  <strong className="text-slate-800">{selectedItem.tanggal}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pihak</span>
                  <strong className="text-slate-800">{selectedItem.pengirimAtauPenerima}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Penandatangan / Disposisi</span>
                <strong className="text-blue-900">
                  {selectedItem.penandatangan === "SEKDES" ? "Sekretaris Desa (a.n. Kades)" : "Kepala Desa Cimanggu I"}
                </strong>
                {selectedItem.catatanPengambilan && (
                  <p className="text-[11px] text-slate-600 mt-1 italic">&quot;{selectedItem.catatanPengambilan}&quot;</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 8. MODAL PRATINJAU LEMBAR DISPOSISI KEPALA DESA */}
      {disposisiItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Lembar Disposisi Kepala Desa</h3>
                <p className="text-xs text-slate-500">Format resmi Lembar Disposisi Surat Masuk Pemdes Cimanggu I.</p>
              </div>
              <button
                type="button"
                onClick={() => setDisposisiItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Pratinjau Lembar Disposisi */}
            <div className="border-2 border-black p-5 bg-white text-black text-xs font-serif leading-tight space-y-3 shadow-inner">
              {/* Kop Surat Disposisi */}
              <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-center">
                <img src="/images/letters/logo_bogor.png" alt="Logo" className="w-12 h-14 object-contain" />
                <div className="flex-1">
                  <h4 className="text-[9.5pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR</h4>
                  <h3 className="text-[10.5pt] font-bold uppercase m-0">KECAMATAN CIBUNGBULANG</h3>
                  <h2 className="text-[12pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
                  <p className="text-[7pt] italic text-slate-700 m-0">
                    Jl. Raya Gardu Seri Kp. Cianteun RT.004 RW.008 Desa Cimanggu I
                  </p>
                </div>
              </div>

              <div className="text-center font-bold underline uppercase text-[11pt] tracking-wider pt-1">
                LEMBAR DISPOSISI KEPALA DESA
              </div>

              {/* Data Surat Masuk */}
              <table className="w-full border-collapse border border-black text-[8.5pt]">
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5 w-1/2">
                      <span className="font-bold block text-[6.5pt] text-slate-600 uppercase">Surat Dari:</span>
                      <strong className="text-[9pt]">{disposisiItem.pengirimAtauPenerima}</strong>
                    </td>
                    <td className="border border-black p-1.5 w-1/2">
                      <span className="font-bold block text-[6.5pt] text-slate-600 uppercase">Diterima Tanggal:</span>
                      <strong className="text-[9pt]">{disposisiItem.tanggal}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5">
                      <span className="font-bold block text-[6.5pt] text-slate-600 uppercase">Tanggal & Nomor Surat:</span>
                      <span className="font-bold font-mono">{disposisiItem.nomorSurat}</span>
                    </td>
                    <td className="border border-black p-1.5">
                      <span className="font-bold block text-[6.5pt] text-slate-600 uppercase">No. Agenda Masuk:</span>
                      <span className="font-bold font-mono text-blue-900">{disposisiItem.id}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-black p-1.5">
                      <span className="font-bold block text-[6.5pt] text-slate-600 uppercase">Perihal / Isi Ringkas:</span>
                      <p className="font-bold mt-0.5 text-[8.5pt]">{disposisiItem.perihal}</p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Diteruskan & Instruksi */}
              <div className="grid grid-cols-2 gap-2 border border-black p-2 text-[8pt]">
                <div className="space-y-0.5">
                  <strong className="text-[7pt] block border-b border-black pb-0.5 uppercase tracking-wide">
                    Diteruskan Kepada Sdr:
                  </strong>
                  <div>[ &nbsp; ] Sekretaris Desa</div>
                  <div>[ &nbsp; ] Kasi Pemerintahan</div>
                  <div>[ &nbsp; ] Kasi Pelayanan</div>
                  <div>[ &nbsp; ] Kasi Kesejahteraan</div>
                  <div>[ &nbsp; ] Kaur Tata Usaha & Umum</div>
                  <div>[ &nbsp; ] Kaur Keuangan</div>
                  <div>[ &nbsp; ] Kaur Perencanaan</div>
                </div>

                <div className="space-y-0.5 border-l border-black pl-2">
                  <strong className="text-[7pt] block border-b border-black pb-0.5 uppercase tracking-wide">
                    Instruksi / Disposisi:
                  </strong>
                  <div>[ ✔ ] Tanggapi & Tindak Lanjuti</div>
                  <div>[ &nbsp; ] Hadiri / Wakili Kepala Desa</div>
                  <div>[ &nbsp; ] Siapkan Telaahan / Bahan</div>
                  <div>[ &nbsp; ] Koordinasikan</div>
                  <div>[ &nbsp; ] Simpan / Arsipkan</div>
                </div>
              </div>

              {/* Catatan Khusus & TTD */}
              <div className="border border-black p-2 text-[8pt]">
                <span className="font-bold block text-[7pt] uppercase">Catatan Disposisi Kepala Desa:</span>
                <p className="italic mt-1 text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200">
                  &quot;{disposisiItem.catatanPengambilan || "Tindak lanjuti segera sesuai tupoksi dan laporkan hasilnya kepada Kepala Desa."}&quot;
                </p>

                <div className="flex justify-end pt-2">
                  <div className="text-center w-48 leading-tight">
                    <p className="text-[8pt]">Cimanggu I, {disposisiItem.tanggal}</p>
                    <p className="font-bold text-[8pt]">Kepala Desa Cimanggu I,</p>
                    <div className="h-10 flex items-center justify-center">
                      <span className="text-[7pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                    </div>
                    <p className="font-bold underline uppercase text-[8.5pt]">HERNAWAN M. SODIK</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisposisiItem(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={triggerBrowserPrint}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} />
                <span>Cetak Lembar Disposisi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL PRATINJAU CETAK BUKU AGENDA SURAT */}
      {showPrintAgendaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-between p-3 md:p-6 print:hidden">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Cetak {subTab === "masuk" ? "Buku Agenda Surat Masuk" : "Buku Agenda Surat Keluar"}
                </h3>
                <p className="text-xs text-slate-500">
                  Standar Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerBrowserPrint}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Printer size={16} />
                <span>Cetak Dokumen Sekarang (Print / PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintAgendaModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto my-3 p-4 bg-slate-800/60 rounded-2xl flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl p-8 border border-slate-300 w-full max-w-[1200px] text-black font-serif leading-tight">
              <div className="text-center border-b-2 border-black pb-2 mb-3">
                <h4 className="text-[10pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG</h4>
                <h2 className="text-[13pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
                <h3 className="text-[11pt] font-bold uppercase underline mt-1">
                  {subTab === "masuk" ? "BUKU AGENDA SURAT MASUK" : "BUKU AGENDA SURAT KELUAR"} DESA CIMANGGU I
                </h3>
                <p className="text-[8pt] italic m-0">Berdasarkan Lampiran Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa</p>
              </div>

              <table className="w-full border-collapse border border-black text-[8pt]" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1.5 w-10">NO.</th>
                    <th className="border border-black p-1.5 w-24">TANGGAL</th>
                    <th className="border border-black p-1.5 w-44">NOMOR SURAT</th>
                    <th className="border border-black p-1.5 w-48">
                      {subTab === "masuk" ? "INSTANSI PENGIRIM" : "PEMOHON / TUJUAN"}
                    </th>
                    <th className="border border-black p-1.5">PERIHAL / ISI RINGKAS</th>
                    <th className="border border-black p-1.5 w-36">
                      {subTab === "masuk" ? "DISPOSISI" : "PENANDATANGAN"}
                    </th>
                    <th className="border border-black p-1.5 w-24">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {agendaList.map((item, idx) => (
                    <tr key={item.id} className="align-top">
                      <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1.5">{item.tanggal}</td>
                      <td className="border border-black p-1.5 font-mono font-bold text-[7.5pt] break-words">{item.nomorSurat}</td>
                      <td className="border border-black p-1.5 font-bold break-words">{item.pengirimAtauPenerima}</td>
                      <td className="border border-black p-1.5 break-words">{item.perihal}</td>
                      <td className="border border-black p-1.5 break-words">
                        {subTab === "masuk" ? (
                          item.catatanPengambilan || "Disposisi Kades"
                        ) : (
                          item.penandatangan === "SEKDES" ? "Sekretaris Desa" : "Kepala Desa"
                        )}
                      </td>
                      <td className="border border-black p-1.5 text-center">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex justify-between text-center text-[9pt]">
                <div className="w-64">
                  <p className="m-0">Mengetahui,</p>
                  <p className="font-bold uppercase m-0">Kepala Desa Cimanggu I</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-bold underline uppercase m-0">HERNAWAN M. SODIK</p>
                </div>
                <div className="w-64">
                  <p className="m-0">Cimanggu I, {todayStr}</p>
                  <p className="font-bold uppercase m-0">Kaur Tata Usaha & Umum</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan Asli )</span>
                  </div>
                  <p className="font-bold underline uppercase m-0">KAUR TU & UMUM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL PRATINJAU CETAK BUKU EKSPEDISI */}
      {showPrintEkspedisiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-between p-3 md:p-6 print:hidden">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Cetak Buku Ekspedisi Pengiriman Surat Dinas
                </h3>
                <p className="text-xs text-slate-500">
                  Format resmi 8 kolom sesuai Permendagri No. 47 Tahun 2016.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerBrowserPrint}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Printer size={16} />
                <span>Cetak Dokumen Sekarang (Print / PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintEkspedisiModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto my-3 p-4 bg-slate-800/60 rounded-2xl flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl p-8 border border-slate-300 w-full max-w-[1200px] text-black font-serif leading-tight">
              <div className="text-center border-b-2 border-black pb-2 mb-3">
                <h4 className="text-[10pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG</h4>
                <h2 className="text-[13pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
                <h3 className="text-[11pt] font-bold uppercase underline mt-1">BUKU EKSPEDISI SURAT DINAS PEMERINTAH DESA</h3>
                <p className="text-[8pt] italic m-0">Berdasarkan Lampiran Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa</p>
              </div>

              <table className="w-full border-collapse border border-black text-[8pt]" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1.5 w-10">NO.</th>
                    <th className="border border-black p-1.5 w-28">TGL KIRIM</th>
                    <th className="border border-black p-1.5 w-44">TGL & NOMOR SURAT</th>
                    <th className="border border-black p-1.5">ISI RINGKAS / PERIHAL</th>
                    <th className="border border-black p-1.5 w-48">DITUJUKAN KEPADA</th>
                    <th className="border border-black p-1.5 w-32">PENGIRIM</th>
                    <th className="border border-black p-1.5 w-44">TANDA TERIMA / PARAF</th>
                    <th className="border border-black p-1.5 w-28">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {ekspedisiList.map((item, idx) => (
                    <tr key={item.id} className="align-top">
                      <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1.5">{item.tanggalKirim}</td>
                      <td className="border border-black p-1.5 font-mono font-bold text-[7.5pt] break-words">{item.tanggalDanNomorSurat}</td>
                      <td className="border border-black p-1.5 font-bold break-words">{item.perihal}</td>
                      <td className="border border-black p-1.5 break-words">{item.ditujukanKepada}</td>
                      <td className="border border-black p-1.5 break-words">{item.petugasPengirim}</td>
                      <td className="border border-black p-1.5 text-center">
                        {item.namaPenerima ? (
                          <div>
                            <div className="font-bold underline">{item.namaPenerima}</div>
                            <span className="text-[6.5pt] text-slate-600">Tanda terima sah</span>
                          </div>
                        ) : (
                          <div className="h-8 border border-dashed border-slate-400 flex items-center justify-center text-[7pt] text-slate-400">
                            ( Paraf Penerima )
                          </div>
                        )}
                      </td>
                      <td className="border border-black p-1.5 text-[7pt] break-words">{item.keterangan || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex justify-between text-center text-[9pt]">
                <div className="w-64">
                  <p className="m-0">Mengetahui,</p>
                  <p className="font-bold uppercase m-0">Kepala Desa Cimanggu I</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-bold underline uppercase m-0">HERNAWAN M. SODIK</p>
                </div>
                <div className="w-64">
                  <p className="m-0">Cimanggu I, {todayStr}</p>
                  <p className="font-bold uppercase m-0">Kaur Tata Usaha & Umum</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan Asli )</span>
                  </div>
                  <p className="font-bold underline uppercase m-0">KAUR TU & UMUM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL PRATINJAU CETAK BUKU TAMU */}
      {showPrintTamuModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-between p-3 md:p-6 print:hidden">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Cetak Buku Tamu Dinas & Monitoring
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan kunjungan pejabat, instansi, dan monitoring wilayah di Kantor Desa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerBrowserPrint}
                className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Printer size={16} />
                <span>Cetak Dokumen Sekarang (Print / PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintTamuModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto my-3 p-4 bg-slate-800/60 rounded-2xl flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl p-8 border border-slate-300 w-full max-w-[1200px] text-black font-serif leading-tight">
              <div className="text-center border-b-2 border-black pb-2 mb-3">
                <h4 className="text-[10pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG</h4>
                <h2 className="text-[13pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
                <h3 className="text-[11pt] font-bold uppercase underline mt-1">BUKU TAMU DINAS & KUNJUNGAN KERJA</h3>
                <p className="text-[8pt] italic m-0">Kantor Pemerintah Desa Cimanggu I Kecamatan Cibungbulang</p>
              </div>

              <table className="w-full border-collapse border border-black text-[8pt]" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1.5 w-10">NO</th>
                    <th className="border border-black p-1.5 w-32">WAKTU KUNJUNGAN</th>
                    <th className="border border-black p-1.5 w-48">NAMA TAMU / PEJABAT</th>
                    <th className="border border-black p-1.5 w-48">INSTANSI / LEMBAGA</th>
                    <th className="border border-black p-1.5">MAKSUD & KEPERLUAN</th>
                    <th className="border border-black p-1.5 w-32">NO. HP</th>
                    <th className="border border-black p-1.5 w-36">PEJABAT PENERIMA</th>
                  </tr>
                </thead>
                <tbody>
                  {tamuList.map((t, idx) => (
                    <tr key={t.id} className="align-top">
                      <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1.5">
                        <div>{t.tanggal}</div>
                        <span className="text-[7pt] text-slate-500">{t.jam}</span>
                      </td>
                      <td className="border border-black p-1.5 font-bold break-words">{t.nama}</td>
                      <td className="border border-black p-1.5 break-words">{t.instansi}</td>
                      <td className="border border-black p-1.5 break-words">{t.keperluan}</td>
                      <td className="border border-black p-1.5 font-mono">{t.nomorHp || "-"}</td>
                      <td className="border border-black p-1.5 break-words">{t.penerima || "Kaur TU & Umum"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex justify-between text-center text-[9pt]">
                <div className="w-64">
                  <p className="m-0">Mengetahui,</p>
                  <p className="font-bold uppercase m-0">Kepala Desa Cimanggu I</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-bold underline uppercase m-0">HERNAWAN M. SODIK</p>
                </div>
                <div className="w-64">
                  <p className="m-0">Cimanggu I, {todayStr}</p>
                  <p className="font-bold uppercase m-0">Kaur Tata Usaha & Umum</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan Asli )</span>
                  </div>
                  <p className="font-bold underline uppercase m-0">KAUR TU & UMUM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PORTAL CETAK 1: LEMBAR DISPOSISI RESMI KADES (MOUNT KE BODY) ── */}
      {disposisiItem && mounted && typeof document !== "undefined" && createPortal(
        <div id="lembar-disposisi-print-portal" style={{ display: "none" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                #lembar-disposisi-print-portal {
                  display: none !important;
                }
              }
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 15mm 18mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                body > *:not(#lembar-disposisi-print-portal) {
                  display: none !important;
                }
                #lembar-disposisi-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: relative !important;
                  width: 100% !important;
                }
              }
            `
          }} />
          <div className="border-2 border-black p-6 bg-white text-black text-xs font-serif leading-tight space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 border-b-2 border-black pb-2 text-center">
              <img src="/images/letters/logo_bogor.png" alt="Logo" className="w-16 h-18 object-contain" />
              <div className="flex-1">
                <h4 className="text-[12pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR</h4>
                <h3 className="text-[13pt] font-bold uppercase m-0">KECAMATAN CIBUNGBULANG</h3>
                <h2 className="text-[15pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
                <p className="text-[8.5pt] italic text-slate-700 m-0">
                  Jl. Raya Gardu Seri Kp. Cianteun RT.004 RW.008 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor
                </p>
              </div>
            </div>

            <div className="text-center font-bold underline uppercase text-[13pt] tracking-wider pt-2">
              LEMBAR DISPOSISI KEPALA DESA
            </div>

            <table className="w-full border-collapse border border-black text-[9.5pt]">
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold block text-[7.5pt] text-slate-600 uppercase">Surat Dari:</span>
                    <strong className="text-[10pt]">{disposisiItem.pengirimAtauPenerima}</strong>
                  </td>
                  <td className="border border-black p-2 w-1/2">
                    <span className="font-bold block text-[7.5pt] text-slate-600 uppercase">Diterima Tanggal:</span>
                    <strong className="text-[10pt]">{disposisiItem.tanggal}</strong>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2">
                    <span className="font-bold block text-[7.5pt] text-slate-600 uppercase">Tanggal & Nomor Surat:</span>
                    <span className="font-bold font-mono">{disposisiItem.nomorSurat}</span>
                  </td>
                  <td className="border border-black p-2">
                    <span className="font-bold block text-[7.5pt] text-slate-600 uppercase">No. Agenda Masuk:</span>
                    <span className="font-bold font-mono text-blue-900">{disposisiItem.id}</span>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-black p-2">
                    <span className="font-bold block text-[7.5pt] text-slate-600 uppercase">Perihal / Isi Ringkas:</span>
                    <p className="font-bold mt-1 text-[10pt]">{disposisiItem.perihal}</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-3 border border-black p-3 text-[9pt]">
              <div className="space-y-1">
                <strong className="text-[8.5pt] block border-b border-black pb-0.5 uppercase tracking-wide">
                  Diteruskan Kepada Sdr:
                </strong>
                <div>[ &nbsp; ] Sekretaris Desa</div>
                <div>[ &nbsp; ] Kasi Pemerintahan</div>
                <div>[ &nbsp; ] Kasi Pelayanan</div>
                <div>[ &nbsp; ] Kasi Kesejahteraan</div>
                <div>[ &nbsp; ] Kaur Tata Usaha & Umum</div>
                <div>[ &nbsp; ] Kaur Keuangan</div>
                <div>[ &nbsp; ] Kaur Perencanaan</div>
              </div>

              <div className="space-y-1 border-l border-black pl-3">
                <strong className="text-[8.5pt] block border-b border-black pb-0.5 uppercase tracking-wide">
                  Instruksi / Disposisi:
                </strong>
                <div>[ ✔ ] Tanggapi & Tindak Lanjuti</div>
                <div>[ &nbsp; ] Hadiri / Wakili Kepala Desa</div>
                <div>[ &nbsp; ] Siapkan Telaahan / Bahan</div>
                <div>[ &nbsp; ] Koordinasikan</div>
                <div>[ &nbsp; ] Simpan / Arsipkan</div>
              </div>
            </div>

            <div className="border border-black p-3 text-[9pt]">
              <span className="font-bold block text-[8pt] uppercase">Catatan Disposisi Kepala Desa:</span>
              <p className="italic mt-1.5 text-slate-900 bg-slate-50 p-2 rounded border border-slate-300">
                &quot;{disposisiItem.catatanPengambilan || "Tindak lanjuti segera sesuai tupoksi dan laporkan hasilnya kepada Kepala Desa."}&quot;
              </p>

              <div className="flex justify-end pt-4">
                <div className="text-center w-56 leading-tight">
                  <p className="text-[9pt]">Cimanggu I, {disposisiItem.tanggal}</p>
                  <p className="font-bold text-[9.5pt]">Kepala Desa Cimanggu I,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-bold underline uppercase text-[10pt]">HERNAWAN M. SODIK</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PORTAL CETAK 2: BUKU EKSPEDISI RESMI (MOUNT KE BODY) ── */}
      {showPrintEkspedisiModal && mounted && typeof document !== "undefined" && createPortal(
        <div id="buku-ekspedisi-print-portal" style={{ display: "none" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                #buku-ekspedisi-print-portal {
                  display: none !important;
                }
              }
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 10mm 12mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                body > *:not(#buku-ekspedisi-print-portal) {
                  display: none !important;
                }
                #buku-ekspedisi-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: relative !important;
                  width: 100% !important;
                }
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  page-break-inside: auto !important;
                }
                thead {
                  display: table-header-group !important;
                }
                tr {
                  page-break-inside: avoid !important;
                  page-break-after: auto !important;
                }
              }
            `
          }} />
          <div className="p-4 bg-white text-black font-serif leading-tight">
            <div className="text-center border-b-2 border-black pb-2 mb-3">
              <h4 className="text-[11pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG</h4>
              <h2 className="text-[14pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
              <h3 className="text-[12pt] font-bold uppercase underline mt-1">BUKU EKSPEDISI SURAT DINAS PEMERINTAH DESA</h3>
              <p className="text-[8.5pt] italic m-0">Berdasarkan Lampiran Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa</p>
            </div>

            <table className="w-full border-collapse border border-black text-[8.5pt]" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-black p-1.5 w-10">NO.</th>
                  <th className="border border-black p-1.5 w-28">TGL KIRIM</th>
                  <th className="border border-black p-1.5 w-44">TGL & NOMOR SURAT</th>
                  <th className="border border-black p-1.5">ISI RINGKAS / PERIHAL</th>
                  <th className="border border-black p-1.5 w-48">DITUJUKAN KEPADA</th>
                  <th className="border border-black p-1.5 w-32">PENGIRIM</th>
                  <th className="border border-black p-1.5 w-44">TANDA TERIMA / PARAF</th>
                  <th className="border border-black p-1.5 w-28">KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {ekspedisiList.map((item, idx) => (
                  <tr key={item.id} className="align-top">
                    <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1.5">{item.tanggalKirim}</td>
                    <td className="border border-black p-1.5 font-mono font-bold text-[8pt] break-words">{item.tanggalDanNomorSurat}</td>
                    <td className="border border-black p-1.5 font-bold break-words">{item.perihal}</td>
                    <td className="border border-black p-1.5 break-words">{item.ditujukanKepada}</td>
                    <td className="border border-black p-1.5 break-words">{item.petugasPengirim}</td>
                    <td className="border border-black p-1.5 text-center">
                      {item.namaPenerima ? (
                        <div>
                          <div className="font-bold underline">{item.namaPenerima}</div>
                          <span className="text-[7pt] text-slate-600">Tanda terima sah</span>
                        </div>
                      ) : (
                        <div className="h-8 border border-dashed border-slate-400 flex items-center justify-center text-[7pt] text-slate-400">
                          ( Paraf Penerima )
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-1.5 text-[7.5pt] break-words">{item.keterangan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-between text-center text-[9pt]">
              <div className="w-64">
                <p className="m-0">Mengetahui,</p>
                <p className="font-bold uppercase m-0">Kepala Desa Cimanggu I</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                </div>
                <p className="font-bold underline uppercase m-0">HERNAWAN M. SODIK</p>
              </div>
              <div className="w-64">
                <p className="m-0">Cimanggu I, {todayStr}</p>
                <p className="font-bold uppercase m-0">Kaur Tata Usaha & Umum</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan Asli )</span>
                </div>
                <p className="font-bold underline uppercase m-0">KAUR TU & UMUM</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PORTAL CETAK 3: BUKU AGENDA SURAT RESMI (MOUNT KE BODY) ── */}
      {showPrintAgendaModal && mounted && typeof document !== "undefined" && createPortal(
        <div id="buku-agenda-print-portal" style={{ display: "none" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                #buku-agenda-print-portal {
                  display: none !important;
                }
              }
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 10mm 12mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                body > *:not(#buku-agenda-print-portal) {
                  display: none !important;
                }
                #buku-agenda-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: relative !important;
                  width: 100% !important;
                }
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  page-break-inside: auto !important;
                }
                thead {
                  display: table-header-group !important;
                }
                tr {
                  page-break-inside: avoid !important;
                  page-break-after: auto !important;
                }
              }
            `
          }} />
          <div className="p-4 bg-white text-black font-serif leading-tight">
            <div className="text-center border-b-2 border-black pb-2 mb-3">
              <h4 className="text-[11pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG</h4>
              <h2 className="text-[14pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
              <h3 className="text-[12pt] font-bold uppercase underline mt-1">
                {subTab === "masuk" ? "BUKU AGENDA SURAT MASUK" : "BUKU AGENDA SURAT KELUAR"} DESA CIMANGGU I
              </h3>
              <p className="text-[8.5pt] italic m-0">Berdasarkan Lampiran Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa</p>
            </div>

            <table className="w-full border-collapse border border-black text-[8.5pt]" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-black p-1.5 w-10">NO.</th>
                  <th className="border border-black p-1.5 w-24">TANGGAL</th>
                  <th className="border border-black p-1.5 w-44">NOMOR SURAT</th>
                  <th className="border border-black p-1.5 w-48">
                    {subTab === "masuk" ? "INSTANSI PENGIRIM" : "PEMOHON / TUJUAN"}
                  </th>
                  <th className="border border-black p-1.5">PERIHAL / ISI RINGKAS</th>
                  <th className="border border-black p-1.5 w-36">
                    {subTab === "masuk" ? "DISPOSISI" : "PENANDATANGAN"}
                  </th>
                  <th className="border border-black p-1.5 w-24">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {agendaList.map((item, idx) => (
                  <tr key={item.id} className="align-top">
                    <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1.5">{item.tanggal}</td>
                    <td className="border border-black p-1.5 font-mono font-bold text-[8pt] break-words">{item.nomorSurat}</td>
                    <td className="border border-black p-1.5 font-bold break-words">{item.pengirimAtauPenerima}</td>
                    <td className="border border-black p-1.5 break-words">{item.perihal}</td>
                    <td className="border border-black p-1.5 break-words">
                      {subTab === "masuk" ? (
                        item.catatanPengambilan || "Disposisi Kades"
                      ) : (
                        item.penandatangan === "SEKDES" ? "Sekretaris Desa" : "Kepala Desa"
                      )}
                    </td>
                    <td className="border border-black p-1.5 text-center">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-between text-center text-[9pt]">
              <div className="w-64">
                <p className="m-0">Mengetahui,</p>
                <p className="font-bold uppercase m-0">Kepala Desa Cimanggu I</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                </div>
                <p className="font-bold underline uppercase m-0">HERNAWAN M. SODIK</p>
              </div>
              <div className="w-64">
                <p className="m-0">Cimanggu I, {todayStr}</p>
                <p className="font-bold uppercase m-0">Kaur Tata Usaha & Umum</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan Asli )</span>
                </div>
                <p className="font-bold underline uppercase m-0">KAUR TU & UMUM</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PORTAL CETAK 4: BUKU TAMU DINAS RESMI (MOUNT KE BODY) ── */}
      {showPrintTamuModal && mounted && typeof document !== "undefined" && createPortal(
        <div id="buku-tamu-print-portal" style={{ display: "none" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                #buku-tamu-print-portal {
                  display: none !important;
                }
              }
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 10mm 12mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                body > *:not(#buku-tamu-print-portal) {
                  display: none !important;
                }
                #buku-tamu-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: relative !important;
                  width: 100% !important;
                }
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  page-break-inside: auto !important;
                }
                thead {
                  display: table-header-group !important;
                }
                tr {
                  page-break-inside: avoid !important;
                  page-break-after: auto !important;
                }
              }
            `
          }} />
          <div className="p-4 bg-white text-black font-serif leading-tight">
            <div className="text-center border-b-2 border-black pb-2 mb-3">
              <h4 className="text-[11pt] font-bold uppercase m-0">PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG</h4>
              <h2 className="text-[14pt] font-black uppercase m-0">PEMERINTAH DESA CIMANGGU I</h2>
              <h3 className="text-[12pt] font-bold uppercase underline mt-1">BUKU TAMU DINAS & KUNJUNGAN KERJA</h3>
              <p className="text-[8.5pt] italic m-0">Kantor Pemerintah Desa Cimanggu I Kecamatan Cibungbulang</p>
            </div>

            <table className="w-full border-collapse border border-black text-[8.5pt]" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-black p-1.5 w-10">NO</th>
                  <th className="border border-black p-1.5 w-32">WAKTU KUNJUNGAN</th>
                  <th className="border border-black p-1.5 w-48">NAMA TAMU / PEJABAT</th>
                  <th className="border border-black p-1.5 w-48">INSTANSI / LEMBAGA</th>
                  <th className="border border-black p-1.5">MAKSUD & KEPERLUAN</th>
                  <th className="border border-black p-1.5 w-32">NO. HP</th>
                  <th className="border border-black p-1.5 w-36">PEJABAT PENERIMA</th>
                </tr>
              </thead>
              <tbody>
                {tamuList.map((t, idx) => (
                  <tr key={t.id} className="align-top">
                    <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1.5">
                      <div>{t.tanggal}</div>
                      <span className="text-[7.5pt] text-slate-500">{t.jam}</span>
                    </td>
                    <td className="border border-black p-1.5 font-bold break-words">{t.nama}</td>
                    <td className="border border-black p-1.5 break-words">{t.instansi}</td>
                    <td className="border border-black p-1.5 break-words">{t.keperluan}</td>
                    <td className="border border-black p-1.5 font-mono">{t.nomorHp || "-"}</td>
                    <td className="border border-black p-1.5 break-words">{t.penerima || "Kaur TU & Umum"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-between text-center text-[9pt]">
              <div className="w-64">
                <p className="m-0">Mengetahui,</p>
                <p className="font-bold uppercase m-0">Kepala Desa Cimanggu I</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan & Cap )</span>
                </div>
                <p className="font-bold underline uppercase m-0">HERNAWAN M. SODIK</p>
              </div>
              <div className="w-64">
                <p className="m-0">Cimanggu I, {todayStr}</p>
                <p className="font-bold uppercase m-0">Kaur Tata Usaha & Umum</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[8pt] text-slate-400 italic">( Tanda Tangan Asli )</span>
                </div>
                <p className="font-bold underline uppercase m-0">KAUR TU & UMUM</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
