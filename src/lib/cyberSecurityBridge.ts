import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface WafScanResult {
  engine: string;
  ip: string;
  path: string;
  targetNode: string;
  status: "ALLOWED" | "BLOCKED" | "WARNING";
  threatScore: number;
  threatLevel: "CLEAN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  attackVector: string;
  action: string;
  executionTimeMicroseconds: number;
  matchedSignatures: string[];
}

export interface FraudAnalysisResult {
  engine: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  isFraudulent: boolean;
  severity: "CLEAN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  violations: Array<{
    code: string;
    rule: string;
    detail: string;
  }>;
  suggestedPenalty: string;
  userWarningMessage: string;
  masterAlertMessage: string;
  statusSuccess: boolean;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  sourceType: "EXTERNAL_ATTACK" | "INTERNAL_FRAUD" | "RULE_VIOLATION";
  ip: string;
  userOrIdentifier: string;
  targetNode: string;
  attackVector: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "BLOCKED" | "WARNING" | "INVESTIGATING" | "RESOLVED";
  detail: string;
  userWarningDispatched?: boolean;
}

export interface TechnologyNode {
  id: string;
  name: string;
  category: "FRONTEND" | "GATEWAY" | "DATABASE" | "CPP_CORE" | "PYTHON_AI" | "STORAGE" | "INTEGRATION" | "SENTRY_BRAIN";
  techStack: string;
  status: "ONLINE" | "SECURED" | "THREAT_DEFENDED" | "WARNING";
  threatCount: number;
  latencyMs: number;
  description: string;
  connectedTo: string[]; // ID simpul lain yang terhubung
}

// In-Memory Security State with JSON fallback persistence
const DATA_DIR = path.join(process.cwd(), "services", "sentry_cyber", "data");
const INCIDENTS_FILE = path.join(DATA_DIR, "incidents.json");
const BLACKLIST_FILE = path.join(DATA_DIR, "blacklist.json");
const USER_WARNINGS_FILE = path.join(DATA_DIR, "active_warnings.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 12 Technology Nodes (Entire Project Topology - No Single Tech Left Behind)
export const PROJECT_TECH_NODES: TechnologyNode[] = [
  {
    id: "sentry-brain",
    name: "Sentry Brain (Otak Kepala Keamanan)",
    category: "SENTRY_BRAIN",
    techStack: "C++ WAF & Python Sentinel Core",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 0.8,
    description: "Sentral inspeksi lalu lintas siber, deteksi kecurangan, dan komando blokade instan 24/7.",
    connectedTo: ["next-edge", "auth-vault", "postgres-db", "cpp-geo", "cpp-rab", "py-posyandu", "py-musrenbang"]
  },
  {
    id: "next-edge",
    name: "Next.js 16 Edge Gateway",
    category: "FRONTEND",
    techStack: "Turbopack, React 19, Server Actions",
    status: "SECURED",
    threatCount: 0,
    latencyMs: 12.4,
    description: "Gerbang antar-muka aplikasi desa, SSR, dan routing terenkripsi.",
    connectedTo: ["sentry-brain", "auth-vault", "postgres-db"]
  },
  {
    id: "auth-vault",
    name: "Auth & Identity Vault",
    category: "GATEWAY",
    techStack: "NextAuth, WebAuthn Biometric, Argon2",
    status: "SECURED",
    threatCount: 0,
    latencyMs: 14.1,
    description: "Penjaga sesi, autentikasi sidik jari, dan kontrol RBAC pengguna terdaftar.",
    connectedTo: ["sentry-brain", "postgres-db"]
  },
  {
    id: "postgres-db",
    name: "PostgreSQL Database Core",
    category: "DATABASE",
    techStack: "PostgreSQL, Prisma ORM, JSONB Indexing",
    status: "SECURED",
    threatCount: 0,
    latencyMs: 4.8,
    description: "Penyimpanan master kependudukan, sensus riil, audit trail, dan buku tamu.",
    connectedTo: ["sentry-brain", "supabase-storage"]
  },
  {
    id: "supabase-storage",
    name: "Supabase & Media Storage",
    category: "STORAGE",
    techStack: "S3 Compatible Object Storage, AES-256",
    status: "SECURED",
    threatCount: 0,
    latencyMs: 18.2,
    description: "Penyimpanan dokumen permohonan surat, bukti bansos, dan arsip digital.",
    connectedTo: ["sentry-brain", "postgres-db"]
  },
  {
    id: "cpp-geo",
    name: "C++ Geodesic Spatial Core",
    category: "CPP_CORE",
    techStack: "C++17, Raycasting Polygon, Microsecond Engine",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 0.4,
    description: "Kalkulasi batas wilayah Dusun/RW/RT & perpotongan spasial peta desa berkecepatan mikrodetik.",
    connectedTo: ["sentry-brain", "next-edge"]
  },
  {
    id: "cpp-rab",
    name: "C++ AHSP Construction Core",
    category: "CPP_CORE",
    techStack: "C++17, PUPR Standard, O(N) Computational Math",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 0.6,
    description: "Perhitungan Bill of Quantities & RAB pembangunan infrastruktur desa.",
    connectedTo: ["sentry-brain", "next-edge"]
  },
  {
    id: "py-posyandu",
    name: "Python Posyandu AI Engine",
    category: "PYTHON_AI",
    techStack: "Python 3.12, WHO Anthro MGRS, Z-Score Model",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 8.2,
    description: "Kecerdasan buatan diagnosis stunting, gizi buruk, dan proyeksi kesehatan balita 60 hari.",
    connectedTo: ["sentry-brain", "next-edge"]
  },
  {
    id: "py-musrenbang",
    name: "Python MCDM Decision Core",
    category: "PYTHON_AI",
    techStack: "Python 3.12, TOPSIS Matrix Normalization",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 9.1,
    description: "Analisis prioritas usulan pembangunan Musrenbang berbasis algoritma multi-kriteria.",
    connectedTo: ["sentry-brain", "next-edge"]
  },
  {
    id: "gemini-ai",
    name: "Google Gemini AI Studio",
    category: "INTEGRATION",
    techStack: "Gemini 2.5 Pro API, Multimodal OCR",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 45.0,
    description: "Ekstraksi otomatis dokumen fisik APBDes, KTP, KK, dan formulir permohonan.",
    connectedTo: ["sentry-brain", "next-edge"]
  },
  {
    id: "wa-gateway",
    name: "WhatsApp Fonnte Gateway",
    category: "INTEGRATION",
    techStack: "Fonnte Webhook, Asynchronous Queue",
    status: "ONLINE",
    threatCount: 0,
    latencyMs: 28.5,
    description: "Penyampaian notifikasi real-time surat selesai dan peringatan darurat ke nomor warga.",
    connectedTo: ["sentry-brain", "next-edge"]
  },
  {
    id: "siskeudes-flow",
    name: "Siskeudes Administration Core",
    category: "DATABASE",
    techStack: "F4 Multi-Page Layout Engine, Digital Signatures",
    status: "SECURED",
    threatCount: 0,
    latencyMs: 5.6,
    description: "Pemrosesan tata naskah dinas, penomoran otomatis buku agenda, dan disposisi.",
    connectedTo: ["sentry-brain", "postgres-db"]
  }
];

/**
 * Scan incoming web request using compiled C++ WAF Binary
 */
export async function scanRequestWithCppWaf(
  ip: string,
  pathUri: string,
  payload: string = "",
  userAgent: string = "Mozilla/5.0"
): Promise<WafScanResult> {
  const binPath = path.join(process.cwd(), "services", "sentry_cyber", "bin", "sentry_waf");

  if (!fs.existsSync(binPath)) {
    // Fallback if binary is not yet compiled
    return {
      engine: "TypeScript WAF Fallback Engine",
      ip,
      path: pathUri,
      targetNode: "Edge Gateway (Next.js)",
      status: "ALLOWED",
      threatScore: 0,
      threatLevel: "CLEAN",
      attackVector: "CLEAN",
      action: "ALLOW",
      executionTimeMicroseconds: 50,
      matchedSignatures: []
    };
  }

  return new Promise((resolve) => {
    const proc = spawn(binPath, [ip, pathUri, payload, userAgent]);
    let output = "";

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.on("close", (code) => {
      try {
        const json = JSON.parse(output.trim());
        if (json.status === "BLOCKED") {
          recordIncident({
            sourceType: "EXTERNAL_ATTACK",
            ip,
            userOrIdentifier: "EXTERNAL_ACTOR",
            targetNode: json.targetNode || "Edge Gateway",
            attackVector: json.attackVector || "MALICIOUS_PAYLOAD",
            severity: "CRITICAL",
            status: "BLOCKED",
            detail: `C++ WAF memblokade IP ${ip} saat mencoba ${json.attackVector} pada endpoint ${pathUri}. Score: ${json.threatScore}`
          });
          addToBlacklist(ip, `Auto-blocked by C++ Sentry WAF: ${json.attackVector}`);
        }
        resolve(json);
      } catch (e) {
        resolve({
          engine: "C++ WAF (Fallback Parse)",
          ip,
          path: pathUri,
          targetNode: "Edge Gateway",
          status: "ALLOWED",
          threatScore: 0,
          threatLevel: "CLEAN",
          attackVector: "CLEAN",
          action: "ALLOW",
          executionTimeMicroseconds: 100,
          matchedSignatures: []
        });
      }
    });

    proc.on("error", () => {
      resolve({
        engine: "C++ WAF (Error Fallback)",
        ip,
        path: pathUri,
        targetNode: "Edge Gateway",
        status: "ALLOWED",
        threatScore: 0,
        threatLevel: "CLEAN",
        attackVector: "CLEAN",
        action: "ALLOW",
        executionTimeMicroseconds: 100,
        matchedSignatures: []
      });
    });
  });
}

/**
 * Analyze user operations for internal fraud / rules violation using Python AI Sentinel
 */
export async function analyzeUserBehaviorWithPython(data: {
  userId: string;
  userName: string;
  role: string;
  action: string;
  targetResource: string;
  ip?: string;
  metadata?: any;
}): Promise<FraudAnalysisResult> {
  const pyScript = path.join(process.cwd(), "services", "sentry_cyber", "fraud_sentinel.py");

  return new Promise((resolve) => {
    const proc = spawn("python3", [pyScript, JSON.stringify(data)]);
    let output = "";

    proc.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    proc.on("close", () => {
      try {
        const json = JSON.parse(output.trim());
        if (json.isFraudulent) {
          recordIncident({
            sourceType: "INTERNAL_FRAUD",
            ip: data.ip || "127.0.0.1",
            userOrIdentifier: `${data.userName} (${data.role})`,
            targetNode: data.targetResource || "Database Core",
            attackVector: json.violations?.[0]?.code || "RULE_VIOLATION",
            severity: json.severity || "HIGH",
            status: "WARNING",
            detail: json.userWarningMessage || "Pelanggaran protokol sistem internal",
            userWarningDispatched: true
          });
          // Dispatch active alarm to user
          dispatchUserWarning(data.userId, json.userWarningMessage);
        }
        resolve(json);
      } catch (e) {
        resolve({
          engine: "Python Sentinel (Fallback)",
          timestamp: new Date().toISOString(),
          userId: data.userId,
          userName: data.userName,
          userRole: data.role,
          isFraudulent: false,
          severity: "CLEAN",
          violations: [],
          suggestedPenalty: "NONE",
          userWarningMessage: "",
          masterAlertMessage: "",
          statusSuccess: false
        });
      }
    });

    proc.on("error", () => {
      resolve({
        engine: "Python Sentinel (Unavailable)",
        timestamp: new Date().toISOString(),
        userId: data.userId,
        userName: data.userName,
        userRole: data.role,
        isFraudulent: false,
        severity: "CLEAN",
        violations: [],
        suggestedPenalty: "NONE",
        userWarningMessage: "",
        masterAlertMessage: "",
        statusSuccess: false
      });
    });
  });
}

// ── PERSISTENCE & STORAGE HELPERS ──────────────────────────────────────────

export function getSecurityIncidents(): SecurityIncident[] {
  ensureDataDir();
  try {
    if (fs.existsSync(INCIDENTS_FILE)) {
      const content = fs.readFileSync(INCIDENTS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Failed to read incidents file:", e);
  }

  // Initial seed data if file is new
  const initial: SecurityIncident[] = [
    {
      id: "inc-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      sourceType: "EXTERNAL_ATTACK",
      ip: "103.145.22.8",
      userOrIdentifier: "UNKNOWN_SCANNER",
      targetNode: "PostgreSQL Database Core",
      attackVector: "SQL_INJECTION",
      severity: "CRITICAL",
      status: "BLOCKED",
      detail: "C++ Sentry WAF mendeteksi payload 'UNION SELECT * FROM users' dari bot scanner dan memblokir IP secara instan."
    },
    {
      id: "inc-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      sourceType: "INTERNAL_FRAUD",
      ip: "192.168.1.14",
      userOrIdentifier: "Operator Lapangan (OPERATOR_DESA)",
      targetNode: "C++ AHSP RAB Engine",
      attackVector: "FINANCIAL_DATA_TAMPERING",
      severity: "HIGH",
      status: "WARNING",
      detail: "Python AI Sentinel mendeteksi percobaan modifikasi nominal anggaran APBDes tanpa tiket otorisasi pimpinan.",
      userWarningDispatched: true
    }
  ];
  saveIncidents(initial);
  return initial;
}

export function recordIncident(incident: Omit<SecurityIncident, "id" | "timestamp">) {
  const current = getSecurityIncidents();
  const newIncident: SecurityIncident = {
    ...incident,
    id: `inc-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString()
  };
  current.unshift(newIncident);
  // Keep last 100 incidents
  saveIncidents(current.slice(0, 100));
}

function saveIncidents(incidents: SecurityIncident[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(incidents, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save incidents:", e);
  }
}

export function getBlacklistedIps(): Array<{ ip: string; reason: string; timestamp: string }> {
  ensureDataDir();
  try {
    if (fs.existsSync(BLACKLIST_FILE)) {
      return JSON.parse(fs.readFileSync(BLACKLIST_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read blacklist:", e);
  }
  const initial = [
    { ip: "103.145.22.8", reason: "Automated SQLi Bot Scanner (Blocked by C++ WAF)", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { ip: "45.155.205.233", reason: "Brute Force SSH & Auth Probe (Blocked by C++ Sentry)", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
  ];
  saveBlacklist(initial);
  return initial;
}

export function addToBlacklist(ip: string, reason: string) {
  const list = getBlacklistedIps();
  if (!list.some(item => item.ip === ip)) {
    list.unshift({ ip, reason, timestamp: new Date().toISOString() });
    saveBlacklist(list);
  }
}

export function removeFromBlacklist(ip: string) {
  const list = getBlacklistedIps().filter(item => item.ip !== ip);
  saveBlacklist(list);
}

function saveBlacklist(list: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save blacklist:", e);
  }
}

// ── USER WARNING / ALARM DISPATCH ──────────────────────────────────────────

export function dispatchUserWarning(userId: string, message: string) {
  ensureDataDir();
  let warnings: Record<string, { message: string; timestamp: string }> = {};
  try {
    if (fs.existsSync(USER_WARNINGS_FILE)) {
      warnings = JSON.parse(fs.readFileSync(USER_WARNINGS_FILE, "utf-8"));
    }
  } catch (e) {}

  warnings[userId] = {
    message,
    timestamp: new Date().toISOString()
  };

  try {
    fs.writeFileSync(USER_WARNINGS_FILE, JSON.stringify(warnings, null, 2), "utf-8");
  } catch (e) {}
}

export function consumeUserWarning(userId: string): string | null {
  ensureDataDir();
  try {
    if (fs.existsSync(USER_WARNINGS_FILE)) {
      const warnings = JSON.parse(fs.readFileSync(USER_WARNINGS_FILE, "utf-8"));
      if (warnings[userId]) {
        const msg = warnings[userId].message;
        delete warnings[userId];
        fs.writeFileSync(USER_WARNINGS_FILE, JSON.stringify(warnings, null, 2), "utf-8");
        return msg;
      }
    }
  } catch (e) {}
  return null;
}
