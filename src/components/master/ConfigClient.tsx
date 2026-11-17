"use client";

import { ConfigSettings } from "@/types/config";
import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import { 
    Settings, Shield, Globe, Zap, Database, Lock, Save, RefreshCw, 
    CreditCard, MessageSquare, AlertTriangle, HardDrive, Smartphone, 
    Upload, Bell, CheckCircle2, Loader2, Play, Activity, Fingerprint, ShieldCheck,
    FileSpreadsheet, FileText, Download
} from "lucide-react";
import { updateSystemSettings, backupDatabase, testWhatsAppConnection, registerMasterDevice } from "@/actions/master";

interface ConfigClientProps {
    initialSettings: any;
}

export function ConfigClient({ initialSettings }: ConfigClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [saving, setSaving] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [testingWA, setTestingWA] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSystemSettings(settings);
            alert("Pengaturan sistem berhasil disimpan!");
        } catch (error) {
            alert("Gagal menyimpan pengaturan.");
        } finally {
            setSaving(false);
        }
    };

    const [backupInfo, setBackupInfo] = useState<any>(null);

    const handleBackup = async () => {
        setBackingUp(true);
        try {
            const res = await backupDatabase();
            setBackupInfo(res);
            alert(`🎉 Backup Berhasil Dibuat!\n\nFile: ${res.archiveName}\nUkuran: ${res.sizeMB} MB\nTotal Records: ${res.totalRecords}\nStorage Files: ${res.storageFiles}\n\nKlik tombol 'Download (.tar.gz)' untuk menyimpan ke Flashdisk / Harddisk Offline.`);
        } catch (error: any) {
            alert("Gagal melakukan backup: " + (error?.message || error));
        } finally {
            setBackingUp(false);
        }
    };

    const handleTestWA = async () => {
        setTestingWA(true);
        try {
            const res = await testWhatsAppConnection();
            alert(`Koneksi WhatsApp: ${res.status}`);
        } catch (error) {
            alert("Gagal tes koneksi WhatsApp.");
        } finally {
            setTestingWA(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
            {/* 1. HERO CONFIGURATION HEADER (MATCHING ADMIN DESA EXECUTIVE STYLE) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1122] to-slate-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none -mb-20" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                            <Settings size={12} className="animate-spin-slow" /> Master Config Terminal
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Control Center</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-xs sm:text-sm leading-relaxed">
                            Pusat kendali pengaturan global, keamanan infrastruktur, dan orkestrasi integrasi API untuk ekosistem Cimanggu I.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button 
                            type="button"
                            onClick={handleBackup}
                            disabled={backingUp}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/15 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                            {backingUp ? <Loader2 className="animate-spin" size={15} /> : <Database size={15} className="text-amber-400" />} Backup DB & Storage
                        </button>
                        <a 
                            href="/api/backup/download"
                            download
                            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 text-center"
                        >
                            <Download size={15} /> Download (.tar.gz)
                        </a>
                        <button 
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={15} /> : <ShieldCheck size={16} />} 
                            <span>Simpan Konfigurasi</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. API INTEGRATION (PPOB & PAYMENT) */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative group overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3.5 mb-6">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">External Integrations</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Payment Gateway & PPOB Node</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <PremiumInput 
                                    label="Payment Gateway API Key" 
                                    icon={CreditCard} 
                                    value={settings.payment_api_key || ""} 
                                    onChange={(v: string) => setSettings({...settings, payment_api_key: v})}
                                    placeholder="Midtrans/Xendit Secret Key"
                                />
                                <PremiumInput 
                                    label="PPOB Provider Secret" 
                                    icon={Smartphone} 
                                    value={settings.ppob_api_key || ""} 
                                    onChange={(v: string) => setSettings({...settings, ppob_api_key: v})}
                                    placeholder="API Key Provider PPOB"
                                />
                                <PremiumInput 
                                    label="Official RAB Template Spreadsheet ID" 
                                    icon={FileSpreadsheet} 
                                    value={settings.rab_template_id || ""} 
                                    onChange={(v: string) => setSettings({...settings, rab_template_id: v})}
                                    placeholder="Google Sheets ID (e.g. 1aBcDeFg...)"
                                />
                                <PremiumInput 
                                    label="Official RAB Template Range" 
                                    icon={FileText} 
                                    value={settings.rab_template_range || "Sheet1!B9:F20"} 
                                    onChange={(v: string) => setSettings({...settings, rab_template_range: v})}
                                    placeholder="Range (e.g. Sheet1!B9:F20)"
                                />
                            </div>

                            <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner border border-emerald-100">
                                        <MessageSquare size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">WhatsApp Gateway</h4>
                                        <p className="text-xs text-slate-500 font-medium">Notifikasi real-time transaksi & kependudukan.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleTestWA}
                                    disabled={testingWA}
                                    className="px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-slate-900/10"
                                >
                                    {testingWA ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} className="text-emerald-400" />} Test Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. SECURITY & RESOURCE LIMITS */}
                    <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security & Infrastructure</h3>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">Resource Limits & Access Policy</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                            <PremiumInput 
                                label="Global Storage Limit (MB)" 
                                icon={HardDrive} 
                                type="number"
                                value={settings.storage_limit || "500"} 
                                onChange={(v: string) => setSettings({...settings, storage_limit: v})}
                            />
                            <PremiumInput 
                                label="Master IP Whitelisting" 
                                icon={Lock} 
                                value={settings.ip_whitelist || ""} 
                                onChange={(v: string) => setSettings({...settings, ip_whitelist: v})}
                                placeholder="Separated by comma"
                            />
                        </div>

                        <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-md">
                                    <Database size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold tracking-tight">Emergency Full Backup (DB + Storage)</h4>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                        Antisipasi Ransomware / Kerusakan Server
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                                <button 
                                    type="button"
                                    onClick={handleBackup}
                                    disabled={backingUp}
                                    className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {backingUp ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />} Buat Snapshot Baru
                                </button>
                                <a 
                                    href="/api/backup/download"
                                    download
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-600/30 text-center"
                                >
                                    <Download size={14} /> Download .tar.gz
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 3. SECURITY HARDENING & IDENTITY */}
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3.5 mb-8">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center shadow-md">
                                    <ShieldCheck size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Security Hardening</h3>
                                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mt-0.5">Advanced Identity Protection Node</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SecurityToggle 
                                    label="Two-Factor Authentication (2FA)"
                                    description="Wajibkan kode OTP tambahan setiap kali login ke terminal Master Admin."
                                    icon={Smartphone}
                                    isActive={settings.two_factor_auth || false}
                                    onToggle={() => setSettings({...settings, two_factor_auth: !settings.two_factor_auth})}
                                />
                                <SecurityToggle 
                                    label="Biometric Face-ID Login"
                                    description="Gunakan otentikasi wajah (WebAuthn) untuk akses cepat dan aman."
                                    icon={Fingerprint}
                                    isActive={settings.face_id_auth || false}
                                    onToggle={() => setSettings({...settings, face_id_auth: !settings.face_id_auth})}
                                />
                            </div>

                            {/* EXCLUSIVE MASTER PROVISIONING */}
                            {settings.face_id_auth && (
                                <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl animate-in zoom-in duration-300">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-600/30">
                                                <Smartphone size={24} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-base font-black tracking-tight">Master Device Registration</h4>
                                                <p className="text-xs text-blue-300 font-medium">Daftarkan wajah/biometrik perangkat Anda sekarang.</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={async () => {
                                                if(confirm("Sistem akan memulai sinkronisasi biometrik perangkat ini. Lanjutkan?")) {
                                                    try {
                                                        const getRes = await fetch("/api/webauthn", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ action: "generate-registration" })
                                                        });
                                                        const options = await getRes.json();
                                                        
                                                        if (options.error) {
                                                            alert("Gagal: " + options.error);
                                                            return;
                                                        }

                                                        let attResp;
                                                        try {
                                                            attResp = await startRegistration({ optionsJSON: options } as any);
                                                        } catch (error: any) {
                                                            if (error.name === 'InvalidStateError') {
                                                                alert("Perangkat ini sudah terdaftar.");
                                                            } else {
                                                                alert("Registrasi dibatalkan atau gagal.");
                                                            }
                                                            return;
                                                        }

                                                        const verifyRes = await fetch("/api/webauthn", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                action: "verify-registration",
                                                                response: attResp
                                                            })
                                                        });
                                                        
                                                        const verification = await verifyRes.json();
                                                        if (verification.verified) {
                                                            alert("Perangkat Master berhasil diverifikasi dan didaftarkan!");
                                                        } else {
                                                            alert("Gagal memverifikasi biometrik: " + verification.error);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Terjadi kesalahan saat registrasi biometrik.");
                                                    }
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-600/20"
                                        >
                                            Register My Face
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3 group-hover:bg-white/10 transition-all">
                                <div className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center shrink-0 border border-amber-500/20">
                                    <AlertTriangle size={16} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Peringatan Keamanan</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                        Mengaktifkan fitur ini akan memaksa seluruh sesi Admin Master untuk melakukan verifikasi ulang pada login berikutnya. Pastikan perangkat Anda mendukung WebAuthn sebelum mengaktifkan Face-ID.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SYSTEM STATUS SIDEBAR */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-slate-900 to-black rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2.5">
                            <Fingerprint size={20} className="text-blue-400" /> Core Integrity
                        </h3>
                        <div className="space-y-5">
                            <PremiumStatus label="Main Database" status="Synchronized" />
                            <PremiumStatus label="Storage Node" status="High Priority" />
                            <PremiumStatus label="API Gateway" status="Operational" />
                            <PremiumStatus label="WA Messaging" status="Connected" />
                            <PremiumStatus label="Audit Engine" status="Recording" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                <Activity size={18} className="text-emerald-400 animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                                    <span className="text-xs font-bold text-white">99.98% Healthy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
                         <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                                 <AlertTriangle size={32} />
                             </div>
                             <h4 className="text-lg font-black text-slate-800 tracking-tighter leading-none">Security Protocol</h4>
                         </div>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Seluruh perubahan konfigurasi di terminal ini terikat pada protokol keamanan tinggi dan akan dicatat secara <span className="text-slate-900 font-black">Immutable</span> di Audit Logs.
                         </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function PremiumInput({ label, icon: Icon, value, onChange, type = "text", placeholder }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                {Icon && <Icon size={12} />} {label}
            </label>
            <div className="relative group">
                <input 
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-8 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                />
            </div>
        </div>
    )
}

function PremiumStatus({ label, status }: { label: string; status: string }) {
    return (
        <div className="flex items-center justify-between group cursor-default">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            </div>
        </div>
    )
}

function SecurityToggle({ label, description, icon: Icon, isActive, onToggle }: any) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-6">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300">
                    <Icon size={24} />
                </div>
                <button 
                    onClick={onToggle}
                    className={`w-14 h-7 rounded-full relative transition-all duration-500 ${isActive ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 ${isActive ? 'right-1' : 'left-1'}`} />
                </button>
            </div>
            <div className="space-y-1">
                <h4 className="text-base font-black tracking-tight">{label}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

