import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await prisma.umkmOrder.findUnique({
    where: { id },
    include: { store: { select: { userId: true, storeName: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = session.user as any;
  const allowed =
    order.buyerId === user.id ||
    order.store.userId === user.id ||
    ["ADMIN_MASTER", "BUMDES", "ADMIN_DESA", "KADES"].includes(user.role);

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const meta = parseOrderMeta(order.address, order.totalAmount);
  return NextResponse.json({
    id: order.id,
    status: order.status,
    updatedAt: order.updatedAt,
    storeName: order.store.storeName,
    invoiceNo: meta.invoiceNo,
    paymentStatus: meta.paymentStatus,
    paymentMethod: meta.paymentMethod,
    courierName: meta.courierName || "",
    courierPhone: meta.courierPhone || "",
    trackingNote: meta.trackingNote || "",
    trackingEvents: meta.trackingEvents || [],
  });
}

