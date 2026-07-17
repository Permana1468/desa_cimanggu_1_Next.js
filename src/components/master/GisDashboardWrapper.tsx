"use client";

import dynamic from "next/dynamic";

const GisDashboardClient = dynamic(
  () => import("./GisDashboardClient"),
  { ssr: false }
);

export default function GisDashboardWrapper(props: any) {
  return <GisDashboardClient {...props} />;
}
