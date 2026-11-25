import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FloatingChat } from "@/components/dashboard/FloatingChat";
import { Suspense } from "react";



import { cookies, headers } from "next/headers";
import dynamic from "next/dynamic";
import { checkPathMaintenance } from "@/lib/maintenanceService";
import { MobileDashboardHeader } from "@/components/dashboard/MobileDashboardHeader";
import { DesktopDashboardHeader } from "@/components/dashboard/DesktopDashboardHeader";
import { MaintenanceNotice } from "@/components/common/MaintenanceNotice";
import { SecurityAlarmListener } from "@/components/common/SecurityAlarmListener";

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
  
  const email = (session?.user?.email || "").toLowerCase();
  const userName = (session?.user?.name || "").toLowerCase();
  const baseRole = (session?.user as any)?.role || "WARGA";
  
  let role = baseRole;
  if (baseRole === "KAUR" && (email.includes("perencanaan") || userName.includes("perencanaan"))) {
    role = "KAUR_PERENCANAAN";
  }
  
  const cookieStore = isBuildTime ? null : await cookies();
  const themeMode = cookieStore?.get('themeMode')?.value || 'hacker';
  
  const isHackerTheme = false; // role === "KAUR_PERENCANAAN" && themeMode === 'hacker';

  const headersList = isBuildTime ? null : await headers();
  const currentPath = headersList?.get('x-pathname') || '/dashboard';
  const maintenance = isBuildTime ? { isMaintenance: false, notice: "", isGlobal: false } : await checkPathMaintenance(currentPath, baseRole);

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isHackerTheme ? 'bg-slate-950 text-cyan-50' : 'bg-white text-slate-950 light-mode'}`}>
      {/* Full-Width Desktop Top Header (Aligned with Mockup Navbar) */}
      <DesktopDashboardHeader session={session} />

      {/* Mobile Header Bar (Unified for mobile/tablet screens) */}
      <MobileDashboardHeader session={session} />

      {/* Main Workspace Area: Curved Sidebar + Content */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative bg-white">
        {/* Village Sidebar */}
        <Suspense fallback={<div className={`hidden lg:block w-72 h-full shrink-0 ${baseRole === 'POSYANDU' ? 'bg-[#047857]' : 'bg-[#1d64ec]'}`} />}>
          <VillageSidebar session={session} isHackerTheme={isHackerTheme} />
        </Suspense>

        {/* Scrollable Page Content */}
        <main className={`flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 pb-24 lg:pb-8 custom-scrollbar bg-white ${isHackerTheme ? 'hacker-theme-override' : ''}`}>
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isHackerTheme && (
              <style dangerouslySetInnerHTML={{ __html: `
                .hacker-theme-override .bg-white {
                  background-color: rgba(15, 23, 42, 0.45) !important;
                  backdrop-filter: blur(16px) saturate(150%) !important;
                  -webkit-backdrop-filter: blur(16px) saturate(150%) !important;
                  border: 1px solid rgba(20, 184, 166, 0.15) !important;
                  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
                  color: #f8fafc !important;
                  transition: all 0.3s ease;
                }
                .hacker-theme-override .bg-white:hover {
                  border: 1px solid rgba(20, 184, 166, 0.3) !important;
                  box-shadow: 0 8px 32px 0 rgba(20, 184, 166, 0.1) !important;
                }
                .hacker-theme-override .text-slate-800,
                .hacker-theme-override .text-slate-900,
                .hacker-theme-override .text-gray-900 {
                  color: #f1f5f9 !important;
                  text-shadow: 0 0 10px rgba(241, 245, 249, 0.2);
                }
                .hacker-theme-override .text-emerald-700,
                .hacker-theme-override .text-emerald-800,
                .hacker-theme-override .text-emerald-600 {
                  color: #2dd4bf !important;
                  text-shadow: 0 0 15px rgba(45, 212, 191, 0.4);
                }
                .hacker-theme-override .text-rose-600,
                .hacker-theme-override .text-rose-700 {
                  color: #fb7185 !important;
                  text-shadow: 0 0 15px rgba(251, 113, 133, 0.4);
                }
                .hacker-theme-override .text-slate-500,
                .hacker-theme-override .text-slate-600,
                .hacker-theme-override .text-gray-500 {
                  color: #94a3b8 !important;
                }
                .hacker-theme-override .bg-slate-50,
                .hacker-theme-override .bg-slate-100,
                .hacker-theme-override .bg-slate-50\\/80,
                .hacker-theme-override .bg-slate-100\\/80 {
                  background-color: rgba(30, 41, 59, 0.5) !important;
                  border: 1px solid rgba(20, 184, 166, 0.1) !important;
                  backdrop-filter: blur(12px) !important;
                  -webkit-backdrop-filter: blur(12px) !important;
                }
                .hacker-theme-override .bg-emerald-50,
                .hacker-theme-override .bg-emerald-100,
                .hacker-theme-override .bg-emerald-50\\/80 {
                  background-color: rgba(20, 184, 166, 0.1) !important;
                  border: 1px solid rgba(20, 184, 166, 0.2) !important;
                }
                .hacker-theme-override .border-slate-100,
                .hacker-theme-override .border-slate-200,
                .hacker-theme-override .border-slate-200\\/80,
                .hacker-theme-override .border-slate-200\\/60 {
                  border-color: rgba(20, 184, 166, 0.15) !important;
                }
                .hacker-theme-override input,
                .hacker-theme-override select,
                .hacker-theme-override textarea {
                  background-color: rgba(15, 23, 42, 0.6) !important;
                  color: #f1f5f9 !important;
                  border: 1px solid rgba(20, 184, 166, 0.2) !important;
                }
                .hacker-theme-override table th {
                  background-color: rgba(20, 184, 166, 0.1) !important;
                  color: #5eead4 !important;
                }
                .hacker-theme-override table td {
                  border-bottom: 1px solid rgba(20, 184, 166, 0.1) !important;
                }
                .hacker-theme-override .bg-white.shadow-sm {
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
                }
                
                /* Custom Icon Animations for Luxury Night Mode (Global) */
                .animate-luxury-float {
                  animation: float-luxury 3s ease-in-out infinite;
                }
                .animate-luxury-pulse {
                  animation: pulse-luxury 2s ease-in-out infinite;
                }
                .animate-luxury-spin {
                  animation: spin-luxury 4s linear infinite;
                }
                .luxury-glow {
                  filter: drop-shadow(0 0 8px rgba(20, 184, 166, 0.6));
                }
                .luxury-glow-strong {
                  filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.9));
                }
                
                @keyframes float-luxury {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-3px); }
                }
                @keyframes pulse-luxury {
                  0%, 100% { opacity: 1; filter: drop-shadow(0 0 12px rgba(20, 184, 166, 0.8)); }
                  50% { opacity: 0.7; filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.3)); }
                }
                @keyframes spin-luxury {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}} />
            )}
            {maintenance.isMaintenance ? (
              <div className="py-4">
                <MaintenanceNotice 
                  featureName={maintenance.feature?.name || "Modul Dashboard Desa"}
                  reason={maintenance.notice}
                  category={maintenance.feature?.categoryLabel || "Dashboard Desa"}
                  isGlobal={maintenance.isGlobal}
                  homeUrl="/dashboard"
                />
              </div>
            ) : (
              <Suspense fallback={<div className="flex h-full items-center justify-center py-10">Loading...</div>}>
                {children}
              </Suspense>
            )}
          </div>
        </main>
      </div>
      
      {/* Floating Transparent Chat for Dashboard Users */}
      <FloatingChat session={session} />
      {/* {role === "KAUR_PERENCANAAN" && <ImoRobotCompanion />} */}

      {/* Sentry Cyber Fraud & Security Alarm Listener */}
      <SecurityAlarmListener />
    </div>
  );
}
