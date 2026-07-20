import { ContentManagement } from "@/components/dashboard/roles/operator/ContentManagement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVillageProfile, getLatestNews } from "@/actions/landing";

export default async function CMSPage() {
  const session = await getServerSession(authOptions);
  
  // Guard access
  if (!session?.user || !["OPERATOR_DESA", "ADMIN_DESA", "ADMIN_MASTER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Fetch initial data
  const initialProfile = await getVillageProfile() || {};
  const initialNews = await getLatestNews() || [];

  return (
    <div className="max-w-7xl mx-auto py-8">
      <ContentManagement session={session} initialProfile={initialProfile} initialNews={initialNews} />
    </div>
  );
}
