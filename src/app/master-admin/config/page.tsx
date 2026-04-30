import { Settings, Shield, Globe, Zap, Database, Lock, Save, RefreshCw } from "lucide-react";

export default async function ConfigurationPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">System Configuration</h1>
                    <p className="text-slate-500 text-sm">Pusat kendali pengaturan global, keamanan, dan integrasi infrastruktur.</p>
                </div>
                <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2">
                    <Save size={16} /> Simpan Perubahan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GENERAL SETTINGS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                            <Settings size={20} className="text-slate-400" /> Pengaturan Umum
                        </h3>
                        
                        <div className="space-y-6">
                            <ConfigToggle 
                                label="Mode Pemeliharaan (Maintenance)" 
                                desc="Nonaktifkan seluruh akses user kecuali Master Admin saat melakukan update."
                                checked={false}
                            />
                            <ConfigToggle 
                                label="Registrasi Warga Mandiri" 
                                desc="Izinkan warga baru untuk mendaftar akun secara mandiri melalui NIK."
                                checked={true}
                            />
                            <div className="pt-6 border-t border-slate-50">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">System Domain Utama</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        defaultValue="cimanggu1.desa.id"
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                            <Shield size={20} className="text-emerald-500" /> Keamanan & Akses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ConfigCard icon={Lock} label="Password Complexity" value="High Policy" />
                            <ConfigCard icon={RefreshCw} label="Session Timeout" value="24 Hours" />
                            <ConfigCard icon={Database} label="Backup Otomatis" value="Every 12h" />
                            <ConfigCard icon={Shield} label="Two-Factor (2FA)" value="Optional" />
                        </div>
                    </div>
                </div>

                {/* SIDEBAR CONFIGS */}
                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-amber-400" /> API Integration
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <span className="block text-[8px] font-black text-slate-400 tracking-widest mb-1 uppercase">Supabase Key</span>
                                <code className="text-[10px] font-mono text-emerald-400 break-all">••••••••••••••••••••••••••••••••</code>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <span className="block text-[8px] font-black text-slate-400 tracking-widest mb-1 uppercase">WhatsApp Gateway</span>
                                <code className="text-[10px] font-mono text-blue-400 break-all">api.whatsapp.cimanggu.id</code>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Informasi Sistem</h3>
                        <div className="space-y-3">
                            <InfoRow label="Versi Aplikasi" value="v2.4.0-Enterprise" />
                            <InfoRow label="Node.js Version" value="v24.15.0" />
                            <InfoRow label="Environment" value="Production" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConfigToggle({ label, desc, checked }: { label: string; desc: string; checked: boolean }) {
    return (
        <div className="flex items-center justify-between gap-8">
            <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">{label}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    )
}

function ConfigCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-amber-200 transition-all">
            <div className="flex items-center gap-3 mb-2">
                <Icon size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-bold text-slate-700">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
            <span className="text-[10px] font-black text-slate-700">{value}</span>
        </div>
    )
}
