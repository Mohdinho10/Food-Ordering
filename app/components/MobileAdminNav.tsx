"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  LogOut,
  ScrollText,
  UtensilsCrossed,
  Users,
} from "lucide-react";

type Permission = string;

type MobileAdminNavProps = {
  permissions: Permission[];
};

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
    permission: "dashboard.view",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    permission: "orders.view",
  },
  {
    label: "Foods",
    href: "/admin/foods",
    icon: UtensilsCrossed,
    permission: "products.view",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileText,
    permission: "reports.view",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "users.view",
  },
  {
    label: "Audit",
    href: "/admin/audit-logs",
    icon: ScrollText,
    permission: "audit_logs.view",
  },
];

export default function MobileAdminNav({ permissions }: MobileAdminNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/admin/login",
    });
  };

  const visibleItems = navItems.filter((item) =>
    permissions.includes(item.permission),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEEEEE] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
      <div
        className="mx-auto flex h-16 max-w-lg items-stretch overflow-x-auto px-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {visibleItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-16 min-w-19 shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 transition ${
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
                className={`whitespace-nowrap text-[10px] ${
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
          className="flex h-16 min-w-19 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-2 text-[#999999] transition hover:text-[#D41B27]"
        >
          <div className="flex h-7 w-10 items-center justify-center rounded-full">
            <LogOut className="h-5 w-5" />
          </div>

          <span className="whitespace-nowrap text-[10px] font-medium">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}
