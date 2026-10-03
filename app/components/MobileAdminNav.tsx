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
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    label: "Foods",
    href: "/admin/foods",
    icon: UtensilsCrossed,
  },
];

export default function MobileAdminNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/admin/login",
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEEEEE] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl transition ${
                isActive
                  ? "text-[#D41B27]"
                  : "text-[#999999] hover:text-[#666666]"
              }`}
            >
              <div
                className={`flex h-7 w-10 items-center justify-center rounded-full transition ${
                  isActive ? "bg-[#FDEBEC]" : ""
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <span
                className={`text-[10px] ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl text-[#999999] transition hover:text-[#D41B27]"
        >
          <div className="flex h-7 w-10 items-center justify-center rounded-full">
            <LogOut className="h-5 w-5" />
          </div>

          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
