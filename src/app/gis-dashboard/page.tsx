import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBoundaries, getGisDashboardStats } from "@/actions/gis";
import GisDashboardWrapper from "@/components/master/GisDashboardWrapper";
import { checkFeatureMaintenance } from "@/lib/maintenanceService";
import { MaintenanceNotice } from "@/components/common/MaintenanceNotice";

export default async function GisDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // We allow ADMIN_MASTER or anyone assigned to GIS (like OPERATOR_DESA)
  const role = (session.user as any).role;
  if (role !== "ADMIN_MASTER" && role !== "OPERATOR_DESA" && role !== "ADMIN_DESA") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <h1 className="text-2xl font-black">AKSES DITOLAK: KHUSUS PETUGAS GIS</h1>
      </div>
    );
  }

  const maintenance = await checkFeatureMaintenance("webgis", role);
  if (maintenance.isMaintenance) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
        <MaintenanceNotice 
          featureName={maintenance.feature?.name || "Peta WebGIS Interaktif"}
          reason={maintenance.notice}
          category={maintenance.feature?.categoryLabel || "Layanan Publik"}
          isGlobal={maintenance.isGlobal}
          homeUrl="/"
        />
      </div>
    );
  }

  const tenantId = (session.user as any).tenantId;
  
  // Fetch boundaries and real stats for this tenant
  const [boundariesRes, statsRes] = await Promise.all([
    getBoundaries(tenantId),
    getGisDashboardStats(tenantId)
  ]);
  
  const boundaries = boundariesRes.success ? (boundariesRes.data || []) : [];
  const realStats = statsRes.success ? statsRes.data : { houses: 0, families: 0, population: 0, poverty: 0 };

  return (
    <main className="w-full h-screen overflow-hidden relative">
      <GisDashboardWrapper 
        boundaries={boundaries}
        userName={session.user.name || "Petugas GIS"}
        tenantName={(session.user as any).tenantName || "Desa Cimanggu I"}
        realStats={realStats}
        tenantId={tenantId}
        userEmail={session.user.email}
      />
    </main>
  );
}
