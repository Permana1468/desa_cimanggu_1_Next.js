"use client";

import { KaurStudioFotoTab } from "@/components/dashboard/roles/kaur-perencanaan/KaurStudioFotoTab";
import { useRouter } from "next/navigation";

export default function DashboardStudioFotoPage() {
  const router = useRouter();

  return (
    <KaurStudioFotoTab onBack={() => router.push("/dashboard")} />
  );
}

