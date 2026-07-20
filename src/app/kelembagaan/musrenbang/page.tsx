import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import MusrenbangFormClient from "@/components/dashboard/roles/kelembagaan/MusrenbangFormClient";

export default async function MusrenbangPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  const isInstitutional = ["PKK", "TP_PKK", "LPM", "BPD", "KARANG_TARUNA", "PETUGAS_SENSUS", "POSYANDU", "RT", "RW"].includes(userRole);

  if (!isInstitutional) {
    redirect("/dashboard");
  }

  // Fetch tenant profile for default Village Name
  const tenant = await prisma.tenant.findUnique({
    where: { id: (session.user as any).tenantId },
    include: { profile: true }
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-black text-slate-800">Formulir Usulan Musrenbang</h1>
            <p className="text-slate-500 mt-2 text-sm">Silakan isi formulir usulan prioritas pembangunan untuk RKPDes dan Bantuan Keuangan Desa Tahun 2025.</p>
         </div>
         <MusrenbangFormClient 
            desaName={tenant?.profile?.title || tenant?.name || "Desa"}
         />
      </div>
    </div>
  );
}
