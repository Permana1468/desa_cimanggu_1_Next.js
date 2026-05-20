import { getAllTenantsMinimal, getVillageStructure } from "@/actions/master";
import { getBoundaries } from "@/actions/gis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import GisManagementWrapper from "@/components/master/GisManagementWrapper";

export default async function GisManagementPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
    redirect("/login");
  }

  const tenantId = (session.user as any).tenantId;

  // Parallel fetch: tenants, boundaries for current tenant, and village structure config
  const [tenants, boundariesRes, villageStructure] = await Promise.all([
    getAllTenantsMinimal(),
    getBoundaries(tenantId),
    getVillageStructure(),
  ]);

  const initialBoundaries = boundariesRes.success ? boundariesRes.data || [] : [];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Sistem Informasi Geografis (GIS)
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
            Manajemen Batas Wilayah Administrasi & Demografi Spasial
          </p>
        </div>
      </div>

      <GisManagementWrapper
        initialBoundaries={initialBoundaries}
        tenants={tenants}
        currentTenantId={tenantId}
        villageStructure={villageStructure}
      />
    </div>
  );
}
