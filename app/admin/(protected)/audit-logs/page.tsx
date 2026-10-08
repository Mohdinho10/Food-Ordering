import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  //   Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";
import AuditLogFilters from "./AuditLogFilters";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    action?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 25;

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionStyle(action: string) {
  if (action.includes("DELETE") || action.includes("CANCEL")) {
    return "bg-red-50 text-red-700";
  }

  if (
    action.includes("CREATE") ||
    action.includes("INVITE") ||
    action.includes("ENABLE")
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    action.includes("UPDATE") ||
    action.includes("EDIT") ||
    action.includes("RESET")
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    action.includes("LOGIN") ||
    action.includes("LOGOUT") ||
    action.includes("AUTH")
  ) {
    return "bg-violet-50 text-violet-700";
  }

  return "bg-gray-100 text-gray-700";
}

function formatEntity(entity: string) {
  return entity
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function safeJson(value: Prisma.JsonValue | null) {
  if (value === null) return null;

  return JSON.stringify(value, null, 2);
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  await requirePermission("audit_logs.view");

  const params = await searchParams;

  const search = params.search?.trim() || "";
  const action = params.action?.trim() || "";

  const parsedPage = Number.parseInt(params.page || "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where: Prisma.AuditLogWhereInput = {};

  if (action) {
    where.action = action;
  }

  if (search) {
    where.OR = [
      {
        action: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        entity: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        entityId: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [logs, totalLogs, actionRows] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),

    prisma.auditLog.count({
      where,
    }),

    prisma.auditLog.findMany({
      select: {
        action: true,
      },
      distinct: ["action"],
      orderBy: {
        action: "asc",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalLogs / PAGE_SIZE));

  const safePage = Math.min(currentPage, totalPages);

  const visibleLogs =
    safePage === currentPage
      ? logs
      : await prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (safePage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        });

  const startItem = totalLogs === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(safePage * PAGE_SIZE, totalLogs);

  const queryString = (page: number) => {
    const query = new URLSearchParams();

    if (search) query.set("search", search);
    if (action) query.set("action", action);

    query.set("page", String(page));

    return `/admin/audit-logs?${query.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
            <ShieldCheck className="h-5 w-5 text-[#D41B27]" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-[#777777]">
            Track important actions performed inside the restaurant admin panel.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-3">
          <Activity className="h-4 w-4 text-[#D41B27]" />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#999999]">
              Total Logs
            </p>
            <p className="text-sm font-bold text-[#1F1F1F]">
              {totalLogs.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AuditLogFilters
        search={search}
        action={action}
        actions={actionRows.map((item) => item.action)}
      />

      {/* Logs */}
      <div className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
        <div className="hidden border-b border-[#EEEEEE] bg-[#FAFAFA] lg:grid lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]">
          <div className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
            User
          </div>

          <div className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
            Action
          </div>

          <div className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
            Entity
          </div>

          <div className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
            Date & Time
          </div>

          <div className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
            Details
          </div>
        </div>

        {visibleLogs.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEBEC]">
              <FileText className="h-6 w-6 text-[#D41B27]" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#1F1F1F]">
              No audit logs found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#999999]">
              There are no records matching your current search or filters.
            </p>
          </div>
        ) : (
          <div>
            {visibleLogs.map((log) => {
              const oldData = safeJson(log.oldData);
              const newData = safeJson(log.newData);

              return (
                <details
                  key={log.id}
                  className="group border-b border-[#EEEEEE] last:border-b-0"
                >
                  <summary className="cursor-pointer list-none lg:grid lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] lg:items-center">
                    {/* User */}
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC] text-xs font-bold text-[#D41B27]">
                          {log.user?.name?.charAt(0).toUpperCase() || "S"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                            {log.user?.name || "System"}
                          </p>

                          <p className="truncate text-xs text-[#999999]">
                            {log.user?.role?.name || "System"}
                            {log.user?.phone ? ` · ${log.user.phone}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="px-5 pb-4 lg:px-5 lg:py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${actionStyle(
                          log.action,
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </div>

                    {/* Entity */}
                    <div className="px-5 pb-4 lg:px-5 lg:py-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 shrink-0 text-[#AAAAAA]" />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#333333]">
                            {formatEntity(log.entity)}
                          </p>

                          {log.entityId && (
                            <p className="truncate font-mono text-[10px] text-[#999999]">
                              {log.entityId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="px-5 pb-4 lg:px-5 lg:py-4">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 shrink-0 text-[#AAAAAA]" />

                        <div>
                          <p className="text-sm font-medium text-[#333333]">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-5 pb-4 lg:px-5 lg:py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D41B27]">
                        View changes
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                      </span>
                    </div>
                  </summary>

                  {/* Details */}
                  <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-5 py-5">
                    <div className="grid gap-5 xl:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#999999]" />

                          <h4 className="text-xs font-bold uppercase tracking-wide text-[#666666]">
                            Previous Data
                          </h4>
                        </div>

                        <pre className="max-h-80 overflow-auto rounded-xl border border-[#EEEEEE] bg-white p-4 text-xs leading-5 text-[#555555]">
                          {oldData || "No previous data recorded."}
                        </pre>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#999999]" />

                          <h4 className="text-xs font-bold uppercase tracking-wide text-[#666666]">
                            New Data
                          </h4>
                        </div>

                        <pre className="max-h-80 overflow-auto rounded-xl border border-[#EEEEEE] bg-white p-4 text-xs leading-5 text-[#555555]">
                          {newData || "No new data recorded."}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-[#999999]" />

                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                            Performed By
                          </p>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-[#1F1F1F]">
                          {log.user?.name || "System"}
                        </p>

                        {log.user?.phone && (
                          <p className="mt-1 text-xs text-[#999999]">
                            {log.user.phone}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#999999]" />

                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                            Timestamp
                          </p>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-[#1F1F1F]">
                          {formatDate(log.createdAt)}
                        </p>

                        {log.entityId && (
                          <p className="mt-1 break-all font-mono text-[10px] text-[#999999]">
                            Entity ID: {log.entityId}
                          </p>
                        )}
                      </div>
                    </div>

                    {(log.ipAddress || log.userAgent) && (
                      <div className="mt-4 rounded-xl border border-[#EEEEEE] bg-white p-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#999999]">
                          Request Information
                        </p>

                        {log.ipAddress && (
                          <p className="text-xs text-[#666666]">
                            <span className="font-semibold">IP:</span>{" "}
                            {log.ipAddress}
                          </p>
                        )}

                        {log.userAgent && (
                          <p className="mt-1 break-all text-xs text-[#666666]">
                            <span className="font-semibold">User Agent:</span>{" "}
                            {log.userAgent}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalLogs > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#EEEEEE] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#888888]">
              Showing{" "}
              <span className="font-semibold text-[#555555]">{startItem}</span>{" "}
              to <span className="font-semibold text-[#555555]">{endItem}</span>{" "}
              of{" "}
              <span className="font-semibold text-[#555555]">{totalLogs}</span>{" "}
              logs
            </p>

            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link
                  href={queryString(safePage - 1)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-semibold text-[#555555] transition hover:bg-[#FAFAFA]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-3 text-xs font-semibold text-[#BBBBBB]">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              )}

              <div className="flex h-9 items-center rounded-lg bg-[#FDEBEC] px-3 text-xs font-bold text-[#D41B27]">
                Page {safePage} of {totalPages}
              </div>

              {safePage < totalPages ? (
                <Link
                  href={queryString(safePage + 1)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-semibold text-[#555555] transition hover:bg-[#FAFAFA]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-3 text-xs font-semibold text-[#BBBBBB]">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
