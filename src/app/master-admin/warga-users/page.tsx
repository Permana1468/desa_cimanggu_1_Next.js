import { getAllUsers, getAllTenantsMinimal } from "@/actions/master";
import WargaUsersClient from "@/components/master/WargaUsersClient";
import { Suspense } from "react";

export const unstable_instant = {
    prefetch: "static",
    samples: [
        { searchParams: { tenantId: null } }
    ]
};

export default async function WargaUsersPage() {
    return (
        <Suspense fallback={<WargaUsersSkeleton />}>
            <WargaUsersContent />
        </Suspense>
    );
}

async function WargaUsersContent() {
    let users: any[] = [];
    let tenants: any[] = [];
    try {
        const [u, t] = await Promise.all([
            getAllUsers(),
            getAllTenantsMinimal()
        ]);
        users = u;
        tenants = t;
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }

    return (
        <div className="animate-in fade-in duration-700">
            <WargaUsersClient 
                initialUsers={users} 
                tenants={tenants} 
            />
        </div>
    );
}

function WargaUsersSkeleton() {
    return (
        <div className="space-y-8 animate-pulse p-6">
            <div className="flex justify-between items-center">
                <div className="h-10 w-48 bg-slate-200 rounded-full" />
                <div className="h-10 w-32 bg-slate-200 rounded-full" />
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-96" />
        </div>
    );
}
