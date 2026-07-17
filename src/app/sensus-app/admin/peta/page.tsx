import { Metadata } from "next";
import { Map as MapIcon, Maximize } from "lucide-react";
import GisDashboardWrapper from "@/components/master/GisDashboardWrapper";
import { getBoundaries, getGisDashboardStats } from "@/actions/gis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Sensus App | Peta Sebaran",
};

export default async function PetaSebaranPage() {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.tenantId || "default";
    
    // Fetch boundaries and real stats for this tenant
    const [boundariesRes, statsRes] = await Promise.all([
        getBoundaries(tenantId),
        getGisDashboardStats(tenantId)
    ]);
    
    const boundaries = boundariesRes.success ? (boundariesRes.data || []) : [];
    const realStats = statsRes.success ? statsRes.data : { houses: 0, families: 0, population: 0, poverty: 0 };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-slate-950 to-transparent z-10 flex items-center px-8 justify-between pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                        <MapIcon className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> Peta Sebaran Sensus
                    </h1>
                </div>
                <button className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white p-2.5 rounded-lg hover:bg-blue-600 transition-colors">
                    <Maximize size={20} />
                </button>
            </header>

            <div className="flex-1 w-full h-full relative">
                {/* We use a relative full-height container instead of inset-0 with arbitrary styling */}
                <div className="w-full h-full relative z-0">
                    <GisDashboardWrapper 
                        boundaries={boundaries}
                        userName={session?.user?.name || "Petugas"}
                        tenantName={(session?.user as any)?.tenantName || "Desa Digital"}
                        realStats={realStats as any}
                        tenantId={tenantId}
                        userEmail={session?.user?.email}
                    />
                </div>
            </div>
        </div>
    );
}
