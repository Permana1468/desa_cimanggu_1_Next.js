import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VillageAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log("[Dashboard Layout] Session:", session);

  if (!session?.user) {
    console.log("[Dashboard Layout] No session user, redirecting to login");
    redirect("/login");
  }
  
  // Guard: All Village Roles can access the Unified /dashboard
  const userRole = (session.user as any).role;
  console.log("[Dashboard Layout] Role detected:", userRole);

  // If no role, or if role is unknown and not in exclusion list
  if (!userRole) {
    console.log("[Dashboard Layout] NO ROLE - REDIRECTING");
    redirect("/login");
  }

  // Role-Based Landing Page Routing
  if (userRole === "ADMIN_MASTER") {
    redirect("/master-admin");
  }
  
  // 2. KELEMBAGAAN (RT, RW, PKK, POSYANDU, SENSUS, PUSKESOS, KARANG TARUNA, LPM, BPD)
  if (["RT", "RW", "PKK", "POSYANDU", "LPM", "BPD", "PETUGAS_SENSUS", "PUSKESOS", "KARANG_TARUNA"].includes(userRole)) {
    redirect("/kelembagaan");
  }

  if (userRole === "WARGA") {
    redirect("/resident");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-950 light-mode">
      {/* Village Sidebar */}
      <VillageSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
