import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function KelembagaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;

  // Guard: Only Institutional roles can access /kelembagaan
  const allowedRoles = ["RT", "RW", "PKK", "POSYANDU", "LPM", "BPD"];
  if (!allowedRoles.includes(userRole)) {
    if (userRole === "ADMIN_MASTER") redirect("/master-admin");
    if (userRole === "ADMIN_DESA" || userRole === "SEKDES") redirect("/dashboard");
    if (userRole === "WARGA") redirect("/resident");
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <VillageSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
