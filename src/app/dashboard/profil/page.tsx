import { MapPin, History, Target, ShieldCheck, Image as ImageIcon } from "lucide-react";

export default function VillageProfilePage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profil Desa</h1>
                    <p className="text-slate-500 text-sm">Informasi dasar, sejarah, visi, dan misi Desa Cimanggu I.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
                    Edit Profil
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vision & Mission */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Target size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Visi & Misi</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Visi</h4>
                                <p className="text-slate-700 font-bold text-lg leading-relaxed italic">
                                    "Terwujudnya Desa Cimanggu I yang Mandiri, Sejahtera, dan Berbudaya melalui Tata Kelola Pemerintahan yang Transparan dan Inovatif."
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Misi</h4>
                                <ul className="space-y-3">
                                    {[
                                        "Meningkatkan kualitas pelayanan publik berbasis teknologi.",
                                        "Mengoptimalkan potensi ekonomi lokal melalui BUMDes.",
                                        "Membangun infrastruktur desa yang merata dan berkelanjutan.",
                                        "Memperkuat nilai-nilai religius dan kebudayaan masyarakat."
                                    ].map((misi, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                                            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-black">{i+1}</div>
                                            {misi}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <History size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Sejarah Singkat</h2>
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed">
                            Desa Cimanggu I memiliki sejarah panjang yang berakar dari semangat gotong royong masyarakat agraris. Sejak berdirinya, desa ini telah mengalami berbagai fase transformasi dari desa tradisional menjadi desa yang mulai mengadopsi sistem digitalisasi untuk melayani ribuan warga yang tersebar di wilayah Kecamatan Cibungbulang.
                        </p>
                    </div>
                </div>

                {/* Geography & Stats */}
                <div className="space-y-8">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-blue-400" /> Geografi
                        </h3>
                        <div className="space-y-4">
                            <GeoRow label="Luas Wilayah" value="245.5 Ha" />
                            <GeoRow label="Batas Utara" value="Desa Cimanggu II" />
                            <GeoRow label="Batas Selatan" value="Desa Dukuh" />
                            <GeoRow label="Batas Timur" value="Desa Galuga" />
                            <GeoRow label="Batas Barat" value="Desa Situ" />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <ImageIcon size={20} className="text-amber-500" /> Galeri Desa
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-bold">{value}</span>
        </div>
    )
}
