import { getGoogleIntegration } from "@/actions/google";
import { GoogleIntegrationClient } from "@/components/master/GoogleIntegrationClient";

export default async function GoogleIntegrationPage() {
    const settings = await getGoogleIntegration();

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            <GoogleIntegrationClient initialSettings={settings} />
        </div>
    );
}
