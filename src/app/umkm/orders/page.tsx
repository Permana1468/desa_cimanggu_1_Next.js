import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, ShoppingBag, Receipt, QrCode, Building2, Wallet } from "lucide-react";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
import { UmkmOrderActions } from "@/components/umkm/UmkmOrderActions";
import { UmkmQrImage } from "@/components/umkm/UmkmQrImage";

const formatRp = (val: number) => `Rp ${Math.round(val || 0).toLocaleString("id-ID")}`;

export default async function BuyerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/umkm/login");
  }

  const buyerId = (session.user as any).id;
  const orders = await prisma.umkmOrder.findMany({
    where: { buyerId },
    include: {
      store: { select: { storeName: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/umkm" className="text-slate-600 hover:text-blue-600">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" /> Pesanan &amp; Struk Saya
            </h1>
          </div>
          <Link href="/umkm" className="text-xs font-bold text-blue-600 hover:underline">
            Belanja Lagi
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4 mt-2">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <ShoppingBag size={48} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">Belum ada riwayat pesanan.</p>
            <Link href="/umkm" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black">
              Jelajahi Produk UMKM
            </Link>
          </div>
        ) : (
          orders.map((ord) => {
            const meta = parseOrderMeta(ord.address, ord.totalAmount);
            const statusLabel =
              ord.status === "COMPLETED"
                ? { text: "SELESAI", cls: "bg-emerald-100 text-emerald-700" }
                : ord.status === "SHIPPED"
                  ? { text: "DALAM PENGIRIMAN", cls: "bg-blue-100 text-blue-700" }
                  : ord.status === "PAID"
                    ? { text: "DIBAYAR (DIKEMAS)", cls: "bg-teal-100 text-teal-700" }
                    : ord.status === "CANCELLED"
                      ? { text: "DIBATALKAN", cls: "bg-rose-100 text-rose-700" }
                      : meta.paymentMethod === "COD"
                        ? { text: "COD (SIAP DIKIRIM)", cls: "bg-amber-100 text-amber-800" }
                        : { text: "MENUNGGU PEMBAYARAN", cls: "bg-amber-100 text-amber-800" };

            return (
              <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-800">{meta.invoiceNo}</span>
                    <span className="text-xs font-bold text-slate-500">• {ord.store.storeName}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusLabel.cls}`}>
                    {statusLabel.text}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="divide-y divide-slate-100">
                    {ord.items.map((it) => (
                      <div key={it.id} className="py-2 flex justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {it.product.name} <span className="text-slate-400">x{it.quantity}</span>
                        </span>
                        <span className="font-bold text-slate-900">{formatRp(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Instruksi bayar ringkas jika UNPAID dan non-COD */}
                  {ord.status === "UNPAID" && meta.paymentMethod === "QRIS" && meta.qrisPayload && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-4">
                      <UmkmQrImage value={meta.qrisPayload} size={84} alt="QRIS" />
                      <div className="text-xs space-y-1">
                        <p className="font-black text-slate-900 flex items-center gap-1">
                          <QrCode size={14} className="text-blue-600" /> Bayar dengan QRIS
                        </p>
                        <p className="text-slate-500">Scan kode QR di samping lalu klik &quot;Verifikasi Bayar&quot;.</p>
                      </div>
                    </div>
                  )}

                  {ord.status === "UNPAID" && meta.paymentMethod === "BANK_VA" && meta.vaNumber && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
                      <p className="font-black text-blue-900 flex items-center gap-1">
                        <Building2 size={14} /> Virtual Account {meta.paymentChannel}
                      </p>
                      <p className="font-mono font-black text-base text-slate-900">{meta.vaNumber}</p>
                    </div>
                  )}

                  {meta.paymentMethod === "COD" && ord.status === "UNPAID" && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <Wallet size={14} /> Metode Bayar di Tempat (COD) • Siapkan {formatRp(ord.totalAmount)}
                    </div>
                  )}

                  {meta.trackingNote && (
                    <p className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                      Status Terkini: {meta.trackingNote}
                    </p>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Tagihan</span>
                      <span className="text-base font-black text-blue-700">{formatRp(ord.totalAmount)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <UmkmOrderActions
                        orderId={ord.id}
                        status={ord.status}
                        paymentMethod={meta.paymentMethod}
                      />
                      <Link
                        href={`/umkm/orders/${ord.id}/receipt`}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5"
                      >
                        <Printer size={13} />
                        <span>Struk / Bon</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

