import { Metadata } from "next";
import { getPendingSensusPoints } from "@/actions/sensus";
import AdminVerifierClient from "@/components/sensus/AdminVerifierClient";

import prisma from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Sensus App | Ruang Kuisioner",
};

export default async function KuisionerPage() {
    // Fetch pending points and master village structure concurrently for max performance
    const [pendingPoints, config] = await Promise.all([
        getPendingSensusPoints(),
        prisma.systemSetting.findUnique({ where: { id: "village_structure" } })
    ]);
    
    const villageStructure = (config?.settings as any) || { dusun: [] };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                        K
                    </div>
                    <div>
                        <h1 className="text-white font-bold tracking-wide">Kuisioner & Verifikasi Lapangan</h1>
                        <p className="text-xs text-slate-400">Tinjau dan Setujui Data Sensus dari Surveyor</p>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 overflow-hidden">
                <AdminVerifierClient initialPoints={pendingPoints} villageStructure={villageStructure} />
            </main>
        </div>
    );
}
