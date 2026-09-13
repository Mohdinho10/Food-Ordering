"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  PackageSearch,
  Phone,
  Search,
  ShoppingBag,
  Store,
  Utensils,
} from "lucide-react";

type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED";

type Order = {
  id: string;
  customerName: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
  }[];
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Order Received",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const orderTypeLabels: Record<OrderType, string> = {
  DELIVERY: "Delivery",
  PICKUP: "Pickup",
  DINE_IN: "Dine-in",
};

function getStatusStyles(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "bg-[#EAF7EE] text-[#2E7D46]";

    case "CANCELLED":
      return "bg-[#FDEBEC] text-[#B91621]";

    case "READY":
      return "bg-[#FFF5E6] text-[#A15C00]";

    default:
      return "bg-[#FDEBEC] text-[#D41B27]";
  }
}

function getOrderTypeIcon(orderType: OrderType) {
  switch (orderType) {
    case "DELIVERY":
      return <MapPin className="h-4 w-4" />;

    case "PICKUP":
      return <Store className="h-4 w-4" />;

    case "DINE_IN":
      return <Utensils className="h-4 w-4" />;
  }
}

function formatOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-TZ", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setOrders([]);

    const normalizedPhone = phone.replace(/\s+/g, "");

    if (!normalizedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^\+255[67]\d{8}$/.test(normalizedPhone)) {
      setError(
        "Please enter a valid Tanzanian phone number starting with +255, e.g. +255 700 123 456.",
      );
      return;
    }

    try {
      setIsSearching(true);

      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalizedPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to find your orders.");
      }

      setOrders(data.orders || []);
      setHasSearched(true);

      // Hide the large search form after a successful search.
      setShowSearchForm(false);
    } catch (error) {
      console.error("Track order error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while finding your orders.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchAnotherNumber = () => {
    setShowSearchForm(true);
    setHasSearched(false);
    setOrders([]);
    setError("");

    // Put the cursor back into the phone input after
    // the form becomes visible.
    setTimeout(() => {
      document.getElementById("phone")?.focus();
    }, 100);
  };

  return (
    <main className="min-h-[70vh] bg-[#FAFAFA]">
      {/* ==================== PAGE HEADER ==================== */}

      <section className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEBEC]">
              <PackageSearch className="h-7 w-7 text-[#D41B27]" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#D41B27]">
              Order Tracking
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
              Track Your Order
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6B6B6B] sm:text-base">
              Enter the phone number you used when placing your order to see
              your recent orders and their current status.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== SEARCH SECTION ==================== */}

      {showSearchForm && (
        <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Phone className="h-5 w-5 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#1F1F1F]">
                  Find Your Orders
                </h2>

                <p className="mt-1 text-sm leading-5 text-[#6B6B6B]">
                  Use the same phone number you provided at checkout.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="+255 700 000 000"
                  className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                />
              </div>

              <p className="mt-2 text-xs text-[#999999]">
                Enter your phone number starting with +255
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-[#F5C2C7] bg-[#FDEBEC] px-4 py-3">
                  <p className="text-sm leading-5 text-[#B91621]">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSearching ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Finding Orders...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Track Order
                  </>
                )}
              </button>
            </div>
          </div>

          {!hasSearched && (
            <div className="mt-8 text-center">
              <p className="text-sm text-[#777777]">
                Don&apos;t have an order yet?
              </p>

              <Link
                href="/menu"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D41B27] transition hover:text-[#B91621]"
              >
                Browse our menu
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ==================== SEARCH RESULTS ==================== */}

      {hasSearched && orders.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D41B27]">
              Your Recent Orders
            </p>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
                  {orders.length}{" "}
                  {orders.length === 1 ? "Order Found" : "Orders Found"}
                </h2>

                <p className="mt-1 text-sm text-[#777777]">
                  Orders associated with{" "}
                  <span className="font-medium text-[#555555]">{phone}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleSearchAnotherNumber}
                className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-[#D41B27] transition hover:text-[#B91621]"
              >
                <Search className="h-4 w-4" />
                Search Another Number
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-6"
              >
                {/* ORDER HEADER */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDEBEC]">
                        <ShoppingBag className="h-4 w-4 text-[#D41B27]" />
                      </div>

                      <div>
                        <p className="text-xs text-[#999999]">
                          Order {formatOrderId(order.id)}
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F]">
                          {order.customerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyles(
                      order.status,
                    )}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* ORDER META */}

                <div className="mt-5 grid gap-3 border-y border-[#EEEEEE] py-4 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    {getOrderTypeIcon(order.orderType)}

                    <span>{orderTypeLabels[order.orderType]}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <CalendarDays className="h-4 w-4" />

                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <Clock className="h-4 w-4" />

                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* ORDER ITEMS */}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#999999]">
                    Items
                  </p>

                  <div className="mt-2 space-y-1.5">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${index}`}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="min-w-0 truncate text-[#555555]">
                          {item.quantity} × {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOTAL + BUTTON */}

                <div className="mt-5 flex flex-col gap-4 border-t border-[#EEEEEE] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-[#999999]">Total</p>

                    <p className="mt-0.5 text-lg font-bold text-[#D41B27]">
                      TSh {order.total.toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/order/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D41B27] px-5 py-2.5 text-sm font-semibold text-[#D41B27] transition hover:bg-[#FDEBEC]"
                  >
                    View Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM HELP */}

          <div className="mt-8 rounded-2xl border border-[#EEEEEE] bg-white p-5 text-center">
            <p className="text-sm text-[#777777]">
              Looking for a different order?
            </p>

            <button
              type="button"
              onClick={handleSearchAnotherNumber}
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#D41B27] transition hover:text-[#B91621]"
            >
              Search Another Number
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ==================== NO ORDERS ==================== */}

      {hasSearched && orders.length === 0 && (
        <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEBEC]">
              <PackageSearch className="h-7 w-7 text-[#D41B27]" />
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#1F1F1F]">
              No Orders Found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6B6B6B]">
              We couldn&apos;t find any orders associated with this phone
              number. Please make sure you entered the same number you used when
              placing your order.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSearchAnotherNumber}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D41B27] px-6 py-3 text-sm font-semibold text-[#D41B27] transition hover:bg-[#FDEBEC]"
              >
                <Search className="h-4 w-4" />
                Try Another Number
              </button>

              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-[#D41B27] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621]"
              >
                Browse Menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
