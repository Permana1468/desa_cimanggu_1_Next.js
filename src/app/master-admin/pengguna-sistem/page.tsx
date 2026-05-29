import { getAllUsers, getAllTenantsMinimal } from "@/actions/master";
import UserManagementClient from "@/components/master/UserManagementClient";
import { Suspense } from "react";

// Enable instant client navigation validation to prevent page navigation blocking
export const unstable_instant = { prefetch: "static" };

export default async function UserManagementPage() {
    return (
        <Suspense fallback={<UserManagementSkeleton />}>
            <UserManagementContent />
        </Suspense>
    );
}

async function UserManagementContent() {
    const [users, tenants] = await Promise.all([
        getAllUsers(),
        getAllTenantsMinimal()
    ]);

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
