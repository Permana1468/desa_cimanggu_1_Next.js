"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  executeUmkmLedgerEngine,
  signReceiptToken,
  type UmkmPaymentMethod,
  type UmkmShippingMethod,
} from "@/lib/umkmEngine";
import { parseOrderMeta, serializeOrderMeta, type UmkmOrderMeta } from "@/lib/umkmOrderMeta";
import { createUmkmPaymentInstruction } from "@/lib/umkmPaymentGateway";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Hasil Tani": ["beras", "tani", "gabah", "jagung", "singkong", "kelapa"],
  "Kuliner & Snack": ["keripik", "snack", "kue", "cemilan", "kuliner"],
  "Kopi Desa": ["kopi", "robusta", "arabika", "espresso"],
  "Kerajinan Bambu": ["bambu", "anyaman", "kerajinan", "tampah", "bakul"],
  "Batik & Fashion": ["batik", "kain", "fashion", "baju", "tenun"],
  "Madu & Herbal": ["madu", "herbal", "vco", "minyak", "jamu"],
  "Produk BUMDes": ["bumdes", "paket", "sembako"],
  "Olahan Sambal": ["sambal", "terasi", "roa", "cabai"],
  "Sayur Segar": ["sayur", "bayam", "kangkung", "organik", "segar"],
  "Wisata Desa": ["wisata", "tiket", "homestay", "paket wisata"],
};

export async function getUmkmCatalog(params?: {
  search?: string;
  category?: string;
  storeId?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "bestseller";
  limit?: number;
}) {
  const search = (params?.search || "").trim();
  const category = (params?.category || "").trim();
  const storeId = (params?.storeId || "").trim();
  const limit = Math.min(48, Math.max(1, params?.limit || 24));

  const andConditions: any[] = [
    { status: "LIVE" },
    { store: { status: "APPROVED" } },
  ];

  if (storeId) {
    andConditions.push({ storeId });
  }

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { store: { storeName: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (category) {
    const keywords = CATEGORY_KEYWORDS[category] || [category.toLowerCase()];
    andConditions.push({
      OR: [
        { category: { name: { equals: category, mode: "insensitive" } } },
        ...keywords.map((kw) => ({ name: { contains: kw, mode: "insensitive" } })),
        ...keywords.map((kw) => ({ description: { contains: kw, mode: "insensitive" } })),
      ],
    });
  }

  const orderBy: any =
    params?.sort === "price_asc"
      ? { price: "asc" }
      : params?.sort === "price_desc"
        ? { price: "desc" }
        : params?.sort === "bestseller"
          ? { sold: "desc" }
          : { createdAt: "desc" };

  return await prisma.umkmProduct.findMany({
    where: { AND: andConditions },
    include: { store: true, category: true },
    take: limit,
    orderBy,
  });
}

export async function createUmkmStore(
  userId: string,
  tenantId: string,
  storeName: string,
  description: string
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Harap login terlebih dahulu" };
    }
    const sessionUser = session.user as any;
    const effectiveUserId = sessionUser.id || userId;
    const effectiveTenantId = sessionUser.tenantId || tenantId;

    const existing = await prisma.umkmStore.findUnique({
      where: { userId: effectiveUserId },
    });
    if (existing) {
      return { success: false, error: "Akun Anda sudah memiliki toko terdaftar." };
    }

    const store = await prisma.umkmStore.create({
      data: {
        userId: effectiveUserId,
        tenantId: effectiveTenantId,
        storeName: storeName.trim(),
        description: description.trim(),
        status: "PENDING", // Menunggu verifikasi BUMDes / Admin Desa / Admin Master agar aman & terkurasi
      },
    });
    revalidatePath("/umkm/seller");
    revalidatePath("/master-admin/umkm");
    revalidatePath("/dashboard/bumdes");
    return { success: true, store };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStoreByUserId(userId: string) {
  return await prisma.umkmStore.findUnique({
    where: { userId },
  });
}

async function assertStoreAuthority(storeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const user = session.user as any;

  const store = await prisma.umkmStore.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Toko tidak ditemukan");

  const isPrivileged = ["ADMIN_MASTER", "BUMDES", "ADMIN_DESA"].includes(user.role);
  if (store.userId !== user.id && !isPrivileged) {
    throw new Error("Akses ditolak: Anda bukan pemilik toko ini.");
  }
  return { session, user, store };
}

export async function addProduct(
  storeId: string,
  data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryName?: string;
  }
) {
  try {
    await assertStoreAuthority(storeId);

    const cleanPrice = Math.max(100, Math.round(Number(data.price) || 0));
    const cleanStock = Math.max(0, Math.floor(Number(data.stock) || 0));

    let categoryId: string | undefined;
    if (data.categoryName && data.categoryName.trim()) {
      const cat = await prisma.umkmCategory.findFirst({
        where: { name: { equals: data.categoryName.trim(), mode: "insensitive" } },
      });
      if (cat) {
        categoryId = cat.id;
      } else {
        const createdCat = await prisma.umkmCategory.create({
          data: { name: data.categoryName.trim() },
        });
        categoryId = createdCat.id;
      }
    }

    const validImages = (data.images || []).filter((u) => u && u.trim().length > 0);
    const product = await prisma.umkmProduct.create({
      data: {
        storeId,
        categoryId,
        name: data.name.trim(),
        description: data.description.trim(),
        price: cleanPrice,
        stock: cleanStock,
        images: JSON.stringify(validImages.length > 0 ? validImages : [FALLBACK_IMAGE]),
        status: "LIVE",
      },
    });
    revalidatePath("/umkm");
    revalidatePath("/umkm/seller");
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductBySeller(
  productId: string,
  updates: { price?: number; stock?: number; status?: "LIVE" | "HIDDEN" }
) {
  try {
    const product = await prisma.umkmProduct.findUnique({ where: { id: productId } });
    if (!product) return { success: false, error: "Produk tidak ditemukan" };
    await assertStoreAuthority(product.storeId);

    const data: any = {};
    if (typeof updates.price === "number") data.price = Math.max(100, Math.round(updates.price));
    if (typeof updates.stock === "number") data.stock = Math.max(0, Math.floor(updates.stock));
    if (updates.status) data.status = updates.status;

    const updated = await prisma.umkmProduct.update({
      where: { id: productId },
      data,
    });
    revalidatePath("/umkm");
    revalidatePath("/umkm/seller");
    return { success: true, product: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const product = await prisma.umkmProduct.findUnique({ where: { id: productId } });
    if (!product) return { success: false, error: "Produk tidak ditemukan" };
    await assertStoreAuthority(product.storeId);

    await prisma.umkmProduct.delete({ where: { id: productId } });
    revalidatePath("/umkm");
    revalidatePath("/umkm/seller");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveStore(storeId: string) {
  return await updateUmkmStoreStatus(storeId, "APPROVED");
}

export async function updateUmkmStoreStatus(
  storeId: string,
  status: "APPROVED" | "REJECTED" | "BANNED" | "PENDING"
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!["ADMIN_MASTER", "BUMDES", "ADMIN_DESA", "KADES"].includes(role)) {
      return { success: false, error: "Akses ditolak." };
    }

    await prisma.umkmStore.update({
      where: { id: storeId },
      data: { status },
    });
    revalidatePath("/master-admin/umkm");
    revalidatePath("/dashboard/bumdes");
    revalidatePath("/umkm");
    revalidatePath("/umkm/seller");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export interface SecureCheckoutRequest {
  recipientName: string;
  phone: string;
  addressText: string;
  notes?: string;
  shippingMethod: UmkmShippingMethod;
  paymentMethod: UmkmPaymentMethod;
  paymentChannel: string; // "QRIS_NASIONAL" | "BRI" | "BNI" | "MANDIRI" | "BCA" | "COD"
  items: { productId: string; quantity: number }[];
}

/**
 * Checkout Atomik & Aman:
 * - Mengambil harga & stok asli dari database (bukan dari client)
 * - Pengurangan stok atomik di dalam prisma.$transaction (mencegah overselling saat trafik tinggi)
 * - Menghitung total & integrityHash via Native C++ Ledger Engine (umkm_ledger)
 * - Menghasilkan instruksi pembayaran QRIS / Virtual Account Bank / COD + Struk Resmi
 */
export async function createSecureCheckout(input: SecureCheckoutRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Silakan login terlebih dahulu sebelum membuat pesanan." };
    }
    const buyer = session.user as any;

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Keranjang belanja kosong." };
    }
    if (!input.recipientName?.trim() || !input.phone?.trim() || !input.addressText?.trim()) {
      return { success: false, error: "Nama penerima, No. HP/WA, dan alamat lengkap wajib diisi." };
    }

    const requestedIds = Array.from(new Set(input.items.map((i) => i.productId)));
    const dbProducts = await prisma.umkmProduct.findMany({
      where: { id: { in: requestedIds } },
      include: { store: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Kelompokkan per toko (karena 1 UmkmOrder terikat ke 1 UmkmStore)
    const storeGroups = new Map<
      string,
      { store: any; lines: { product: any; quantity: number }[] }
    >();

    for (const reqItem of input.items) {
      const qty = Math.floor(Number(reqItem.quantity) || 0);
      if (qty <= 0) continue;

      const prod = productMap.get(reqItem.productId);
      if (!prod) {
        return { success: false, error: "Salah satu produk tidak lagi tersedia." };
      }
      if (prod.status !== "LIVE" || prod.store.status !== "APPROVED") {
        return { success: false, error: `Produk "${prod.name}" sedang tidak aktif atau toko belum disetujui.` };
      }
      if (prod.stock < qty) {
        return {
          success: false,
          error: `Stok "${prod.name}" tersisa ${prod.stock}, tidak mencukupi untuk ${qty} item.`,
        };
      }

      if (!storeGroups.has(prod.storeId)) {
        storeGroups.set(prod.storeId, { store: prod.store, lines: [] });
      }
      storeGroups.get(prod.storeId)!.lines.push({ product: prod, quantity: qty });
    }

    if (storeGroups.size === 0) {
      return { success: false, error: "Tidak ada item valid untuk diproses." };
    }

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const createdOrders: any[] = [];

    for (const [storeId, group] of storeGroups.entries()) {
      const randSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const invoiceNo = `INV-CMG-${datePart}-${randSuffix}`;

      // Hitung presisi integer via C++ Engine (`umkm_ledger`)
      const ledger = await executeUmkmLedgerEngine({
        invoiceSeed: invoiceNo,
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
        discount: 0,
        items: group.lines.map((l) => ({
          unitPrice: Math.round(l.product.price),
          quantity: l.quantity,
        })),
      });

      const receiptSignature = signReceiptToken(invoiceNo, ledger.grandTotal, ledger.integrityHash);

      const payInstruction = await createUmkmPaymentInstruction({
        invoiceNo,
        amount: ledger.grandTotal,
        paymentMethod: input.paymentMethod,
        paymentChannel: input.paymentChannel || input.paymentMethod,
        storeName: group.store.storeName,
        buyerName: input.recipientName.trim(),
        buyerEmail: buyer.email,
      });

      const meta: UmkmOrderMeta = {
        invoiceNo,
        recipientName: input.recipientName.trim(),
        phone: input.phone.trim(),
        addressText: input.addressText.trim(),
        notes: input.notes?.trim() || "",
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        paymentChannel: input.paymentChannel || input.paymentMethod,
        paymentStatus: input.paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
        paymentRef: payInstruction.paymentRef,
        vaNumber: payInstruction.vaNumber,
        qrisPayload: payInstruction.qrisPayload,
        gatewayProvider: payInstruction.provider,
        subtotal: ledger.subtotal,
        discount: ledger.discount,
        shippingFee: ledger.shippingFee,
        adminFee: ledger.adminFee,
        bumdesContribution: ledger.bumdesContribution,
        sellerNet: ledger.sellerNet,
        integrityHash: ledger.integrityHash,
        receiptSignature,
        engineMode: ledger.executionMode,
      };

      // Transaksi atomik: kurangi stok hanya jika masih mencukupi & buat order sekaligus
      const created = await prisma.$transaction(async (tx) => {
        for (const line of group.lines) {
          const updatedStock = await tx.umkmProduct.updateMany({
            where: {
              id: line.product.id,
              stock: { gte: line.quantity },
              status: "LIVE",
            },
            data: {
              stock: { decrement: line.quantity },
              sold: { increment: line.quantity },
            },
          });

          if (updatedStock.count === 0) {
            throw new Error(`Stok "${line.product.name}" baru saja habis. Silakan periksa keranjang Anda.`);
          }
        }

        const order = await tx.umkmOrder.create({
          data: {
            storeId,
            buyerId: buyer.id,
            totalAmount: ledger.grandTotal,
            status: "UNPAID",
            address: serializeOrderMeta(meta),
            items: {
              create: group.lines.map((l) => ({
                productId: l.product.id,
                quantity: l.quantity,
                price: Math.round(l.product.price),
              })),
            },
          },
          include: {
            store: true,
            items: { include: { product: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            action: "UMKM_ORDER_CREATED",
            entity: "UmkmOrder",
            entityId: order.id,
            details: {
              invoiceNo,
              grandTotal: ledger.grandTotal,
              paymentMethod: input.paymentMethod,
              engineMode: ledger.executionMode,
              integrityHash: ledger.integrityHash,
            },
            userId: buyer.id,
            tenantId: group.store.tenantId,
            category: "UMKM",
          },
        });

        return order;
      });

      createdOrders.push({
        id: created.id,
        storeName: group.store.storeName,
        totalAmount: created.totalAmount,
        status: created.status,
        meta,
        instructions: payInstruction.instructions,
      });
    }

    revalidatePath("/umkm");
    revalidatePath("/umkm/seller");
    revalidatePath("/umkm/orders");
    revalidatePath("/dashboard/bumdes");

    return { success: true, orders: createdOrders };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memproses checkout." };
  }
}

/**
 * Legacy wrapper kept for safety if anything older calls it, redirected securely
 */
export async function createCheckout(
  _storeId: string,
  _buyerId: string,
  _totalAmount: number,
  address: string,
  items: { productId: string; quantity: number; price: number }[]
) {
  const session = await getServerSession(authOptions);
  const user = (session?.user as any) || {};
  return createSecureCheckout({
    recipientName: user.name || "Warga Cimanggu I",
    phone: "-",
    addressText: address,
    shippingMethod: "KURIR_DESA",
    paymentMethod: "COD",
    paymentChannel: "COD",
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });
}

/**
 * Menetapkan status pembayaran order menjadi PAID secara idempoten + mencatat log
 */
export async function settleUmkmOrderPayment(orderId: string, channelLabel?: string) {
  try {
    const order = await prisma.umkmOrder.findUnique({
      where: { id: orderId },
      include: { store: true },
    });
    if (!order) return { success: false, error: "Pesanan tidak ditemukan" };
    if (order.status === "PAID" || order.status === "SHIPPED" || order.status === "COMPLETED") {
      return { success: true, alreadySettled: true };
    }

    const meta = parseOrderMeta(order.address, order.totalAmount);
    meta.paymentStatus = "SETTLED";
    meta.paidAt = new Date().toISOString();
    if (channelLabel) meta.trackingNote = `Pembayaran terkonfirmasi via ${channelLabel}`;

    await prisma.$transaction(async (tx) => {
      await tx.umkmOrder.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          address: serializeOrderMeta(meta),
        },
      });

      // Catat pendapatan transaksi jika toko adalah unit BUMDes
      if (order.store.storeName.toUpperCase().includes("BUMDES")) {
        await tx.bumdesFinancial.create({
          data: {
            title: `Penjualan Marketplace (${meta.invoiceNo})`,
            amount: meta.sellerNet || order.totalAmount,
            type: "INCOME",
            description: `Penjualan ${order.store.storeName} - Metode ${meta.paymentMethod} (${meta.paymentChannel})`,
            tenantId: order.store.tenantId,
          },
        });
      }
    });

    revalidatePath("/umkm/orders");
    revalidatePath("/umkm/seller");
    revalidatePath(`/umkm/orders/${orderId}/receipt`);
    revalidatePath("/dashboard/bumdes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusBySeller(
  orderId: string,
  nextStatus: "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED",
  trackingNote?: string
) {
  try {
    const order = await prisma.umkmOrder.findUnique({
      where: { id: orderId },
      include: { store: true, items: true },
    });
    if (!order) return { success: false, error: "Pesanan tidak ditemukan" };
    await assertStoreAuthority(order.storeId);

    if (nextStatus === "PAID") {
      return await settleUmkmOrderPayment(orderId, "Konfirmasi Penjual / COD");
    }

    const meta = parseOrderMeta(order.address, order.totalAmount);
    if (trackingNote) meta.trackingNote = trackingNote;

    if (nextStatus === "SHIPPED") {
      meta.shippedAt = new Date().toISOString();
    } else if (nextStatus === "COMPLETED") {
      meta.completedAt = new Date().toISOString();
      if (meta.paymentStatus !== "SETTLED") {
        meta.paymentStatus = "SETTLED";
        meta.paidAt = meta.paidAt || new Date().toISOString();
      }
    } else if (nextStatus === "CANCELLED") {
      meta.paymentStatus = "CANCELLED";
    }

    await prisma.$transaction(async (tx) => {
      // Jika dibatalkan dari status yang belum pernah dibatalkan, kembalikan stok!
      if (nextStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          await tx.umkmProduct.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sold: { decrement: item.quantity },
            },
          });
        }
      }

      await tx.umkmOrder.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          address: serializeOrderMeta(meta),
        },
      });
    });

    revalidatePath("/umkm/seller");
    revalidatePath("/umkm/orders");
    revalidatePath(`/umkm/orders/${orderId}/receipt`);
    revalidatePath("/umkm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function confirmOrderReceivedByBuyer(orderId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const user = session.user as any;

    const order = await prisma.umkmOrder.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== user.id) {
      return { success: false, error: "Pesanan tidak ditemukan atau bukan milik Anda." };
    }

    const meta = parseOrderMeta(order.address, order.totalAmount);
    meta.paymentStatus = "SETTLED";
    meta.paidAt = meta.paidAt || new Date().toISOString();
    meta.completedAt = new Date().toISOString();
    meta.trackingNote = "Pesanan diterima dengan baik oleh pembeli.";

    await prisma.umkmOrder.update({
      where: { id: orderId },
      data: { status: "COMPLETED", address: serializeOrderMeta(meta) },
    });

    revalidatePath("/umkm/orders");
    revalidatePath("/umkm/seller");
    revalidatePath(`/umkm/orders/${orderId}/receipt`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBumdesUmkmOverview() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const tenantId = (session?.user as any)?.tenantId;
  if (!["BUMDES", "ADMIN_MASTER", "ADMIN_DESA", "KADES", "SEKDES"].includes(role)) {
    return null;
  }

  const whereTenant = role === "ADMIN_MASTER" || !tenantId ? {} : { tenantId };
  const [stores, recentOrders, totalProducts] = await Promise.all([
    prisma.umkmStore.findMany({
      where: whereTenant,
      include: {
        user: { select: { fullName: true, phoneNumber: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.umkmOrder.findMany({
      where: whereTenant ? { store: whereTenant } : {},
      include: {
        store: { select: { storeName: true } },
        buyer: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.umkmProduct.count({
      where: whereTenant ? { store: whereTenant, status: "LIVE" } : { status: "LIVE" },
    }),
  ]);

  const paidOrders = recentOrders.filter((o) =>
    ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)
  );
  const grossOmzet = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalStores: stores.length,
    pendingStores: stores.filter((s) => s.status === "PENDING").length,
    approvedStores: stores.filter((s) => s.status === "APPROVED").length,
    totalProducts,
    grossOmzet,
    stores,
    recentOrders,
  };
}

// Ensure Authentic Village UMKM Products Exist in DB (and repair any broken seeded image URL)
export async function ensureUmkmSeedData() {
  try {
    const count = await prisma.umkmProduct.count();
    if (count > 0) {
      // Perbaiki gambar Batik Tulis lama yang URL Unsplash-nya kadang 404
      await prisma.umkmProduct.updateMany({
        where: { images: { contains: "photo-1610030469983-98e550d6193c" } },
        data: {
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600",
          ]),
        },
      });
      return { success: true };
    }

    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: "Desa Cimanggu I", domain: "cimanggu1.desa.id" },
      });
    }

    let sellerUser = await prisma.user.findFirst({
      where: { email: "sensus@cimanggu1.desa.id" },
    });
    if (!sellerUser) {
      sellerUser = await prisma.user.findFirst();
    }
    if (!sellerUser) return { success: false, error: "No user available" };

    let store = await prisma.umkmStore.findFirst({
      where: { userId: sellerUser.id },
    });

    if (!store) {
      store = await prisma.umkmStore.create({
        data: {
          userId: sellerUser.id,
          tenantId: tenant.id,
          storeName: "BUMDes Cimanggu Mandiri",
          description: "Pusat Produk Unggulan & Hasil Bumi Desa Cimanggu I",
          status: "APPROVED",
        },
      });
    } else if (store.status !== "APPROVED") {
      await prisma.umkmStore.update({
        where: { id: store.id },
        data: { status: "APPROVED" },
      });
    }

    const authenticProducts = [
      {
        name: "Keripik Pisang Renyah Khas Cimanggu I (250g)",
        description:
          "Keripik pisang pilihan hasil olahan UMKM warga Desa Cimanggu I. Renyah, gurih, dan dibuat tanpa bahan pengawet.",
        price: 15000,
        stock: 50,
        sold: 142,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1621996346565-e3def6164286?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Beras Organik Pandan Wangi Cimanggu I (5kg)",
        description:
          "Beras asli panen persawahan Desa Cimanggu I. Bebas pestisida kimia, wangi alami, pulen, dan diproses langsung oleh Kelompok Tani Desa.",
        price: 75000,
        stock: 30,
        sold: 89,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Kopi Robusta Cimanggu I Origin (200g)",
        description:
          "Kopi olahan biji kopi pilihan dari perkebunan lokal Desa. Aromanya mantap dengan cita rasa khas kopi Bogor yang tebal dan wangi.",
        price: 35000,
        stock: 40,
        sold: 210,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Kerajinan Anyaman Bambu Tradisional Desa",
        description:
          "Tampah dan bakul bambu buatan tangan perajin Desa Cimanggu I. Halus, awet, dan ramah lingkungan.",
        price: 45000,
        stock: 20,
        sold: 56,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Madu Hutan Murni Asli Cimanggu I (350ml)",
        description:
          "Madu murni alami hasil ternak lebah warga desa. Kaya nutrisi dan khasiat untuk menjaga imunitas tubuh keluarga.",
        price: 85000,
        stock: 25,
        sold: 178,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1587049352847-4a222e784d38?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Batik Tulis Motif Khas Cimanggu I",
        description:
          "Kain batik buatan tangan dengan motif khas alam Desa Cimanggu I. Bahan katun halus prima, nyaman dan elegan.",
        price: 150000,
        stock: 15,
        sold: 34,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Sambal Terasi & Roa Dapur Ibu Desa (150g)",
        description:
          "Sambal botol rumahan resep keluarga khas desa. Gurih, pedas pas, diproses higienis dan tahan lama tanpa pengawet buatan.",
        price: 25000,
        stock: 60,
        sold: 312,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600",
        ]),
        status: "LIVE",
      },
      {
        name: "Minyak Kelapa Murni (VCO) Herbal (250ml)",
        description:
          "Virgin Coconut Oil hasil olahan tradisi kelapa segar desa. Sangat baik untuk kesehatan kulit, rambut, dan konsumsi harian.",
        price: 50000,
        stock: 35,
        sold: 95,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600",
        ]),
        status: "LIVE",
      },
    ];

    for (const prod of authenticProducts) {
      await prisma.umkmProduct.create({
        data: {
          storeId: store.id,
          ...prod,
        },
      });
    }

    revalidatePath("/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Error seeding UMKM data:", error);
    return { success: false, error: error.message };
  }
}
