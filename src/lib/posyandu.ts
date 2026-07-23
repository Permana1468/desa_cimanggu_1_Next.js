export interface PosyanduUnit {
  id: string;
  code: string;
  name: string;
  unitCode: string;
  rws: string[];
  rtDescription: string;
  color: string;
}

export const POSYANDU_UNITS: PosyanduUnit[] = [
  { id: "mawar1", code: "MAWAR_1", name: "Posyandu Mawar I", unitCode: "Posyandu Unit 001", rws: ["001"], rtDescription: "RW 001 (Mencakup seluruh RT)", color: "from-rose-500 to-pink-600" },
  { id: "mawar2", code: "MAWAR_2", name: "Posyandu Mawar II", unitCode: "Posyandu Unit 002", rws: ["002"], rtDescription: "RW 002 (Mencakup seluruh RT)", color: "from-purple-500 to-indigo-600" },
  { id: "mawar3", code: "MAWAR_3", name: "Posyandu Mawar III", unitCode: "Posyandu Unit 003", rws: ["003"], rtDescription: "RW 003 (Mencakup seluruh RT)", color: "from-blue-500 to-cyan-600" },
  { id: "mawar4", code: "MAWAR_4", name: "Posyandu Mawar IV", unitCode: "Posyandu Unit 004", rws: ["004", "009"], rtDescription: "RW 004 & RW 009 (Mencakup seluruh RT)", color: "from-teal-500 to-emerald-600" },
  { id: "mawar5", code: "MAWAR_5", name: "Posyandu Mawar V", unitCode: "Posyandu Unit 005", rws: ["005"], rtDescription: "RW 005 (Mencakup seluruh RT)", color: "from-amber-500 to-orange-600" },
  { id: "mawar6", code: "MAWAR_6", name: "Posyandu Mawar VI", unitCode: "Posyandu Unit 006", rws: ["006", "007"], rtDescription: "RW 006 & RW 007 (Mencakup seluruh RT)", color: "from-emerald-500 to-teal-600" },
  { id: "mawar7", code: "MAWAR_7", name: "Posyandu Mawar VII", unitCode: "Posyandu Unit 007", rws: ["008"], rtDescription: "RW 008 (Mencakup seluruh RT)", color: "from-violet-500 to-purple-600" },
];

/**
 * Get Posyandu Unit object by ID, code, unitCode, or name string
 */
export function getPosyanduUnit(key?: string | null): PosyanduUnit | null {
  if (!key || key === "ALL") return null;
  const normalizedKey = key.trim().toLowerCase();
  
  return POSYANDU_UNITS.find(unit => 
    unit.id.toLowerCase() === normalizedKey ||
    unit.code.toLowerCase() === normalizedKey ||
    unit.unitCode.toLowerCase() === normalizedKey ||
    unit.unitCode.replace(/\s+/g, "").toLowerCase() === normalizedKey.replace(/\s+/g, "") ||
    unit.name.toLowerCase() === normalizedKey ||
    unit.name.replace(/\s+/g, "").toLowerCase() === normalizedKey.replace(/\s+/g, "")
  ) || null;
}

/**
 * Get valid RW array for a given posyandu unit key (id/code/name).
 * Returns empty array if unit not found or if "ALL".
 */
export function getRWsForPosyandu(key?: string | null): string[] {
  const unit = getPosyanduUnit(key);
  return unit ? unit.rws : [];
}

/**
 * Detect user's assigned Posyandu unit from session user object (email, fullName, name, position, rw).
 * Matches posyandu001, posyandu002 ... posyandu007 and Posyandu Unit 001 ... Posyandu Unit 007.
 */
export function detectUserPosyanduUnit(user?: any): PosyanduUnit | null {
  if (!user) return null;

  const rwStr = user.rw ? String(user.rw).trim() : "";
  const textToSearch = [
    user.fullName,
    user.name,
    user.email,
    user.position,
    user.posyanduName
  ].filter(Boolean).join(" ").toLowerCase();

  // 1. Match by Unit 001 - 007 or posyandu001 - posyandu007 or Mawar I - VII
  if (textToSearch.includes("001") || textToSearch.includes("posyandu001") || textToSearch.includes("mawar 1") || textToSearch.includes("mawar1") || textToSearch.includes("mawar i")) {
    return POSYANDU_UNITS[0]; // Unit 001 / Mawar I -> RW 001
  }
  if (textToSearch.includes("002") || textToSearch.includes("posyandu002") || textToSearch.includes("mawar 2") || textToSearch.includes("mawar2") || textToSearch.includes("mawar ii")) {
    return POSYANDU_UNITS[1]; // Unit 002 / Mawar II -> RW 002
  }
  if (textToSearch.includes("003") || textToSearch.includes("posyandu003") || textToSearch.includes("mawar 3") || textToSearch.includes("mawar3") || textToSearch.includes("mawar iii")) {
    return POSYANDU_UNITS[2]; // Unit 003 / Mawar III -> RW 003
  }
  if (textToSearch.includes("004") || textToSearch.includes("posyandu004") || textToSearch.includes("mawar 4") || textToSearch.includes("mawar4") || textToSearch.includes("mawar iv")) {
    return POSYANDU_UNITS[3]; // Unit 004 / Mawar IV -> RW 004 & RW 009
  }
  if (textToSearch.includes("005") || textToSearch.includes("posyandu005") || textToSearch.includes("mawar 5") || textToSearch.includes("mawar5") || textToSearch.includes("mawar v")) {
    return POSYANDU_UNITS[4]; // Unit 005 / Mawar V -> RW 005
  }
  if (textToSearch.includes("006") || textToSearch.includes("posyandu006") || textToSearch.includes("mawar 6") || textToSearch.includes("mawar6") || textToSearch.includes("mawar vi")) {
    return POSYANDU_UNITS[5]; // Unit 006 / Mawar VI -> RW 006 & RW 007
  }
  if (textToSearch.includes("007") || textToSearch.includes("posyandu007") || textToSearch.includes("mawar 7") || textToSearch.includes("mawar7") || textToSearch.includes("mawar vii")) {
    return POSYANDU_UNITS[6]; // Unit 007 / Mawar VII -> RW 008
  }

  // 2. Match by RW string if text search yields no unit
  if (rwStr) {
    const cleanUserRws = rwStr.split(",").map(s => s.trim().padStart(3, "0"));
    for (const unit of POSYANDU_UNITS) {
      if (cleanUserRws.some(urw => unit.rws.map(r => r.padStart(3, "0")).includes(urw))) {
        return unit;
      }
    }
  }

  return null;
}

/**
 * Given a user's session rw string or user details, determine their default posyandu unit or RW list.
 */
export function resolvePosyanduRWs(userRw?: string | null, posyanduFilter?: string | null): string[] {
  // If specific posyandu filter is requested
  if (posyanduFilter && posyanduFilter !== "ALL") {
    const unit = getPosyanduUnit(posyanduFilter);
    if (unit) return unit.rws;
  }

  // Parse user rw string if available
  if (userRw) {
    const rws = userRw.split(",").map(s => s.trim()).filter(Boolean);
    if (rws.length > 0) return rws;
  }

  return [];
}
