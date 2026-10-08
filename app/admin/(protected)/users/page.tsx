import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Plus,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";

type SearchParams = {
  search?: string;
  role?: string;
  status?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getRoleBadgeClasses(role: string) {
  switch (role) {
    case "OWNER":
      return "bg-[#FDEBEC] text-[#D41B27]";

    case "MANAGER":
      return "bg-[#FFF4E5] text-[#A15C00]";

    case "STAFF":
      return "bg-[#EEF4FF] text-[#315EA8]";

    default:
      return "bg-[#F2F2F2] text-[#666666]";
  }
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-[#EAF8EF] text-[#237A42]";

    case "INVITED":
      return "bg-[#FFF4E5] text-[#A15C00]";

    case "SUSPENDED":
      return "bg-[#FDEBEC] text-[#D41B27]";

    default:
      return "bg-[#F2F2F2] text-[#666666]";
  }
}

export default async function UsersPage({ searchParams }: PageProps) {
  const user = await requirePermission("users.view");

  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const selectedRole = params.role ?? "";
  const selectedStatus = params.status ?? "";

  const permissions =
    user.role?.permissions.map(
      (rolePermission) => rolePermission.permission.name,
    ) ?? [];

  const canCreate = permissions.includes("users.create");
  const canUpdate = permissions.includes("users.update");
  const canSuspend = permissions.includes("users.suspend");

  const users = await prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(selectedRole
        ? {
            role: {
              name: selectedRole,
            },
          }
        : {}),
      ...(selectedStatus
        ? {
            status: selectedStatus as "ACTIVE" | "INVITED" | "SUSPENDED",
          }
        : {}),
    },
    include: {
      role: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [totalUsers, activeUsers, invitedUsers, suspendedUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          status: "ACTIVE",
        },
      }),
      prisma.user.count({
        where: {
          status: "INVITED",
        },
      }),
      prisma.user.count({
        where: {
          status: "SUSPENDED",
        },
      }),
    ]);

  const hasFilters = Boolean(search || selectedRole || selectedStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <UserRound className="h-5 w-5 text-[#D41B27]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#1F1F1F]">Users</h1>
              <p className="mt-0.5 text-sm text-[#888888]">
                Manage restaurant staff and access.
              </p>
            </div>
          </div>
        </div>

        {canCreate && (
          <Link
            href="/admin/users/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Total Users</p>
              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {totalUsers}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F5]">
              <UserRound className="h-5 w-5 text-[#666666]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Active</p>
              <p className="mt-2 text-2xl font-bold text-[#237A42]">
                {activeUsers}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF8EF]">
              <CheckCircle2 className="h-5 w-5 text-[#237A42]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Invited</p>
              <p className="mt-2 text-2xl font-bold text-[#A15C00]">
                {invitedUsers}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E5]">
              <KeyRound className="h-5 w-5 text-[#A15C00]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Suspended</p>
              <p className="mt-2 text-2xl font-bold text-[#D41B27]">
                {suspendedUsers}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <XCircle className="h-5 w-5 text-[#D41B27]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="rounded-2xl border border-[#EEEEEE] bg-white p-4"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <div>
            <label
              htmlFor="search"
              className="mb-1.5 block text-xs font-semibold text-[#666666]"
            >
              Search
            </label>

            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Search by name or phone..."
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC]"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-xs font-semibold text-[#666666]"
            >
              Role
            </label>

            <select
              id="role"
              name="role"
              defaultValue={selectedRole}
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#1F1F1F] outline-none focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC]"
            >
              <option value="">All roles</option>
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-xs font-semibold text-[#666666]"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#1F1F1F] outline-none focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC]"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INVITED">Invited</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="h-11 flex-1 rounded-xl bg-[#1F1F1F] px-5 text-sm font-semibold text-white transition hover:bg-[#333333]"
            >
              Filter
            </button>

            {hasFilters && (
              <Link
                href="/admin/users"
                className="flex h-11 items-center justify-center rounded-xl border border-[#E5E5E5] px-4 text-sm font-semibold text-[#666666] transition hover:bg-[#FAFAFA]"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      </form>

      {/* Users */}
      <div className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F1F1F]">
              Restaurant Users
            </h2>

            <p className="mt-1 text-xs text-[#999999]">
              {users.length} {users.length === 1 ? "user" : "users"}
              {hasFilters ? " matching your filters" : ""}
            </p>
          </div>

          <ShieldCheck className="h-5 w-5 text-[#D41B27]" />
        </div>

        {users.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F7F7]">
              <UserRound className="h-6 w-6 text-[#AAAAAA]" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#1F1F1F]">
              No users found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-[#999999]">
              {hasFilters
                ? "Try changing your search or filters."
                : "Create your first restaurant user to start managing staff access."}
            </p>

            {!hasFilters && canCreate && (
              <Link
                href="/admin/users/new"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#D41B27] px-4 text-xs font-semibold text-white hover:bg-[#B91621]"
              >
                <Plus className="h-4 w-4" />
                Create User
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA] text-left">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                      User
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                      Role
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                      MFA
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#F1F1F1] last:border-b-0 hover:bg-[#FCFCFC]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC] text-xs font-bold text-[#D41B27]">
                            {getInitials(item.name) || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-xs text-[#999999]">
                              {item.phone || "No phone number"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getRoleBadgeClasses(
                            item.role?.name ?? "",
                          )}`}
                        >
                          {item.role?.name ?? "No role"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusBadgeClasses(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {item.mfaEnabled ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-[#237A42]" />
                              <span className="text-xs font-medium text-[#237A42]">
                                Enabled
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-[#999999]" />
                              <span className="text-xs font-medium text-[#999999]">
                                Not enabled
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-[#666666]">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {canUpdate || canSuspend ? (
                          <Link
                            href={`/admin/users/${item.id}/edit`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] px-3 text-xs font-semibold text-[#555555] transition hover:border-[#D41B27] hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          >
                            Manage
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-[#BBBBBB]">
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-[#EEEEEE] md:hidden">
              {users.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC] text-xs font-bold text-[#D41B27]">
                        {getInitials(item.name) || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1F1F1F]">
                          {item.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#999999]">
                          {item.phone || "No phone number"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusBadgeClasses(
                        item.status,
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#FAFAFA] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#AAAAAA]">
                        Role
                      </p>

                      <span
                        className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${getRoleBadgeClasses(
                          item.role?.name ?? "",
                        )}`}
                      >
                        {item.role?.name ?? "No role"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#FAFAFA] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#AAAAAA]">
                        MFA
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        {item.mfaEnabled ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#237A42]" />
                            <span className="text-[11px] font-semibold text-[#237A42]">
                              Enabled
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-[#999999]" />
                            <span className="text-[11px] font-semibold text-[#999999]">
                              Not enabled
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-[#999999]">
                      Created {formatDate(item.createdAt)}
                    </p>

                    {(canUpdate || canSuspend) && (
                      <Link
                        href={`/admin/users/${item.id}/edit`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] px-3 text-xs font-semibold text-[#555555] hover:border-[#D41B27] hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                      >
                        Manage
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
