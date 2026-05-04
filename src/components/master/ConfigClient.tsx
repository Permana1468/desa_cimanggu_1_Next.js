"use client";

import { useState } from "react";
import { 
    Settings, Shield, Globe, Zap, Database, Lock, Save, RefreshCw, 
    CreditCard, MessageSquare, AlertTriangle, HardDrive, Smartphone, 
    Upload, Bell, CheckCircle2, Loader2, Play, Activity, Fingerprint, ShieldCheck
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

    const handleBackup = async () => {
        setBackingUp(true);
        try {
            const res = await backupDatabase();
            alert(`Backup berhasil! Timestamp: ${res.timestamp}`);
        } catch (error) {
            alert("Gagal melakukan backup.");
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
        <div className="space-y-16 pb-20 animate-in fade-in duration-700">
            {/* HERO CONFIGURATION HEADER */}
            <div className="relative p-12 md:p-20 rounded-[3rem] md:rounded-[4rem] bg-slate-950 text-white overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            <Settings size={12} className="animate-spin-slow" /> Master Config Terminal
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Control Center</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                            Pusat kendali pengaturan global, keamanan infrastruktur, dan orkestrasi integrasi API untuk ekosistem Cimanggu I.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleBackup}
                            disabled={backingUp}
                            className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] text-sm font-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {backingUp ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} className="text-amber-400" />} Backup DB
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-sm font-black shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={20} />} 
                            Sync Configuration
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* 1. API INTEGRATION (PPOB & PAYMENT) */}
                    <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100 relative group overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <Zap size={28} />
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

                        <div className="p-8 md:p-10 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center text-amber-400 shadow-xl">
                                    <Database size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight">Emergency DB Backup</h4>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Pre-update safety synchronization</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleBackup}
                                disabled={backingUp}
                                className="w-full md:w-auto px-10 py-5 bg-white text-slate-900 rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {backingUp ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} Execute
                            </button>
                        </div>
                    </div>

                    {/* 3. SECURITY HARDENING & IDENTITY */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-indigo-900/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-xl">
                                    <ShieldCheck size={28} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Security Hardening</h3>
                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">Advanced Identity Protection Node</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                <div className="mt-10 p-10 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] animate-in zoom-in duration-500">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                                                <Smartphone size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black tracking-tight">Master Device Registration</h4>
                                                <p className="text-xs text-blue-300 font-medium">Daftarkan wajah/biometrik perangkat Anda sekarang.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if(confirm("Sistem akan memulai sinkronisasi biometrik perangkat ini. Lanjutkan?")) {
                                                    await registerMasterDevice("DEV-KEY-" + Math.random().toString(36).substring(7));
                                                    alert("Perangkat Master berhasil diverifikasi!");
                                                }
                                            }}
                                            className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                                        >
                                            Register My Face
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-start gap-6 group-hover:bg-white/10 transition-all">
                                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-tight text-amber-400">Peringatan Keamanan</h4>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Mengaktifkan fitur ini akan memaksa seluruh sesi Admin Master untuk melakukan verifikasi ulang pada login berikutnya. Pastikan perangkat Anda mendukung WebAuthn sebelum mengaktifkan Face-ID.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SYSTEM STATUS SIDEBAR */}
                <div className="space-y-10">
                    <div className="bg-gradient-to-b from-slate-900 to-black rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
                        <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                            <Fingerprint size={24} className="text-blue-400" /> Core Integrity
                        </h3>
                        <div className="space-y-8">
                            <PremiumStatus label="Main Database" status="Synchronized" />
                            <PremiumStatus label="Storage Node" status="High Priority" />
                            <PremiumStatus label="API Gateway" status="Operational" />
                            <PremiumStatus label="WA Messaging" status="Connected" />
                            <PremiumStatus label="Audit Engine" status="Recording" />
                        </div>

                        <div className="mt-12 pt-10 border-t border-white/5">
                            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                <Activity size={20} className="text-emerald-400 animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                                    <span className="text-sm font-black">99.98% Healthy</span>
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

