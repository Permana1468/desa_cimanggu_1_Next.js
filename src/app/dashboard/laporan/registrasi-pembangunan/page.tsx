import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LpjRegistrasiPembangunanTab } from "@/components/dashboard/kesra/lpj/LpjRegistrasiPembangunanTab";

export default async function RegistrasiPembangunanReportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["OPERATOR_DESA", "ADMIN_DESA", "ADMIN_MASTER", "KASI_KESEJAHTERAAN"].includes((session.user as any).role)) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <LpjRegistrasiPembangunanTab session={session} />
    </div>
  );
}
