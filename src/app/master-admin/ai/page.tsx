import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAiIntegration } from "@/actions/ai";
import { AiIntegrationClient } from "@/components/master/AiIntegrationClient";

export default async function AiIntegrationPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        redirect("/login");
    }

    const initialSettings = await getAiIntegration();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md mb-6">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Kecerdasan Buatan</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 flex items-center gap-4">
                        Integrasi Gemini AI
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
                        Pusat kendali pengaturan API Key Gemini (Google AI Studio) untuk mengaktifkan fitur pembacaan dokumen dan otomasi cerdas di seluruh modul aplikasi.
                    </p>
                </div>
            </div>

            {/* Client Form Component */}
            <AiIntegrationClient initialSettings={initialSettings} />
        </div>
    );
}
