"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";
import {
  ArrowLeft, MapPin, CheckCircle2, QrCode, Building2, Truck,
  ShieldCheck, Printer, Copy, Loader2, Wallet, CreditCard
} from "lucide-react";
import { createSecureCheckout, submitManualPaymentProof } from "@/app/actions/umkm";
import { UmkmSafeImage } from "@/components/umkm/UmkmSafeImage";
import { UmkmQrImage } from "@/components/umkm/UmkmQrImage";

const formatRp = (val: number) => `Rp ${Math.round(val || 0).toLocaleString("id-ID")}`;

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressText, setAddressText] = useState("");
  const [notes, setNotes] = useState("");

  const [shippingMethod, setShippingMethod] = useState<"KURIR_DESA" | "PICKUP">("KURIR_DESA");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "BANK_VA" | "COD">("QRIS");
  const [bankChannel, setBankChannel] = useState<"BRI" | "BNI" | "MANDIRI" | "BCA">("BRI");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdOrders, setCreatedOrders] = useState<any[] | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [paidOrderIds, setPaidOrderIds] = useState<Record<string, boolean>>({});
  const [awaitingVerifyIds, setAwaitingVerifyIds] = useState<Record<string, boolean>>({});
  const [senderNameMap, setSenderNameMap] = useState<Record<string, string>>({});
  const [proofNoteMap, setProofNoteMap] = useState<Record<string, string>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Kalkulasi pratinjau identik dengan C++ Native Ledger Engine (umkm_ledger)
  const storeCount = useMemo(() => {
    return new Set(cart.map((c) => c.storeId)).size || 1;
  }, [cart]);

  const previewCalc = useMemo(() => {
    const subtotal = Math.round(totalAmount);
    const shippingFee =
      shippingMethod === "KURIR_DESA" && subtotal > 0 && subtotal < 100000
        ? 5000 * storeCount
        : 0;
    const base = subtotal + shippingFee;
    let adminFee = 0;
    if (paymentMethod === "QRIS" && base > 0) {
      adminFee = Math.floor((base * 7 + 999) / 1000);
    } else if (paymentMethod === "BANK_VA" && base > 0) {
      adminFee = 4000 * storeCount;
    }
    return {
      subtotal,
      shippingFee,
      adminFee,
      grandTotal: base + adminFee,
    };
  }, [totalAmount, shippingMethod, paymentMethod, storeCount]);

  const handleCheckout = async () => {
    setErrorMsg("");
    if (!recipientName.trim() || !phone.trim() || !addressText.trim()) {
      setErrorMsg("Mohon lengkapi Nama Penerima, Nomor WhatsApp, dan Alamat lengkap (RT/RW).");
      return;
    }

    setLoading(true);
    try {
      const res = await createSecureCheckout({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        addressText: addressText.trim(),
        notes: notes.trim(),
        shippingMethod,
        paymentMethod,
        paymentChannel:
          paymentMethod === "QRIS"
            ? "QRIS_NASIONAL"
            : paymentMethod === "BANK_VA"
              ? bankChannel
              : "COD",
        items: cart.map((c) => ({ productId: c.id, quantity: c.quantity })),
      });

      if (!res.success || !res.orders) {
        setErrorMsg(res.error || "Gagal memproses pesanan.");
        setLoading(false);
        return;
      }

      setCreatedOrders(res.orders);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    setVerifyingId(orderId);
    setErrorMsg("");
    try {
      const res = await fetch("/api/umkm/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "verify" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || data.error || "Pembayaran belum terdeteksi.");
        return;
      }
      setPaidOrderIds((prev) => ({ ...prev, [orderId]: true }));
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memverifikasi pembayaran.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSubmitDirectProof = async (orderId: string) => {
    const sender = senderNameMap[orderId] || recipientName;
    if (!sender.trim()) {
      setErrorMsg("Mohon isi nama pengirim transfer/e-wallet.");
      return;
    }
    setVerifyingId(orderId);
    setErrorMsg("");
    try {
      const res = await submitManualPaymentProof(orderId, {
        senderName: sender.trim(),
        note: proofNoteMap[orderId] || "",
      });
      if (!res.success) {
        setErrorMsg(res.error || "Gagal mengirim konfirmasi transfer.");
      } else {
        setAwaitingVerifyIds((prev) => ({ ...prev, [orderId]: true }));
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(txt);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Tampilan Setelah Checkout Berhasil -> Instruksi Bayar QRIS / VA / COD + Tombol Struk Resmi
  if (createdOrders && createdOrders.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Pesanan Berhasil Dibuat!</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Total telah diverifikasi secara presisi oleh Mesin Kalkulasi Keamanan DesaMart ({createdOrders[0]?.meta?.engineMode || "CPP_NATIVE"}).
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {createdOrders.map((ord) => {
            const isPaid = paidOrderIds[ord.id] || ord.status === "PAID";
            const isAwaiting = awaitingVerifyIds[ord.id];
            const meta = ord.meta;
            const isDirectMerchant = meta.gatewayProvider === "DIRECT_MERCHANT" && meta.storeBankInfo;

            return (
              <div key={ord.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Invoice Resmi</span>
                    <span className="font-mono font-black text-sm">{meta.invoiceNo}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                      isPaid
                        ? "bg-emerald-500 text-white"
                        : isAwaiting
                          ? "bg-indigo-500 text-white"
                          : meta.paymentMethod === "COD"
                            ? "bg-blue-500 text-white"
                            : "bg-amber-400 text-slate-950"
                    }`}
                  >
                    {isPaid
                      ? "LUNAS (PAID)"
                      : isAwaiting
                        ? "MENUNGGU VERIFIKASI PENJUAL"
                        : meta.paymentMethod === "COD"
                          ? "COD - MENUNGGU KURIR"
                          : "MENUNGGU PEMBAYARAN"}
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Toko: <strong className="text-slate-900">{ord.storeName}</strong></span>
                    <span className="text-lg font-black text-blue-700">{formatRp(ord.totalAmount)}</span>
                  </div>

                  {/* Direct Merchant Bank / QRIS Milik Pemilik Toko */}
                  {!isPaid && !isAwaiting && isDirectMerchant && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-800 uppercase">
                          Rekening / QRIS Resmi Pemilik Toko (Terverifikasi BUMDes)
                        </span>
                      </div>
                      {meta.paymentMethod === "QRIS" && meta.storeBankInfo.qrisImageUrl ? (
                        <div className="bg-white p-3 rounded-2xl border border-emerald-200 flex flex-col items-center">
                          <img src={meta.storeBankInfo.qrisImageUrl} alt="QRIS Toko" className="w-48 h-48 object-contain" />
                          <p className="text-[11px] font-bold text-slate-600 mt-2">
                            a.n. {meta.storeBankInfo.accountHolder}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1">
                          <span className="text-xs font-black text-slate-500">{meta.storeBankInfo.bankName}</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-lg font-black text-slate-900">{meta.storeBankInfo.accountNumber}</span>
                            <button
                              onClick={() => handleCopy(meta.storeBankInfo.accountNumber)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              Salin
                            </button>
                          </div>
                          <span className="text-xs font-bold text-slate-700 block">a.n. {meta.storeBankInfo.accountHolder}</span>
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t border-emerald-200/70">
                        <input
                          type="text"
                          placeholder="Nama Pengirim di Rekening / e-Wallet"
                          value={senderNameMap[ord.id] ?? recipientName}
                          onChange={(e) => setSenderNameMap((p) => ({ ...p, [ord.id]: e.target.value }))}
                          className="w-full border border-emerald-300 bg-white rounded-xl px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Catatan / No. Referensi Transfer (Opsional)"
                          value={proofNoteMap[ord.id] ?? ""}
                          onChange={(e) => setProofNoteMap((p) => ({ ...p, [ord.id]: e.target.value }))}
                          className="w-full border border-emerald-300 bg-white rounded-xl px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleSubmitDirectProof(ord.id)}
                          disabled={verifyingId === ord.id}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"
                        >
                          {verifyingId === ord.id ? "Mengirim..." : "Kirim Konfirmasi Transfer ke Penjual"}
                        </button>
                      </div>
                    </div>
                  )}

                  {isAwaiting && !isPaid && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-800 font-bold">
                      Konfirmasi transfer telah dikirim ke pemilik toko. Penjual sedang mengecek mutasi masuk untuk menerbitkan status LUNAS.
                    </div>
                  )}

                  {/* QRIS Display */}
                  {!isPaid && !isDirectMerchant && meta.paymentMethod === "QRIS" && meta.qrisPayload && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        Scan QRIS Nasional ({meta.gatewayProvider})
                      </span>
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                        <UmkmQrImage value={meta.qrisPayload} size={190} alt="QRIS DesaMart" />
                      </div>
                      <p className="text-xs text-slate-600 max-w-sm">
                        Scan menggunakan GoPay, OVO, DANA, ShopeePay, BCA/BRI/Mandiri Mobile lalu klik tombol verifikasi di bawah.
                      </p>
                      <button
                        onClick={() => handleVerifyPayment(ord.id)}
                        disabled={verifyingId === ord.id}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifyingId === ord.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        <span>Saya Sudah Bayar • Verifikasi Sekarang</span>
                      </button>
                    </div>
                  )}

                  {/* Virtual Account Bank Display */}
                  {!isPaid && !isDirectMerchant && meta.paymentMethod === "BANK_VA" && meta.vaNumber && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-800 uppercase">
                          Virtual Account {meta.paymentChannel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{meta.gatewayProvider}</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                        <span className="font-mono text-lg sm:text-xl font-black text-slate-900 tracking-wider">
                          {meta.vaNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(meta.vaNumber)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy size={13} />
                          <span>{copiedText === meta.vaNumber ? "Disalin!" : "Salin VA"}</span>
                        </button>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {ord.instructions?.map((ins: string, idx: number) => (
                          <li key={idx}>{ins}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleVerifyPayment(ord.id)}
                        disabled={verifyingId === ord.id}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifyingId === ord.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        <span>Konfirmasi Transfer &amp; Terbitkan Struk Lunas</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons -> Cetak Struk / Bon Resmi */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                    <Link
                      href={`/umkm/orders/${ord.id}/tracking`}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2"
                    >
                      <MapPin size={15} />
                      <span>Lacak Barang (Live)</span>
                    </Link>
                    <Link
                      href={`/umkm/orders/${ord.id}/receipt`}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2"
                    >
                      <Printer size={15} />
                      <span>Cetak Struk / Bon Resmi</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="text-center">
            <Link href="/umkm" className="text-sm font-bold text-blue-600 hover:underline">
              ← Kembali Belanja di DesaMart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-4">
        <p className="font-bold text-slate-600">Keranjang belanja Anda masih kosong.</p>
        <Link href="/umkm" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm">
          Kembali ke Katalog UMKM
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
          <Link href="/umkm/cart" className="text-slate-600 hover:text-blue-600">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-lg font-black text-slate-900">Checkout &amp; Pembayaran Aman</h1>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <ShieldCheck size={13} /> Proteksi Kalkulasi C++
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* KIRI (2 KOLOM): FORM PENGIRIMAN & METODE BAYAR */}
        <div className="lg:col-span-2 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* 1. Alamat & Penerima */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
              <MapPin size={18} />
              <h2>Data Penerima &amp; Pengiriman</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Penerima *</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama lengkap penerima"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">No. HP / WhatsApp *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap (RT / RW / Kampung / Patokan) *</label>
              <textarea
                rows={2}
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Contoh: Kp. Cimanggu RT 001 / RW 009, dekat Posyandu Mawar"
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Catatan untuk Penjual (Opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Bungkus terpisah, antar sore hari"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
              />
            </div>
          </div>

          {/* 2. Metode Pengiriman */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Truck size={18} className="text-blue-600" />
              <h2>Opsi Pengiriman</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShippingMethod("KURIR_DESA")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  shippingMethod === "KURIR_DESA"
                    ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-black text-xs text-slate-900 flex justify-between">
                  <span>Kurir Lokal Desa Cimanggu I</span>
                  <span className="text-blue-700">
                    {totalAmount >= 100000 ? "GRATIS" : "Rp 5.000"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Gratis ongkir untuk belanja minimal Rp 100.000</p>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod("PICKUP")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  shippingMethod === "PICKUP"
                    ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-black text-xs text-slate-900 flex justify-between">
                  <span>Ambil di Toko / Outlet BUMDes</span>
                  <span className="text-emerald-700">GRATIS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Ambil langsung ke pelaku UMKM tanpa biaya kirim</p>
              </button>
            </div>
          </div>

          {/* 3. Metode Pembayaran */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <CreditCard size={18} className="text-blue-600" />
              <h2>Metode Pembayaran</h2>
            </div>

            <div className="space-y-2.5">
              <label
                onClick={() => setPaymentMethod("QRIS")}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "QRIS" ? "border-blue-600 bg-blue-50/70" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <QrCode size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between font-black text-xs text-slate-900">
                    <span>QRIS Nasional (Semua e-Wallet &amp; m-Banking)</span>
                    <span className="text-slate-500">Biaya 0.7%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">GoPay, OVO, DANA, ShopeePay, LinkAja, BCA/BRI/Mandiri Mobile</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("BANK_VA")}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "BANK_VA" ? "border-blue-600 bg-blue-50/70" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Building2 size={20} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between font-black text-xs text-slate-900">
                    <span>Transfer Bank (Virtual Account Otomatis)</span>
                    <span className="text-slate-500">Admin Rp 4.000</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Verifikasi otomatis via Virtual Account Bank Nasional</p>
                  {paymentMethod === "BANK_VA" && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {(["BRI", "BNI", "MANDIRI", "BCA"] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBankChannel(b);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                            bankChannel === b
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-700 border-slate-300"
                          }`}
                        >
                          Bank {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("COD")}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "COD" ? "border-blue-600 bg-blue-50/70" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Wallet size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between font-black text-xs text-slate-900">
                    <span>Bayar di Tempat (COD / Tunai BUMDes)</span>
                    <span className="text-emerald-700">Gratis Admin</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bayar tunai saat barang tiba atau diambil langsung</p>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Produk Dipesan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="font-black text-sm text-slate-900 mb-3">Rincian Produk ({cart.length} jenis)</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <UmkmSafeImage src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                    {item.storeName && <p className="text-[10px] text-slate-400 font-semibold">{item.storeName}</p>}
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="text-slate-500">{item.quantity} x {formatRp(item.price)}</span>
                      <span className="font-black text-slate-800">{formatRp(item.quantity * item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KANAN: RINGKASAN & TOMBOL BUAT PESANAN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-20 space-y-4">
          <h2 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3">Ringkasan Tagihan</h2>
          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal Produk</span>
              <span className="font-bold text-slate-900">{formatRp(previewCalc.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim ({shippingMethod === "KURIR_DESA" ? "Kurir Desa" : "Ambil Sendiri"})</span>
              <span className="font-bold text-slate-900">{formatRp(previewCalc.shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan Pembayaran</span>
              <span className="font-bold text-slate-900">{formatRp(previewCalc.adminFee)}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
            <span className="font-black text-sm text-slate-900">Total Bayar</span>
            <span className="font-black text-xl text-blue-700">{formatRp(previewCalc.grandTotal)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>{loading ? "Memvalidasi Stok & Harga..." : "Buat Pesanan & Bayar"}</span>
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Harga &amp; ketersediaan stok divalidasi langsung oleh database + Engine C++ anti-manipulasi. Struk resmi diterbitkan otomatis.
          </p>
        </div>
      </main>
    </div>
  );
}
