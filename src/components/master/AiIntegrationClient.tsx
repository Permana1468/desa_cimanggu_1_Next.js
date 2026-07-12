"use client";

import { useState } from "react";
import { 
    Brain, Settings, Loader2, CheckCircle2, 
    XCircle, Key, ExternalLink,
    AlertTriangle, ShieldCheck
} from "lucide-react";
import { saveAiIntegration, testAiConnection, disconnectAi } from "@/actions/ai";

interface AiIntegrationClientProps {
    initialSettings: any;
}

export function AiIntegrationClient({ initialSettings }: AiIntegrationClientProps) {
    const [apiKey, setApiKey] = useState(initialSettings.apiKey || "");
    const [isConnected, setIsConnected] = useState(initialSettings.isConnected || false);

    // UI States
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<"idle" | "running" | "success" | "failed">("idle");
    const [testMessage, setTestMessage] = useState("");

    const handleSave = async () => {
        if (!apiKey.trim()) {
            alert("API Key Gemini wajib diisi.");
            return;
        }

        setSaving(true);
        try {
            await saveAiIntegration({ apiKey: apiKey.trim(), isConnected: true });
            setIsConnected(true);
            alert("API Key Gemini berhasil disimpan!");
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan pengaturan.");
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Apakah Anda yakin ingin memutuskan integrasi AI? Semua fitur berbasis AI akan dinonaktifkan.")) {
            return;
        }

        setSaving(true);
        try {
            await disconnectAi();
            setIsConnected(false);
            setApiKey("");
            setTestStatus("idle");
            setTestMessage("");
            alert("Integrasi AI berhasil diputuskan.");
        } catch (error: any) {
            alert(error.message || "Gagal memutuskan integrasi.");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!apiKey.trim() && !initialSettings.apiKey) {
            alert("Silakan isi API Key terlebih dahulu.");
            return;
        }

        setTesting(true);
        setTestStatus("running");
        setTestMessage("Menghubungi server Google Gemini...");
        
        try {
            await testAiConnection(apiKey.trim() || initialSettings.apiKey);
            setTestStatus("success");
            setTestMessage("Koneksi berhasil! API Key valid dan terhubung.");
        } catch (error: any) {
            setTestStatus("failed");
            setTestMessage(error.message || "Gagal menghubungi Gemini API.");
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - FORM */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Koneksi API Gemini</h3>
                                <p className="text-slate-500 font-medium text-sm">Metode Autentikasi Sistem</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                <AlertTriangle size={14} className="text-amber-500" /> Panduan Akses Gemini
                            </h4>
                            <ol className="text-xs text-slate-600 font-medium list-decimal list-inside space-y-2 leading-relaxed">
                                <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-600 font-bold hover:underline">Google AI Studio</a> dan login.</li>
                                <li>Klik tombol <strong>Get API Key</strong> dan buat kunci baru.</li>
                                <li>Salin <strong>API Key</strong> tersebut ke kolom di bawah.</li>
                                <li>Klik <strong>Simpan Kunci API</strong>.</li>
                            </ol>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <Key size={14} /> Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSyA..."
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 text-xs focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-8 focus:ring-purple-600/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full px-8 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                            {saving ? "Menyimpan..." : "Simpan Kunci API"}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - STATUS & ACTIONS */}
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />
                    
                    <h3 className="text-xl font-black mb-10 flex items-center gap-3 border-b border-white/10 pb-6">
                        <ShieldCheck size={24} className="text-purple-400" /> Integrasi Status
                    </h3>
                    
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</span>
                            {isConnected ? (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Terhubung</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Terputus</span>
                                </div>
                            )}
                        </div>

                        {isConnected && (
                            <>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {testing ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                                    Uji Koneksi (Ping)
                                </button>
                                
                                <button
                                    onClick={handleDisconnect}
                                    disabled={saving}
                                    className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    Putuskan Integrasi
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* TEST STATUS BANNER */}
                {testStatus !== "idle" && (
                    <div className={`p-6 rounded-3xl border shadow-lg transition-all animate-in zoom-in-95 duration-300 ${
                        testStatus === "running" ? "bg-blue-50 border-blue-100 text-blue-700" :
                        testStatus === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                        "bg-rose-50 border-rose-100 text-rose-700"
                    }`}>
                        <div className="flex items-center gap-3 mb-2">
                            {testStatus === "running" && <Loader2 size={20} className="animate-spin" />}
                            {testStatus === "success" && <CheckCircle2 size={20} className="text-emerald-500" />}
                            {testStatus === "failed" && <XCircle size={20} className="text-rose-500" />}
                            <h4 className="text-sm font-black uppercase tracking-wider">Hasil Pengujian</h4>
                        </div>
                        <p className="text-xs font-medium leading-relaxed opacity-90">{testMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
