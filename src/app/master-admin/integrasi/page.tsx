import { getGoogleIntegration, getRedirectUri } from "@/actions/google";
import { GoogleIntegrationClient } from "@/components/master/GoogleIntegrationClient";
import { Suspense } from "react";

// Enable instant client navigation validation to prevent page navigation blocking
export const unstable_instant = { prefetch: "static" };

export default async function GoogleIntegrationPage() {
    return (
        <Suspense fallback={<GoogleIntegrationSkeleton />}>
            <GoogleIntegrationContent />
        </Suspense>
    );
}

async function GoogleIntegrationContent() {
    const settings = await getGoogleIntegration();
    const redirectUri = await getRedirectUri();

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            <GoogleIntegrationClient initialSettings={settings} redirectUri={redirectUri} />
        </div>
    );
}

function GoogleIntegrationSkeleton() {
    return (
        <div className="space-y-8 animate-pulse p-6">
            <div className="h-10 w-64 bg-slate-200 rounded-full" />
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-80" />
        </div>
    );
}
