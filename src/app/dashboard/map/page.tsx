import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBoundaries } from "@/actions/gis";
import { redirect } from "next/navigation";
import InteractiveVillageMap from "@/components/gis/InteractiveVillageMap";

export default async function DashboardMapPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const tenantId = (session.user as any).tenantId;

  // Fetch boundaries for current user's village
  const boundariesRes = await getBoundaries(tenantId);
  const initialBoundaries = boundariesRes.success ? boundariesRes.data || [] : [];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          Peta Wilayah Interaktif
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
          Visualisasi Spasial Batas Administratif RT, RW, Dusun & Demografi
        </p>
      </div>

      <InteractiveVillageMap
        tenantId={tenantId}
        initialBoundaries={initialBoundaries}
      />
    </div>
  );
}
