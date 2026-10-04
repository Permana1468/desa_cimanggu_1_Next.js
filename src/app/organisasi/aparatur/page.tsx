import { getOrganizationalStructure } from '@/actions/landing';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';


export default async function AparaturDesaPage() {
    const aparaturRes = await getOrganizationalStructure();
    
    const mapPejabat = (obj: any) => ({
        name: obj.name,
        role: obj.position,
        foto: obj.photo
    });

    const orgData = {
        kades: aparaturRes?.find((x: any) => x.level === 0) ? mapPejabat(aparaturRes.find((x: any) => x.level === 0)) : { name: "Hernawan M. Sodik", role: "Kepala Desa" },
        sekdes: aparaturRes?.find((x: any) => x.level === 1) ? mapPejabat(aparaturRes.find((x: any) => x.level === 1)) : { name: "Fajar Tri Apriana", role: "Sekretaris Desa" },
        staff: aparaturRes?.filter((x: any) => x.level === 2).map(mapPejabat) || [],
        kadus: aparaturRes?.filter((x: any) => x.level === 3).map(mapPejabat) || []
    };

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black pb-24">
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </Link>
                </header>

                <main className="pt-32 px-6 max-w-7xl mx-auto flex flex-col items-center">
                    <div className="w-full">
                        <LandingOrganization orgData={orgData} />
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
