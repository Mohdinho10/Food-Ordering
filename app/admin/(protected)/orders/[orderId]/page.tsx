import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  CalendarClock,
  Clock3,
  CreditCard,
  MapPin,
  Phone,
  Receipt,
  Store,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { prisma } from "@/app/lib/prisma";

import OrderRealtimeListener from "./OrderRealtimeListener";
import OrderStatusControl from "./OrderStatusControl";
import PaymentStatusControl from "./PaymentStatusControl";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function formatCurrency(value: unknown) {
  return `TSh ${Number(value).toLocaleString("en-TZ")}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-TZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-TZ", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return labels[status] || status;
}

function getStatusClasses(status: string) {
  const classes: Record<string, string> = {
    PENDING: "bg-[#FFF7E6] text-[#B7791F]",
    CONFIRMED: "bg-[#EDF4FF] text-[#2B6CB0]",
    PREPARING: "bg-[#F3EEFF] text-[#6B46C1]",
    READY: "bg-[#EDF8F1] text-[#2F855A]",
    OUT_FOR_DELIVERY: "bg-[#EAF7FA] text-[#238A9E]",
    DELIVERED: "bg-[#EDF8F1] text-[#2F855A]",
    CANCELLED: "bg-[#FDEBEC] text-[#B91621]",
  };

  return classes[status] || "bg-[#F5F5F5] text-[#666666]";
}

function getOrderTypeLabel(orderType: string) {
  const labels: Record<string, string> = {
    DELIVERY: "Delivery",
    PICKUP: "Pickup",
    DINE_IN: "Dine In",
  };

  return labels[orderType] || orderType;
}

function getOrderTypeIcon(orderType: string) {
  if (orderType === "DELIVERY") {
    return <Bike className="h-4 w-4" />;
  }

  if (orderType === "DINE_IN") {
    return <Users className="h-4 w-4" />;
  }

  return <Store className="h-4 w-4" />;
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    CASH: "Cash",
    MOBILE_MONEY: "Mobile Money",
    CARD: "Card",
  };

  return labels[method] || method;
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
  };

  return labels[status] || status;
}

function getPaymentStatusClasses(status: string) {
  const classes: Record<string, string> = {
    PENDING: "bg-[#FFF7E6] text-[#B7791F]",
    PAID: "bg-[#EDF8F1] text-[#2F855A]",
    FAILED: "bg-[#FDEBEC] text-[#B91621]",
  };

  return classes[status] || "bg-[#F5F5F5] text-[#666666]";
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const totalItems = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const orderTypeIcon = getOrderTypeIcon(order.orderType);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Realtime order updates */}
      <OrderRealtimeListener orderId={orderId} />

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#777777] transition hover:text-[#D41B27]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
                Order #{order.id.slice(-6).toUpperCase()}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  order.status,
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#999999]">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                {formatDate(order.createdAt)}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {formatTime(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FDEBEC] px-5 py-3">
            <p className="text-xs font-medium text-[#999999]">Order Total</p>

            <p className="mt-0.5 whitespace-nowrap text-xl font-bold text-[#D41B27]">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <Users className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">
                  Customer Information
                </h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Customer details for this order
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#999999]">Name</p>

                <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {order.customerName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-[#999999]">Phone</p>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#D41B27] hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {order.customerPhone}
                </a>
              </div>

              {order.customerAddress && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-[#999999]">
                    Delivery Address
                  </p>

                  <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-[#1F1F1F]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D41B27]" />
                    {order.customerAddress}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Order Items */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                  <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#1F1F1F]">Order Items</h2>

                  <p className="mt-0.5 text-xs text-[#999999]">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#EEEEEE]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7] ring-1 ring-black/5">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5 transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#FAFAFA]">
                        <UtensilsCrossed className="h-5 w-5 text-[#CCCCCC]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-xs text-[#999999]">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>

                  <p className="shrink-0 whitespace-nowrap text-sm font-bold text-[#1F1F1F]">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[#EEEEEE] pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#777777]">
                  Total
                </span>

                <span className="whitespace-nowrap text-lg font-bold text-[#1F1F1F]">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                  <Receipt className="h-4 w-4 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#1F1F1F]">Customer Notes</h2>

                  <p className="mt-0.5 text-xs text-[#999999]">
                    Special instructions from the customer
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAFAFA] px-4 py-3">
                <p className="text-sm leading-6 text-[#666666]">
                  {order.notes}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status */}
          <OrderStatusControl orderId={order.id} currentStatus={order.status} />

          {/* Order Information */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                {orderTypeIcon}
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">Order Information</h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Delivery and fulfillment details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#999999]">Order Type</p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {getOrderTypeLabel(order.orderType)}
                  </p>
                </div>

                <div className="rounded-lg bg-[#FAFAFA] p-2 text-[#777777]">
                  {orderTypeIcon}
                </div>
              </div>

              <div className="border-t border-[#EEEEEE] pt-4">
                <p className="text-xs text-[#999999]">Fulfillment</p>

                <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {order.fulfillmentTime === "ASAP"
                    ? "As soon as possible"
                    : "Scheduled"}
                </p>

                {order.scheduledAt && (
                  <p className="mt-1 text-xs text-[#999999]">
                    {formatDate(order.scheduledAt)} at{" "}
                    {formatTime(order.scheduledAt)}
                  </p>
                )}
              </div>

              {order.partySize && (
                <div className="border-t border-[#EEEEEE] pt-4">
                  <p className="text-xs text-[#999999]">Party Size</p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {order.partySize}{" "}
                    {order.partySize === 1 ? "person" : "people"}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Payment Information */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <CreditCard className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">
                  Payment Information
                </h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Payment method and status
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#777777]">Method</span>

                <span className="text-sm font-semibold text-[#1F1F1F]">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[#EEEEEE] pt-4">
                <span className="text-sm text-[#777777]">Status</span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                    order.paymentStatus,
                  )}`}
                >
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>

              <div className="border-t border-[#EEEEEE] pt-4">
                <p className="text-xs text-[#999999]">Amount</p>

                <p className="mt-1 whitespace-nowrap text-lg font-bold text-[#1F1F1F]">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            {/* Payment Status Control */}
            <div className="mt-5 border-t border-[#EEEEEE] pt-5">
              <PaymentStatusControl
                orderId={order.id}
                currentStatus={order.paymentStatus}
              />
            </div>
          </section>

          {/* Order ID */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

              <div className="min-w-0">
                <p className="text-xs font-medium text-[#999999]">Order ID</p>

                <p className="mt-1 break-all font-mono text-xs text-[#666666]">
                  {order.id}
                </p>

                <p className="mt-4 text-xs font-medium text-[#999999]">
                  Last Updated
                </p>

                <p className="mt-1 text-xs text-[#666666]">
                  {formatDate(order.updatedAt)} at {formatTime(order.updatedAt)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
