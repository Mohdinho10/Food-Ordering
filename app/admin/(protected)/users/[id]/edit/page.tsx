import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  getCurrentUserPermissions,
} from "@/app/lib/authorization";
import EditUserForm from "./EditUserForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  const permissions = await getCurrentUserPermissions();

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const canUpdate = permissions.includes("users.update");
  const canSuspend = permissions.includes("users.suspend");
  const canDelete = permissions.includes("users.delete");

  const isSelf = currentUser?.id === user.id;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/users"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#666666] transition hover:border-[#D41B27] hover:text-[#D41B27]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1F1F1F]">Manage User</h1>

              {isSelf && (
                <span className="rounded-full bg-[#FDEBEC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#D41B27]">
                  You
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-[#888888]">
              Manage account details, access, and security.
            </p>
          </div>
        </div>
      </div>

      {/* User summary */}
      <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDEBEC] text-lg font-bold text-[#D41B27]">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-[#1F1F1F]">
              {user.name}
            </h2>

            <p className="mt-1 text-sm text-[#888888]">{user.phone}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F5F5F5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#666666]">
                {user.role?.name || "NO ROLE"}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  user.status === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : user.status === "INVITED"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {user.status}
              </span>

              {user.mfaEnabled && (
                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  <ShieldCheck className="h-3 w-3" />
                  MFA Enabled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <EditUserForm
        user={{
          id: user.id,
          name: user.name,
          phone: user.phone || "",
          roleId: user.roleId || "",
          roleName: user.role?.name || "",
          status: user.status,
          mfaEnabled: user.mfaEnabled,
          mustChangePassword: user.mustChangePassword,
          createdAt: user.createdAt.toISOString(),
        }}
        roles={roles}
        permissions={{
          canUpdate,
          canSuspend,
          canDelete,
        }}
        isSelf={isSelf}
      />

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-[#EEEEEE] pt-2 text-xs text-[#999999]">
        <UserRound className="h-3.5 w-3.5" />
        <span>
          User created on{" "}
          {user.createdAt.toLocaleDateString("en-TZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
