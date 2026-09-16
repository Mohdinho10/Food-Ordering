import {
  ArrowRight,
  ClipboardList,
  Clock3,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [totalOrders, pendingOrders, todayOrders, todayRevenue, recentOrders] =
    await Promise.all([
      prisma.order.count(),

      prisma.order.count({
        where: {
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      }),

      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
          status: {
            not: "CANCELLED",
          },
        },
      }),

      prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          customerName: true,
          orderType: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
    ]);

  const revenue = todayRevenue._sum.total ? Number(todayRevenue._sum.total) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-TZ", {
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

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[#777777]">
            Here&apos;s what&apos;s happening with your restaurant today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Orders */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Total Orders</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {totalOrders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <ShoppingBag className="h-5 w-5 text-[#D41B27]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">All orders received</p>
        </div>

        {/* Pending Orders */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">
                Pending Orders
              </p>

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

        {/* Today's Orders */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">
                Today&apos;s Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {todayOrders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF6FF]">
              <ClipboardList className="h-5 w-5 text-[#2B6CB0]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">Orders received today</p>
        </div>

        {/* Today's Revenue */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">
                Today&apos;s Revenue
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {formatCurrency(revenue)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF8F1]">
              <TrendingUp className="h-5 w-5 text-[#2F855A]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">
            Excluding cancelled orders
          </p>
        </div>
      </div>

      {/* Lower Section */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Recent Orders */}
        <div className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-[#EEEEEE] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-[#1F1F1F]">Recent Orders</h2>

              <p className="mt-0.5 text-xs text-[#999999]">
                Latest orders received
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#D41B27] transition hover:text-[#B91621]"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <ClipboardList className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#1F1F1F]">
                No orders yet
              </h3>

              <p className="mt-1 max-w-xs text-xs leading-5 text-[#999999]">
                Orders placed by customers will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEEEEE]">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#FAFAFA] sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEBEC] text-xs font-bold text-[#D41B27]">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                        {order.customerName}
                      </p>

                      <p className="mt-0.5 text-xs text-[#999999]">
                        {getOrderTypeLabel(order.orderType)} ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#1F1F1F]">
                      {formatCurrency(Number(order.total))}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyles(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
          <div>
            <h2 className="font-bold text-[#1F1F1F]">Quick Actions</h2>

            <p className="mt-0.5 text-xs text-[#999999]">
              Manage your restaurant
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              href="/admin/orders"
              className="group flex items-center gap-3 rounded-xl border border-[#EEEEEE] p-3 transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC] transition group-hover:bg-white">
                <ClipboardList className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1F1F1F]">
                  Manage Orders
                </p>

                <p className="mt-0.5 text-xs text-[#999999]">
                  View and update orders
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[#AAAAAA] transition group-hover:translate-x-0.5 group-hover:text-[#D41B27]" />
            </Link>

            <Link
              href="/admin/foods"
              className="group flex items-center gap-3 rounded-xl border border-[#EEEEEE] p-3 transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC] transition group-hover:bg-white">
                <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1F1F1F]">
                  Manage Foods
                </p>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Add or update your menu
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[#AAAAAA] transition group-hover:translate-x-0.5 group-hover:text-[#D41B27]" />
            </Link>
          </div>

          {/* Restaurant Status */}
          <div className="mt-6 rounded-xl bg-[#FAFAFA] p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2F855A]" />

              <p className="text-xs font-semibold text-[#1F1F1F]">
                Restaurant is Active
              </p>
            </div>

            <p className="mt-1.5 text-[11px] leading-5 text-[#999999]">
              Customers can currently browse the menu and place orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
