import { SistemLog } from "@/components/dashboard/roles/operator/SistemLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function SistemPage() {
  const session = await getServerSession(authOptions);
  
  // Guard access
  if (!session?.user || !["OPERATOR_DESA", "ADMIN_DESA", "ADMIN_MASTER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
          user: { select: { fullName: true, email: true, role: true } }
      }
  });

  return (
    <div className="max-w-7xl mx-auto py-8">
      <SistemLog session={session} initialLogs={logs} />
    </div>
  );
}
