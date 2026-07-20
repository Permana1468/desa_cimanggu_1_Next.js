import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AbsensiPekerja } from "@/components/dashboard/roles/operator/AbsensiPekerja";

export default async function PekerjaAbsensiPage() {
  const session = await getServerSession(authOptions);
  
  // Guard access
  if (!session?.user || !["OPERATOR_DESA", "ADMIN_DESA", "ADMIN_MASTER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <AbsensiPekerja />
    </div>
  );
}
