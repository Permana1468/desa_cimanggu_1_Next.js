"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { confirmOrderReceivedByBuyer } from "@/app/actions/umkm";

export function UmkmOrderActions({
  orderId,
  status,
  paymentMethod,
}: {
  orderId: string;
  status: string;
  paymentMethod: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerifyPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/umkm/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "verify" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || data.error || "Pembayaran belum terdeteksi.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal memverifikasi pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!confirm("Konfirmasi bahwa pesanan telah Anda terima dengan baik?")) return;
    setLoading(true);
    try {
      const res = await confirmOrderReceivedByBuyer(orderId);
      if (!res.success) alert(res.error);
      else router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "UNPAID" && paymentMethod !== "COD" && (
        <button
          onClick={handleVerifyPayment}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          <span>Verifikasi Bayar</span>
        </button>
      )}

      {status === "SHIPPED" && (
        <button
          onClick={handleConfirmReceived}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <PackageCheck size={13} />}
          <span>Pesanan Diterima</span>
        </button>
      )}
    </div>
  );
}

