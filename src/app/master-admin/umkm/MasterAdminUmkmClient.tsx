"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Search, CheckCircle, XCircle, AlertCircle, ShieldAlert } from "lucide-react";
import { updateUmkmStoreStatus } from "@/app/actions/umkm";

export default function MasterAdminUmkmClient({ umkmList }: { umkmList: any[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filteredList = umkmList.filter((u) => {
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchQuery =
      !q ||
      u.storeName?.toLowerCase().includes(q) ||
      u.user?.fullName?.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const handleStatusChange = async (
    id: string,
    nextStatus: "APPROVED" | "REJECTED" | "BANNED",
    confirmMsg: string
  ) => {
    if (!confirm(confirmMsg)) return;
    setLoading(id);
    const res = await updateUmkmStoreStatus(id, nextStatus);
    setLoading(null);
    if (!res.success) alert(res.error);
    else router.refresh();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Store size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Moderasi &amp; Verifikasi UMKM</h1>
            <p className="text-sm text-slate-500 font-medium">
              Kelola persetujuan toko UMKM yang beroperasi di DesaMart (disinkronkan dengan BUMDes).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "BANNED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL"
                  ? "Semua"
                  : status === "PENDING"
                    ? "Menunggu Verifikasi"
                    : status === "APPROVED"
                      ? "Disetujui"
                      : status === "REJECTED"
                        ? "Ditolak"
                        : "Dibekukan"}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama toko / pemilik..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium w-full focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">
                <th className="p-4 rounded-tl-xl">Toko &amp; Pemilik</th>
                <th className="p-4">Kontak (WhatsApp / NIK)</th>
                <th className="p-4">Tanggal Daftar</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    Tidak ada data toko UMKM yang cocok.
                  </td>
                </tr>
              )}
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{item.storeName}</div>
                    <div className="text-xs text-slate-500">{item.user?.fullName || "-"}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">
                    {item.user?.phoneNumber || item.user?.nik || "-"}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                        item.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : item.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status === "PENDING" ? (
                        <AlertCircle size={12} />
                      ) : item.status === "APPROVED" ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.status !== "APPROVED" && (
                        <button
                          disabled={loading === item.id}
                          onClick={() =>
                            handleStatusChange(item.id, "APPROVED", `Setujui toko "${item.storeName}"?`)
                          }
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {loading === item.id ? "..." : "Setujui"}
                        </button>
                      )}
                      {item.status === "PENDING" && (
                        <button
                          disabled={loading === item.id}
                          onClick={() =>
                            handleStatusChange(item.id, "REJECTED", `Tolak pendaftaran toko "${item.storeName}"?`)
                          }
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Tolak
                        </button>
                      )}
                      {item.status === "APPROVED" && (
                        <button
                          disabled={loading === item.id}
                          onClick={() =>
                            handleStatusChange(item.id, "BANNED", `Bekukan sementara toko "${item.storeName}"?`)
                          }
                          className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldAlert size={12} />
                          <span>Bekukan</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
