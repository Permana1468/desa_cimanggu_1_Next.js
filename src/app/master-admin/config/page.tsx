import { getRolePermissions, getSystemSettings } from "@/actions/master";
import { RbacManager } from "@/components/master/RbacManager";
import { ConfigClient } from "@/components/master/ConfigClient";

export default async function ConfigurationPage() {
    const [permissions, settings] = await Promise.all([
        getRolePermissions(),
        getSystemSettings()
    ]);

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            {/* 1. MASTER CONFIGURATION UI (New PPOB, Payment, Branding) */}
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
