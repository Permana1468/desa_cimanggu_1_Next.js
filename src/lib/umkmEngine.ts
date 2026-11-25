import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export type UmkmPaymentMethod = "QRIS" | "BANK_VA" | "COD";
export type UmkmShippingMethod = "KURIR_DESA" | "PICKUP";

export interface UmkmCalcItemInput {
  unitPrice: number;
  quantity: number;
}

export interface UmkmLedgerInput {
  items: UmkmCalcItemInput[];
  paymentMethod: UmkmPaymentMethod;
  shippingMethod: UmkmShippingMethod;
  discount?: number;
  invoiceSeed: string;
}

export interface UmkmLedgerResult {
  totalQty: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  adminFee: number;
  grandTotal: number;
  bumdesContribution: number;
  sellerNet: number;
  integrityHash: string;
  executionMode: "CPP_NATIVE" | "TYPESCRIPT_INTEGER_FALLBACK";
}

function fnv1a64Pair(input: string): string {
  const FNV_OFFSET = BigInt("14695981039346656037");
  const FNV_PRIME = BigInt("1099511628211");
  const MASK_64 = BigInt("0xFFFFFFFFFFFFFFFF");
  let h1 = FNV_OFFSET;
  let h2 = FNV_OFFSET ^ BigInt("0x9e3779b97f4a7c15");

  const bytes = Buffer.from(input, "utf8");
  for (const b of bytes) {
    const c = BigInt(b);
    h1 = ((h1 ^ c) * FNV_PRIME) & MASK_64;
    h2 = ((h2 * FNV_PRIME) ^ (c + BigInt("0x517cc1b727220a95"))) & MASK_64;
  }

  return (
    h1.toString(16).toUpperCase().padStart(16, "0") +
    h2.toString(16).toUpperCase().padStart(16, "0")
  );
}

/**
 * Exact integer-Rupiah fallback identik 100% dengan logika C++ Native `umkm_ledger.cpp`
 */
export function calculateUmkmLedgerFallback(input: UmkmLedgerInput): UmkmLedgerResult {
  let subtotal = 0;
  let totalQty = 0;

  for (const item of input.items) {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    const unitPrice = Math.max(0, Math.round(Number(item.unitPrice) || 0));
    if (qty > 0) {
      subtotal += unitPrice * qty;
      totalQty += qty;
    }
  }

  let shippingFee = 0;
  if (input.shippingMethod === "KURIR_DESA" && subtotal > 0 && subtotal < 100000) {
    shippingFee = 5000;
  }

  const rawDiscount = Math.max(0, Math.round(Number(input.discount) || 0));
  const discount = Math.min(subtotal, rawDiscount);
  const netGoods = subtotal - discount;

  let adminFee = 0;
  const taxableBase = netGoods + shippingFee;
  if (input.paymentMethod === "QRIS" && taxableBase > 0) {
    adminFee = Math.floor((taxableBase * 7 + 999) / 1000);
  } else if (input.paymentMethod === "BANK_VA" && taxableBase > 0) {
    adminFee = 4000;
  }

  const grandTotal = netGoods + shippingFee + adminFee;
  const bumdesContribution = Math.floor((netGoods * 1) / 100);
  const sellerNet = Math.max(0, netGoods - bumdesContribution);

  const signPayload = `${input.invoiceSeed}|${input.paymentMethod}|${input.shippingMethod}|${subtotal}|${shippingFee}|${adminFee}|${discount}|${grandTotal}`;
  const integrityHash = fnv1a64Pair(signPayload);

  return {
    totalQty,
    subtotal,
    discount,
    shippingFee,
    adminFee,
    grandTotal,
    bumdesContribution,
    sellerNet,
    integrityHash,
    executionMode: "TYPESCRIPT_INTEGER_FALLBACK",
  };
}

/**
 * Menjalankan Native C++ UMKM Ledger & Anti-Tamper Engine (`services/umkm_engine/bin/umkm_ledger`).
 * Menggunakan integer 64-bit bebas error floating-point dan tahan manipulasi harga sisi client.
 */
export async function executeUmkmLedgerEngine(
  input: UmkmLedgerInput
): Promise<UmkmLedgerResult> {
  const binPath = path.join(process.cwd(), "services", "umkm_engine", "bin", "umkm_ledger");

  if (!fs.existsSync(binPath)) {
    return calculateUmkmLedgerFallback(input);
  }

  return new Promise((resolve) => {
    try {
      const sanitizedPayload = JSON.stringify({
        invoiceSeed: input.invoiceSeed,
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
        discount: Math.max(0, Math.round(input.discount || 0)),
        items: input.items.map((it) => ({
          unitPrice: Math.max(0, Math.round(it.unitPrice)),
          quantity: Math.max(0, Math.floor(it.quantity)),
        })),
      });

      const proc = spawn(binPath, [sanitizedPayload], { timeout: 2500 });
      let stdout = "";

      proc.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      proc.on("close", (code) => {
        if (code === 0 && stdout.trim()) {
          try {
            const parsed = JSON.parse(stdout.trim());
            resolve({
              ...parsed,
              executionMode: "CPP_NATIVE",
            });
            return;
          } catch {
            // Fallback silently on parse error
          }
        }
        resolve(calculateUmkmLedgerFallback(input));
      });

      proc.on("error", () => {
        resolve(calculateUmkmLedgerFallback(input));
      });
    } catch {
      resolve(calculateUmkmLedgerFallback(input));
    }
  });
}

/**
 * Menghasilkan signature HMAC-SHA256 server-side untuk verifikasi struk / bon resmi.
 */
export function signReceiptToken(invoiceNo: string, grandTotal: number, integrityHash: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "desamart_cimanggu1_hmac_key";
  return crypto
    .createHmac("sha256", secret)
    .update(`${invoiceNo}:${grandTotal}:${integrityHash}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();
}

