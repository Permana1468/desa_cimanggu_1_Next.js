import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTenantsMinimal } from "@/actions/master";
import { MasterShell } from "@/components/master/MasterShell";

export const unstable_instant = false;

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

  if (!isBuildTime) {
    if (!session?.user) redirect("/login");

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN_MASTER") {
      if (userRole === "WARGA") redirect("/resident");
      redirect("/dashboard");
    }
  }

  let tenants: any[] = [];
  try {
    tenants = await getAllTenantsMinimal();
  } catch (error) {
    console.warn("Failed to fetch tenants for static shell rendering:", error);
  }

  return (
    <MasterShell 
      session={session} 
      tenants={tenants}
    >
      {children}
    </MasterShell>
  );
}
