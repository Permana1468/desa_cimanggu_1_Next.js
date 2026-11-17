import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MasterExecutiveDashboard } from "@/components/master/MasterExecutiveDashboard";
import { MasterInfrastructureStatus } from "@/components/master/MasterInfrastructureStatus";
import { OverviewCharts } from "@/components/master/OverviewChartsWrapper";
import { SystemHealthCacheManager } from "@/components/master/SystemHealthCacheManager";
import { getMaintenanceSettings } from "@/lib/maintenanceService";

export default async function MasterDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tenantId?: string }> 
}) {
  const { tenantId } = await searchParams;
  const session = await getServerSession(authOptions);

  const filter = tenantId ? { tenantId } : {};

  // Live Data Integration - Run queries concurrently using Promise.all to optimize page loading time
  const [
    totalPenduduk, 
    adminAktif, 
    totalTenant, 
    dailyLogs, 
    latestLogs, 
    selectedTenant, 
    maintenanceSettings,
    totalUsers
  ] = await Promise.all([
    prisma.dataKependudukan.count({ where: filter }),
    prisma.user.count({ where: { ...filter, isActive: true } }),
    tenantId ? Promise.resolve(1) : prisma.tenant.count(),
    prisma.auditLog.count({
      where: {
        ...filter,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.auditLog.findMany({
      where: filter,
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, role: true } },
        tenant: { select: { name: true } }
      }
    }),
    tenantId ? prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }) : Promise.resolve(null),
    getMaintenanceSettings(),
    prisma.user.count({ where: filter })
  ]);

  const stats = {
    totalUsers,
    adminAktif,
    totalPenduduk,
    totalTenant,
    dailyLogs
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. EXECUTIVE DASHBOARD - REPLICATES ADMIN DESA FOLDER & DRIVE UI PERSIS SEPERTI GAMBAR 2 */}
      <MasterExecutiveDashboard 
        stats={stats}
        latestLogs={latestLogs}
        selectedTenant={selectedTenant}
        maintenanceSettings={maintenanceSettings}
        session={session}
      />

      {/* 2. REAL-TIME SYSTEM ENGINE & INFRASTRUCTURE VITALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemHealthCacheManager />
        </div>
        <div className="lg:col-span-1">
          <MasterInfrastructureStatus />
        </div>
      </div>

      {/* 3. ANALYTICS CHARTS SECTION */}
      <OverviewCharts tenantId={tenantId} />
    </div>
  );
}
