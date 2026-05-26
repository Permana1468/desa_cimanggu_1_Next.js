import { getGoogleIntegration, getRedirectUri } from "@/actions/google";
import { GoogleIntegrationClient } from "@/components/master/GoogleIntegrationClient";

export default async function GoogleIntegrationPage() {
    const settings = await getGoogleIntegration();
    const redirectUri = await getRedirectUri();

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            <GoogleIntegrationClient initialSettings={settings} redirectUri={redirectUri} />
        </div>
    );
}
