import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMaintenanceSettings } from "@/lib/maintenanceService";
import { MaintenanceClient } from "@/components/master/MaintenanceClient";

export const metadata = {
  title: "Pusat Kontrol Mode Pemeliharaan | Master Admin",
  description: "Manajemen status pemeliharaan (maintenance) fitur dan modul website desa secara terpusat."
};

export default async function MaintenancePage() {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  const session = isBuildTime ? null : await getServerSession(authOptions);

  if (!isBuildTime) {
    if (!session?.user) redirect("/login");
    const role = (session.user as any).role;
    if (role !== "ADMIN_MASTER") {
      redirect("/dashboard");
    }
  }

  const settings = await getMaintenanceSettings();

  return <MaintenanceClient initialSettings={settings} />;
}
