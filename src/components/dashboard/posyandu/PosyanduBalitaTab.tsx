"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Baby, Trash2, CheckCircle2 } from "lucide-react";
import { getPosyanduBalita, addPosyanduBalita, updatePosyanduBalitaStatus, deletePosyanduBalita } from "@/actions/posyandu";
import { CitizenSearchAutocomplete } from "./CitizenSearchAutocomplete";
import { getRWsForPosyandu, POSYANDU_UNITS } from "@/lib/posyandu";

function hitungUsia(tanggalLahir: string | Date): string {
  const tgl = new Date(tanggalLahir);
  const now = new Date();
  const bulan = (now.getFullYear() - tgl.getFullYear()) * 12 + (now.getMonth() - tgl.getMonth());
  if (bulan < 12) return `${bulan} Bulan`;
  return `${Math.floor(bulan / 12)} Tahun ${bulan % 12} Bln`;
}

export function PosyanduBalitaTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduBalita(selectedPosyandu);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

  const handleToggleStunting = async (id: string, currentStatus: boolean) => {
    await updatePosyanduBalitaStatus(id, !currentStatus);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data balita ini?")) {
      await deletePosyanduBalita(id);
      fetchData();
    }
  };

  const filteredData = data.filter(d =>
    d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (d.nik && d.nik.includes(search))
  );

  const statusGiziLabel = (b: any) => {
    if (b.statusStunting) return { label: "Stunting", color: "bg-red-50 text-red-700 border-red-200" };
    return { label: "Normal", color: "bg-green-50 text-green-700 border-green-200" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Baby className="w-6 h-6 text-teal-500" />
            Data Balita
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data balita dan pemantauan status gizi
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Balita
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama balita atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-teal-50 text-teal-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Balita</th>
                <th className="px-4 py-3 font-semibold">Jenis Kelamin</th>
                <th className="px-4 py-3 font-semibold">Tanggal Lahir</th>
                <th className="px-4 py-3 font-semibold">Usia</th>
                <th className="px-4 py-3 font-semibold">Nama Ibu</th>
                <th className="px-4 py-3 font-semibold">Alamat</th>
                <th className="px-4 py-3 font-semibold">Status Gizi</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data balita ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((b, idx) => {
                  const gizi = statusGiziLabel(b);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.nik || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.namaLengkap}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.jenisKelamin === "L" || b.jenisKelamin === "LAKI_LAKI" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                        }`}>
                          {b.jenisKelamin === "L" || b.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {b.tanggalLahir ? new Date(b.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {b.tanggalLahir ? hitungUsia(b.tanggalLahir) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.namaOrangTua || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">RT {b.rt} / RW {b.rw}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStunting(b.id, b.statusStunting)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${gizi.color}`}
                        >
                          {gizi.label}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="mt-4 text-xs text-slate-400 text-right">
            Menampilkan {filteredData.length} dari {data.length} data
          </div>
        )}
      </div>

      {showModal && (
        <ModalTambahBalita
          onClose={() => setShowModal(false)}
          onRefresh={fetchData}
          session={session}
          selectedPosyandu={selectedPosyandu}
        />
      )}
    </div>
  );
}

function ModalTambahBalita({ onClose, onRefresh, session, selectedPosyandu }: any) {
  const [loading, setLoading] = useState(false);
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("L");
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [rt, setRt] = useState("001");
  const [rw, setRw] = useState("");

  // Determine valid RW options for the current Posyandu scope
  let availableRws: string[] = [];

  if (selectedPosyandu && selectedPosyandu !== "ALL") {
    availableRws = getRWsForPosyandu(selectedPosyandu);
  } else if (session?.user?.rw) {
    availableRws = session.user.rw.split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  if (availableRws.length === 0) {
    availableRws = ["001", "002", "003", "004", "005", "006", "007", "008", "009"];
  }

  useEffect(() => {
    if (availableRws.length > 0 && !rw) {
      setRw(availableRws[0]);
    }
  }, [availableRws]);

  const handleCitizenSelect = (citizen: any) => {
    if (citizen.nik) setNik(citizen.nik);
    if (citizen.namaLengkap) setNamaLengkap(citizen.namaLengkap);
    if (citizen.tanggalLahir) {
      const d = new Date(citizen.tanggalLahir);
      setTanggalLahir(d.toISOString().split("T")[0]);
    }
    if (citizen.jenisKelamin) {
      setJenisKelamin(citizen.jenisKelamin === "LAKI_LAKI" || citizen.jenisKelamin === "L" ? "L" : "P");
    }
    if (citizen.namaIbu || citizen.namaAyah) {
      setNamaOrangTua(citizen.namaIbu || citizen.namaAyah);
    }
    if (citizen.rt) setRt(citizen.rt);
    if (citizen.rw && availableRws.includes(citizen.rw)) {
      setRw(citizen.rw);
    } else if (availableRws.length > 0) {
      setRw(availableRws[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let posyanduName = "Posyandu";
    if (selectedPosyandu && selectedPosyandu !== "ALL") {
      const matched = POSYANDU_UNITS.find(u => u.id === selectedPosyandu || u.code === selectedPosyandu);
      if (matched) posyanduName = matched.name;
    } else if (session?.user?.fullName) {
      posyanduName = session.user.fullName;
    }

    await addPosyanduBalita({
      nik: nik || null,
      namaLengkap,
      tanggalLahir,
      jenisKelamin,
      namaOrangTua,
      rt,
      rw: rw || availableRws[0],
      posyanduName,
      posyanduFilter: selectedPosyandu
    });

    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Balita</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap balita atau cari dari Data Kependudukan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>

        {/* Autocomplete Search Citizen */}
        <div className="mb-5 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
          <CitizenSearchAutocomplete
            onSelect={handleCitizenSelect}
            posyanduFilter={selectedPosyandu}
            label="Integrasi Data Kependudukan (Cari NIK / Nama Balita)"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK (Opsional)</label>
              <input
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                type="text"
                maxLength={16}
                placeholder="16 digit NIK Balita"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap Balita *</label>
              <input
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                type="text"
                placeholder="Nama Balita"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Lahir *</label>
              <input
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin *</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Ibu / Orang Tua *</label>
              <input
                value={namaOrangTua}
                onChange={(e) => setNamaOrangTua(e.target.value)}
                required
                type="text"
                placeholder="Nama Ibu Kandung"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RT *</label>
              <input
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                required
                type="text"
                placeholder="001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RW *</label>
              <select
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium text-slate-800"
              >
                {availableRws.map((rwVal: string) => (
                  <option key={rwVal} value={rwVal}>RW. {rwVal}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
