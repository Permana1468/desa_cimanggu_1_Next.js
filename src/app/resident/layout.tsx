import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    User, 
    FileText, 
    Home, 
    Bell, 
    Settings, 
    LogOut,
    Menu
} from "lucide-react";
import { ResidentSidebar } from "@/components/resident/ResidentSidebar";



export default async function ResidentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    const session = isBuildTime ? null : await getServerSession(authOptions);

    if (!isBuildTime) {
        if (!session?.user) {
            redirect("/login");
        }

        if ((session.user as any).role !== "WARGA") {
            redirect("/login"); 
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Resident */}
            <ResidentSidebar session={session} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pt-8 lg:pt-8 pb-24 lg:pb-8">
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
