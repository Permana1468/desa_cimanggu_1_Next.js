import { getVillageStructure } from "@/actions/master";
import { WilayahManagementClient } from "@/components/master/WilayahManagementClient";

export default async function WilayahPage() {
    const structure = await getVillageStructure();

    return (
        <div className="container mx-auto">
            <WilayahManagementClient initialStructure={structure} />
        </div>
    );
}
