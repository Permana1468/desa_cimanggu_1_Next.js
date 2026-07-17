import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GIS Monitoring Center | Desa Cimanggu 1",
  description: "Pusat pemantauan pemetaan dan sensus desa berbasis GIS",
};

export default function GisDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 overflow-hidden">
      {children}
    </div>
  );
}
