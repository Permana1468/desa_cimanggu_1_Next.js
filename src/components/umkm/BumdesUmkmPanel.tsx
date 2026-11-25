"use client";

import { useEffect, useState, useCallback } from "react";
import { Store, CheckCircle2, XCircle, Loader2, RefreshCw, Printer } from "lucide-react";
import Link from "next/link";
import { getBumdesUmkmOverview, updateUmkmStoreStatus } from "@/app/actions/umkm";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";

const formatRp = (val: number) => `Rp ${Math.round(val || 0).toLocaleString("id-ID")}`;

export function BumdesUmkmPanel({ canEdit }: { canEdit: boolean }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBumdesUmkmOverview();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStoreAction = async (storeId: string, status: "APPROVED" | "REJECTED") => {
    setBusyId(storeId);
    const res = await updateUmkmStoreStatus(storeId, status);
    setBusyId(null);
    if (!res.success) alert(res.error);
    else await load();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/70 shadow-sm flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-xs font-bold text-slate-500">Memuat Monitoring Marketplace UMKM...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-[3rem] p-8 sm:p-10 shadow-sm border border-slate-200/60 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Store size={24} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Ekosistem Marketplace UMKM (DesaMart)
            </h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">
              Kurasi toko UMKM warga &amp; pantau transaksi real-time bersama pengelola BUMDes.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} /> Sinkronkan
        </button>
      </div>

      {/* Ringkasan KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Toko UMKM</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{data.totalStores}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <span className="text-[10px] font-black uppercase text-amber-700">Menunggu Verifikasi</span>
          <span className="text-2xl font-black text-amber-800 block mt-1">{data.pendingStores}</span>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
          <span className="text-[10px] font-black uppercase text-blue-700">Produk Live</span>
          <span className="text-2xl font-black text-blue-800 block mt-1">{data.totalProducts}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <span className="text-[10px] font-black uppercase text-emerald-700">Omzet Terverifikasi</span>
          <span className="text-xl font-black text-emerald-800 block mt-1">{formatRp(data.grossOmzet)}</span>
        </div>
      </div>

      {/* Daftar Toko & Kurasi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-black text-slate-800">Daftar Toko UMKM Desa</h4>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {data.stores.map((s: any) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{s.storeName}</p>
                  <p className="text-slate-500">
                    {s.user?.fullName || "-"} • {s._count?.products || 0} Produk • {s._count?.orders || 0} Order
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      s.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {s.status}
                  </span>
                  {canEdit && s.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStoreAction(s.id, "APPROVED")}
                        disabled={busyId === s.id}
                        className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                        title="Setujui Toko"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        onClick={() => handleStoreAction(s.id, "REJECTED")}
                        disabled={busyId === s.id}
                        className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                        title="Tolak Toko"
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi Marketplace Terbaru */}
        <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-black text-slate-800">Pesanan Marketplace Terbaru</h4>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi marketplace.</p>
            ) : (
              data.recentOrders.map((ord: any) => {
                const meta = parseOrderMeta(ord.address, ord.totalAmount);
                return (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-mono font-bold text-slate-900">{meta.invoiceNo}</p>
                      <p className="text-slate-500">
                        {ord.store?.storeName} • {meta.paymentMethod} ({ord.status})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-blue-700">{formatRp(ord.totalAmount)}</span>
                      <Link
                        href={`/umkm/orders/${ord.id}/receipt`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Lihat Struk"
                      >
                        <Printer size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

