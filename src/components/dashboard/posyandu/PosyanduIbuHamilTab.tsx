"use client";

import { useState, useEffect } from "react";
import { Plus, Search, HeartPulse, Trash2 } from "lucide-react";
import { getPosyanduIbuHamil, addPosyanduIbuHamil, updatePosyanduIbuHamilStatus, deletePosyanduIbuHamil } from "@/actions/posyandu";
import { CitizenSearchAutocomplete } from "./CitizenSearchAutocomplete";
import { getRWsForPosyandu, POSYANDU_UNITS } from "@/lib/posyandu";

export function PosyanduIbuHamilTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduIbuHamil(selectedPosyandu);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

  const handleToggleRisiko = async (id: string, currentStatus: boolean) => {
    await updatePosyanduIbuHamilStatus(id, !currentStatus);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data ibu hamil ini?")) {
      await deletePosyanduIbuHamil(id);
      fetchData();
    }
  };

  const filteredData = data.filter(d =>
    d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (d.nik && d.nik.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-pink-500" />
            Data Ibu Hamil
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data pemantauan kesehatan ibu hamil</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Ibu Hamil
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama ibu hamil atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-pink-50 text-pink-900">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-4 py-3 font-semibold">Usia Kandungan</th>
                <th className="px-4 py-3 font-semibold">Berat Badan</th>
                <th className="px-4 py-3 font-semibold">No HP</th>
                <th className="px-4 py-3 font-semibold">Alamat</th>
                <th className="px-4 py-3 font-semibold">Status Risiko</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data ibu hamil ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.nik}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.namaLengkap}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{d.usiaKandungan} Bulan</td>
                    <td className="px-4 py-3 text-slate-600">{d.beratBadan ? `${d.beratBadan} kg` : "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.noHp || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">RT {d.rt} / RW {d.rw}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleRisiko(d.id, d.risikoTinggi)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          d.risikoTinggi ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {d.risikoTinggi ? "Risiko Tinggi" : "Normal"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
        <ModalTambahIbuHamil
          onClose={() => setShowModal(false)}
          onRefresh={fetchData}
          session={session}
          selectedPosyandu={selectedPosyandu}
        />
      )}
    </div>
  );
}

function ModalTambahIbuHamil({ onClose, onRefresh, session, selectedPosyandu }: any) {
  const [loading, setLoading] = useState(false);
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [usiaKandungan, setUsiaKandungan] = useState("1");
  const [beratBadan, setBeratBadan] = useState("");
  const [noHp, setNoHp] = useState("");
  const [rt, setRt] = useState("001");
  const [rw, setRw] = useState("");

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
    if (citizen.phoneNumber) setNoHp(citizen.phoneNumber);
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

    await addPosyanduIbuHamil({
      nik,
      namaLengkap,
      usiaKandungan: parseInt(usiaKandungan) || 1,
      beratBadan: beratBadan ? parseFloat(beratBadan) : null,
      noHp: noHp || null,
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
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Ibu Hamil</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap atau cari dari Data Kependudukan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>

        {/* Autocomplete Search Citizen */}
        <div className="mb-5 bg-pink-50/50 p-3.5 rounded-xl border border-pink-100">
          <CitizenSearchAutocomplete
            onSelect={handleCitizenSelect}
            posyanduFilter={selectedPosyandu}
            label="Integrasi Data Kependudukan (Cari NIK / Nama Ibu Hamil)"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK *</label>
            <input
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
              type="text"
              maxLength={16}
              placeholder="16 digit NIK Ibu Hamil"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap *</label>
            <input
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              required
              type="text"
              placeholder="Nama Lengkap Ibu"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Usia Kandungan (Bulan) *</label>
              <input
                value={usiaKandungan}
                onChange={(e) => setUsiaKandungan(e.target.value)}
                required
                type="number"
                min="1"
                max="9"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Berat Badan (kg)</label>
              <input
                value={beratBadan}
                onChange={(e) => setBeratBadan(e.target.value)}
                type="number"
                step="0.1"
                placeholder="50.0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor HP / WhatsApp</label>
            <input
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              type="text"
              placeholder="08xxxxxxxxxx"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RT *</label>
              <input
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                required
                type="text"
                placeholder="001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RW *</label>
              <select
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white font-medium text-slate-800"
              >
                {availableRws.map((rwVal: string) => (
                  <option key={rwVal} value={rwVal}>RW. {rwVal}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
