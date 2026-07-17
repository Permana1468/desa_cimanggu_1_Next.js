import AdminSidebar from "@/components/sensus/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
            {/* Sidebar Command Center */}
            <AdminSidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Tech Background pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <main className="flex-1 relative z-10 overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
