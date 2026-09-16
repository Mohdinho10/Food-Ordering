import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import AdminNav from "@/app/components/AdminNav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1F1F1F]">
      {" "}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#EEEEEE] bg-white lg:flex lg:flex-col">
        {" "}
        {/* Logo */}{" "}
        <div className="flex h-20 items-center border-b border-[#EEEEEE] px-6">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D41B27]">
              {" "}
              <UtensilsCrossed className="h-5 w-5 text-white" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h1 className="text-sm font-bold text-[#1F1F1F]">
                {" "}
                Bella Vista{" "}
              </h1>{" "}
              <p className="text-xs text-[#999999]"> Restaurant Admin </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Navigation */} <AdminNav /> {/* Bottom */}{" "}
        <div className="border-t border-[#EEEEEE] p-4">
          {" "}
          <div className="rounded-xl bg-[#FAFAFA] px-4 py-3">
            {" "}
            <p className="text-xs font-semibold text-[#1F1F1F]">
              {" "}
              Bella Vista Restaurant{" "}
            </p>{" "}
            <p className="mt-1 text-[11px] text-[#999999]">
              {" "}
              Management Panel{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </aside>{" "}
      {/* Main Area */}{" "}
      <div className="lg:pl-64">
        {" "}
        {/* Top Bar */}{" "}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#EEEEEE] bg-white/95 px-5 backdrop-blur sm:px-8">
          {" "}
          <div>
            {" "}
            <h2 className="text-lg font-bold text-[#1F1F1F]">
              {" "}
              Admin Panel{" "}
            </h2>{" "}
            <p className="hidden text-xs text-[#999999] sm:block">
              {" "}
              Manage your restaurant{" "}
            </p>{" "}
          </div>{" "}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEC] text-sm font-bold text-[#D41B27]">
            {" "}
            {session.user.name?.charAt(0).toUpperCase() || "A"}{" "}
          </div>{" "}
        </header>{" "}
        {/* Page Content */}{" "}
        <main className="min-h-[calc(100vh-80px)] p-5 sm:p-8">
          {" "}
          {children}{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
