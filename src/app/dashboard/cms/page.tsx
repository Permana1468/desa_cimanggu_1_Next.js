import { ContentManagement } from "@/components/dashboard/roles/operator/ContentManagement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVillageProfile, getLatestNews } from "@/actions/landing";
import { getLandingUiConfig } from "@/lib/landingUiConfig";

export default async function CMSPage() {
  const session = await getServerSession(authOptions);
  
  // Guard access
  if (!session?.user || !["OPERATOR_DESA", "ADMIN_DESA", "ADMIN_MASTER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Fetch initial data
  const [initialProfile, initialNews, initialUiConfig] = await Promise.all([
    getVillageProfile(),
    getLatestNews(),
    getLandingUiConfig(),
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <ContentManagement
        session={session}
        initialProfile={initialProfile || {}}
        initialNews={initialNews || []}
        initialUiConfig={initialUiConfig}
      />
    </div>
  );
}
