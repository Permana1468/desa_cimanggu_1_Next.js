import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
import { getConfiguredPaymentKey } from "@/lib/umkmPaymentGateway";
import { settleUmkmOrderPayment } from "@/app/actions/umkm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, action } = body as { orderId: string; action: "verify" | "check" };

    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib diisi" }, { status: 400 });
    }

    const order = await prisma.umkmOrder.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const user = session.user as any;
    const isAllowed =
      order.buyerId === user.id ||
      order.store.userId === user.id ||
      ["ADMIN_MASTER", "BUMDES", "ADMIN_DESA"].includes(user.role);

    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status === "PAID" || order.status === "SHIPPED" || order.status === "COMPLETED") {
      return NextResponse.json({ success: true, status: order.status, alreadyPaid: true });
    }

    const meta = parseOrderMeta(order.address, order.totalAmount);

    // Jika menggunakan Midtrans Live/Sandbox API key, cek status langsung ke server Midtrans
    if (meta.gatewayProvider === "MIDTRANS") {
      const apiKey = await getConfiguredPaymentKey();
      if (apiKey.startsWith("SB-Mid-server-") || apiKey.startsWith("Mid-server-")) {
        const isProd = apiKey.startsWith("Mid-server-") && !apiKey.startsWith("SB-");
        const statusUrl = isProd
          ? `https://api.midtrans.com/v2/${encodeURIComponent(meta.invoiceNo)}/status`
          : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(meta.invoiceNo)}/status`;
        const authHeader = "Basic " + Buffer.from(`${apiKey}:`).toString("base64");

        const res = await fetch(statusUrl, {
          headers: { Authorization: authHeader, Accept: "application/json" },
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const data = await res.json();
          if (["settlement", "capture"].includes(data.transaction_status)) {
            await settleUmkmOrderPayment(order.id, `Midtrans ${data.payment_type || meta.paymentChannel}`);
            return NextResponse.json({ success: true, status: "PAID", provider: "MIDTRANS" });
          }
          return NextResponse.json({
            success: false,
            status: order.status,
            message: `Status Midtrans saat ini: ${data.transaction_status || "pending"}. Selesaikan pembayaran terlebih dahulu.`,
          });
        }
      }
    }

    // Jika menggunakan DesaPay Internal Gateway (atau konfirmasi manual COD oleh seller/admin)
    if (action === "verify") {
      if (meta.paymentMethod === "COD" && order.store.userId !== user.id && !["ADMIN_MASTER", "BUMDES", "ADMIN_DESA"].includes(user.role)) {
        return NextResponse.json(
          { error: "Pembayaran COD hanya dapat dikonfirmasi lunas oleh Penjual / Kurir / Admin Desa." },
          { status: 403 }
        );
      }

      const settled = await settleUmkmOrderPayment(order.id, `${meta.paymentMethod} (${meta.paymentChannel})`);
      if (!settled.success) {
        return NextResponse.json({ error: settled.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, status: "PAID", provider: "DESAPAY_INTERNAL" });
    }

    return NextResponse.json({ success: true, status: order.status, paymentStatus: meta.paymentStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}

