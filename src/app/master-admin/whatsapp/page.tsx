import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WhatsappIntegrationClient from "@/components/master/WhatsappIntegrationClient";

export default async function WhatsappIntegrationPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        return (
            <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-xl">
                Akses Ditolak
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    WhatsApp Gateway
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                    Integrasi API Fonnte & WhatsApp Web.js
                </p>
            </div>
            <WhatsappIntegrationClient />
        </div>
    );
}
