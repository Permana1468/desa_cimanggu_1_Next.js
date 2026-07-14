import { 
  Terminal,
  Activity,
  Cpu,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  MonitorPlay,
  Hexagon,
  Radar,
  Network
} from "lucide-react";
import Link from "next/link";

export function PerencanaanDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "KAUR PERENCANAAN";

  return (
    <div className="space-y-6 bg-slate-950 min-h-[calc(100vh-80px)] p-4 md:p-6 rounded-[2.5rem] font-sans overflow-hidden relative">
      {/* MATRIX / HUD BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* TOP GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/20 blur-[100px] pointer-events-none z-0" />

      {/* HEADER CARD - HUD STYLE */}
      <div className="relative z-10 border border-cyan-500/30 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-3xl opacity-50" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-cyan-50">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              <Terminal size={14} className="animate-pulse" /> SYSTEM ACTIVE: APBDES PLANNING
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] uppercase">
              {roleName}
            </h1>
            <p className="text-cyan-200/80 max-w-xl text-sm md:text-base font-medium tracking-wide">
              Selamat datang, <span className="text-cyan-300 font-bold">{session?.user?.name}</span>. Modul perencanaan strategis terhubung. Memantau progres RAB dan serapan anggaran desa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-5 min-w-[140px] shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] relative group">
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
              <span className="block text-[10px] font-bold text-cyan-500 mb-2 uppercase tracking-widest">Serapan Dana</span>
              <span className="block text-3xl font-black text-cyan-300 font-mono drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]">45%</span>
            </div>
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-5 min-w-[140px] shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
              <span className="block text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-widest">Sisa Anggaran</span>
              <span className="block text-xl md:text-2xl font-black text-emerald-400 font-mono mt-1 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">Rp 450 Jt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* LEFT COLUMN: RINGKASAN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-800">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Radar size={28} className="text-cyan-400 animate-[spin_4s_linear_infinite]" />
                <div>
                  <h2 className="text-xl font-black text-cyan-50 tracking-wide uppercase">Analisis APBDes 2026</h2>
                  <p className="text-cyan-500 text-xs font-mono uppercase tracking-widest mt-1">Alokasi & Realisasi Anggaran Berjalan</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* PENDAPATAN */}
              <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between hover:border-emerald-500/50 transition-all group shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
                    <ArrowDownRight size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 uppercase tracking-wide text-sm">Pendapatan Desa</h4>
                    <span className="text-xs text-slate-500 font-mono">TARGET: RP 1.2M</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-emerald-400 font-mono text-lg">Rp 800.000.000</span>
                  <span className="inline-block mt-1 text-[10px] font-bold text-slate-950 bg-emerald-400 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(52,211,153,0.8)]">66% TERCAPAI</span>
                </div>
              </div>

              {/* BELANJA */}
              <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between hover:border-rose-500/50 transition-all group shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-950 border border-rose-500/30 text-rose-400 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 uppercase tracking-wide text-sm">Belanja Desa</h4>
                    <span className="text-xs text-slate-500 font-mono">PAGU: RP 1.2M</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-rose-400 font-mono text-lg">Rp 450.000.000</span>
                  <span className="inline-block mt-1 text-[10px] font-bold text-slate-950 bg-rose-400 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(251,113,133,0.8)]">37% TERSERAP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-cyan-900/30">
              <Hexagon size={120} strokeWidth={1} />
            </div>
            
            <h2 className="text-sm font-black text-cyan-500 mb-5 uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
              <MonitorPlay size={16} /> Command Center
            </h2>
            
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button className="flex flex-col items-center gap-3 p-5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 hover:bg-cyan-900/60 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all group">
                <Database size={28} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-center uppercase tracking-widest">Input RAB</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-400 hover:bg-indigo-900/60 hover:border-indigo-400/50 hover:shadow-[0_0_15px_rgba(129,140,248,0.2)] transition-all group">
                <Activity size={28} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-center uppercase tracking-widest">Laporan Realisasi</span>
              </button>
            </div>
          </div>
          
          {/* CPU / SERVER STATUS */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-inner">
             <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
                <span>SYSTEM STATUS</span>
                <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> ONLINE</span>
             </div>
             <div className="space-y-3">
               <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>SERVER LOAD</span>
                    <span>24%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-cyan-500 h-1 rounded-full shadow-[0_0_5px_rgba(6,182,212,0.8)]" style={{width: '24%'}}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>DATABASE SYNC</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-emerald-500 h-1 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]" style={{width: '100%'}}></div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
