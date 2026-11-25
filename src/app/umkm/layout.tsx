import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkFeatureMaintenance } from "@/lib/maintenanceService";
import { MaintenanceNotice } from "@/components/common/MaintenanceNotice";
import { CartProvider } from "./CartContext";

export default async function UmkmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([
    getServerSession(authOptions),
    cookies(),
  ]);
  const userRole = (session?.user as any)?.role;
  const isDevBypass = cookieStore.get("dev_maintenance_bypass")?.value === "1";
  const maintenance = await checkFeatureMaintenance("marketplace_umkm", userRole, isDevBypass);

  if (maintenance.isMaintenance) {
    return (
      <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4">
        <MaintenanceNotice
          featureName={maintenance.feature?.name || "Marketplace & Katalog UMKM"}
          reason={maintenance.notice}
          category={maintenance.feature?.categoryLabel || "Layanan Publik"}
          isGlobal={maintenance.isGlobal}
          isMasterUser={userRole === "ADMIN_MASTER"}
          currentPath="/umkm"
          homeUrl="/"
        />
      </div>
    );
  }

  const publicMaintenance = await checkFeatureMaintenance("marketplace_umkm", undefined, false);
  const showDevBanner = userRole === "ADMIN_MASTER" && isDevBypass && publicMaintenance.isMaintenance;

  return (
    <CartProvider>
      {children}
      {showDevBanner && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl border border-amber-400/40 backdrop-blur-md">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Mode Developer (Publik Terkunci)
          </span>
          <a
            href="/api/master/dev-preview?disable=1&to=/umkm"
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black transition-colors"
          >
            Kunci Kembali
          </a>
        </div>
      )}
    </CartProvider>
  );
}
