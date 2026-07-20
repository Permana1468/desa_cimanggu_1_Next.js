import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FloatingChat } from "@/components/dashboard/FloatingChat";
import { Suspense } from "react";



import { cookies } from "next/headers";

export default async function VillageAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  const session = isBuildTime ? null : await getServerSession(authOptions);

  if (!isBuildTime && !session?.user) {
    redirect("/login");
  }
  
  const email = session?.user?.email || "";
  const baseRole = (session?.user as any)?.role || "WARGA";
  
  let role = baseRole;
  if (baseRole === "KAUR" && email.includes("perencanaan")) {
    role = "KAUR_PERENCANAAN";
  }
  
  const cookieStore = isBuildTime ? null : await cookies();
  const themeMode = cookieStore?.get('themeMode')?.value || 'hacker';
  
  const isHackerTheme = role === "KAUR_PERENCANAAN" && themeMode === 'hacker';

  return (
    <div className={`flex h-screen overflow-hidden ${isHackerTheme ? 'bg-slate-950 text-cyan-50' : 'bg-slate-50 text-slate-950 light-mode'}`}>
      {/* Village Sidebar */}
      <Suspense fallback={<div className="w-64 h-screen bg-slate-900/90 shrink-0" />}>
        <VillageSidebar session={session} isHackerTheme={isHackerTheme} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Page Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar ${isHackerTheme ? 'hacker-theme-override' : ''}`}>
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isHackerTheme && (
              <style dangerouslySetInnerHTML={{ __html: `
                .hacker-theme-override .bg-white {
                  background-color: rgba(2, 6, 23, 0.8) !important;
                  backdrop-filter: blur(12px) !important;
                  border: 1px solid rgba(6, 182, 212, 0.3) !important;
                  box-shadow: 0 0 20px rgba(6, 182, 212, 0.1) !important;
                  color: #cffafe !important;
                }
                .hacker-theme-override .text-slate-800,
                .hacker-theme-override .text-slate-900,
                .hacker-theme-override .text-gray-900 {
                  color: #22d3ee !important;
                  text-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
                }
                .hacker-theme-override .text-slate-500,
                .hacker-theme-override .text-slate-600,
                .hacker-theme-override .text-gray-500 {
                  color: #67e8f9 !important;
                }
                .hacker-theme-override .bg-slate-50,
                .hacker-theme-override .bg-slate-100 {
                  background-color: rgba(15, 23, 42, 0.6) !important;
                  border: 1px solid rgba(6, 182, 212, 0.2) !important;
                }
                .hacker-theme-override .border-slate-100,
                .hacker-theme-override .border-slate-200 {
                  border-color: rgba(6, 182, 212, 0.3) !important;
                }
                .hacker-theme-override input,
                .hacker-theme-override select,
                .hacker-theme-override textarea {
                  background-color: rgba(2, 6, 23, 0.9) !important;
                  color: #22d3ee !important;
                  border: 1px solid rgba(6, 182, 212, 0.5) !important;
                }
                .hacker-theme-override table th {
                  background-color: rgba(8, 145, 178, 0.2) !important;
                  color: #67e8f9 !important;
                }
                .hacker-theme-override table td {
                  border-bottom: 1px solid rgba(6, 182, 212, 0.2) !important;
                }
                .hacker-theme-override .bg-white.shadow-sm {
                  box-shadow: 0 0 15px rgba(6, 182, 212, 0.1) !important;
                }
              `}} />
            )}
            <Suspense fallback={<div className="flex h-full items-center justify-center py-10">Loading...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
      
      {/* Floating Transparent Chat for Dashboard Users */}
      <FloatingChat session={session} />
    </div>
  );
}
