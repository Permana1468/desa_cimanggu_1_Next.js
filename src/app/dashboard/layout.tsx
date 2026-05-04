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

  if (!session?.user) redirect("/login");
  
  // Guard: Only Admin Desa and Officials can access /dashboard
  const allowedRoles = ["ADMIN_DESA", "KADES", "SEKDES", "RT", "RW", "PKK", "POSYANDU", "KARANG_TARUNA", "LPM", "BPD", "KASI", "KAUR", "KADUS"];
  const userRole = (session.user as any).role;

  if (!allowedRoles.includes(userRole)) {
    // If Admin Master or Warga tries to enter, redirect to their proper place
    if (userRole === "ADMIN_MASTER") redirect("/master-admin");
    if (userRole === "WARGA") redirect("/resident");
    redirect("/login");
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
