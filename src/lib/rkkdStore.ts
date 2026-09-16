// Helper store for Real-time RKKD Pagu Synchronization with APBDes

export interface RkkdPaguData {
  ADD: number;
  DDS: number;
  PBH: number;
  PBK: number;
  PBP: number;
}

export const DEFAULT_RKKD_PAGU: RkkdPaguData = {
  ADD: 916400000,
  DDS: 1530900000,
  PBH: 435351216,
  PBK: 1500000000,
  PBP: 130000000
};

const STORAGE_KEY = "rkkd_pagu_store_v1";

export function getRkkdPagus(): RkkdPaguData {
  if (typeof window === "undefined") return DEFAULT_RKKD_PAGU;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RKKD_PAGU;
    const parsed = JSON.parse(raw);
    return {
      ADD: Number(parsed.ADD) || DEFAULT_RKKD_PAGU.ADD,
      DDS: Number(parsed.DDS) || DEFAULT_RKKD_PAGU.DDS,
      PBH: Number(parsed.PBH) || DEFAULT_RKKD_PAGU.PBH,
      PBK: Number(parsed.PBK) || DEFAULT_RKKD_PAGU.PBK,
      PBP: Number(parsed.PBP) || DEFAULT_RKKD_PAGU.PBP,
    };
  } catch (e) {
    return DEFAULT_RKKD_PAGU;
  }
}

export function updateRkkdPagu(sourceKey: keyof RkkdPaguData, newPagu: number) {
  if (typeof window === "undefined") return;
  try {
    const current = getRkkdPagus();
    const updated = { ...current, [sourceKey]: Number(newPagu) || 0 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("rkkd_pagu_updated"));
  } catch (e) {
    console.error("Error updating RKKD pagu store:", e);
  }
}
