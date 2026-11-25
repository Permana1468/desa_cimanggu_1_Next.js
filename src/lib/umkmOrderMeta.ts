export interface UmkmOrderMeta {
  invoiceNo: string;
  recipientName: string;
  phone: string;
  addressText: string;
  notes?: string;
  shippingMethod: "KURIR_DESA" | "PICKUP";
  paymentMethod: "QRIS" | "BANK_VA" | "COD";
  paymentChannel: string; // e.g. "QRIS_NASIONAL" | "BRI" | "BNI" | "MANDIRI" | "BCA" | "COD"
  paymentStatus: "PENDING" | "SETTLED" | "COD_PENDING" | "EXPIRED" | "CANCELLED";
  paymentRef?: string;
  vaNumber?: string;
  qrisPayload?: string;
  gatewayProvider?: "MIDTRANS" | "XENDIT" | "DESAPAY_INTERNAL";
  subtotal: number;
  discount: number;
  shippingFee: number;
  adminFee: number;
  bumdesContribution: number;
  sellerNet: number;
  integrityHash: string;
  receiptSignature: string;
  engineMode?: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  trackingNote?: string;
}

const META_PREFIX = "__DESAMART_META__:";

export function serializeOrderMeta(meta: UmkmOrderMeta): string {
  return `${META_PREFIX}${JSON.stringify(meta)}`;
}

export function parseOrderMeta(rawAddress: string | null | undefined, fallbackTotal = 0): UmkmOrderMeta {
  if (rawAddress && rawAddress.startsWith(META_PREFIX)) {
    try {
      const parsed = JSON.parse(rawAddress.slice(META_PREFIX.length));
      return parsed as UmkmOrderMeta;
    } catch {
      // fallback below
    }
  }

  return {
    invoiceNo: "INV-LEGACY",
    recipientName: "Pelanggan DesaMart",
    phone: "-",
    addressText: rawAddress || "-",
    shippingMethod: "KURIR_DESA",
    paymentMethod: "COD",
    paymentChannel: "COD",
    paymentStatus: "COD_PENDING",
    gatewayProvider: "DESAPAY_INTERNAL",
    subtotal: fallbackTotal,
    discount: 0,
    shippingFee: 0,
    adminFee: 0,
    bumdesContribution: 0,
    sellerNet: fallbackTotal,
    integrityHash: "-",
    receiptSignature: "-",
  };
}

