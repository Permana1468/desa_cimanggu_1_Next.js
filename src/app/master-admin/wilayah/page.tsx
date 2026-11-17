import { getVillageStructure } from "@/actions/master";
import { WilayahManagementClient } from "@/components/master/WilayahManagementClient";
import { Suspense } from "react";


export default async function WilayahPage() {
    return (
        <div className="container mx-auto space-y-12">
            <Suspense fallback={<WilayahSkeleton />}>
                <WilayahContent />
            </Suspense>
        </div>
    );
}

async function WilayahContent() {
    let structure = null;
    try {
        structure = await getVillageStructure();
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }
    return (
        <div className="animate-in fade-in duration-700">
            <WilayahManagementClient initialStructure={structure} />
        </div>
    );
}

function WilayahSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-64 bg-slate-50" />
                ))}
            </div>
        </div>
    );
}
