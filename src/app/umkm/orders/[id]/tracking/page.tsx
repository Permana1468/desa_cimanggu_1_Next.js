import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { parseOrderMeta } from "@/lib/umkmOrderMeta";
import { UmkmLiveTrackingClient } from "@/components/umkm/UmkmLiveTrackingClient";

export default async function OrderTrackingPage({
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
    include: { store: { select: { userId: true, storeName: true } } },
  });

  if (!order) notFound();

  const user = session.user as any;
  const allowed =
    order.buyerId === user.id ||
    order.store.userId === user.id ||
    ["ADMIN_MASTER", "BUMDES", "ADMIN_DESA", "KADES"].includes(user.role);

  if (!allowed) redirect("/umkm");

  const meta = parseOrderMeta(order.address, order.totalAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-6 font-sans">
      <UmkmLiveTrackingClient
        orderId={order.id}
        initialData={{
          status: order.status,
          storeName: order.store.storeName,
          invoiceNo: meta.invoiceNo,
          paymentStatus: meta.paymentStatus,
          paymentMethod: meta.paymentMethod,
          courierName: meta.courierName || "",
          courierPhone: meta.courierPhone || "",
          trackingNote: meta.trackingNote || "",
          trackingEvents: meta.trackingEvents || [],
        }}
      />
    </div>
  );
}

