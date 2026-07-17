import { Metadata } from "next";
import { Layers, Eye, EyeOff } from "lucide-react";

export const metadata: Metadata = {
    title: "Sensus App | Manajemen Layer",
};

export default function LayerPage() {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Layers className="text-emerald-500" /> Manajemen Layer Spasial
                </h1>
                <p className="text-slate-400">Atur layer peta yang akan ditampilkan ke publik atau disinkronisasi ke D-GIS Center.</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-w-3xl">
                <div className="divide-y divide-slate-800">
                    {[
                        { name: "Rumah Warga & Kependudukan", active: true, desc: "Menampilkan titik koordinat rumah warga yang telah diverifikasi beserta data KK." },
                        { name: "Fasilitas Umum & Sosial", active: true, desc: "Infrastruktur desa seperti Masjid, Balai Desa, dan Posyandu." },
                        { name: "Jaringan Infrastruktur (Jalan/Drainase)", active: false, desc: "Layer polyline untuk jalan desa dan saluran air." },
                        { name: "Potensi UMKM", active: true, desc: "Sebaran titik usaha mikro kecil menengah warga." },
                        { name: "Mitigasi Bencana & Keamanan", active: false, desc: "Zona rawan bencana dan titik kumpul evakuasi." },
                    ].map((layer, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-3 h-3 rounded-full ${layer.active ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                                <div>
                                    <h3 className={`font-bold text-lg mb-1 ${layer.active ? 'text-white' : 'text-slate-500'}`}>{layer.name}</h3>
                                    <p className="text-sm text-slate-400 max-w-lg">{layer.desc}</p>
                                </div>
                            </div>
                            <button className={`p-3 rounded-xl transition-all ${layer.active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                                {layer.active ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
