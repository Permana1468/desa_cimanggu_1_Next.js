import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
import { getConfiguredPaymentKey } from "@/lib/umkmPaymentGateway";
import { settleUmkmOrderPayment } from "@/app/actions/umkm";

/**
 * Webhook Callback Resmi Payment Gateway (Midtrans / Xendit)
 * Memverifikasi signature secara kriptografis sebelum memperbarui status pesanan ke PAID.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = await getConfiguredPaymentKey();

    // 1. Midtrans Webhook Notification
    if (body.order_id && body.signature_key && body.status_code && body.gross_amount) {
      const expectedSig = crypto
        .createHash("sha512")
        .update(`${body.order_id}${body.status_code}${body.gross_amount}${apiKey}`)
        .digest("hex");

      if (expectedSig !== body.signature_key) {
        return NextResponse.json({ error: "Invalid Midtrans signature" }, { status: 403 });
      }

      const matchedOrder = await prisma.umkmOrder.findFirst({
        where: { address: { contains: body.order_id } },
        select: { id: true, status: true },
      });

      if (!matchedOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (["settlement", "capture"].includes(body.transaction_status)) {
        await settleUmkmOrderPayment(matchedOrder.id, `Midtrans Webhook (${body.payment_type || "ONLINE"})`);
      } else if (["expire", "cancel", "deny"].includes(body.transaction_status)) {
        const current = await prisma.umkmOrder.findUnique({ where: { id: matchedOrder.id } });
        if (current && current.status === "UNPAID") {
          const meta = parseOrderMeta(current.address, current.totalAmount);
          meta.paymentStatus = body.transaction_status === "expire" ? "EXPIRED" : "CANCELLED";
          await prisma.umkmOrder.update({
            where: { id: matchedOrder.id },
            data: { status: "CANCELLED" },
          });
        }
      }

      return NextResponse.json({ received: true });
    }

    // 2. Xendit Callback Verification
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken && apiKey && body.external_id) {
      if (callbackToken !== apiKey && callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
        return NextResponse.json({ error: "Invalid Xendit token" }, { status: 403 });
      }

      const matchedOrder = await prisma.umkmOrder.findFirst({
        where: { address: { contains: body.external_id } },
        select: { id: true },
      });

      if (matchedOrder && ["PAID", "SETTLED"].includes(String(body.status || "").toUpperCase())) {
        await settleUmkmOrderPayment(matchedOrder.id, `Xendit Webhook (${body.payment_channel || "ONLINE"})`);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ error: "Unsupported webhook payload" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Webhook error" }, { status: 500 });
  }
}

