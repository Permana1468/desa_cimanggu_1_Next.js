export function toRoman(num: number): string {
  const roman: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let str = '';
  for (const i of Object.keys(roman)) {
    const q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}

export function formatDusun(dusun: string | null | undefined): string {
    if (!dusun) return "";
    let str = String(dusun).trim().toUpperCase();
    if (str.startsWith("DUSUN ")) {
        str = str.replace("DUSUN ", "").trim();
    }
    const num = parseInt(str);
    if (!isNaN(num) && num > 0) {
        return `DUSUN ${toRoman(num)}`;
    }
    return `DUSUN ${str}`;
}

export function formatRT(rt: string | number | null | undefined): string {
    if (!rt) return "000";
    return String(rt).replace(/\D/g, '').padStart(3, '0');
}

export function formatRW(rw: string | number | null | undefined): string {
    if (!rw) return "000";
    return String(rw).replace(/\D/g, '').padStart(3, '0');
}

export function formatWilayah(rt: string | number | null | undefined, rw: string | number | null | undefined, dusun: string | null | undefined): string {
    let result = `RT. ${formatRT(rt)} / RW. ${formatRW(rw)}`;
    if (dusun) {
        result += ` - ${formatDusun(dusun)}`;
    }
    return result;
}
