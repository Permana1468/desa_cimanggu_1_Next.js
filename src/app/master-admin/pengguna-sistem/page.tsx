import { getAllUsers, getAllTenantsMinimal } from "@/actions/master";
import UserManagementClient from "@/components/master/UserManagementClient";
import { Suspense } from "react";

export const unstable_instant = {
    prefetch: "static",
    samples: [
        { searchParams: { tenantId: null } }
    ]
};

export default async function UserManagementPage() {
    return (
        <Suspense fallback={<UserManagementSkeleton />}>
            <UserManagementContent />
        </Suspense>
    );
}

async function UserManagementContent() {
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
            <UserManagementClient 
                initialUsers={users} 
                tenants={tenants} 
            />
        </div>
    );
}

function UserManagementSkeleton() {
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
