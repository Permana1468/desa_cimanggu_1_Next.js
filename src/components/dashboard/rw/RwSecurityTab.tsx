"use client";

import { useState, useEffect } from "react";
import { 
    Shield, Users, AlertTriangle, Calendar, Plus, Trash2, 
    CheckCircle, Search, Edit3, X, Printer, RefreshCw, Sparkles
} from "lucide-react";
import { 
    getRwSecurityLogs, addRwSecurityLog, updateRwSecurityLogStatus, 
    deleteRwSecurityLog, getRwPatrolSchedules, addRwPatrolSchedule, 
    updateRwPatrolSchedule, deleteRwPatrolSchedule 
} from "@/actions/rw";
import { getWilayahStrukturOptions } from "@/actions/rt";
import { triggerNotificationRefresh } from "@/hooks/useNotifications";

export function RwSecurityTab({ session }: { session: any }) {
    const rwNo = (session?.user as any)?.rw || "009";
    const [activeSubTab, setActiveSubTab] = useState<"logs" | "patrol">("logs");
    
    // States for Logs
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [logForm, setLogForm] = useState({ type: "TAMU", reporter: "", title: "", description: "" });
    const [submittingLog, setSubmittingLog] = useState(false);

    // States for Patrol
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [patrolForm, setPatrolForm] = useState({ 
        rt: "", 
        date: new Date().toISOString().split("T")[0], 
        personnel: "", 
        notes: "" 
    });
    const [submittingPatrol, setSubmittingPatrol] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<any | null>(null);

    // Structure RT options
    const [rtList, setRtList] = useState<string[]>([]);

    const rawRole = String(session?.user?.role || "").toUpperCase();
    const isRw = rawRole === "RW" || rawRole === "ADMIN_DESA" || rawRole === "KADES" || rawRole === "SEKDES" || Boolean((session?.user as any)?.rw && (!(session?.user as any)?.rt || (session?.user as any)?.rt === "000"));

    const loadLogs = async () => {
        setLoadingLogs(true);
        const data = await getRwSecurityLogs(rwNo);
        setLogs(data);
        setLoadingLogs(false);
    };

    const loadSchedules = async () => {
        setLoadingSchedules(true);
        const data = await getRwPatrolSchedules(rwNo);
        setSchedules(data);
        setLoadingSchedules(false);
    };

    useEffect(() => {
        loadLogs();
        loadSchedules();
        getWilayahStrukturOptions().then(res => {
            if (res.rtList && res.rtList.length > 0) {
                setRtList(res.rtList);
            }
        });

        const handleRefresh = () => {
            if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
            loadLogs();
            loadSchedules();
        };
        window.addEventListener("refresh-notifications", handleRefresh);
        window.addEventListener("focus", handleRefresh);

        let bc: BroadcastChannel | null = null;
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
                bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
                bc.onmessage = (ev) => {
                    if (ev.data?.type === "SYNC_EVENT" || ev.data?.type === "SECURITY_UPDATED") {
                        loadLogs();
                        loadSchedules();
                    }
                };
            } catch {}
        }

        const interval = setInterval(handleRefresh, 30000);
        return () => {
            window.removeEventListener("refresh-notifications", handleRefresh);
            window.removeEventListener("focus", handleRefresh);
            if (bc) bc.close();
            clearInterval(interval);
        };
    }, [rwNo]);

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingLog(true);
        await addRwSecurityLog({
            type: logForm.type,
            reporter: logForm.reporter,
            title: logForm.title,
            description: logForm.description,
            date: new Date(),
            rw: rwNo
        });
        setLogForm({ type: "TAMU", reporter: "", title: "", description: "" });
        setSubmittingLog(false);
        loadLogs();
        triggerNotificationRefresh();
    };

    const handleAddPatrol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isRw) return;
        setSubmittingPatrol(true);
        await addRwPatrolSchedule({
            rt: patrolForm.rt,
            date: new Date(patrolForm.date),
            personnel: patrolForm.personnel,
            notes: patrolForm.notes,
            rw: rwNo
        });
        setPatrolForm({ 
            rt: "", 
            date: new Date().toISOString().split("T")[0], 
            personnel: "", 
            notes: "" 
        });
        setSubmittingPatrol(false);
        loadSchedules();
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSchedule) return;
        setSubmittingPatrol(true);
        await updateRwPatrolSchedule(editingSchedule.id, {
            rt: editingSchedule.rt,
            date: new Date(editingSchedule.date),
            personnel: editingSchedule.personnel,
            notes: editingSchedule.notes
        });
        setSubmittingPatrol(false);
        setEditingSchedule(null);
        loadSchedules();
    };

    const handlePrintPatrol = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Jadwal Ronda Malam Terpadu RW ${rwNo}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 25px; color: #111; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16px; text-transform: uppercase; }
        .header h2 { margin: 4px 0 0; font-size: 13px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #0f172a; color: #fff; padding: 8px; text-align: left; font-size: 10px; }
        td { padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 10px; }
        .footer { margin-top: 30px; display: flex; justify-content: flex-end; }
        .sig { text-align: center; width: 220px; }
        .sig-line { margin-top: 65px; border-bottom: 1px solid #111; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>JADWAL SISTEM KEAMANAN LINGKUNGAN (SISKAMLING) RW ${rwNo}</h1>
        <h2>DESA CIMANGGU I KECAMATAN CIBUNGBULANG</h2>
        <div style="margin-top:5px;font-size:11px;color:#555;">Dicetak pada: ${dateStr}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:30px;">No</th>
                <th style="width:110px;">Hari / Tanggal</th>
                <th style="width:130px;">Target Pos / RT</th>
                <th>Petugas Ronda Terjadwal</th>
                <th>Catatan Khusus</th>
            </tr>
        </thead>
        <tbody>
            ${schedules.map((s, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td><strong>Wilayah ${s.rt}</strong></td>
                    <td>${s.personnel}</td>
                    <td>${s.notes || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <div class="sig">
            <div>Bogor, ${dateStr}</div>
            <div style="font-weight:bold;margin-top:4px;">Ketua RW ${rwNo}</div>
            <div class="sig-line"></div>
            <div style="font-size:9px;color:#555;margin-top:3px;">Tanda Tangan & Cap RW</div>
        </div>
    </div>
</body>
</html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 350);
    };

    return (
        <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[2.5rem] p-7 md:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-[70px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-[11px] font-bold backdrop-blur-md mb-3 border border-white/10">
                            <Shield size={13} className="text-emerald-400" />
                            <span>Kamtibmas & Siskamling Terpadu RW {rwNo}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black mb-2 flex items-center gap-3">
                            <Shield className="shrink-0 text-emerald-400" /> Keamanan Lingkungan RW {rwNo}
                        </h2>
                        <p className="text-slate-300 max-w-xl text-xs sm:text-sm leading-relaxed">
                            Pencatatan tamu menginap 1x24 jam, pelaporan insiden keamanan, dan pengorganisasian jadwal ronda malam terpadu seluruh RT.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {activeSubTab === "patrol" && schedules.length > 0 && (
                            <button
                                onClick={handlePrintPatrol}
                                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                                <Printer size={15} /> Cetak Jadwal Ronda
                            </button>
                        )}
                        <button
                            onClick={() => { loadLogs(); loadSchedules(); }}
                            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                            title="Segarkan Data"
                        >
                            <RefreshCw size={15} className={loadingLogs || loadingSchedules ? "animate-spin text-emerald-400" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl w-fit shadow-xs">
                <button 
                    onClick={() => setActiveSubTab("logs")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSubTab === "logs" 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                    <AlertTriangle size={15} className={activeSubTab === "logs" ? "text-amber-400" : ""} />
                    <span>Laporan Tamu &amp; Insiden ({logs.length})</span>
                </button>
                <button 
                    onClick={() => setActiveSubTab("patrol")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSubTab === "patrol" 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                    <Shield size={15} className={activeSubTab === "patrol" ? "text-emerald-400" : ""} />
                    <span>Jadwal Ronda Terpadu ({schedules.length})</span>
                </button>
            </div>

            {/* SUB-TAB 1: LOGS */}
            {activeSubTab === "logs" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs h-fit space-y-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                            <Plus size={18} className="text-emerald-600" /> Catat Tamu / Laporan Insiden
                        </h3>
                        <form onSubmit={handleAddLog} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Jenis Laporan</label>
                                <select 
                                    value={logForm.type} 
                                    onChange={e => setLogForm({...logForm, type: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                >
                                    <option value="TAMU">Tamu Wajib Lapor (1x24 Jam)</option>
                                    <option value="INSIDEN">Insiden Keamanan / Kamtibmas</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Pelapor (Nama / Wilayah RT)</label>
                                <input 
                                    required 
                                    value={logForm.reporter} 
                                    onChange={e => setLogForm({...logForm, reporter: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    placeholder="Contoh: Bpk Budi (Ketua RT 01)"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Judul / Identitas</label>
                                <input 
                                    required 
                                    value={logForm.title} 
                                    onChange={e => setLogForm({...logForm, title: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    placeholder="Contoh: Tamu Menginap 3 hari dari Bandung"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Detail Keterangan</label>
                                <textarea 
                                    required 
                                    value={logForm.description} 
                                    onChange={e => setLogForm({...logForm, description: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold min-h-[90px] text-slate-900" 
                                    placeholder="Alamat asal tamu, tujuan berkunjung, atau kronologi insiden..."
                                />
                            </div>
                            <button 
                                disabled={submittingLog} 
                                type="submit" 
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 text-xs shadow-md cursor-pointer transition-all"
                            >
                                {submittingLog ? "Menyimpan..." : "Simpan Laporan"}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {loadingLogs ? (
                            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80">
                                <RefreshCw className="animate-spin text-slate-600 mx-auto mb-3" size={32} />
                                <p className="text-xs font-bold text-slate-500">Memuat catatan keamanan...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80 text-slate-500 space-y-3">
                                <Shield className="mx-auto text-slate-300" size={42} />
                                <p className="font-bold text-sm text-slate-700">Belum ada catatan keamanan atau tamu 1x24 jam.</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Catat tamu menginap atau pantau gangguan kamtibmas melalui form di samping.
                                </p>
                            </div>
                        ) : logs.map(log => (
                            <div key={log.id} className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 hover:border-slate-300 transition-all">
                                <div className={`p-4 rounded-2xl h-fit shrink-0 ${log.type === 'TAMU' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {log.type === 'TAMU' ? <Users size={22} /> : <AlertTriangle size={22} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                log.type === 'TAMU' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {log.type === 'TAMU' ? 'Tamu 1x24 Jam' : 'Insiden Keamanan'}
                                            </span>
                                            <h4 className="font-black text-slate-900 text-base mt-2">{log.title}</h4>
                                        </div>
                                        <div className="text-left sm:text-right shrink-0">
                                            <span className="text-[10px] font-bold text-slate-400 block">
                                                {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className={`text-[11px] font-black uppercase ${
                                                log.status === 'SELESAI' ? 'text-emerald-600' : 'text-amber-600'
                                            }`}>
                                                {log.status === 'SELESAI' ? '• Selesai Ditangani' : '• Laporan Aktif'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-medium">{log.description}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                            <Search size={13} className="text-slate-400" /> Pelapor: <strong className="text-slate-700">{log.reporter}</strong>
                                        </span>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {log.status !== "SELESAI" && isRw && (
                                                <button 
                                                    onClick={async () => { await updateRwSecurityLogStatus(log.id, "SELESAI"); loadLogs(); }} 
                                                    className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-emerald-100 transition-all cursor-pointer border border-emerald-200/60"
                                                >
                                                    <CheckCircle size={13} /> Tandai Selesai
                                                </button>
                                            )}
                                            {isRw && (
                                                <button 
                                                    onClick={async () => { if (confirm("Hapus catatan keamanan ini?")) { await deleteRwSecurityLog(log.id); loadLogs(); } }} 
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: JADWAL RONDA */}
            {activeSubTab === "patrol" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {isRw && (
                        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs h-fit space-y-4">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                                <Calendar size={18} className="text-indigo-600" /> Buat Jadwal Ronda RW
                            </h3>
                            <form onSubmit={handleAddPatrol} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tanggal Ronda</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={patrolForm.date} 
                                        onChange={e => setPatrolForm({...patrolForm, date: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Target Wilayah / Pos RT</label>
                                    <input 
                                        required 
                                        value={patrolForm.rt} 
                                        onChange={e => setPatrolForm({...patrolForm, rt: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                        placeholder="Contoh: RT 01 & Posko Utama RW" 
                                    />
                                    {rtList.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {rtList.map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setPatrolForm(prev => ({
                                                        ...prev,
                                                        rt: prev.rt ? `${prev.rt}, RT ${r}` : `RT ${r}`
                                                    }))}
                                                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-bold"
                                                >
                                                    + RT {r}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setPatrolForm(prev => ({ ...prev, rt: "Seluruh Wilayah RW" }))}
                                                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg font-bold"
                                            >
                                                + Seluruh RW
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Daftar Personil / Petugas</label>
                                    <textarea 
                                        required 
                                        value={patrolForm.personnel} 
                                        onChange={e => setPatrolForm({...patrolForm, personnel: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold min-h-[80px] text-slate-900" 
                                        placeholder="Nama-nama personil atau giliran kelompok warga..." 
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Catatan Tambahan (Opsional)</label>
                                    <input 
                                        value={patrolForm.notes} 
                                        onChange={e => setPatrolForm({...patrolForm, notes: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900" 
                                        placeholder="Fokus patroli jam 02.00 WIB, gerbang ditutup, dll..." 
                                    />
                                </div>

                                <button 
                                    disabled={submittingPatrol} 
                                    type="submit" 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                                >
                                    {submittingPatrol ? "Menyimpan..." : "Jadwalkan Ronda"}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className={`lg:col-span-${isRw ? '2' : '3'} space-y-4`}>
                        {loadingSchedules ? (
                            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80">
                                <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
                                <p className="text-xs font-bold text-slate-500">Memuat jadwal ronda...</p>
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80 text-slate-500 space-y-3">
                                <Calendar className="mx-auto text-slate-300" size={42} />
                                <p className="font-bold text-sm text-slate-700">Belum ada jadwal ronda malam yang disusun.</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Susun jadwal siskamling lingkungan RW untuk memastikan keamanan warga tetap kondusif.
                                </p>
                            </div>
                        ) : schedules.map(schedule => (
                            <div key={schedule.id} className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center min-w-[75px] shrink-0">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase">Tgl</span>
                                        <span className="block text-2xl font-black text-indigo-600 leading-none my-0.5">
                                            {new Date(schedule.date).getDate()}
                                        </span>
                                        <span className="block text-[11px] font-bold text-slate-600">
                                            {new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700">
                                                Wilayah {schedule.rt}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1.5 leading-snug">
                                            Petugas: <span className="font-medium text-slate-600">{schedule.personnel}</span>
                                        </p>
                                        {schedule.notes && (
                                            <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg inline-block mt-2 border border-amber-200/50 font-medium">
                                                Catatan: {schedule.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {isRw && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                        <button 
                                            onClick={() => setEditingSchedule({
                                                ...schedule,
                                                date: new Date(schedule.date).toISOString().split("T")[0]
                                            })}
                                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                                            title="Edit Jadwal"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button 
                                            onClick={async () => { if (confirm("Hapus jadwal ronda ini?")) { await deleteRwPatrolSchedule(schedule.id); loadSchedules(); } }} 
                                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                                            title="Hapus"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL EDIT JADWAL RONDA */}
            {editingSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="font-black text-slate-900 text-base">Edit Jadwal Ronda Malam</h4>
                            <button onClick={() => setEditingSchedule(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tanggal</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={editingSchedule.date} 
                                    onChange={e => setEditingSchedule({...editingSchedule, date: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Target Wilayah / Pos</label>
                                <input 
                                    required 
                                    value={editingSchedule.rt} 
                                    onChange={e => setEditingSchedule({...editingSchedule, rt: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Daftar Personil</label>
                                <textarea 
                                    required 
                                    value={editingSchedule.personnel} 
                                    onChange={e => setEditingSchedule({...editingSchedule, personnel: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold min-h-[80px] text-slate-900" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Catatan Tambahan</label>
                                <input 
                                    value={editingSchedule.notes || ""} 
                                    onChange={e => setEditingSchedule({...editingSchedule, notes: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900" 
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingSchedule(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                                    Batal
                                </button>
                                <button disabled={submittingPatrol} type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
