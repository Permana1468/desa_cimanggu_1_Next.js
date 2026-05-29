import { getVillageStructure } from "@/actions/master";
import { WilayahManagementClient } from "@/components/master/WilayahManagementClient";
import { Suspense } from "react";

// Enable instant client navigation validation to prevent page navigation blocking
export const unstable_instant = { prefetch: "static" };

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
    const structure = await getVillageStructure();
    return (
        <div className="animate-in fade-in duration-700">
            <WilayahManagementClient initialStructure={structure} />
        </div>
    );
}

function WilayahSkeleton() {
    return (
        <div className="space-y-8 animate-pulse p-6">
            <div className="h-10 w-64 bg-slate-200 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl h-64 bg-slate-50" />
                ))}
            </div>
        </div>
    );
}
