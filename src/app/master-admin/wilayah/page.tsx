import { getVillageStructure } from "@/actions/master";
import { WilayahManagementClient } from "@/components/master/WilayahManagementClient";

export default async function WilayahPage() {
    const structure = await getVillageStructure();

    return (
        <div className="container mx-auto space-y-12 animate-in fade-in duration-700">
            {/* MANAJEMEN STRUKTUR WILAYAH (DUSUN, RW, RT) */}
            <WilayahManagementClient initialStructure={structure} />
        </div>
    );
}
