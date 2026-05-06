import { Building2, Users, Target, Shield } from "lucide-react";

export default function KelembagaanPage() {
    const lembagas = [
        { name: "LPM", fullName: "Lembaga Pemberdayaan Masyarakat", members: 12, desc: "Mitra pemerintah desa dalam merencanakan dan melaksanakan pembangunan." },
        { name: "PKK", fullName: "Pemberdayaan Kesejahteraan Keluarga", members: 25, desc: "Peningkatan kesejahteraan keluarga melalui 10 program pokok PKK." },
        { name: "Karang Taruna", fullName: "Karya Mandiri", members: 40, desc: "Wadah pengembangan generasi muda desa di bidang sosial dan ekonomi." },
        { name: "MUI", fullName: "Majelis Ulama Indonesia", members: 8, desc: "Lembaga koordinasi umat beragama dan bimbingan religius." }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kelembagaan Desa</h1>
                    <p className="text-slate-500 text-sm">Kelola struktur dan pengurus lembaga kemasyarakatan desa.</p>
                </div>
                <button className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                    Tambah Lembaga
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lembagas.map((item, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-8 group hover:border-amber-200 transition-all">
                        <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                            <Building2 size={40} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-800">{item.name}</h3>
                                <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Users size={12} /> {item.members} Anggota
                                </div>
                            </div>
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">{item.fullName}</p>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                            
                            <div className="pt-4 flex gap-3">
                                <button className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                                    Lihat Pengurus <Target size={14} />
                                </button>
                                <button className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                    Program Kerja <Shield size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
