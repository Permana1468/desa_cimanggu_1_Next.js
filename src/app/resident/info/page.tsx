import { getVillageProfile } from "@/actions/village";
import { MapPin, Info, Users, BookOpen } from "lucide-react";

export default async function ResidentVillageInfo() {
    const profile = await getVillageProfile();

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Info size={48} className="text-slate-300 mb-4" />
                <h3 className="text-xl font-black text-slate-800">Data Desa Belum Tersedia</h3>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Informasi Desa</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Profil dan informasi umum tentang Desa Cimanggu I.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200/60 space-y-12">
                
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Visi & Misi</h3>
                    </div>
                    
                    <div className="space-y-6 pl-4 md:pl-16">
                        <div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Visi</h4>
                            <p className="text-lg font-bold text-slate-800 leading-relaxed">
                                &quot;{profile.visi}&quot;
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Misi</h4>
                            <ul className="space-y-2">
                                {Array.isArray(profile.misi) && (profile.misi as any[]).map((m: any, i: number) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-blue-600 font-black">{i + 1}.</span>
                                        <span className="text-slate-700 font-medium">{m}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-100" />

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <MapPin size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Profil Wilayah</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 md:pl-16">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Luas Wilayah</h4>
                            <p className="text-xl font-bold text-slate-800">{profile.luasWilayah || "-"}</p>
                        </div>
                        
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batas Wilayah</h4>
                            <div className="space-y-2 text-sm font-medium text-slate-700">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Utara</span>
                                    <span className="font-bold text-slate-900">{profile.batasUtara || "-"}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Selatan</span>
                                    <span className="font-bold text-slate-900">{profile.batasSelatan || "-"}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Timur</span>
                                    <span className="font-bold text-slate-900">{profile.batasTimur || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Barat</span>
                                    <span className="font-bold text-slate-900">{profile.batasBarat || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
