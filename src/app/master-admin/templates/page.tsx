import { getSystemSettings } from "@/actions/master";
import { TemplateManagementClient } from "@/components/master/TemplateManagementClient";

export default async function MasterTemplatesPage() {
    const settings = await getSystemSettings();
    const initialTemplates = settings.officialTemplates || [];

    return (
        <TemplateManagementClient initialTemplates={initialTemplates} />
    );
}
