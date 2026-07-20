"use client";

import { useRouter } from "next/navigation";
import { CyberPlanHargaSatuanTab } from "@/components/dashboard/perencanaan/CyberPlanHargaSatuanTab";

export function CyberPlanHargaSatuanWrapper() {
  const router = useRouter();
  return <CyberPlanHargaSatuanTab onBack={() => router.push("/dashboard")} />;
}
