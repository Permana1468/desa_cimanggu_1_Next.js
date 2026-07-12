"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { KatarOverview } from "./katar/KatarOverview";
import { KatarMembers } from "./katar/KatarMembers";
import { KatarFinance } from "./katar/KatarFinance";
import { KatarEOffice } from "./katar/KatarEOffice";
import { KatarInventory } from "./katar/KatarInventory";
import { KatarPrograms } from "./katar/KatarPrograms";
import { KatarEconomy } from "./katar/KatarEconomy";
import { KatarGallery } from "./katar/KatarGallery";
import Image from "next/image";

export function KarangTarunaDashboardClient() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "overview";

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* WELCOME BANNER */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-indigo-900/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                            <div className="relative w-5 h-5">
                                <Image src="/images/logo-katar.png" alt="Logo Karang Taruna" fill sizes="20px" className="object-contain filter drop-shadow-sm" />
                            </div>
                            Panel Pemuda Desa
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Karang Taruna
                        </h1>
                        <p className="text-indigo-100 max-w-xl text-xs font-semibold leading-relaxed">
                            Pusat data kepemudaan, program kreativitas, kewirausahaan, serta kegiatan sosial gotong royong pemuda.
                        </p>
                    </div>
                </div>
            </div>

            {/* TAB CONTENT RENDERING */}
            {activeTab === "overview" && <KatarOverview session={session} />}
            {activeTab === "anggota" && <KatarMembers session={session} />}
            {activeTab === "finance" && <KatarFinance session={session} />}
            {activeTab === "eoffice" && <KatarEOffice session={session} />}
            {activeTab === "inventory" && <KatarInventory session={session} />}
            {activeTab === "kegiatan" && <KatarPrograms session={session} />}
            {activeTab === "wirausaha" && <KatarEconomy session={session} />}
            {activeTab === "gallery" && <KatarGallery session={session} />}
        </div>
    );
}
