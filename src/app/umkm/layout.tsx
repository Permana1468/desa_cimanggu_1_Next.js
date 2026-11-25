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
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const maintenance = await checkFeatureMaintenance("marketplace_umkm", userRole);

  if (maintenance.isMaintenance) {
    return (
      <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4">
        <MaintenanceNotice
          featureName={maintenance.feature?.name || "Marketplace & Katalog UMKM"}
          reason={maintenance.notice}
          category={maintenance.feature?.categoryLabel || "Layanan Publik"}
          isGlobal={maintenance.isGlobal}
          homeUrl="/"
        />
      </div>
    );
  }

  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
