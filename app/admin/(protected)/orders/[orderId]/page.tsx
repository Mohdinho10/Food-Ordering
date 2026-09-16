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
import OrderStatusControl from "./OrderStatusControl";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function formatCurrency(value: number | string) {
  return `TSh ${Number(value).toLocaleString("en-TZ")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatOrderType(type: string) {
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
}

function formatFulfillmentTime(fulfillmentTime: string) {
  switch (fulfillmentTime) {
    case "ASAP":
      return "As Soon As Possible";

    case "SCHEDULED":
      return "Scheduled";

    default:
      return fulfillmentTime;
  }
}

function formatPaymentMethod(method: string) {
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
}

function formatPaymentStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "PAID":
      return "Paid";

    case "FAILED":
      return "Failed";

    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-[#FFF7E6] text-[#B7791F]";

    case "CONFIRMED":
      return "bg-[#EEF5FF] text-[#2563EB]";

    case "PREPARING":
      return "bg-[#F3EEFF] text-[#7C3AED]";

    case "READY":
      return "bg-[#EDF8F1] text-[#2F855A]";

    case "OUT_FOR_DELIVERY":
      return "bg-[#EEF5FF] text-[#2563EB]";

    case "DELIVERED":
      return "bg-[#EDF8F1] text-[#2F855A]";

    case "CANCELLED":
      return "bg-[#FDEBEC] text-[#B91621]";

    default:
      return "bg-[#F5F5F5] text-[#666666]";
  }
}

function getOrderTypeIcon(type: string) {
  switch (type) {
    case "DELIVERY":
      return <Bike className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />;

    case "DINE_IN":
      return <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />;

    case "PICKUP":
      return <Store className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />;

    default:
      return <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />;
  }
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

  const orderTypeIcon = getOrderTypeIcon(order.orderType);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#777777] transition hover:text-[#D41B27]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  order.status,
                )}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <p className="mt-2 text-sm text-[#999999]">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-[#999999]">Order Total</p>

            <p className="mt-1 text-2xl font-bold text-[#D41B27]">
              {formatCurrency(order.total.toString())}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
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

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FAFAFA] p-4">
                <p className="text-xs font-medium text-[#999999]">
                  Customer Name
                </p>

                <p className="mt-1.5 text-sm font-semibold text-[#1F1F1F]">
                  {order.customerName}
                </p>
              </div>

              <div className="rounded-xl bg-[#FAFAFA] p-4">
                <p className="text-xs font-medium text-[#999999]">
                  Phone Number
                </p>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#D41B27] hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {order.customerPhone}
                </a>
              </div>
            </div>
          </section>

          {/* Order items */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="border-b border-[#EEEEEE] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                  <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#1F1F1F]">Order Items</h2>

                  <p className="mt-0.5 text-xs text-[#999999]">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "different items"}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#EEEEEE]">
              {order.items.map((item) => {
                const itemSubtotal = Number(item.price) * item.quantity;

                return (
                  <div key={item.id} className="flex gap-4 p-5 sm:p-6">
                    {/* Product image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UtensilsCrossed className="h-6 w-6 text-[#CCCCCC]" />
                        </div>
                      )}
                    </div>

                    {/* Product information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#1F1F1F]">
                            {item.product.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#999999]">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-bold text-[#1F1F1F]">
                          {formatCurrency(itemSubtotal)}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-[#777777]">
                        {formatCurrency(item.price.toString())} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#666666]">
                  Total
                </span>

                <span className="text-lg font-bold text-[#D41B27]">
                  {formatCurrency(order.total.toString())}
                </span>
              </div>
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
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

              <div className="mt-5 rounded-xl bg-[#FAFAFA] p-4">
                <p className="text-sm leading-6 text-[#555555]">
                  {order.notes}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Update status */}
          <OrderStatusControl orderId={order.id} currentStatus={order.status} />

          {/* Order information */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <Receipt className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">Order Information</h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Delivery and fulfillment details
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Order type */}
              <div className="flex items-start gap-3">
                {orderTypeIcon}

                <div>
                  <p className="text-xs text-[#999999]">Order Type</p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {formatOrderType(order.orderType)}
                  </p>
                </div>
              </div>

              {/* Fulfillment */}
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

                <div>
                  <p className="text-xs text-[#999999]">Fulfillment</p>

                  <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {formatFulfillmentTime(order.fulfillmentTime)}
                  </p>
                </div>
              </div>

              {/* Scheduled time */}
              {order.fulfillmentTime === "SCHEDULED" && order.scheduledAt && (
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

                  <div>
                    <p className="text-xs text-[#999999]">Scheduled For</p>

                    <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                      {formatDate(order.scheduledAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Party size */}
              {order.orderType === "DINE_IN" && order.partySize && (
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

                  <div>
                    <p className="text-xs text-[#999999]">Party Size</p>

                    <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                      {order.partySize}{" "}
                      {order.partySize === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery address */}
              {order.orderType === "DELIVERY" && order.customerAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

                  <div>
                    <p className="text-xs text-[#999999]">Delivery Address</p>

                    <p className="mt-1 text-sm font-semibold leading-5 text-[#1F1F1F]">
                      {order.customerAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <CreditCard className="h-4 w-4 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">Payment</h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Payment information
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#999999]">Method</span>

                <span className="text-sm font-semibold text-[#1F1F1F]">
                  {formatPaymentMethod(order.paymentMethod)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#999999]">Status</span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "bg-[#EDF8F1] text-[#2F855A]"
                      : order.paymentStatus === "FAILED"
                        ? "bg-[#FDEBEC] text-[#B91621]"
                        : "bg-[#FFF7E6] text-[#B7791F]"
                  }`}
                >
                  {formatPaymentStatus(order.paymentStatus)}
                </span>
              </div>

              <div className="border-t border-[#EEEEEE] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[#666666]">
                    Order Total
                  </span>

                  <span className="text-base font-bold text-[#1F1F1F]">
                    {formatCurrency(order.total.toString())}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Order ID */}
          <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
            <p className="text-xs font-medium text-[#999999]">Order ID</p>

            <p className="mt-2 break-all font-mono text-xs text-[#666666]">
              {order.id}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#999999]">
              <CalendarClock className="h-3.5 w-3.5" />

              <span>Last updated: {formatDate(order.updatedAt)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
