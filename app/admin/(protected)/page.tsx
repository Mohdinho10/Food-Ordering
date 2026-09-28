import { redirect } from "next/navigation";
import { auth } from "@/app/auth";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
