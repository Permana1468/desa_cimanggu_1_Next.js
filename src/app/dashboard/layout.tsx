import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FloatingChat } from "@/components/dashboard/FloatingChat";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function VillageAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-950 light-mode">
      {/* Village Sidebar */}
      <Suspense fallback={<div className="w-64 h-screen bg-slate-900/90 shrink-0" />}>
        <VillageSidebar session={session} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
      
      {/* Floating Transparent Chat for Dashboard Users */}
      <FloatingChat session={session} />
    </div>
  );
}
