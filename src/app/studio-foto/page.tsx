import { redirect } from "next/navigation";

export default function StandaloneStudioFotoRedirect() {
  redirect("/dashboard?tab=studio-foto");
}
