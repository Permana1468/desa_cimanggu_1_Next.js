import { VillageSidebar } from "@/components/dashboard/VillageSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";



export default async function KelembagaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  const session = isBuildTime ? null : await getServerSession(authOptions);

  if (!isBuildTime && !session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <Suspense fallback={<div className="w-64 h-screen bg-slate-900/90 shrink-0" />}>
        <VillageSidebar session={session} />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
