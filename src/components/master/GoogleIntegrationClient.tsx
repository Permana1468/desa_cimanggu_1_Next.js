"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
    Cloud, Settings, Database, Play, Loader2, CheckCircle2, 
    XCircle, HardDrive, Key, FileSpreadsheet, FileText, ExternalLink,
    AlertTriangle, ShieldCheck, RefreshCw, Copy, Check, Link as LinkIcon
} from "lucide-react";
import { saveGoogleIntegration, getGoogleOAuthUrl, testGoogleConnection, disconnectGoogle } from "@/actions/google";

interface GoogleIntegrationClientProps {
    initialSettings: any;
    redirectUri?: string;
}

export function GoogleIntegrationClient({ initialSettings, redirectUri = "" }: GoogleIntegrationClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Configuration States
    const [integrationType, setIntegrationType] = useState<"service_account" | "oauth2">(
        initialSettings.type || "service_account"
    );
    const [serviceAccountJson, setServiceAccountJson] = useState(
        initialSettings.serviceAccountJson || ""
    );
    const [clientId, setClientId] = useState(initialSettings.oauth?.clientId || "");
    const [clientSecret, setClientSecret] = useState(initialSettings.oauth?.clientSecret || "");
    const [isConnected, setIsConnected] = useState(initialSettings.isConnected || false);
    const [connectedEmail, setConnectedEmail] = useState(
        initialSettings.type === "service_account" 
            ? (initialSettings.serviceAccountJson ? JSON.parse(initialSettings.serviceAccountJson).client_email : "")
            : (initialSettings.oauth?.connectedEmail || "")
    );

    // UI States
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testLogs, setTestLogs] = useState<string[]>([]);
    const [testStatus, setTestStatus] = useState<"idle" | "running" | "success" | "failed">("idle");
    const [copiedRedirect, setCopiedRedirect] = useState(false);
    const [localRedirectUri, setLocalRedirectUri] = useState(redirectUri);

    // Read redirect callback URL on mount if not provided by server
    useEffect(() => {
        if (!localRedirectUri && typeof window !== "undefined") {
            setLocalRedirectUri(`${window.location.origin}/api/auth/google/callback`);
        }
    }, [localRedirectUri]);

    // Handle OAuth Callback Search Parameters (Toast/Notif)
    useEffect(() => {
        const status = searchParams.get("status");
        const message = searchParams.get("message");

        if (status === "success") {
            alert("Integrasi Google OAuth2 berhasil dihubungkan!");
            // Clear query params
            router.replace("/master-admin/integrasi");
        } else if (status === "error") {
            alert(`Gagal menghubungkan Google OAuth2: ${message || "Terjadi kesalahan"}`);
            router.replace("/master-admin/integrasi");
        }
    }, [searchParams, router]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(localRedirectUri);
        setCopiedRedirect(true);
        setTimeout(() => setCopiedRedirect(false), 2000);
    };

    // Save Service Account Credentials
    const handleSaveServiceAccount = async () => {
        if (!serviceAccountJson.trim()) {
            alert("JSON kredensial Service Account wajib diisi.");
            return;
        }

        try {
            // Validate JSON syntax first
            const parsed = JSON.parse(serviceAccountJson);
            if (!parsed.client_email || !parsed.private_key) {
                alert("JSON tidak valid. Pastikan field 'client_email' dan 'private_key' tertera.");
                return;
            }

            setSaving(true);
            const payload = {
                type: "service_account",
                serviceAccountJson: serviceAccountJson.trim(),
                isConnected: true // assume connected, let test connection verify
            };

            await saveGoogleIntegration(payload);
            setIsConnected(true);
            setConnectedEmail(parsed.client_email);
            alert("Kredensial Service Account berhasil disimpan!");
        } catch (error: any) {
            alert(error.message || "Gagal mengurai JSON kredensial. Periksa kembali tanda baca.");
        } finally {
            setSaving(false);
        }
    };

    // Save OAuth2 Credentials and Redirect to Google
    const handleConnectOAuth2 = async () => {
        if (!clientId.trim() || !clientSecret.trim()) {
            alert("Client ID dan Client Secret wajib diisi.");
            return;
        }

        setSaving(true);
        try {
            // First save the client credentials to database
            const payload = {
                type: "oauth2",
                oauth: {
                    clientId: clientId.trim(),
                    clientSecret: clientSecret.trim(),
                }
            };
            await saveGoogleIntegration(payload);

            // Fetch authorization redirect URL
            const url = await getGoogleOAuthUrl(clientId.trim(), clientSecret.trim());
            
            // Redirect to Google Consent Page
            window.location.href = url;
        } catch (error: any) {
            alert(error.message || "Gagal menginisialisasi Google OAuth.");
            setSaving(false);
        }
    };

    // Disconnect Integration
    const handleDisconnect = async () => {
        if (!confirm("Apakah Anda yakin ingin memutuskan integrasi dengan Google Workspace? Kredensial akan dinonaktifkan.")) {
            return;
        }

        setSaving(true);
        try {
            await disconnectGoogle();
            setIsConnected(false);
            setConnectedEmail("");
            setServiceAccountJson("");
            setClientId("");
            setClientSecret("");
            setTestStatus("idle");
            setTestLogs([]);
            alert("Integrasi Google berhasil diputuskan.");
        } catch (error: any) {
            alert(error.message || "Gagal memutuskan integrasi.");
        } finally {
            setSaving(false);
        }
    };

    // Run connection test
    const handleTestConnection = async () => {
        setTesting(true);
        setTestStatus("running");
        setTestLogs(["Memulai uji koneksi..."]);

        try {
            const res = await testGoogleConnection();
            setTestLogs(res.logs || []);
            
            if (res.success) {
                setTestStatus("success");
                setIsConnected(true);
                if (res.account) setConnectedEmail(res.account);
            } else {
                setTestStatus("failed");
            }
        } catch (error: any) {
            setTestStatus("failed");
            setTestLogs(prev => [...prev, `FATAL ERROR: ${error.message || error}`]);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-16 pb-20 animate-in fade-in duration-700">
            {/* HERO INTEGRATION HEADER */}
            <div className="relative p-12 md:p-20 rounded-[3rem] md:rounded-[4rem] bg-slate-950 text-white overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            <Cloud size={12} className="animate-pulse" /> Google Workspace Node
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                            Workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Integration</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                            Hubungkan sistem Desa Cimanggu I dengan Google API untuk mendukung otomatisasi pembuatan Spreadsheet, dokumen Word (.docx), dan penyimpanan berkas di Google Drive secara real-time.
                        </p>
                    </div>

                    {isConnected && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleDisconnect}
                                disabled={saving || testing}
                                className="px-10 py-5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 rounded-[2rem] text-sm font-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                Putuskan Koneksi
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* INTEGRATION STATUS & TESTING PANELS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* CONFIGURATION OPTIONS PANEL */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100 relative group overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                        
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between flex-wrap gap-6 border-b border-slate-100 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <Settings size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Koneksi API Google</h3>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Metode Autentikasi Sistem</p>
                                    </div>
                                </div>
                                
                                {/* AUTH TYPE SWITCHER */}
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                    <button
                                        onClick={() => setIntegrationType("service_account")}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            integrationType === "service_account"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-900"
                                        }`}
                                    >
                                        Service Account
                                    </button>
                                    <button
                                        onClick={() => setIntegrationType("oauth2")}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            integrationType === "oauth2"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-900"
                                        }`}
                                    >
                                        Google OAuth2
                                    </button>
                                </div>
                            </div>

                            {/* SERVICE ACCOUNT FORM */}
                            {integrationType === "service_account" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-500" /> Panduan Service Account
                                        </h4>
                                        <ol className="text-xs text-slate-600 font-medium list-decimal list-inside space-y-2 leading-relaxed">
                                            <li>Buka Google Cloud Console, lalu buat/pilih project Anda.</li>
                                            <li>Buat **Service Account** di menu IAM & Admin dan unduh berkas kunci berformat **JSON**.</li>
                                            <li>Aktifkan API **Google Sheets** & **Google Drive** pada Cloud Project.</li>
                                            <li>Salin seluruh isi berkas JSON tersebut dan tempelkan pada kolom input di bawah ini.</li>
                                            <li>PENTING: Agar sistem bisa menulis/membaca berkas di Drive Anda, bagikan akses editor (Share) folder Drive atau Spreadsheet yang dituju ke alamat email Service Account Anda.</li>
                                        </ol>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Key size={12} /> Service Account JSON Key
                                        </label>
                                        <textarea
                                            rows={8}
                                            value={serviceAccountJson}
                                            onChange={(e) => setServiceAccountJson(e.target.value)}
                                            placeholder='Plese paste your entire JSON key content here. E.g.:&#10;{&#10;  "type": "service_account",&#10;  "project_id": "...",&#10;  "private_key_id": "...",&#10;  "private_key": "...",&#10;  ...&#10;}'
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all font-mono text-slate-900 placeholder:text-slate-300"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveServiceAccount}
                                        disabled={saving}
                                        className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={16} />}
                                        Simpan Kredensial Service Account
                                    </button>
                                </div>
                            )}

                            {/* OAUTH2 FORM */}
                            {integrationType === "oauth2" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-500" /> Panduan Google OAuth2
                                        </h4>
                                        <ol className="text-xs text-slate-600 font-medium list-decimal list-inside space-y-2 leading-relaxed">
                                            <li>Buka Google Cloud Console, pilih project Anda.</li>
                                            <li>Buat **OAuth Client ID** bertipe *Web Application* di bagian Credentials.</li>
                                            <li>Masukkan URL di bawah ini ke dalam **Authorized Redirect URIs** di Cloud Console.</li>
                                            <li>Salin **Client ID** dan **Client Secret** yang Anda dapatkan ke isian di bawah.</li>
                                            <li>Klik tombol **Hubungkan Akun Google** untuk melakukan autentikasi.</li>
                                        </ol>
                                    </div>

                                    {/* REDIRECT URI DISPLAY */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <LinkIcon size={12} /> Authorized Redirect URI
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={localRedirectUri}
                                                className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 px-6 text-xs text-slate-600 font-bold outline-none"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="px-5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shrink-0"
                                            >
                                                {copiedRedirect ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                {copiedRedirect ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Key size={12} /> Client ID
                                            </label>
                                            <input
                                                type="text"
                                                value={clientId}
                                                onChange={(e) => setClientId(e.target.value)}
                                                placeholder="Google OAuth Client ID"
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Key size={12} /> Client Secret
                                            </label>
                                            <input
                                                type="password"
                                                value={clientSecret}
                                                onChange={(e) => setClientSecret(e.target.value)}
                                                placeholder="Google OAuth Client Secret"
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConnectOAuth2}
                                        disabled={saving}
                                        className="px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={14} /> : <ExternalLink size={16} />}
                                        Hubungkan Akun Google
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR PANELS: STATUS & LIVE TESTER */}
                <div className="space-y-10">
                    
                    {/* 1. STATUS PANEL */}
                    <div className="bg-gradient-to-b from-slate-900 to-black rounded-[3.5rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
                        
                        <h3 className="text-xl font-black mb-10 flex items-center gap-3 border-b border-white/10 pb-6">
                            <ShieldCheck size={24} className="text-blue-400" /> Integrasi Status
                        </h3>
                        
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konektivitas</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {isConnected ? "Terhubung" : "Terputus"}
                                    </span>
                                    <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"}`} />
                                </div>
                            </div>
                            
                            {isConnected && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode Integrasi</span>
                                        <span className="text-xs font-bold uppercase text-slate-200">
                                            {initialSettings.type === "service_account" ? "Service Account" : "OAuth2 (Consent Flow)"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 overflow-hidden">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akun Google</span>
                                        <span className="text-xs font-mono text-blue-300 break-all">
                                            {connectedEmail || "Email tidak termuat"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 2. REAL-TIME TESTER PANEL */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                                <Database size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">Uji Koneksi Real-time</h4>
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">Live Read & Write Simulation</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Simulasikan pembuatan spreadsheet, pengisian baris data baru, pembacaan sel, dan pembersihan otomatis di Google Drive Anda.
                        </p>

                        <button
                            onClick={handleTestConnection}
                            disabled={testing || !isConnected}
                            className="w-full px-8 py-4.5 bg-slate-900 hover:bg-black text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-900/10"
                        >
                            {testing ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} className="fill-current" />}
                            Jalankan Uji Koneksi
                        </button>

                        {/* LIVE LOGGER CONTAINER */}
                        {testStatus !== "idle" && (
                            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 max-h-60 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aktivitas Log</span>
                                    {testStatus === "running" && <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider animate-pulse">Running...</span>}
                                    {testStatus === "success" && <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Sukses</span>}
                                    {testStatus === "failed" && <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1"><XCircle size={10} /> Gagal</span>}
                                </div>
                                <div className="font-mono text-[10px] text-slate-300 space-y-2 leading-relaxed">
                                    {testLogs.map((log, index) => {
                                        const isError = log.startsWith("ERROR") || log.startsWith("FATAL ERROR");
                                        const isSuccess = log.includes("sukses") || log.includes("berhasil") || log.includes("selesai");
                                        return (
                                            <div 
                                                key={index} 
                                                className={`break-words ${
                                                    isError ? "text-rose-400" : isSuccess ? "text-emerald-400 font-bold" : "text-slate-300"
                                                }`}
                                            >
                                                &gt; {log}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
