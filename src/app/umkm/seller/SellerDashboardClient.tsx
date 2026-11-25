"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Package, CheckCircle2, Truck, Printer, Banknote,
  Trash2, Eye, EyeOff, ShoppingBag, Loader2
} from "lucide-react";
import {
  addProduct,
  deleteProduct,
  updateProductBySeller,
  updateOrderStatusBySeller,
} from "@/app/actions/umkm";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
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

  const [activeTab, setActiveTab] = useState<"produk" | "pesanan" | "keuangan">(
    urlTab === "pesanan" ? "pesanan" : urlTab === "keuangan" ? "keuangan" : "produk"
  );
  const [isAdding, setIsAdding] = useState(urlAdd);

  useEffect(() => {
    if (urlTab === "pesanan" || urlTab === "keuangan" || urlTab === "produk") {
      setActiveTab(urlTab);
    }
    if (urlAdd) setIsAdding(true);
  }, [urlTab, urlAdd]);

  // Add product states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryName, setCategoryName] = useState("Kuliner & Snack");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    else router.refresh();
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
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Toko Terverifikasi ({store.status})
          </span>
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
          { key: "pesanan" as const, label: `Pesanan Masuk (${orders.length})${pendingOrderCount > 0 ? ` • ${pendingOrderCount} Aktif` : ""}` },
          { key: "keuangan" as const, label: `Keuangan & Omzet` },
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
                      <Link
                        href={`/umkm/orders/${ord.id}/receipt`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Printer size={13} /> Lihat Struk / Bon
                      </Link>

                      <div className="flex flex-wrap gap-2">
                        {ord.status === "UNPAID" && (
                          <button
                            onClick={() => handleOrderStatus(ord.id, "PAID", "Pembayaran dikonfirmasi penjual")}
                            disabled={busyId === ord.id}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                          >
                            {busyId === ord.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            <span>Konfirmasi Lunas</span>
                          </button>
                        )}
                        {(ord.status === "PAID" || (ord.status === "UNPAID" && meta.paymentMethod === "COD")) && (
                          <button
                            onClick={() =>
                              handleOrderStatus(
                                ord.id,
                                "SHIPPED",
                                meta.shippingMethod === "PICKUP"
                                  ? "Barang siap diambil di toko / BUMDes"
                                  : "Sedang diantar oleh Kurir Lokal Desa"
                              )
                            }
                            disabled={busyId === ord.id}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck size={13} />
                            <span>{meta.shippingMethod === "PICKUP" ? "Siap Diambil" : "Kirim Pesanan"}</span>
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
      </div>
    </div>
  );
}
