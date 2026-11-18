"use client";

import React, { useState, useTransition, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Server, 
  Lock, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  Terminal, 
  Activity, 
  Globe, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Play, 
  Radio, 
  Flame, 
  CornerDownRight, 
  Info,
  Layers,
  ArrowRight,
  Bell,
  UserX,
  FileCheck2
} from "lucide-react";
import { 
  simulateExternalAttackAction, 
  simulateInternalFraudAction, 
  blockIpAction, 
  unblockIpAction,
  resolveIncidentAction,
  suspendFraudulentUserAction,
  sendDirectUserAlarmAction,
  getRealtimeCyberSecurityOverview
} from "@/actions/cyberSecurity";
import toast from "react-hot-toast";

interface CyberSentryDashboardProps {
  initialData: {
    nodes: any[];
    incidents: any[];
    blacklistedIps: any[];
    metrics: any;
  };
}

export function CyberSentryDashboard({ initialData }: CyberSentryDashboardProps) {
  const [data, setData] = useState(initialData);
  const [selectedNode, setSelectedNode] = useState<any>(initialData.nodes[0] || null);
  const [isPending, startTransition] = useTransition();
  const [manualIp, setManualIp] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [activeTab, setActiveTab] = useState<"TOPOLOGY" | "INCIDENTS" | "FIREWALL">("TOPOLOGY");
  const [lastSync, setLastSync] = useState<string>("Baru Saja");

  // Real-Time Background Synchronization (Auto-polls every 10 seconds when tab is active)
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      try {
        const updated = await getRealtimeCyberSecurityOverview();
        if (isMounted && updated) {
          setData(updated);
          setLastSync(new Date().toLocaleTimeString("id-ID"));
        }
      } catch {
        // Silent error for background poll
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Quick refresh helper
  const refreshData = async () => {
    try {
      const updated = await getRealtimeCyberSecurityOverview();
      if (updated) {
        setData(updated);
        setLastSync(new Date().toLocaleTimeString("id-ID"));
        toast.success("Data keamanan berhasil disinkronkan.");
      }
    } catch {
      toast.error("Gagal menyinkronkan data.");
    }
  };

  // Handler: Test External Cyber Attack (Triggers C++ WAF)
  const handleTestExternalAttack = (vector: "SQLI" | "XSS" | "SCANNER") => {
    startTransition(async () => {
      const toastId = toast.loading(`Mengirim simulasi serangan siber (${vector}) ke C++ WAF...`);
      try {
        const res: any = await simulateExternalAttackAction(vector);
        toast.dismiss(toastId);
        if (res.status === "BLOCKED") {
          toast.error(
            `[C++ WAF MEMBLOKADE] ${res.attackVector} dari IP ${res.ip} berhasil dicegat dalam ${res.executionTimeMicroseconds} μs!`,
            { duration: 6000 }
          );
        } else {
          toast.success(`[C++ WAF] Request diproses: ${res.status}`, { duration: 4000 });
        }
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (err: any) {
        toast.dismiss(toastId);
        toast.error(err.message || "Gagal menjalankan simulasi.");
      }
    });
  };

  // Handler: Test Internal User Fraud (Triggers Python Sentinel)
  const handleTestInternalFraud = (type: "IDOR_TERRITORY" | "FINANCIAL_TAMPERING" | "BOT_SPAM") => {
    startTransition(async () => {
      const toastId = toast.loading(`Menganalisis anomali kecurangan internal dengan Python AI Sentinel...`);
      try {
        const res: any = await simulateInternalFraudAction(type);
        toast.dismiss(toastId);
        if (res.isFraudulent) {
          toast.error(
            `[PYTHON AI SENTINEL] Kecurangan Terdeteksi: ${res.violations?.[0]?.code}! Alarm peringatan telah dikirimkan ke layar pengguna.`,
            { duration: 6000 }
          );
        } else {
          toast.success(`[PYTHON AI] Tidak ada anomali terdeteksi.`);
        }
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (err: any) {
        toast.dismiss(toastId);
        toast.error(err.message || "Gagal menjalankan analisis.");
      }
    });
  };

  // Handler: Manual Block IP
  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp.trim()) return;
    startTransition(async () => {
      try {
        await blockIpAction(manualIp.trim(), manualReason.trim());
        toast.success(`IP ${manualIp} telah diblokade ke firewall.`);
        setManualIp("");
        setManualReason("");
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (err: any) {
        toast.error(err.message || "Gagal memblokir IP.");
      }
    });
  };

  // Handler: Unblock IP
  const handleUnblock = (ip: string) => {
    startTransition(async () => {
      try {
        await unblockIpAction(ip);
        toast.success(`IP ${ip} telah dibuka dari blokir.`);
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (err: any) {
        toast.error(err.message || "Gagal membuka blokir.");
      }
    });
  };

  // Handler Tindakan Khusus: Selesaikan Insiden
  const handleResolveIncident = (incidentId: string) => {
    startTransition(async () => {
      try {
        const res = await resolveIncidentAction(incidentId);
        toast.success(res.message);
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (e: any) {
        toast.error(e.message || "Gagal memperbarui insiden.");
      }
    });
  };

  // Handler Tindakan Khusus: Nonaktifkan / Bekukan Akun Pelaku
  const handleSuspendUser = (userIdentifier: string) => {
    const reason = window.prompt(`Masukkan alasan pembekuan/penonaktifan akun untuk '${userIdentifier}':`, "Pelanggaran integritas data desa terdeteksi oleh AI Sentinel");
    if (!reason) return;

    startTransition(async () => {
      try {
        const res = await suspendFraudulentUserAction(userIdentifier, reason);
        toast.success(res.message);
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (e: any) {
        toast.error(e.message || "Gagal membekukan akun.");
      }
    });
  };

  // Handler Tindakan Khusus: Kirim Peringatan Alarm Kustom
  const handleSendDirectAlarm = (userIdentifier: string) => {
    const msg = window.prompt(`Ketikkan pesan alarm peringatan langsung ke layar '${userIdentifier}':`, "Peringatan Khusus: Jangan mencoba mengakses atau memanipulasi data di luar wewenang Anda!");
    if (!msg) return;

    startTransition(async () => {
      try {
        const res = await sendDirectUserAlarmAction(userIdentifier, msg);
        toast.success(res.message);
        const updated = await getRealtimeCyberSecurityOverview();
        if (updated) setData(updated);
      } catch (e: any) {
        toast.error(e.message || "Gagal mengirim alarm.");
      }
    });
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* ── 1. COMMAND HEADER: SENTRY CYBER OVERWATCH ─────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1122] to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-[90px] pointer-events-none -mb-32" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/25 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Radio size={13} className="animate-pulse" /> Live CCTV Security Overwatch • C++ & Python AI
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SINKRONISASI REALTIME (Sinkron: {lastSync})
                </div>
                <button
                  onClick={refreshData}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold transition-all"
                  title="Sinkronkan Data Sekarang"
                >
                  <RefreshCw size={11} className={isPending ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Pusat Keamanan Siber & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-blue-400">Sentry Sentinel</span>
              </h1>
              <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-3xl leading-relaxed mt-1">
                Otak Pengawas Keamanan Real-Time yang memindai setiap detik seluruh 12 simpul teknologi desa. Memblokade serangan luar dengan C++ WAF instan (14 μs) dan mendeteksi kecurangan internal pengguna dengan Python AI Anomaly Sentinel.
              </p>
            </div>

            {/* Quick Sentry Status Card */}
            <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shrink-0 self-start xl:self-auto">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Eye size={22} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Status Sistem</span>
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  12/12 Node Terlindungi
                </span>
              </div>
            </div>
          </div>

          {/* KPI Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Simpul Terhubung</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">12 Node Aktif</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">IP Diblokade WAF</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">{data.blacklistedIps.length} IP Terisolir</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Anomali Terdeteksi</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">{data.incidents.length} Catatan</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Kecepatan C++ WAF</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5 block font-mono">&lt; 25 μs (Microsec)</span>
            </div>
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Uji Live Simulator:</span>
              <button
                type="button"
                onClick={() => handleTestExternalAttack("SQLI")}
                disabled={isPending}
                className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Flame size={13} /> Uji Serangan SQLi (C++)
              </button>
              <button
                type="button"
                onClick={() => handleTestExternalAttack("XSS")}
                disabled={isPending}
                className="px-3.5 py-2 rounded-xl bg-orange-600/80 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Terminal size={13} /> Uji XSS Exploit (C++)
              </button>
              <button
                type="button"
                onClick={() => handleTestInternalFraud("IDOR_TERRITORY")}
                disabled={isPending}
                className="px-3.5 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <ShieldAlert size={13} /> Uji Kecurangan RT (Python)
              </button>
              <button
                type="button"
                onClick={() => handleTestInternalFraud("FINANCIAL_TAMPERING")}
                disabled={isPending}
                className="px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Lock size={13} /> Uji Tampering APBDes
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Live Sentry Daemon Active
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. NAVIGATION TABS (TOPOLOGY vs INCIDENTS vs FIREWALL) ───────── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("TOPOLOGY")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "TOPOLOGY"
              ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Layers size={15} /> Topologi 12 Node Proyek
        </button>

        <button
          onClick={() => setActiveTab("INCIDENTS")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "INCIDENTS"
              ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Activity size={15} /> Live Incident Stream ({data.incidents.length})
        </button>

        <button
          onClick={() => setActiveTab("FIREWALL")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "FIREWALL"
              ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Ban size={15} /> Firewall & Daftar Blokir ({data.blacklistedIps.length})
        </button>
      </div>

      {/* ── TAB 1: 12 TECHNOLOGY NODES TOPOLOGY MESH ───────────────────── */}
      {activeTab === "TOPOLOGY" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isBrain = node.id === "sentry-brain";

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isBrain
                      ? "bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-500/50 shadow-lg shadow-indigo-900/30 ring-2 ring-indigo-500/40"
                      : isSelected
                      ? "bg-blue-50/80 border-[#1d64ec] shadow-md ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200/80 hover:shadow-md hover:border-slate-300"
                  }`}
                >
                  {/* Active Pulse Status Pin */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      isBrain
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : node.status === "THREAT_DEFENDED"
                        ? "bg-rose-100 text-rose-700 border-rose-200"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}>
                      {node.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        isBrain 
                          ? "bg-indigo-400 animate-ping" 
                          : node.status === "THREAT_DEFENDED"
                          ? "bg-rose-500 animate-pulse"
                          : "bg-emerald-500"
                      }`} />
                      <span className={`text-[10px] font-mono font-bold ${isBrain ? "text-slate-300" : "text-slate-500"}`}>
                        {node.latencyMs} ms
                      </span>
                    </div>
                  </div>

                  <h3 className={`font-black text-sm tracking-tight mb-1 ${isBrain ? "text-white" : "text-slate-900"}`}>
                    {node.name}
                  </h3>
                  <p className={`text-[11px] font-mono mb-3 ${isBrain ? "text-indigo-200" : "text-blue-600 font-bold"}`}>
                    {node.techStack}
                  </p>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isBrain ? "text-slate-300" : "text-slate-500 font-medium"}`}>
                    {node.description}
                  </p>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[10px] font-bold ${
                    isBrain ? "border-white/10 text-slate-400" : "border-slate-100 text-slate-400"
                  }`}>
                    <span>{node.connectedTo.length} Interkoneksi Aktif</span>
                    <span className={node.threatCount > 0 ? "text-rose-500 font-black" : "text-emerald-600"}>
                      {node.threatCount} Ancaman Dicegat
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Simpul Terpilih (Interactive Deep Inspection) */}
          {selectedNode && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d64ec] border border-blue-100 flex items-center justify-center font-black">
                    <Radio size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inspeksi Detil Simpul Teknologi</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedNode.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono">
                    Stack: {selectedNode.techStack}
                  </span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                    Status: {selectedNode.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Fungsi & Tugas Arsitektur</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedNode.description}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Garis Interkoneksi Aktif (Line Mesh)</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedNode.connectedTo.map((targetId: string) => (
                      <span key={targetId} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                        &harr; {targetId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Protokol Keamanan Diterapkan</span>
                  <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside mt-1">
                    <li>Inspeksi C++ WAF Payload Scanner</li>
                    <li>Audit Anomali Python Sentinel</li>
                    <li>Zero-Trust Internal RBAC Policy</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: LIVE INCIDENT STREAM ─────────────────────────────────── */}
      {activeTab === "INCIDENTS" && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Rekam Jejak Insiden Keamanan Real-Time
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Daftar serangan luar yang diblokade dan kecurangan internal pengguna yang dicegah
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {data.incidents.length} Catatan Aktif
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-4 py-2">Waktu</th>
                  <th className="px-4 py-2">Sumber / Pelaku</th>
                  <th className="px-4 py-2">IP & Target Simpul</th>
                  <th className="px-4 py-2">Vektor Ancaman</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Alarm User</th>
                  <th className="px-4 py-2 text-right">Penanganan Khusus (Tindakan Langsung)</th>
                </tr>
              </thead>
              <tbody>
                {data.incidents.map((inc) => (
                  <tr key={inc.id} className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors rounded-2xl">
                    <td className="px-4 py-3 rounded-l-2xl text-xs font-mono text-slate-500">
                      {new Date(inc.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-900 block truncate max-w-[200px]">{inc.userOrIdentifier}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{inc.sourceType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-blue-600 block">{inc.ip}</span>
                      <span className="text-[10px] text-slate-500">{inc.targetNode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}>
                        {inc.attackVector}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                        inc.status === "BLOCKED" 
                          ? "bg-rose-100 text-rose-700" 
                          : inc.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {inc.status === "BLOCKED" ? "Diblokade" : inc.status === "RESOLVED" ? "Selesai" : "Peringatan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {inc.userWarningDispatched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 size={13} /> Aktif
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right rounded-r-2xl">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {inc.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleResolveIncident(inc.id)}
                            disabled={isPending}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold transition-all flex items-center gap-1"
                            title="Tandai Insiden Selesai Ditangani"
                          >
                            <FileCheck2 size={11} /> Selesai
                          </button>
                        )}

                        {inc.sourceType === "INTERNAL_FRAUD" && (
                          <>
                            <button
                              onClick={() => handleSendDirectAlarm(inc.userOrIdentifier)}
                              disabled={isPending}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Kirim Alarm Langsung ke Layar User Ini"
                            >
                              <Bell size={11} /> Alarm
                            </button>
                            <button
                              onClick={() => handleSuspendUser(inc.userOrIdentifier)}
                              disabled={isPending}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Bekukan / Nonaktifkan Akun Pelaku Ini"
                            >
                              <UserX size={11} /> Bekukan
                            </button>
                          </>
                        )}

                        {inc.sourceType === "EXTERNAL_ATTACK" && !data.blacklistedIps.some(b => b.ip === inc.ip) && (
                          <button
                            onClick={() => {
                              startTransition(async () => {
                                await blockIpAction(inc.ip, `Manual block dari insiden: ${inc.attackVector}`);
                                const updated = await getRealtimeCyberSecurityOverview();
                                if (updated) setData(updated);
                                toast.success(`IP ${inc.ip} berhasil diisolasi.`);
                              });
                            }}
                            disabled={isPending}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs transition-all flex items-center gap-1"
                          >
                            <Lock size={11} /> Blokir IP
                          </button>
                        )}

                        {inc.status === "RESOLVED" && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Sudah Ditangani
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: FIREWALL & BLACKLIST MANAGER ──────────────────────────── */}
      {activeTab === "FIREWALL" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Blokir IP Manual */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Ban size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Blokade IP Manual</h3>
                <p className="text-xs text-slate-400 font-medium">Tambahkan IP mencurigakan ke firewall</p>
              </div>
            </div>

            <form onSubmit={handleBlockIp} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Alamat IP (IPv4 / IPv6)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 103.45.67.89"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Alasan Blokir
                </label>
                <input
                  type="text"
                  placeholder="e.g. Percobaan Brute Force atau Exploit"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                Blokade Alamat IP Sekarang
              </button>
            </form>
          </div>

          {/* Daftar IP yang Diblokir */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Daftar Hitam IP Aktif (Active Blacklist)</h3>
                <p className="text-xs text-slate-400 font-medium">Semua koneksi dari IP ini ditolak secara otomatis oleh C++ WAF</p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                {data.blacklistedIps.length} IP Diblokir
              </span>
            </div>

            <div className="space-y-2.5">
              {data.blacklistedIps.map((item) => (
                <div key={item.ip} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900">{item.ip}</span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black uppercase">BLOCKED</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.reason}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Waktu Blokir: {new Date(item.timestamp).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUnblock(item.ip)}
                    disabled={isPending}
                    className="self-end sm:self-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 text-xs font-bold transition-all shadow-2xs"
                  >
                    Buka Blokir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

