"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2, Clock, Package, Truck, MapPin, RefreshCw, Phone, Printer, ArrowLeft, ShieldCheck
} from "lucide-react";
import type { UmkmTrackingEvent } from "@/lib/umkmOrderMeta";

export function UmkmLiveTrackingClient({
  orderId,
  initialData,
}: {
  orderId: string;
  initialData: {
    status: string;
    storeName: string;
    invoiceNo: string;
    paymentStatus: string;
    paymentMethod: string;
    courierName: string;
    courierPhone: string;
    trackingNote: string;
    trackingEvents: UmkmTrackingEvent[];
  };
}) {
  const [data, setData] = useState(initialData);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("Baru saja");

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/umkm/orders/${orderId}/tracking`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch {}
    setSyncing(false);
  }, [orderId]);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("desa_cimanggu_umkm_sync");
        bc.onmessage = (ev) => {
          if (!ev?.data?.orderId || ev.data.orderId === orderId) {
            refresh();
          }
        };
      } catch {}
    }

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refresh();
      }
    }, 6000);

    return () => {
      if (bc) bc.close();
      clearInterval(timer);
    };
  }, [orderId, refresh]);

  const events = [...(data.trackingEvents || [])].reverse();
  const isPaid = data.paymentStatus === "SETTLED" || ["PAID", "SHIPPED", "COMPLETED"].includes(data.status);
  const isPacking = events.some((e) => e.step === "PACKING") || ["SHIPPED", "COMPLETED"].includes(data.status);
  const isShipped = data.status === "SHIPPED" || data.status === "COMPLETED";
  const isCompleted = data.status === "COMPLETED";

  const steps = [
    { label: "Order Dibuat", done: true, icon: Clock },
    { label: "Pembayaran Sah", done: isPaid, icon: ShieldCheck },
    { label: "Dikemas Toko", done: isPacking || isPaid, icon: Package },
    { label: "Dikirim Kurir", done: isShipped, icon: Truck },
    { label: "Tiba / Selesai", done: isCompleted, icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/umkm/orders" className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5">
          <ArrowLeft size={16} /> Kembali ke Pesanan
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Tracking • {lastSync}
          </span>
          <button
            onClick={refresh}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
            title="Sinkronkan Sekarang"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Header Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pelacakan Pengiriman Real-Time</span>
            <h1 className="font-mono text-base font-black">{data.invoiceNo}</h1>
            <p className="text-xs text-slate-300">{data.storeName}</p>
          </div>
          <Link
            href={`/umkm/orders/${orderId}/receipt`}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5"
          >
            <Printer size={14} /> Struk / Bon
          </Link>
        </div>

        {/* 5-Step Progress Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    s.done
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <s.icon size={18} />
                </div>
                <span className={`text-[10px] font-black leading-tight ${s.done ? "text-slate-900" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Kurir Jika Tersedia */}
        {(data.courierName || data.courierPhone) && (
          <div className="px-6 py-4 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-700 block">Kurir Pengantar</span>
                <p className="text-xs font-black text-slate-900">{data.courierName || "Kurir Lokal Desa"}</p>
              </div>
            </div>
            {data.courierPhone && (
              <a
                href={`https://wa.me/${data.courierPhone.replace(/^0/, "62").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5"
              >
                <Phone size={13} /> Hubungi Kurir ({data.courierPhone})
              </a>
            )}
          </div>
        )}

        {/* Timeline Log Perjalanan */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin size={14} className="text-blue-600" /> Log Perjalanan Barang
          </h2>

          {events.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">Menunggu pembaruan status dari penjual.</p>
          ) : (
            <div className="relative pl-5 border-l-2 border-slate-200 space-y-5">
              {events.map((ev, i) => (
                <div key={i} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      i === 0 ? "bg-blue-600 ring-4 ring-blue-100" : "bg-emerald-500"
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(ev.time).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{ev.note}</p>
                  <span className="text-[10px] font-semibold text-slate-400">Oleh: {ev.actor}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

