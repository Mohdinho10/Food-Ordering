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
  ShieldCheck,
  UtensilsCrossed,
  Users,
} from "lucide-react";

type Permission = string;

type AdminNavProps = {
  permissions: Permission[];
};

const managementItems = [
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
];

const administrationItems = [
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "users.view",
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
    permission: "audit_logs.view",
  },
];

export default function AdminNav({ permissions }: AdminNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/admin/login",
    });
  };

  const visibleManagementItems = managementItems.filter((item) =>
    permissions.includes(item.permission),
  );

  const visibleAdministrationItems = administrationItems.filter((item) =>
    permissions.includes(item.permission),
  );

  const renderItem = (item: (typeof managementItems)[number]) => {
    const Icon = item.icon;

    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
          isActive
            ? "bg-[#FDEBEC] font-semibold text-[#D41B27]"
            : "font-medium text-[#666666] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />

        {item.label}
      </Link>
    );
  };

  return (
    <nav className="flex-1 overflow-y-auto px-4 py-6">
      {/* Management */}
      {visibleManagementItems.length > 0 && (
        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Management
          </p>

          <div className="space-y-1">
            {visibleManagementItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Administration */}
      {visibleAdministrationItems.length > 0 && (
        <div className="mt-7">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#AAAAAA]">
            Administration
          </p>

          <div className="space-y-1">
            {visibleAdministrationItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Security */}
      <div className="mt-7">
        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#AAAAAA]">
          Security
        </div>

        <div className="rounded-xl bg-[#FAFAFA] px-3 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEC]">
              <ShieldCheck className="h-4 w-4 text-[#D41B27]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#1F1F1F]">
                Protected Panel
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#999999]">
                MFA and role-based access enabled.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 border-t border-[#EEEEEE] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
