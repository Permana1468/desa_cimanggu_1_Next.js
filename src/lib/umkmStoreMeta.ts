export interface UmkmStorePayoutMeta {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl?: string;
  qrisNmid?: string;
  payoutStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  verifiedBy?: string;
  verifiedAt?: string;
  storePhone?: string;
  storeAddress?: string;
}

const STORE_META_PREFIX = "__DESAMART_STORE__:";

export function serializeStoreMeta(meta: UmkmStorePayoutMeta): string {
  return `${STORE_META_PREFIX}${JSON.stringify(meta)}`;
}

export function parseStoreMeta(rawBanner: string | null | undefined): UmkmStorePayoutMeta {
  if (rawBanner && rawBanner.startsWith(STORE_META_PREFIX)) {
    try {
      return JSON.parse(rawBanner.slice(STORE_META_PREFIX.length)) as UmkmStorePayoutMeta;
    } catch {}
  }
  return {
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    qrisImageUrl: "",
    qrisNmid: "",
    payoutStatus: "UNVERIFIED",
    storePhone: "",
    storeAddress: "",
  };
}

