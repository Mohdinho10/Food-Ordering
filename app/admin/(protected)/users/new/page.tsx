import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";

import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";
import CreateUserForm from "./CreateUserForm";

export default async function NewUserPage() {
  await requirePermission("users.create");

  const roles = await prisma.role.findMany({
    orderBy: [
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#777777] transition hover:text-[#D41B27]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
            <UserPlus className="h-5 w-5 text-[#D41B27]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#1F1F1F]">Create User</h1>

            <p className="mt-0.5 text-sm text-[#888888]">
              Add a staff member to the restaurant management panel.
            </p>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex gap-3 rounded-2xl border border-[#E8E8E8] bg-white p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEC]">
          <ShieldCheck className="h-4 w-4 text-[#D41B27]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1F1F1F]">
            Secure staff access
          </p>

          <p className="mt-1 text-xs leading-5 text-[#888888]">
            The temporary password will be used for the staff member&apos;s
            first login. They will be required to change it before accessing the
            admin panel.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-7">
        <CreateUserForm roles={roles} />
      </div>
    </div>
  );
}
