import { getResidentProfile } from "@/actions/resident";
import { User, MapPin, Briefcase, GraduationCap, Users } from "lucide-react";

export default async function ResidentProfile() {
    const profile = await getResidentProfile();

    if (!profile) {
        return (
            <div className="space-y-8 pb-12 animate-in fade-in duration-700">
                <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 text-center">
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Profil Belum Ditautkan</h2>
                    <p className="text-slate-600 font-medium max-w-lg mx-auto">
                        Akun Anda belum ditautkan dengan data kependudukan (NIK) di sistem desa. 
                        Silakan hubungi RT atau Admin Desa untuk menautkan akun Anda agar dapat menggunakan layanan persuratan.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Data Keluarga & Profil</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Informasi kependudukan yang terdaftar pada sistem desa.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200/60">
                <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-32 h-32 bg-slate-100 rounded-[2rem] shrink-0 flex items-center justify-center text-slate-400">
                        <User size={64} />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">{profile.namaLengkap}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">NIK: {profile.nik}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem icon={MapPin} label="Alamat" value={`${profile.alamat}, RT ${profile.rt} / RW ${profile.rw}, Dusun ${profile.dusun}`} />
                            <InfoItem icon={User} label="Tempat, Tanggal Lahir" value={`${profile.tempatLahir}, ${profile.tanggalLahir.toLocaleDateString('id-ID')}`} />
                            <InfoItem icon={Users} label="Agama" value={profile.agama} />
                            <InfoItem icon={Briefcase} label="Pekerjaan" value={profile.pekerjaan || "-"} />
                            <InfoItem icon={GraduationCap} label="Pendidikan" value={profile.pendidikan || "-"} />
                            <InfoItem icon={Users} label="Status Perkawinan" value={profile.statusKawin} />
                            <InfoItem icon={Users} label="Hubungan Keluarga" value={profile.hubunganKeluarga} />
                            <InfoItem icon={User} label="Jenis Kelamin" value={profile.jenisKelamin} />
                        </div>
                    </div>
                </div>
                
                <div className="mt-10 pt-10 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                        * Jika terdapat kesalahan pada data di atas, mohon segera lapor ke RT setempat atau datang ke balai desa dengan membawa KTP dan KK asli.
                    </p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
