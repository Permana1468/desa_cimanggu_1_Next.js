export interface UmkmTrackingEvent {
  time: string;
  step: "ORDER_CREATED" | "PAYMENT_SUBMITTED" | "PAYMENT_VERIFIED" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  title: string;
  note: string;
  actor: string;
}

export interface UmkmOrderMeta {
  invoiceNo: string;
  recipientName: string;
  phone: string;
  addressText: string;
  notes?: string;
  shippingMethod: "KURIR_DESA" | "PICKUP";
  paymentMethod: "QRIS" | "BANK_VA" | "COD";
  paymentChannel: string;
  paymentStatus: "PENDING" | "AWAITING_VERIFICATION" | "SETTLED" | "COD_PENDING" | "EXPIRED" | "CANCELLED";
  paymentRef?: string;
  vaNumber?: string;
  qrisPayload?: string;
  gatewayProvider?: "MIDTRANS" | "XENDIT" | "DESAPAY_INTERNAL" | "DIRECT_MERCHANT";
  storeBankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrisImageUrl?: string;
  };
  paymentSenderName?: string;
  paymentProofUrl?: string;
  paymentSubmittedAt?: string;
  courierName?: string;
  courierPhone?: string;
  trackingEvents?: UmkmTrackingEvent[];
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
    } catch {}
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
    trackingEvents: [],
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
