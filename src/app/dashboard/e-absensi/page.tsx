"use client";

import { useSession } from "next-auth/react";
import { EAbsensiTab } from "@/components/dashboard/EAbsensiTab";

export default function EAbsensiPage() {
  const { data: session } = useSession();

  return (
    <div className="pb-24">
      <EAbsensiTab session={session} />
    </div>
  );
}
