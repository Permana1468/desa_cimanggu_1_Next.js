import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Store } from "lucide-react";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
import { PrintReceiptButton } from "@/components/umkm/PrintReceiptButton";
import { UmkmQrImage } from "@/components/umkm/UmkmQrImage";

const formatRp = (val: number) => `Rp ${Math.round(val || 0).toLocaleString("id-ID")}`;

export default async function UmkmOrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/umkm/login");
  }

  const { id } = await params;
  const order = await prisma.umkmOrder.findUnique({
    where: { id },
    include: {
      store: { include: { tenant: true } },
      buyer: { select: { fullName: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  if (!order) notFound();

  const user = session.user as any;
  const canView =
    order.buyerId === user.id ||
    order.store.userId === user.id ||
    ["ADMIN_MASTER", "BUMDES", "ADMIN_DESA", "KADES"].includes(user.role);

  if (!canView) {
    redirect("/umkm");
  }

  const meta = parseOrderMeta(order.address, order.totalAmount);
  const isSettled =
    order.status === "PAID" ||
    order.status === "SHIPPED" ||
    order.status === "COMPLETED" ||
    meta.paymentStatus === "SETTLED";

  const qrVerifyData = JSON.stringify({
    inv: meta.invoiceNo,
    tot: order.totalAmount,
    sig: meta.receiptSignature,
    hash: meta.integrityHash,
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans print:bg-white print:p-0">
      {/* Top Bar Hidden on Print */}
      <div className="max-w-xl mx-auto mb-5 flex items-center justify-between print:hidden">
        <Link href="/umkm/orders" className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1.5">
          <ArrowLeft size={16} /> Kembali ke Pesanan
        </Link>
        <PrintReceiptButton />
      </div>

      {/* Struk / Bon Card */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden print:shadow-none print:border-slate-300 print:rounded-none">
        {/* Header Resmi */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-1.5 print:bg-slate-900 print:text-white">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Store size={15} /> {order.store.tenant?.name || "Desa Cimanggu I"}
          </div>
          <h1 className="text-xl font-black tracking-tight">STRUK / BON TRANSAKSI DESAMART</h1>
          <p className="text-xs text-slate-300 font-semibold">{order.store.storeName}</p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Status & Invoice Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-dashed border-slate-300">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Invoice</span>
              <span className="font-mono text-sm font-black text-slate-900">{meta.invoiceNo}</span>
            </div>
            <div className="text-right">
              {isSettled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  <CheckCircle2 size={14} /> LUNAS / PAID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                  <Clock size={14} /> {meta.paymentMethod === "COD" ? "COD (BAYAR DI TEMPAT)" : "BELUM LUNAS"}
                </span>
              )}
            </div>
          </div>

          {/* Info Transaksi & Penerima */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Tanggal Order</span>
              <span className="font-bold text-slate-800">
                {new Date(order.createdAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Metode Pembayaran</span>
              <span className="font-bold text-slate-800">
                {meta.paymentMethod} ({meta.paymentChannel})
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Pembeli / Penerima</span>
              <span className="font-bold text-slate-800">{meta.recipientName || order.buyer.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Telepon / Pengiriman</span>
              <span className="font-bold text-slate-800">
                {meta.phone} • {meta.shippingMethod === "PICKUP" ? "Ambil di Toko" : "Kurir Desa"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 font-semibold block">Alamat Pengiriman</span>
              <span className="font-semibold text-slate-700">{meta.addressText}</span>
            </div>
          </div>

          {/* Daftar Item */}
          <div className="border-t border-b border-dashed border-slate-300 py-4 space-y-2.5">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
              <span>Rincian Barang</span>
              <span>Subtotal</span>
            </div>
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between items-start text-xs gap-4">
                <div>
                  <p className="font-bold text-slate-900">{it.product.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {it.quantity} x {formatRp(it.price)}
                  </p>
                </div>
                <span className="font-bold text-slate-900 shrink-0">{formatRp(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Rincian Biaya */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Barang</span>
              <span className="font-bold">{formatRp(meta.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim</span>
              <span className="font-bold">{formatRp(meta.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan Pembayaran</span>
              <span className="font-bold">{formatRp(meta.adminFee)}</span>
            </div>
            {meta.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Potongan Diskon</span>
                <span className="font-bold">-{formatRp(meta.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-base font-black text-slate-900">
              <span>TOTAL DIBAYAR</span>
              <span className="text-blue-700">{formatRp(order.totalAmount)}</span>
            </div>
          </div>

          {/* QR Verifikasi + Anti-Tamper C++ Signature */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <UmkmQrImage value={qrVerifyData} size={80} alt="QR Verifikasi Struk" className="shrink-0" />
            <div className="min-w-0 space-y-1 text-[10px] text-slate-500">
              <p className="font-black text-slate-800 flex items-center gap-1 text-[11px]">
                <ShieldCheck size={14} className="text-emerald-600" />
                E-Receipt Terverifikasi Digital
              </p>
              <p className="truncate font-mono">SIG: {meta.receiptSignature}</p>
              <p className="truncate font-mono">HASH: {meta.integrityHash}</p>
              <p className="text-[10px] text-slate-400">
                Engine: {meta.engineMode || "CPP_NATIVE"} • Provider: {meta.gatewayProvider || "DESAPAY_INTERNAL"}
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
            Terima kasih telah berbelanja produk lokal warga Desa Cimanggu I. Simpan struk ini sebagai bukti transaksi resmi.
          </p>
        </div>
      </div>
    </div>
  );
}

