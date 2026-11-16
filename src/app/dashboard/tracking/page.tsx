import { redirect } from "next/navigation";

export default function TrackingPage() {
    redirect("/dashboard/surat?tab=tracking");
}
