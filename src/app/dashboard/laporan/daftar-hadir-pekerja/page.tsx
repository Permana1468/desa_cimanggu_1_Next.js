import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LpjDaftarHadirPekerjaTab } from "@/components/dashboard/kesra/lpj/LpjDaftarHadirPekerjaTab";

export default async function DaftarHadirPekerjaReportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["OPERATOR_DESA", "ADMIN_DESA", "ADMIN_MASTER", "KASI_KESEJAHTERAAN"].includes((session.user as any).role)) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <LpjDaftarHadirPekerjaTab session={session} />
    </div>
  );
}
