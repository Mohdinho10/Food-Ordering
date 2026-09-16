import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Eye,
  PackageCheck,
  UtensilsCrossed,
} from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import OrdersFilters from "./OrderFilters";

const validStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

const validOrderTypes = ["DELIVERY", "PICKUP", "DINE_IN"] as const;

type OrderStatus = (typeof validStatuses)[number];
type OrderType = (typeof validOrderTypes)[number];

type SearchParams = {
  status?: string;
  orderType?: string;
  date?: string;
  search?: string;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const status = params.status;
  const orderType = params.orderType;
  const date = params.date;
  const search = params.search?.trim();

  /*
   * Build the Prisma WHERE condition dynamically.
   */
  const where: {
    status?: OrderStatus;
    orderType?: OrderType;
    createdAt?: {
      gte?: Date;
      lt?: Date;
    };
    OR?: Array<
      | {
          customerName: {
            contains: string;
            mode: "insensitive";
          };
        }
      | {
          customerPhone: {
            contains: string;
            mode: "insensitive";
          };
        }
      | {
          id: {
            contains: string;
            mode: "insensitive";
          };
        }
    >;
  } = {};

  /*
   * Status filter
   */
  if (status && validStatuses.includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }

  /*
   * Order type filter
   */
  if (orderType && validOrderTypes.includes(orderType as OrderType)) {
    where.orderType = orderType as OrderType;
  }

  /*
   * Search filter
   *
   * Searches:
   * - customer name
   * - customer phone
   * - order ID
   *
   * Phone spaces are removed so that:
   * +255 700 123 456
   *
   * can still find:
   * +255700123456
   */
  if (search) {
    const phoneSearch = search.replace(/\s+/g, "");

    where.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        customerPhone: {
          contains: phoneSearch,
          mode: "insensitive",
        },
      },
      {
        id: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  /*
   * Date filter
   */
  if (
    date === "TODAY" ||
    date === "YESTERDAY" ||
    date === "7_DAYS" ||
    date === "30_DAYS"
  ) {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    if (date === "TODAY") {
      where.createdAt = {
        gte: startOfToday,
        lt: startOfTomorrow,
      };
    }

    if (date === "YESTERDAY") {
      const startOfYesterday = new Date(startOfToday);

      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      where.createdAt = {
        gte: startOfYesterday,
        lt: startOfToday,
      };
    }

    if (date === "7_DAYS") {
      const startOf7Days = new Date(startOfToday);

      startOf7Days.setDate(startOf7Days.getDate() - 6);

      where.createdAt = {
        gte: startOf7Days,
        lt: startOfTomorrow,
      };
    }

    if (date === "30_DAYS") {
      const startOf30Days = new Date(startOfToday);

      startOf30Days.setDate(startOf30Days.getDate() - 29);

      where.createdAt = {
        gte: startOf30Days,
        lt: startOfTomorrow,
      };
    }
  }

  /*
   * Fetch filtered orders and statistics.
   */
  const [orders, totalOrders, pendingOrders, preparingOrders, readyOrders] =
    await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          orderType: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      }),

      prisma.order.count({
        where,
      }),

      prisma.order.count({
        where: {
          ...where,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      }),

      prisma.order.count({
        where: {
          ...where,
          status: "PREPARING",
        },
      }),

      prisma.order.count({
        where: {
          ...where,
          status: "READY",
        },
      }),
    ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-TZ", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatStatus = (status: string) => {
    return status
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-[#FFF7E6] text-[#B7791F]";

      case "CONFIRMED":
        return "bg-[#EEF6FF] text-[#2B6CB0]";

      case "PREPARING":
        return "bg-[#FDEBEC] text-[#D41B27]";

      case "READY":
        return "bg-[#EDF8F1] text-[#2F855A]";

      case "OUT_FOR_DELIVERY":
        return "bg-[#F3EEFF] text-[#6B46C1]";

      case "DELIVERED":
        return "bg-[#EDF8F1] text-[#2F855A]";

      case "CANCELLED":
        return "bg-[#F5F5F5] text-[#777777]";

      default:
        return "bg-[#F5F5F5] text-[#666666]";
    }
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "DINE_IN":
        return "Dine In";

      case "PICKUP":
        return "Pickup";

      case "DELIVERY":
        return "Delivery";

      default:
        return type;
    }
  };

  const hasFilters =
    Boolean(status) || Boolean(orderType) || Boolean(date) || Boolean(search);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
          Orders
        </h1>

        <p className="mt-1 text-sm text-[#777777]">
          View and manage customer orders.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* All / Matching Orders */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">
                {hasFilters ? "Matching Orders" : "All Orders"}
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {totalOrders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <ClipboardList className="h-5 w-5 text-[#D41B27]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">
            {hasFilters
              ? "Orders matching your filters"
              : "All orders received"}
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Pending</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {pendingOrders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF7E6]">
              <Clock3 className="h-5 w-5 text-[#B7791F]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">Waiting for attention</p>
        </div>

        {/* Preparing */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Preparing</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {preparingOrders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <UtensilsCrossed className="h-5 w-5 text-[#D41B27]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">Orders being prepared</p>
        </div>

        {/* Ready */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Ready</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {readyOrders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF8F1]">
              <PackageCheck className="h-5 w-5 text-[#2F855A]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">Ready for customer</p>
        </div>
      </div>

      {/* Orders Card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-[#1F1F1F]">
              {hasFilters ? "Filtered Orders" : "All Orders"}
            </h2>

            <p className="mt-0.5 text-xs text-[#999999]">
              {hasFilters
                ? `${orders.length} matching ${
                    orders.length === 1 ? "order" : "orders"
                  }`
                : "Latest customer orders"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <OrdersFilters />

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEBEC]">
              <ClipboardList className="h-6 w-6 text-[#D41B27]" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#1F1F1F]">
              {hasFilters ? "No matching orders" : "No orders yet"}
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-[#999999]">
              {hasFilters
                ? "Try changing your search or filters to find the order you're looking for."
                : "Customer orders will appear here once someone places an order."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA] text-left">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Order
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Customer
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Type
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Items
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Total
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEEEEE]">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-[#FAFAFA]"
                    >
                      {/* Order */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-[#1F1F1F]">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>

                        <p className="mt-1 text-[11px] text-[#AAAAAA]">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-[#1F1F1F]">
                            {order.customerName}
                          </p>

                          <p className="mt-1 text-xs text-[#999999]">
                            {order.customerPhone}
                          </p>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-[#666666]">
                          {getOrderTypeLabel(order.orderType)}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-[#666666]">
                          {order.items.reduce(
                            (total, item) => total + item.quantity,
                            0,
                          )}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#1F1F1F]">
                          {formatCurrency(Number(order.total))}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyles(
                            order.status,
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#999999] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          aria-label="View order"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Orders */}
            <div className="divide-y divide-[#EEEEEE] md:hidden">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-5 transition hover:bg-[#FAFAFA]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1F1F1F]">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-semibold ${getStatusStyles(
                            order.status,
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                        {order.customerName}
                      </p>

                      <p className="mt-1 text-xs text-[#999999]">
                        {getOrderTypeLabel(order.orderType)} ·{" "}
                        {order.items.reduce(
                          (total, item) => total + item.quantity,
                          0,
                        )}{" "}
                        items · {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#AAAAAA]" />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#EEEEEE] pt-3">
                    <span className="text-xs text-[#999999]">Total</span>

                    <span className="text-sm font-bold text-[#1F1F1F]">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
