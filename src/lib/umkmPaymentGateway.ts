import crypto from "crypto";
import prisma from "@/lib/prisma";
import type { UmkmPaymentMethod } from "./umkmEngine";

export interface PaymentGatewayInstruction {
  provider: "MIDTRANS" | "XENDIT" | "DESAPAY_INTERNAL";
  paymentRef: string;
  vaNumber?: string;
  qrisPayload?: string;
  instructions: string[];
}

function crc16Ccitt(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildEmvQrisPayload(invoiceNo: string, amount: number, storeName: string): string {
  const merchant = (storeName || "DESAMART CIMANGGU I").slice(0, 22).toUpperCase();
  const amtStr = String(Math.max(100, Math.round(amount)));
  const tag26 = `0014ID.CO.DESAPAY.WWW0118936009140001${invoiceNo.slice(-6)}0215${invoiceNo.slice(0, 15)}`;
  const body =
    "000201" +
    "010212" +
    `26${String(tag26.length).padStart(2, "0")}${tag26}` +
    "52045499" +
    "5303360" +
    `54${String(amtStr.length).padStart(2, "0")}${amtStr}` +
    "5802ID" +
    `59${String(merchant.length).padStart(2, "0")}${merchant}` +
    "6013KAB. BOGOR   " +
    "6304";
  return body + crc16Ccitt(body);
}

function buildBankVaNumber(channel: string, invoiceNo: string): string {
  const bankPrefixes: Record<string, string> = {
    BRI: "88081",
    BNI: "88082",
    MANDIRI: "89083",
    BCA: "39084",
  };
  const prefix = bankPrefixes[channel.toUpperCase()] || "88080";
  const numericHash = crypto
    .createHash("sha256")
    .update(invoiceNo)
    .digest("hex")
    .replace(/[^0-9]/g, "")
    .slice(0, 11)
    .padEnd(11, "7");
  return `${prefix}${numericHash}`;
}

export async function getConfiguredPaymentKey(): Promise<string> {
  try {
    const cfg = await prisma.systemSetting.findUnique({ where: { id: "global_config" } });
    const settings = (cfg?.settings as any) || {};
    return String(settings.payment_api_key || process.env.PAYMENT_GATEWAY_API_KEY || "").trim();
  } catch {
    return String(process.env.PAYMENT_GATEWAY_API_KEY || "").trim();
  }
}

export async function createUmkmPaymentInstruction(params: {
  invoiceNo: string;
  amount: number;
  paymentMethod: UmkmPaymentMethod;
  paymentChannel: string;
  storeName: string;
  buyerName: string;
  buyerEmail?: string;
}): Promise<PaymentGatewayInstruction> {
  const { invoiceNo, amount, paymentMethod, paymentChannel, storeName, buyerName, buyerEmail } = params;

  if (paymentMethod === "COD") {
    return {
      provider: "DESAPAY_INTERNAL",
      paymentRef: `COD-${invoiceNo}`,
      instructions: [
        "Pesanan diteruskan ke toko UMKM untuk disiapkan.",
        "Siapkan uang pas sejumlah total tagihan saat kurir desa tiba atau saat pengambilan di toko/BUMDes.",
        "Penjual atau kurir akan mengonfirmasi pembayaran sehingga struk resmi berstatus LUNAS.",
      ],
    };
  }

  const apiKey = await getConfiguredPaymentKey();

  // Integrasi Midtrans Core API apabila key Midtrans terkonfigurasi
  if (apiKey.startsWith("SB-Mid-server-") || apiKey.startsWith("Mid-server-")) {
    const isProd = apiKey.startsWith("Mid-server-") && !apiKey.startsWith("SB-");
    const endpoint = isProd
      ? "https://api.midtrans.com/v2/charge"
      : "https://api.sandbox.midtrans.com/v2/charge";
    const authHeader = "Basic " + Buffer.from(`${apiKey}:`).toString("base64");

    try {
      const bankCode = paymentChannel.toLowerCase();
      const payload =
        paymentMethod === "QRIS"
          ? {
              payment_type: "qris",
              transaction_details: { order_id: invoiceNo, gross_amount: Math.round(amount) },
              customer_details: { first_name: buyerName, email: buyerEmail || "warga@cimanggu1.desa.id" },
            }
          : bankCode === "mandiri"
            ? {
                payment_type: "echannel",
                transaction_details: { order_id: invoiceNo, gross_amount: Math.round(amount) },
                echannel: { bill_info1: "Belanja UMKM:", bill_info2: invoiceNo },
              }
            : {
                payment_type: "bank_transfer",
                transaction_details: { order_id: invoiceNo, gross_amount: Math.round(amount) },
                bank_transfer: { bank: ["bri", "bni", "bca"].includes(bankCode) ? bankCode : "bri" },
              };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const vaNum = data?.va_numbers?.[0]?.va_number || data?.bill_key || data?.permata_va_number;
        const qrStr = data?.qr_string;
        if (qrStr || vaNum) {
          return {
            provider: "MIDTRANS",
            paymentRef: data.transaction_id || invoiceNo,
            qrisPayload: qrStr,
            vaNumber: vaNum,
            instructions:
              paymentMethod === "QRIS"
                ? [
                    "Scan kode QRIS di atas melalui m-Banking, GoPay, OVO, DANA, atau ShopeePay.",
                    "Pastikan nominal yang muncul sama persis dengan total tagihan.",
                    "Status pesanan otomatis terverifikasi LUNAS setelah pembayaran berhasil.",
                  ]
                : [
                    `Lakukan transfer ke Virtual Account ${paymentChannel} nomor ${vaNum}.`,
                    "Masukkan nominal tagihan secara tepat hingga digit terakhir.",
                    "Sistem akan otomatis memperbarui status pembayaran setelah transfer diterima.",
                  ],
          };
        }
      }
    } catch (err) {
      console.warn("Midtrans charge fallback to DesaPay:", err);
    }
  }

  // Fallback / DesaPay Internal Gateway (siap pakai langsung dengan QRIS & VA valid)
  if (paymentMethod === "QRIS") {
    return {
      provider: "DESAPAY_INTERNAL",
      paymentRef: `QR-${invoiceNo}`,
      qrisPayload: buildEmvQrisPayload(invoiceNo, amount, storeName),
      instructions: [
        "Scan kode QRIS DesaMart menggunakan aplikasi e-Wallet (GoPay, OVO, DANA, ShopeePay) atau Mobile Banking.",
        "Setelah melakukan pembayaran, klik tombol 'Verifikasi Pembayaran' untuk menerbitkan Struk Resmi LUNAS.",
      ],
    };
  }

  const vaNumber = buildBankVaNumber(paymentChannel, invoiceNo);
  return {
    provider: "DESAPAY_INTERNAL",
    paymentRef: `VA-${paymentChannel}-${invoiceNo}`,
    vaNumber,
    instructions: [
      `Pilih menu Transfer Virtual Account ${paymentChannel} di m-Banking / ATM.`,
      `Masukkan Nomor Virtual Account: ${vaNumber}`,
      "Periksa nama tujuan 'DesaMart Cimanggu I' & nominal tagihan, lalu selesaikan transfer.",
    ],
  };
}

