"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  ClipboardList,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Foods", href: "/admin/foods", icon: UtensilsCrossed },
];
export default function AdminNav() {
  const pathname = usePathname();
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };
  return (
    <nav className="flex-1 px-4 py-6">
      {" "}
      {/* Main Navigation */}{" "}
      <div>
        {" "}
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#AAAAAA]">
          {" "}
          Management{" "}
        </p>{" "}
        <div className="space-y-1">
          {" "}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive ? "bg-[#FDEBEC] font-semibold text-[#D41B27]" : "font-medium text-[#666666] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"}`}
              >
                {" "}
                <Icon className="h-5 w-5" /> {item.label}{" "}
              </Link>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
      {/* Logout */}{" "}
      <div className="mt-6 border-t border-[#EEEEEE] pt-4">
        {" "}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
        >
          {" "}
          <LogOut className="h-5 w-5" /> Logout{" "}
        </button>{" "}
      </div>{" "}
    </nav>
  );
}
