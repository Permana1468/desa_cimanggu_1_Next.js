import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTenantsMinimal } from "@/actions/master";
import { MasterShell } from "@/components/master/MasterShell";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN_MASTER") {
    if (userRole === "WARGA") redirect("/resident");
    redirect("/dashboard");
  }

  const tenants = await getAllTenantsMinimal();

  return (
    <MasterShell 
      session={session} 
      tenants={tenants}
    >
      {children}
    </MasterShell>
  );
}
