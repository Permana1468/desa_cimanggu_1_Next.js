import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MasterSidebar } from "@/components/master/MasterSidebar";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;

  // Guard: ONLY ADMIN_MASTER can access /master-admin
  if (userRole !== "ADMIN_MASTER") {
    if (userRole === "WARGA") redirect("/resident");
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <MasterSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
