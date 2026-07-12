import { getAllTenantsMinimal, getVillageStructure } from "@/actions/master";
import { getBoundaries } from "@/actions/gis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GisManagementWrapper from "@/components/master/GisManagementWrapper";
import { Suspense } from "react";


export default async function GisManagementPage() {
    return (
        <Suspense fallback={<GisSkeleton />}>
            <GisContent />
        </Suspense>
    );
}

async function GisContent() {
    const session = await getServerSession(authOptions);
    
    // Fallback UI if session is not loaded yet (e.g. during build-time static rendering)
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        return (
            <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-xl">
                Mengautentikasi Sesi Master Admin...
            </div>
        );
    }

    const tenantId = (session.user as any).tenantId;

    let tenants: any[] = [];
    let boundariesRes: any = { success: false, data: [] };
    let villageStructure: any = null;

    try {
        const [t, b, v] = await Promise.all([
            getAllTenantsMinimal(),
            getBoundaries(tenantId),
            getVillageStructure(),
        ]);
        tenants = t;
        boundariesRes = b;
        villageStructure = v;
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }

    const initialBoundaries = boundariesRes.success ? boundariesRes.data || [] : [];

    return (
        <div className="space-y-8 pb-16 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Sistem Informasi Geografis (GIS)
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                        Manajemen Batas Wilayah Administrasi & Demografi Spasial
                    </p>
                </div>
            </div>

            <GisManagementWrapper
                initialBoundaries={initialBoundaries}
                tenants={tenants}
                currentTenantId={tenantId}
                villageStructure={villageStructure}
            />
        </div>
    );
}

function GisSkeleton() {
    return (
        <div className="space-y-8 animate-pulse p-6">
            <div className="h-10 w-80 bg-slate-200 rounded-full" />
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-[500px]" />
        </div>
    );
}
