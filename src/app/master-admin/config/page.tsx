import { getRolePermissions, getSystemSettings, getAllTenants, getAllUsers } from "@/actions/master";
import { RbacManager } from "@/components/master/RbacManager";
import { ConfigClient } from "@/components/master/ConfigClient";
import { TenantManagementClient } from "@/components/master/TenantManagementClient";
import { UserMaintenanceClient } from "@/components/master/UserMaintenanceClient";

export default async function ConfigurationPage() {
    const [permissions, settings, tenants, users] = await Promise.all([
        getRolePermissions(),
        getSystemSettings(),
        getAllTenants(),
        getAllUsers()
    ]);

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 pb-20">
            {/* 1. KONTROL AKSES (MAINTENANCE MODE) */}
            <div className="space-y-8">
                <TenantManagementClient initialTenants={tenants} />
                <UserMaintenanceClient initialUsers={users} />
            </div>

            {/* 2. MASTER CONFIGURATION UI (New PPOB, Payment, Branding) */}
            <ConfigClient initialSettings={settings} />

            {/* 2. RBAC MANAGEMENT SECTION */}
            <div className="pt-10 border-t border-slate-100">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Role Based Access Control</h2>
                    <p className="text-slate-500 font-medium mt-1">Konfigurasi hak akses modul sistem berdasarkan peran pengguna.</p>
                </div>
                <RbacManager initialPermissions={permissions} />
            </div>
        </div>
    );
}
