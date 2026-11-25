"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Package, CheckCircle2, Truck, Printer, Banknote,
  Trash2, Eye, EyeOff, ShoppingBag, Loader2, ShieldCheck, MapPin, Landmark
} from "lucide-react";
import {
  addProduct,
  deleteProduct,
  updateProductBySeller,
  updateOrderStatusBySeller,
  saveStorePayoutSettings,
  addOrderTrackingUpdate,
} from "@/app/actions/umkm";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
import { parseStoreMeta } from "@/lib/umkmStoreMeta";
import { UmkmSafeImage } from "@/components/umkm/UmkmSafeImage";

const CATEGORIES = [
  "Hasil Tani",
  "Kuliner & Snack",
  "Kopi Desa",
  "Kerajinan Bambu",
  "Batik & Fashion",
  "Madu & Herbal",
  "Produk BUMDes",
  "Olahan Sambal",
  "Sayur Segar",
  "Wisata Desa",
];

const formatRp = (val: number) => `Rp ${Math.round(val || 0).toLocaleString("id-ID")}`;

function broadcastOrderSync(orderId?: string) {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel("desa_cimanggu_umkm_sync");
      bc.postMessage({ orderId, ts: Date.now() });
      bc.close();
    } catch {}
  }
}

export default function SellerDashboardClient({
  store,
  products,
  orders,
}: {
  store: any;
  products: any[];
  orders: any[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get("tab") || "produk";
  const urlAdd = searchParams.get("add") === "1";

  const [activeTab, setActiveTab] = useState<"produk" | "pesanan" | "keuangan" | "rekening">(
    urlTab === "pesanan" || urlTab === "keuangan" || urlTab === "rekening" ? urlTab : "produk"
  );
  const [isAdding, setIsAdding] = useState(urlAdd);

  useEffect(() => {
    if (urlTab === "pesanan" || urlTab === "keuangan" || urlTab === "produk" || urlTab === "rekening") {
      setActiveTab(urlTab);
    }
    if (urlAdd) setIsAdding(true);
  }, [urlTab, urlAdd]);

  // Real-time auto-refresh untuk pesanan masuk baru setiap 15 detik saat tab aktif
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        router.refresh();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);

  // Add product states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryName, setCategoryName] = useState("Kuliner & Snack");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Payout / Rekening & QRIS states
  const existingPayout = parseStoreMeta(store.banner);
  const [bankName, setBankName] = useState(existingPayout.bankName || "BRI");
  const [accountNumber, setAccountNumber] = useState(existingPayout.accountNumber || "");
  const [accountHolder, setAccountHolder] = useState(existingPayout.accountHolder || "");
  const [qrisImageUrl, setQrisImageUrl] = useState(existingPayout.qrisImageUrl || "");
  const [storePhone, setStorePhone] = useState(existingPayout.storePhone || "");
  const [savingPayout, setSavingPayout] = useState(false);

  // Live Tracking Modal state
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [trackStep, setTrackStep] = useState<"PACKING" | "SHIPPED" | "DELIVERED">("SHIPPED");
  const [trackTitle, setTrackTitle] = useState("Pesanan Dalam Perjalanan Kurir Desa");
  const [trackNote, setTrackNote] = useState("");
  const [courierName, setCourierName] = useState("");
  const [courierPhone, setCourierPhone] = useState("");

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await addProduct(store.id, {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      categoryName,
      images: image.trim() ? [image.trim()] : [],
    });
    setLoading(false);
    if (res.success) {
      setIsAdding(false);
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage("");
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayout(true);
    const res = await saveStorePayoutSettings(store.id, {
      bankName,
      accountNumber,
      accountHolder,
      qrisImageUrl,
      storePhone,
    });
    setSavingPayout(false);
    if (res.success) {
      alert("Data Rekening & QRIS toko disimpan! Status: Menunggu Verifikasi Keamanan oleh BUMDes/Admin.");
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus produk ini secara permanen?")) {
      setBusyId(id);
      await deleteProduct(id);
      setBusyId(null);
      router.refresh();
    }
  };

  const handleToggleProduct = async (prod: any) => {
    setBusyId(prod.id);
    await updateProductBySeller(prod.id, {
      status: prod.status === "LIVE" ? "HIDDEN" : "LIVE",
    });
    setBusyId(null);
    router.refresh();
  };

  const handleAdjustStock = async (prod: any, delta: number) => {
    setBusyId(prod.id);
    await updateProductBySeller(prod.id, {
      stock: Math.max(0, (prod.stock || 0) + delta),
    });
    setBusyId(null);
    router.refresh();
  };

  const handleOrderStatus = async (
    orderId: string,
    nextStatus: "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED",
    note?: string
  ) => {
    setBusyId(orderId);
    const res = await updateOrderStatusBySeller(orderId, nextStatus, note);
    setBusyId(null);
    if (!res.success) alert(res.error);
    else {
      broadcastOrderSync(orderId);
      router.refresh();
    }
  };

  const handleSendTrackingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrder) return;
    setBusyId(trackingOrder.id);
    const res = await addOrderTrackingUpdate(trackingOrder.id, {
      step: trackStep,
      title: trackTitle,
      note: trackNote || trackTitle,
      courierName,
      courierPhone,
    });
    setBusyId(null);
    if (!res.success) {
      alert(res.error);
    } else {
      broadcastOrderSync(trackingOrder.id);
      setTrackingOrder(null);
      setTrackNote("");
      router.refresh();
    }
  };

  const settledOrders = orders.filter((o) =>
    ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)
  );
  const totalOmzet = settledOrders.reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrderCount = orders.filter((o) => o.status === "UNPAID" || o.status === "PAID").length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Toko */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Toko Terverifikasi ({store.status})
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                existingPayout.payoutStatus === "VERIFIED"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              Rekening/QRIS: {existingPayout.payoutStatus}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">{store.storeName}</h1>
        </div>
        <button
          onClick={() => {
            setActiveTab("produk");
            setIsAdding(!isAdding);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-black text-xs cursor-pointer shadow-md shadow-blue-600/20"
        >
          <Plus size={16} /> {isAdding ? "Tutup Form" : "Tambah Produk Baru"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-4 gap-2 overflow-x-auto">
        {[
          { key: "produk" as const, label: `Produk (${products.length})` },
          {
            key: "pesanan" as const,
            label: `Pesanan Masuk (${orders.length})${pendingOrderCount > 0 ? ` • ${pendingOrderCount} Aktif` : ""}`,
          },
          { key: "keuangan" as const, label: `Keuangan & Omzet` },
          { key: "rekening" as const, label: `Rekening & QRIS Toko` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3.5 text-xs font-black transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === t.key
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-blue-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6 flex-1 bg-slate-50/50 space-y-6">
        {/* TAB 1: PRODUK */}
        {activeTab === "produk" && (
          <>
            {isAdding && (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <h2 className="text-base font-black text-slate-900 mb-4">Tambah Produk Baru</h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Nama Produk *</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Kategori Produk *</label>
                      <select
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Harga (Rp) *</label>
                      <input
                        type="number"
                        min={100}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Stok Awal *</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">URL Gambar Produk (Opsional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi Produk *</label>
                      <textarea
                        className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                        rows={3}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl bg-white overflow-x-auto shadow-xs">
              <table className="w-full text-left min-w-[780px]">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-4">Produk</th>
                    <th className="p-4 text-center">Harga</th>
                    <th className="p-4 text-center">Stok</th>
                    <th className="p-4 text-center">Terjual</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400">
                        <Package size={44} className="mx-auto mb-3 opacity-40" />
                        <p className="font-bold">Belum ada produk di etalase toko Anda</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => {
                      let imgUrl = "";
                      try {
                        imgUrl = JSON.parse(prod.images)[0] || "";
                      } catch {}
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/70">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <UmkmSafeImage src={imgUrl} alt={prod.name} className="w-12 h-12 object-cover border rounded-xl shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate max-w-[260px]">{prod.name}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{prod.category?.name || "Umum"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-black text-blue-700">{formatRp(prod.price)}</td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                              <button
                                onClick={() => handleAdjustStock(prod, -1)}
                                disabled={busyId === prod.id}
                                className="px-1.5 font-black text-slate-600 hover:text-rose-600 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-black text-slate-900 min-w-[22px]">{prod.stock}</span>
                              <button
                                onClick={() => handleAdjustStock(prod, 1)}
                                disabled={busyId === prod.id}
                                className="px-1.5 font-black text-slate-600 hover:text-emerald-600 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-700">{prod.sold}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleProduct(prod)}
                              disabled={busyId === prod.id}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 cursor-pointer ${
                                prod.status === "LIVE"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {prod.status === "LIVE" ? <Eye size={11} /> : <EyeOff size={11} />}
                              <span>{prod.status}</span>
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDelete(prod.id)}
                              disabled={busyId === prod.id}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: PESANAN MASUK */}
        {activeTab === "pesanan" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-14 border border-slate-200 text-center text-slate-400">
                <ShoppingBag size={44} className="mx-auto mb-3 opacity-40" />
                <p className="font-bold">Belum ada pesanan masuk ke toko Anda.</p>
              </div>
            ) : (
              orders.map((ord) => {
                const meta = parseOrderMeta(ord.address, ord.totalAmount);
                return (
                  <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-xs font-black text-slate-900">{meta.invoiceNo}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          • {new Date(ord.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                          {meta.paymentMethod} ({meta.paymentChannel})
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700"
                              : ord.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-700"
                                : ord.status === "PAID"
                                  ? "bg-teal-100 text-teal-700"
                                  : ord.status === "CANCELLED"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {meta.paymentStatus === "AWAITING_VERIFICATION" && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 font-bold flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Pembeli ({meta.paymentSenderName}) telah mengirim bukti transfer! Cek mutasi rekening/QRIS Anda lalu klik &quot;Verifikasi Lunas&quot;.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">
                          Pembeli: {meta.recipientName || ord.buyer?.fullName || "-"} ({meta.phone})
                        </p>
                        <p className="text-slate-600">{meta.addressText}</p>
                        {meta.notes && <p className="text-amber-700 font-semibold">Catatan: {meta.notes}</p>}
                      </div>
                      <div className="space-y-1">
                        {ord.items?.map((it: any) => (
                          <div key={it.id} className="flex justify-between text-slate-700">
                            <span>{it.product?.name} x{it.quantity}</span>
                            <span className="font-bold">{formatRp(it.price * it.quantity)}</span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-slate-100 flex justify-between font-black text-blue-700">
                          <span>Total Tagihan</span>
                          <span>{formatRp(ord.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/umkm/orders/${ord.id}/receipt`}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Printer size={13} /> Struk / Bon
                        </Link>
                        <Link
                          href={`/umkm/orders/${ord.id}/tracking`}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                        >
                          <MapPin size={13} /> Lacak
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ord.status === "UNPAID" && (
                          <button
                            onClick={() => handleOrderStatus(ord.id, "PAID", "Pembayaran dikonfirmasi sah oleh pemilik toko")}
                            disabled={busyId === ord.id}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                          >
                            {busyId === ord.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            <span>Verifikasi Lunas</span>
                          </button>
                        )}
                        {ord.status !== "CANCELLED" && ord.status !== "COMPLETED" && (
                          <button
                            onClick={() => {
                              setTrackingOrder(ord);
                              setCourierName(meta.courierName || "");
                              setCourierPhone(meta.courierPhone || "");
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck size={13} />
                            <span>Update Tracking Kurir</span>
                          </button>
                        )}
                        {ord.status === "SHIPPED" && (
                          <button
                            onClick={() => handleOrderStatus(ord.id, "COMPLETED", "Pesanan selesai & diterima")}
                            disabled={busyId === ord.id}
                            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black cursor-pointer"
                          >
                            Tandai Selesai
                          </button>
                        )}
                        {(ord.status === "UNPAID" || ord.status === "PAID") && (
                          <button
                            onClick={() => {
                              if (confirm("Batalkan pesanan ini dan kembalikan stok produk?")) {
                                handleOrderStatus(ord.id, "CANCELLED", "Dibatalkan oleh toko");
                              }
                            }}
                            disabled={busyId === ord.id}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer"
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: KEUANGAN & OMZET */}
        {activeTab === "keuangan" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Omzet Terkonfirmasi</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">{formatRp(totalOmzet)}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Pesanan Lunas / Selesai</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">{settledOrders.length} Order</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Item Terjual</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {products.reduce((s, p) => s + (p.sold || 0), 0)} Pcs
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Banknote size={17} className="text-emerald-600" /> Riwayat Pembayaran Masuk
              </h3>
              {settledOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada pembayaran yang selesai.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {settledOrders.map((ord) => {
                    const meta = parseOrderMeta(ord.address, ord.totalAmount);
                    return (
                      <div key={ord.id} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-black text-slate-800">{meta.invoiceNo}</span>
                          <span className="text-slate-500 ml-2">• {meta.paymentMethod} ({meta.paymentChannel})</span>
                        </div>
                        <span className="font-black text-emerald-700">+{formatRp(ord.totalAmount)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REKENING BANK & QRIS MILIK TOKO (KYC KEAMANAN) */}
        {activeTab === "rekening" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 max-w-2xl">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Landmark size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Rekening Bank &amp; QRIS Pemilik Toko</h2>
                  <p className="text-xs text-slate-500">
                    Pembayaran pembeli akan masuk ke rekening/QRIS ini setelah diverifikasi BUMDes/Admin Desa.
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  existingPayout.payoutStatus === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-700"
                    : existingPayout.payoutStatus === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {existingPayout.payoutStatus}
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldCheck size={17} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Keamanan Keuangan:</strong> Demi mencegah penipuan, nama pemilik rekening harus sesuai dengan identitas pelaku UMKM terdaftar. Setiap perubahan data akan diverifikasi ulang oleh BUMDes.
              </span>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Bank *</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white"
                  >
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="BCA">Bank BCA</option>
                    <option value="BJB">Bank BJB</option>
                    <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Contoh: 012301004567501"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Pemilik Rekening (Sesuai Buku Tabungan) *</label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Nama lengkap pemilik rekening"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">No. WhatsApp Toko / Kurir</label>
                  <input
                    type="tel"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">URL Gambar QRIS Toko (Opsional)</label>
                <input
                  type="text"
                  value={qrisImageUrl}
                  onChange={(e) => setQrisImageUrl(e.target.value)}
                  placeholder="https://... (Link gambar QRIS merchant Anda)"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={savingPayout}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black cursor-pointer disabled:opacity-50"
              >
                {savingPayout ? "Menyimpan..." : "Simpan & Ajukan Verifikasi Keamanan"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* MODAL UPDATE LIVE TRACKING KURIR */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSendTrackingUpdate}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <h3 className="text-base font-black text-slate-900">Update Pelacakan Barang Real-Time</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tahap Pengiriman</label>
              <select
                value={trackStep}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setTrackStep(val);
                  if (val === "PACKING") setTrackTitle("Pesanan Sedang Dikemas Toko");
                  if (val === "SHIPPED") setTrackTitle("Pesanan Dalam Perjalanan Kurir Desa");
                  if (val === "DELIVERED") setTrackTitle("Pesanan Tiba di Alamat Tujuan");
                }}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold bg-white"
              >
                <option value="PACKING">Dikemas oleh Toko</option>
                <option value="SHIPPED">Dikirim oleh Kurir Desa</option>
                <option value="DELIVERED">Sudah Tiba / Selesai</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kurir</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Contoh: Pak Budi"
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">No. WA Kurir</label>
                <input
                  type="tel"
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Keterangan Posisi Barang *</label>
              <textarea
                rows={2}
                required
                value={trackNote}
                onChange={(e) => setTrackNote(e.target.value)}
                placeholder="Contoh: Kurir berangkat menuju Kp. Cimanggu RT 002/RW 009"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busyId === trackingOrder.id}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer"
              >
                {busyId === trackingOrder.id ? "Mengirim..." : "Kirim Update Live"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
