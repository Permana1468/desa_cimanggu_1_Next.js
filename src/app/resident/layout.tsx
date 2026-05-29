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

export const unstable_instant = false;

export default async function ResidentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    if ((session.user as any).role !== "WARGA") {
        redirect("/login"); 
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Resident */}
            <ResidentSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Portal Warga Cimanggu I</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-tight">{session.user.name}</p>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Status: Terverifikasi</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                                {session.user.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
