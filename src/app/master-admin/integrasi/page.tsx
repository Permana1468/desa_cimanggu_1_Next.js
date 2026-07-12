import { getGoogleIntegration, getRedirectUri } from "@/actions/google";
import { GoogleIntegrationClient } from "@/components/master/GoogleIntegrationClient";
import { Suspense } from "react";



export default async function GoogleIntegrationPage() {
    return (
        <Suspense fallback={<GoogleIntegrationSkeleton />}>
            <GoogleIntegrationContent />
        </Suspense>
    );
}

async function GoogleIntegrationContent() {
    let settings = null;
    let redirectUri = "";
    try {
        const [s, r] = await Promise.all([
            getGoogleIntegration(),
            getRedirectUri()
        ]);
        settings = s;
        redirectUri = r;
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }

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
