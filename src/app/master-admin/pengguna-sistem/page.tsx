import { getAllUsers, getAllTenantsMinimal } from "@/actions/master";
import UserManagementClient from "@/components/master/UserManagementClient";
import { Suspense } from "react";


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
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-10 w-48 bg-slate-200 rounded-xl" />
                <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm h-96" />
        </div>
    );
}
