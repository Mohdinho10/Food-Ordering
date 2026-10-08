import {
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";

type SearchParams = {
  range?: string;
};

const validRanges = [
  "TODAY",
  "YESTERDAY",
  "7_DAYS",
  "30_DAYS",
  "ALL_TIME",
] as const;

type ReportRange = (typeof validRanges)[number];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ==================== AUTHORIZATION ====================

  await requirePermission("reports.view");

  // ==================== SEARCH PARAMS ====================

  const params = await searchParams;

  const range: ReportRange = validRanges.includes(params.range as ReportRange)
    ? (params.range as ReportRange)
    : "TODAY";

  // ==================== DATE RANGE ====================

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  let startDate = startOfToday;
  let endDate = startOfTomorrow;

  if (range === "YESTERDAY") {
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    startDate = startOfYesterday;
    endDate = startOfToday;
  }

  if (range === "7_DAYS") {
    const startOf7Days = new Date(startOfToday);
    startOf7Days.setDate(startOf7Days.getDate() - 6);

    startDate = startOf7Days;
    endDate = startOfTomorrow;
  }

  if (range === "30_DAYS") {
    const startOf30Days = new Date(startOfToday);
    startOf30Days.setDate(startOf30Days.getDate() - 29);

    startDate = startOf30Days;
    endDate = startOfTomorrow;
  }

  // ALL_TIME intentionally has no createdAt filter.
  const dateWhere =
    range === "ALL_TIME"
      ? {}
      : {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        };

  // ==================== FETCH REPORT DATA ====================

  const [
    totalOrders,
    cancelledOrders,
    revenueResult,
    paidRevenueResult,
    orderTypeGroups,
    paymentMethodGroups,
    foodOrderItems,
  ] = await Promise.all([
    // Total orders
    prisma.order.count({
      where: dateWhere,
    }),

    // Cancelled orders
    prisma.order.count({
      where: {
        ...dateWhere,
        status: "CANCELLED",
      },
    }),

    // Revenue excluding cancelled orders
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        ...dateWhere,
        status: {
          not: "CANCELLED",
        },
      },
    }),

    // Paid revenue excluding cancelled orders
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        ...dateWhere,
        status: {
          not: "CANCELLED",
        },
        paymentStatus: "PAID",
      },
    }),

    // Order type breakdown
    prisma.order.groupBy({
      by: ["orderType"],
      _count: {
        _all: true,
      },
      where: dateWhere,
    }),

    // Payment method breakdown
    prisma.order.groupBy({
      by: ["paymentMethod"],
      _count: {
        _all: true,
      },
      where: dateWhere,
    }),

    // Food sales
    //
    // We fetch the actual order items instead of only grouping by quantity.
    // This allows us to calculate:
    // - quantity sold
    // - number of orders
    // - revenue per food
    //
    // Cancelled orders are excluded because they should not contribute
    // to food sales/revenue.
    prisma.orderItem.findMany({
      where: {
        order: {
          ...dateWhere,
          status: {
            not: "CANCELLED",
          },
        },
      },
      select: {
        orderId: true,
        productId: true,
        quantity: true,
        price: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  // ==================== CALCULATIONS ====================

  const revenue = revenueResult._sum.total
    ? Number(revenueResult._sum.total)
    : 0;

  const paidRevenue = paidRevenueResult._sum.total
    ? Number(paidRevenueResult._sum.total)
    : 0;

  const completedRevenue = revenue;

  const validOrders = totalOrders - cancelledOrders;

  const averageOrderValue =
    validOrders > 0 ? completedRevenue / validOrders : 0;

  // ==================== FOOD SALES CALCULATION ====================

  type FoodSales = {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
    orderIds: Set<string>;
  };

  const foodSalesMap = new Map<string, FoodSales>();

  for (const item of foodOrderItems) {
    const existing = foodSalesMap.get(item.productId);

    const quantity = item.quantity;
    const itemRevenue = Number(item.price) * quantity;

    if (existing) {
      existing.quantity += quantity;
      existing.revenue += itemRevenue;
      existing.orderIds.add(item.orderId);
    } else {
      foodSalesMap.set(item.productId, {
        productId: item.productId,
        name: item.product?.name ?? "Deleted Product",
        quantity,
        revenue: itemRevenue,
        orderIds: new Set([item.orderId]),
      });
    }
  }

  // Sort all foods by actual revenue generated.
  const allFoodSales = Array.from(foodSalesMap.values())
    .map((food) => ({
      productId: food.productId,
      name: food.name,
      quantity: food.quantity,
      revenue: food.revenue,
      orderCount: food.orderIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Total food revenue includes ALL foods, not only the top 10.
  const totalFoodRevenue = allFoodSales.reduce(
    (sum, food) => sum + food.revenue,
    0,
  );

  // Only display the top 10 foods in the table.
  const foodSales = allFoodSales.slice(0, 10);

  const highestFoodRevenue = foodSales.length > 0 ? foodSales[0].revenue : 0;

  // ==================== FORMATTERS ====================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-TZ").format(amount);
  };

  const getRangeLabel = () => {
    switch (range) {
      case "TODAY":
        return "Today";

      case "YESTERDAY":
        return "Yesterday";

      case "7_DAYS":
        return "Last 7 Days";

      case "30_DAYS":
        return "Last 30 Days";

      case "ALL_TIME":
        return "All Time";

      default:
        return "Today";
    }
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "DELIVERY":
        return "Delivery";

      case "PICKUP":
        return "Pickup";

      case "DINE_IN":
        return "Dine In";

      default:
        return type;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "Cash";

      case "MOBILE_MONEY":
        return "Mobile Money";

      case "CARD":
        return "Card";

      default:
        return method;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return Banknote;

      case "MOBILE_MONEY":
        return Wallet;

      case "CARD":
        return CreditCard;

      default:
        return Wallet;
    }
  };

  const rangeHref = (selectedRange: ReportRange) => {
    return `/admin/reports?range=${selectedRange}`;
  };

  // ==================== RENDER ====================

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <BarChart3 className="h-4 w-4 text-[#D41B27]" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide text-[#D41B27]">
              Analytics
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Reports
          </h1>

          <p className="mt-1 text-sm text-[#777777]">
            Understand your restaurant&apos;s sales and order performance.
          </p>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 hidden items-center gap-2 text-xs font-medium text-[#777777] sm:flex">
            <CalendarDays className="h-4 w-4" />
            {getRangeLabel()}
          </div>

          <div className="flex flex-wrap rounded-xl border border-[#EEEEEE] bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <a
              href={rangeHref("TODAY")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                range === "TODAY"
                  ? "bg-[#D41B27] text-white"
                  : "text-[#777777] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
              }`}
            >
              Today
            </a>

            <a
              href={rangeHref("YESTERDAY")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                range === "YESTERDAY"
                  ? "bg-[#D41B27] text-white"
                  : "text-[#777777] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
              }`}
            >
              Yesterday
            </a>

            <a
              href={rangeHref("7_DAYS")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                range === "7_DAYS"
                  ? "bg-[#D41B27] text-white"
                  : "text-[#777777] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
              }`}
            >
              7 Days
            </a>

            <a
              href={rangeHref("30_DAYS")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                range === "30_DAYS"
                  ? "bg-[#D41B27] text-white"
                  : "text-[#777777] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
              }`}
            >
              30 Days
            </a>

            <a
              href={rangeHref("ALL_TIME")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                range === "ALL_TIME"
                  ? "bg-[#D41B27] text-white"
                  : "text-[#777777] hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
              }`}
            >
              All Time
            </a>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Revenue</p>

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

        {/* Orders */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Orders</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {formatNumber(totalOrders)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <ShoppingBag className="h-5 w-5 text-[#D41B27]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">
            {formatNumber(validOrders)} non-cancelled
          </p>
        </div>

        {/* Average Order */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">
                Average Order
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {formatCurrency(averageOrderValue)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF6FF]">
              <ClipboardList className="h-5 w-5 text-[#2B6CB0]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">Per non-cancelled order</p>
        </div>

        {/* Paid Revenue */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#777777]">Paid Revenue</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {formatCurrency(paidRevenue)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <CheckCircle2 className="h-5 w-5 text-[#D41B27]" />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#999999]">Orders marked as paid</p>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Order Types */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <Truck className="h-4 w-4 text-[#D41B27]" />
            </div>

            <div>
              <h2 className="font-bold text-[#1F1F1F]">Orders by Type</h2>

              <p className="mt-0.5 text-xs text-[#999999]">
                How customers receive their orders
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {(["DELIVERY", "PICKUP", "DINE_IN"] as const).map((type) => {
              const item = orderTypeGroups.find(
                (group) => group.orderType === type,
              );

              const count = item?._count._all ?? 0;

              const percentage =
                totalOrders > 0 ? (count / totalOrders) * 100 : 0;

              return (
                <div key={type}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-[#555555]">
                      {getOrderTypeLabel(type)}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#999999]">
                        {percentage.toFixed(0)}%
                      </span>

                      <span className="min-w-7 text-right text-sm font-bold text-[#1F1F1F]">
                        {count}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F3F3F3]">
                    <div
                      className="h-full rounded-full bg-[#D41B27]"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF6FF]">
              <Wallet className="h-4 w-4 text-[#2B6CB0]" />
            </div>

            <div>
              <h2 className="font-bold text-[#1F1F1F]">Payment Methods</h2>

              <p className="mt-0.5 text-xs text-[#999999]">
                Customer payment preferences
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {(["CASH", "MOBILE_MONEY", "CARD"] as const).map((method) => {
              const item = paymentMethodGroups.find(
                (group) => group.paymentMethod === method,
              );

              const count = item?._count._all ?? 0;

              const percentage =
                totalOrders > 0 ? (count / totalOrders) * 100 : 0;

              const Icon = getPaymentMethodIcon(method);

              return (
                <div
                  key={method}
                  className="flex items-center justify-between rounded-xl bg-[#FAFAFA] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#777777]" />

                    <span className="text-sm font-medium text-[#555555]">
                      {getPaymentMethodLabel(method)}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1F1F1F]">{count}</p>

                    <p className="text-[10px] text-[#999999]">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Food Sales & Revenue */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="border-b border-[#EEEEEE] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">
                  Food Sales &amp; Revenue
                </h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Revenue generated by each food for{" "}
                  {getRangeLabel().toLowerCase()}
                </p>
              </div>
            </div>

            {foodSales.length > 0 && (
              <div className="rounded-xl bg-[#FAFAFA] px-4 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#999999]">
                  Food Revenue
                </p>

                <p className="mt-0.5 text-sm font-bold text-[#1F1F1F]">
                  {formatCurrency(totalFoodRevenue)}
                </p>
              </div>
            )}
          </div>
        </div>

        {foodSales.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <UtensilsCrossed className="h-5 w-5 text-[#D41B27]" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#1F1F1F]">
              No food sales yet
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-[#999999]">
              Food sales and revenue will appear here once customers place
              orders.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-190">
                <thead>
                  <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA] text-left">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Food
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Quantity Sold
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Orders
                    </th>

                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Revenue
                    </th>

                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#999999]">
                      Share
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEEEEE]">
                  {foodSales.map((food, index) => {
                    const revenueShare =
                      revenue > 0 ? (food.revenue / revenue) * 100 : 0;

                    const revenueBar =
                      highestFoodRevenue > 0
                        ? (food.revenue / highestFoodRevenue) * 100
                        : 0;

                    return (
                      <tr
                        key={food.productId}
                        className="transition hover:bg-[#FAFAFA]"
                      >
                        {/* Food */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEC] text-xs font-bold text-[#D41B27]">
                              {index + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1F1F1F]">
                                {food.name}
                              </p>

                              <p className="mt-0.5 text-[11px] text-[#999999]">
                                {formatCurrency(food.revenue)} generated
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[#555555]">
                            {formatNumber(food.quantity)}
                          </span>
                        </td>

                        {/* Orders */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-[#555555]">
                            {formatNumber(food.orderCount)}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="px-6 py-4">
                          <div className="min-w-42.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-bold text-[#1F1F1F]">
                                {formatCurrency(food.revenue)}
                              </span>

                              <span className="text-[10px] font-medium text-[#999999]">
                                {revenueShare.toFixed(1)}%
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F3F3F3]">
                              <div
                                className="h-full rounded-full bg-[#D41B27]"
                                style={{
                                  width: `${revenueBar}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Share */}
                        <td className="px-6 py-4 text-right">
                          <span className="rounded-lg bg-[#FDEBEC] px-2.5 py-1.5 text-xs font-bold text-[#D41B27]">
                            {revenueShare.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-[#EEEEEE] md:hidden">
              {foodSales.map((food, index) => {
                const revenueShare =
                  revenue > 0 ? (food.revenue / revenue) * 100 : 0;

                const revenueBar =
                  highestFoodRevenue > 0
                    ? (food.revenue / highestFoodRevenue) * 100
                    : 0;

                return (
                  <div key={food.productId} className="px-5 py-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEC] text-xs font-bold text-[#D41B27]">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                              {food.name}
                            </p>

                            <p className="mt-1 text-xs text-[#999999]">
                              {formatNumber(food.quantity)}{" "}
                              {food.quantity === 1 ? "item" : "items"} sold
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-[#1F1F1F]">
                              {formatCurrency(food.revenue)}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-[#999999]">
                              {revenueShare.toFixed(1)}% of revenue
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F3F3F3]">
                          <div
                            className="h-full rounded-full bg-[#D41B27]"
                            style={{
                              width: `${revenueBar}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-[#999999]">
                            Sold across {formatNumber(food.orderCount)}{" "}
                            {food.orderCount === 1 ? "order" : "orders"}
                          </span>

                          <span className="rounded-lg bg-[#FDEBEC] px-2 py-1 text-[10px] font-bold text-[#D41B27]">
                            {revenueShare.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Report Note */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#EEEEEE] bg-[#FAFAFA] p-4">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

        <p className="text-xs leading-5 text-[#777777]">
          Revenue excludes cancelled orders. Food revenue is calculated from the
          price recorded on each order item multiplied by its quantity. Paid
          revenue only includes orders currently marked as paid. Reports use the
          order data recorded in the system and are shown in Tanzanian Shillings
          (TZS).
        </p>
      </div>
    </div>
  );
}
