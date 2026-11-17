import { getAllUsers, getAllTenantsMinimal } from "@/actions/master";
import WargaUsersClient from "@/components/master/WargaUsersClient";
import { Suspense } from "react";


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
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-10 w-48 bg-slate-200 rounded-xl" />
                <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm h-96" />
        </div>
    );
}
