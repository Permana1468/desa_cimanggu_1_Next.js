import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFinanceProposals } from "@/actions/tracking";
import { FinancePageClient } from "@/components/dashboard/roles/FinancePageClient";
import { Suspense } from "react";

export default async function FinancePage() {
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    const session = isBuildTime ? null : await getServerSession(authOptions);
    const proposals = isBuildTime ? [] : await getFinanceProposals();

    return (
        <div className="space-y-6 p-6">
            <Suspense fallback={<div>Loading finance data...</div>}>
                <FinancePageClient initialProposals={proposals} />
            </Suspense>
        </div>
    );
}
