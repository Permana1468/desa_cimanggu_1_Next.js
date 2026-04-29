import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { DashboardHeader } from "@/components/dashboard/Header";

export default function VillageAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0b1120] overflow-hidden">
      {/* Village Sidebar */}
      <VillageSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Shared Header */}
        <DashboardHeader />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
