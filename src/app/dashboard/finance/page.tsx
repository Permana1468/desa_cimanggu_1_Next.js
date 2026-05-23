import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFinanceProposals } from "@/actions/tracking";
import { FinancePageClient } from "@/components/dashboard/roles/FinancePageClient";

export default async function FinancePage() {
    const session = await getServerSession(authOptions);
    const proposals = await getFinanceProposals();

    return (
        <div className="space-y-6 p-6">
            <FinancePageClient initialProposals={proposals} />
        </div>
    );
}
