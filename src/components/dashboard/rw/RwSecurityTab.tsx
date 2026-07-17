"use client";

import { useState, useEffect } from "react";
import { Shield, Users, AlertTriangle, Calendar, Plus, Trash2, CheckCircle, Search } from "lucide-react";
import { getRwSecurityLogs, addRwSecurityLog, updateRwSecurityLogStatus, deleteRwSecurityLog, getRwPatrolSchedules, addRwPatrolSchedule, deleteRwPatrolSchedule } from "@/actions/rw";

export function RwSecurityTab({ session }: { session: any }) {
    const [activeSubTab, setActiveSubTab] = useState<"logs" | "patrol">("logs");
    
    // States for Logs
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [logForm, setLogForm] = useState({ type: "TAMU", reporter: "", title: "", description: "" });
    const [submittingLog, setSubmittingLog] = useState(false);

    // States for Patrol
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [patrolForm, setPatrolForm] = useState({ rt: "", date: "", personnel: "", notes: "" });
    const [submittingPatrol, setSubmittingPatrol] = useState(false);

    const isRw = session?.user?.role === "RW";

    const loadLogs = async () => {
        setLoadingLogs(true);
        const data = await getRwSecurityLogs();
        setLogs(data);
        setLoadingLogs(false);
    };

    const loadSchedules = async () => {
        setLoadingSchedules(true);
        const data = await getRwPatrolSchedules();
        setSchedules(data);
        setLoadingSchedules(false);
    };

    useEffect(() => {
        loadLogs();
        loadSchedules();
    }, []);



    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingLog(true);
        await addRwSecurityLog({
            type: logForm.type,
            reporter: logForm.reporter,
            title: logForm.title,
            description: logForm.description,
            date: new Date()
        });
        setLogForm({ type: "TAMU", reporter: "", title: "", description: "" });
        setSubmittingLog(false);
        loadLogs();
    };

    const handleAddPatrol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isRw) return;
        setSubmittingPatrol(true);
        await addRwPatrolSchedule({
            rt: patrolForm.rt,
            date: new Date(patrolForm.date),
            personnel: patrolForm.personnel,
            notes: patrolForm.notes
        });
        setPatrolForm({ rt: "", date: "", personnel: "", notes: "" });
        setSubmittingPatrol(false);
        loadSchedules();
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit">
                <button 
                    onClick={() => setActiveSubTab("logs")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSubTab === "logs" ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <AlertTriangle size={16} /> Laporan & Tamu
                </button>
                <button 
                    onClick={() => setActiveSubTab("patrol")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSubTab === "patrol" ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Shield size={16} /> Jadwal Ronda Terpadu
                </button>
            </div>

            {activeSubTab === "logs" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Plus size={18} className="text-emerald-500" /> Buat Laporan Baru
                        </h3>
                        <form onSubmit={handleAddLog} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Jenis Laporan</label>
                                <select 
                                    value={logForm.type} onChange={e => setLogForm({...logForm, type: e.target.value})}
                                    className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                                >
                                    <option value="TAMU">Tamu 1x24 Jam</option>
                                    <option value="INSIDEN">Insiden Keamanan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Pelapor (Nama/RT)</label>
                                <input 
                                    required value={logForm.reporter} onChange={e => setLogForm({...logForm, reporter: e.target.value})}
                                    className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Bpk Budi / RT 01"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Judul / Identitas</label>
                                <input 
                                    required value={logForm.title} onChange={e => setLogForm({...logForm, title: e.target.value})}
                                    className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Tamu Menginap 2 hari"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Keterangan / Detail</label>
                                <textarea 
                                    required value={logForm.description} onChange={e => setLogForm({...logForm, description: e.target.value})}
                                    className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm min-h-[100px]" placeholder="Detail laporan..."
                                />
                            </div>
                            <button disabled={submittingLog} type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                                {submittingLog ? "Menyimpan..." : "Kirim Laporan"}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {loadingLogs ? <div className="p-8 text-center animate-pulse">Memuat...</div> : logs.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200 text-slate-500 font-medium">Belum ada catatan keamanan.</div>
                        ) : logs.map(log => (
                            <div key={log.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex gap-4">
                                <div className={`p-4 rounded-2xl h-fit ${log.type === 'TAMU' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {log.type === 'TAMU' ? <Users size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${log.type === 'TAMU' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{log.type}</span>
                                            <h4 className="font-bold text-slate-800 text-lg mt-2">{log.title}</h4>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 block">{new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            <span className={`text-xs font-bold ${log.status === 'SELESAI' ? 'text-emerald-500' : 'text-amber-500'}`}>{log.status}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">{log.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1"><Search size={14}/> Pelapor: {log.reporter}</span>
                                        <div className="flex gap-2">
                                            {log.status === "LAPORAN" && isRw && (
                                                <button onClick={async () => { await updateRwSecurityLogStatus(log.id, "SELESAI"); loadLogs(); }} className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-200">
                                                    <CheckCircle size={14} /> Tandai Selesai
                                                </button>
                                            )}
                                            {isRw && (
                                                <button onClick={async () => { if(confirm("Hapus log?")) { await deleteRwSecurityLog(log.id); loadLogs(); } }} className="text-xs bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-200">
                                                    <Trash2 size={14} />
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

            {activeSubTab === "patrol" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {isRw && (
                        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-500" /> Buat Jadwal Ronda
                            </h3>
                            <form onSubmit={handleAddPatrol} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Tanggal Ronda</label>
                                    <input type="date" required value={patrolForm.date} onChange={e => setPatrolForm({...patrolForm, date: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Target Wilayah / RT</label>
                                    <input required value={patrolForm.rt} onChange={e => setPatrolForm({...patrolForm, rt: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: RT 01 & 02" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Daftar Personil</label>
                                    <textarea required value={patrolForm.personnel} onChange={e => setPatrolForm({...patrolForm, personnel: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Nama-nama petugas..." />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Catatan Tambahan (Opsional)</label>
                                    <input value={patrolForm.notes} onChange={e => setPatrolForm({...patrolForm, notes: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Fokus area rawan..." />
                                </div>
                                <button disabled={submittingPatrol} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                                    {submittingPatrol ? "Menyimpan..." : "Jadwalkan Ronda"}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className={`lg:col-span-${isRw ? '2' : '3'} space-y-4`}>
                        {loadingSchedules ? <div className="p-8 text-center animate-pulse">Memuat...</div> : schedules.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200 text-slate-500 font-medium">Belum ada jadwal ronda yang disusun.</div>
                        ) : schedules.map(schedule => (
                            <div key={schedule.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[80px]">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Tanggal</span>
                                        <span className="block text-2xl font-black text-blue-600 leading-none">{new Date(schedule.date).getDate()}</span>
                                        <span className="block text-xs font-bold text-slate-600 mt-1">{new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">Wilayah {schedule.rt}</h4>
                                        <p className="text-sm text-slate-500 font-medium mt-1">Personil: {schedule.personnel}</p>
                                        {schedule.notes && <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mt-2">Catatan: {schedule.notes}</p>}
                                    </div>
                                </div>
                                {isRw && (
                                    <button onClick={async () => { if(confirm("Hapus jadwal ini?")) { await deleteRwPatrolSchedule(schedule.id); loadSchedules(); } }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
