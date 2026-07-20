import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CyberPlanHargaSatuanWrapper } from "@/components/dashboard/roles/operator/CyberPlanHargaSatuanWrapper";

export default async function HargaSatuanPage() {
  const session = await getServerSession(authOptions);
  
  // Guard access
  if (!session?.user || !["OPERATOR_DESA", "KAUR_PERENCANAAN", "ADMIN_DESA", "ADMIN_MASTER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
         <CyberPlanHargaSatuanWrapper />
      </div>
    </div>
  );
}
