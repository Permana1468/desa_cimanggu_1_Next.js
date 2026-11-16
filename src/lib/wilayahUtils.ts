export function cleanDigits(val: string | undefined | null): string {
    if (!val) return '0';
    return val.toString().replace(/\D/g, '').replace(/^0+/, '') || '0';
}

export function cleanName(val: string | undefined | null): string {
    if (!val) return "";
    return val.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getWilayahVariants(val: string | undefined | null): string[] {
    if (!val) return [];
    const raw = val.toString().trim();
    const clean = cleanDigits(raw);
    const variants = new Set<string>([
        raw,
        clean,
        clean.padStart(2, '0'),
        clean.padStart(3, '0'),
        `RT ${clean}`,
        `RT ${clean.padStart(2, '0')}`,
        `RT ${clean.padStart(3, '0')}`,
        `RW ${clean}`,
        `RW ${clean.padStart(2, '0')}`,
        `RW ${clean.padStart(3, '0')}`,
        `RT.${clean}`,
        `RW.${clean}`
    ]);
    return Array.from(variants).filter(Boolean);
}

export function isWilayahMatch(
    role: string,
    targetRt: string | null | undefined,
    targetRw: string | null | undefined,
    sessionRt: string | null | undefined,
    sessionRw: string | null | undefined
): boolean {
    if (role === "RW") {
        const cleanTargRw = cleanDigits(targetRw);
        const cleanSessRw = cleanDigits(sessionRw);
        return cleanTargRw === cleanSessRw;
    }
    if (role === "RT") {
        const cleanTargRt = cleanDigits(targetRt);
        const cleanSessRt = cleanDigits(sessionRt);
        const cleanTargRw = cleanDigits(targetRw);
        const cleanSessRw = cleanDigits(sessionRw);
        return cleanTargRw === cleanSessRw && cleanTargRt === cleanSessRt;
    }
    return true;
}

