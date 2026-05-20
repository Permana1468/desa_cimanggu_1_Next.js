"use client";

import dynamic from "next/dynamic";

const GisManagementClient = dynamic(
  () => import("./GisManagementClient"),
  { ssr: false }
);

export default function GisManagementWrapper(props: any) {
  return <GisManagementClient {...props} />;
}
