import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, Mail, Phone, ShieldCheck, Briefcase } from "lucide-react";

export default async function AparaturPage() {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any).tenantId;

    const aparatur = await prisma.user.findMany({
        where: { 
            tenantId,
            role: { not: "WARGA" }
        },
        orderBy: { role: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Aparatur Desa</h1>
                    <p className="text-slate-500 text-sm">Struktur organisasi dan pengurus administrasi Desa Cimanggu I.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
                    Tambah Aparatur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {aparatur.map((person) => (
                    <div key={person.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-2xl group-hover:scale-110 transition-transform">
                                {person.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-black text-slate-800 text-lg leading-tight">{person.fullName}</h3>
                                <div className="inline-flex items-center gap-1.5 mt-1 text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                    <ShieldCheck size={12} /> {person.role}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <Mail size={16} className="text-slate-400" /> {person.email || "-"}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <Phone size={16} className="text-slate-400" /> {person.phoneNumber || "-"}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <Briefcase size={16} className="text-slate-400" /> Masa Jabatan: 2021-2027
                            </div>
                        </div>

                        <div className="mt-8 flex gap-2">
                            <button className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Detail</button>
                            <button className="px-4 py-3 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">Edit</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
