import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  User,
  Utensils,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

type OrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

const statusSteps = [
  {
    key: "PENDING",
    label: "Order Received",
    description: "We've received your order.",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your order has been confirmed.",
  },
  {
    key: "PREPARING",
    label: "Preparing",
    description: "Your food is being prepared.",
  },
  {
    key: "READY",
    label: "Ready",
    description: "Your order is ready.",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Enjoy your meal!",
  },
];

function getStatusIndex(status: string) {
  if (status === "OUT_FOR_DELIVERY") {
    return 4;
  }

  if (status === "CANCELLED") {
    return -1;
  }

  return statusSteps.findIndex((step) => step.key === status);
}

function formatOrderType(orderType: string) {
  switch (orderType) {
    case "DELIVERY":
      return "Delivery";

    case "PICKUP":
      return "Pickup";

    case "DINE_IN":
      return "Dine-in";

    default:
      return orderType;
  }
}

function formatPaymentMethod(paymentMethod: string) {
  switch (paymentMethod) {
    case "CASH":
      return "Cash";

    case "MOBILE_MONEY":
      return "Mobile Money";

    case "CARD":
      return "Card";

    default:
      return paymentMethod;
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="min-h-[70vh] bg-[#FAFAFA]">
      {/* ==================== PAGE HEADER ==================== */}

      <section className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B6B6B] transition hover:text-[#D41B27]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </section>

      {/* ==================== CONTENT ==================== */}

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        {/* ==================== SUCCESS / CANCELLED ==================== */}

        <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:px-10 sm:py-12">
          {isCancelled ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FDEBEC]">
                <span className="text-3xl font-bold text-[#D41B27]">×</span>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#D41B27]">
                Order Cancelled
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                Your Order Was Cancelled
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6B6B6B] sm:text-base">
                This order has been cancelled. If you believe this happened by
                mistake, please contact the restaurant.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FDEBEC]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D41B27]">
                  <Check className="h-6 w-6 text-white" strokeWidth={3} />
                </div>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#D41B27]">
                Order Placed Successfully
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                Thank You!
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6B6B6B] sm:text-base">
                Your order has been received. You can use this page to follow
                its progress.
              </p>
            </>
          )}

          <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#FAFAFA] px-4 py-2">
            <ShoppingBag className="h-4 w-4 text-[#D41B27]" />

            <span className="text-sm font-semibold text-[#1F1F1F]">
              Order #{order.id}
            </span>
          </div>
        </div>

        {!isCancelled && (
          <>
            {/* ==================== ORDER STATUS ==================== */}

            <section className="mt-8 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D41B27]">
                    Order Status
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                    Track Your Order
                  </h2>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[#FDEBEC] sm:flex">
                  <Clock className="h-5 w-5 text-[#D41B27]" />
                </div>
              </div>

              <div className="mt-8">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={step.key}
                      className="relative flex gap-4 pb-8 last:pb-0"
                    >
                      {/* Connecting line */}

                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 h-[calc(100%-18px)] w-0.5 ${
                            index < currentStatusIndex
                              ? "bg-[#D41B27]"
                              : "bg-[#EEEEEE]"
                          }`}
                        />
                      )}

                      {/* Status circle */}

                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-[#D41B27] text-white"
                            : "bg-[#F5F5F5] text-[#AAAAAA]"
                        } ${isCurrent ? "ring-4 ring-[#FDEBEC]" : ""}`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>

                      {/* Status information */}

                      <div className="pt-1">
                        <h3
                          className={`text-sm font-bold ${
                            isCompleted ? "text-[#1F1F1F]" : "text-[#999999]"
                          }`}
                        >
                          {step.label}
                        </h3>

                        <p
                          className={`mt-1 text-xs leading-5 ${
                            isCompleted ? "text-[#6B6B6B]" : "text-[#AAAAAA]"
                          }`}
                        >
                          {step.description}
                        </p>

                        {isCurrent && (
                          <span className="mt-2 inline-flex rounded-full bg-[#FDEBEC] px-2.5 py-1 text-[10px] font-semibold text-[#D41B27]">
                            Current Status
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ==================== ORDER INFORMATION ==================== */}

            <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
              {/* ==================== LEFT COLUMN ==================== */}

              <div className="space-y-8">
                {/* ORDER ITEMS */}

                <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEC]">
                      <ShoppingBag className="h-5 w-5 text-[#D41B27]" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#1F1F1F]">
                        Your Order
                      </h2>

                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 divide-y divide-[#EEEEEE]">
                    {order.items.map((item) => {
                      const price = Number(item.price);
                      const itemTotal = price * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#1F1F1F]">
                              {item.product.name}
                            </h3>

                            <p className="mt-1 text-xs text-[#6B6B6B]">
                              TSh {price.toLocaleString()} × {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-[#1F1F1F]">
                            TSh {itemTotal.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="my-6 border-t border-[#EEEEEE]" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[#1F1F1F]">
                      Total
                    </span>

                    <span className="text-xl font-bold text-[#D41B27]">
                      TSh {Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* CUSTOMER INFORMATION */}

                <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEC]">
                      <User className="h-5 w-5 text-[#D41B27]" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#1F1F1F]">
                        Customer Information
                      </h2>

                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        Information provided with your order.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#999999]">
                        Name
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                        {order.customerName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#999999]">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                        {order.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== RIGHT COLUMN ==================== */}

              <aside className="lg:sticky lg:top-28">
                <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    Order Details
                  </h2>

                  <div className="mt-6 space-y-5">
                    {/* ORDER TYPE */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                        {order.orderType === "DELIVERY" ? (
                          <MapPin className="h-4 w-4 text-[#D41B27]" />
                        ) : order.orderType === "PICKUP" ? (
                          <Store className="h-4 w-4 text-[#D41B27]" />
                        ) : (
                          <Utensils className="h-4 w-4 text-[#D41B27]" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-[#999999]">Order Type</p>

                        <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F]">
                          {formatOrderType(order.orderType)}
                        </p>
                      </div>
                    </div>

                    {/* DELIVERY ADDRESS */}

                    {order.orderType === "DELIVERY" &&
                      order.customerAddress && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                            <MapPin className="h-4 w-4 text-[#D41B27]" />
                          </div>

                          <div>
                            <p className="text-xs text-[#999999]">
                              Delivery Address
                            </p>

                            <p className="mt-0.5 text-sm font-semibold leading-5 text-[#1F1F1F]">
                              {order.customerAddress}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* DINE-IN */}

                    {order.orderType === "DINE_IN" && order.partySize && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                          <Users className="h-4 w-4 text-[#D41B27]" />
                        </div>

                        <div>
                          <p className="text-xs text-[#999999]">
                            Number of People
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F]">
                            {order.partySize}{" "}
                            {order.partySize === 1 ? "person" : "people"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FULFILLMENT TIME */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                        {order.fulfillmentTime === "SCHEDULED" ? (
                          <CalendarDays className="h-4 w-4 text-[#D41B27]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#D41B27]" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-[#999999]">
                          Fulfillment Time
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F]">
                          {order.fulfillmentTime === "ASAP"
                            ? "As Soon As Possible"
                            : order.scheduledAt
                              ? formatDate(order.scheduledAt)
                              : "Scheduled"}
                        </p>
                      </div>
                    </div>

                    {/* PAYMENT */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                        <ShoppingBag className="h-4 w-4 text-[#D41B27]" />
                      </div>

                      <div>
                        <p className="text-xs text-[#999999]">Payment Method</p>

                        <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F]">
                          {formatPaymentMethod(order.paymentMethod)}
                        </p>

                        <p className="mt-1 text-xs text-[#6B6B6B]">
                          {order.paymentStatus === "PAID"
                            ? "Payment received"
                            : "Payment pending"}
                        </p>
                      </div>
                    </div>

                    {/* ORDER DATE */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                        <CalendarDays className="h-4 w-4 text-[#D41B27]" />
                      </div>

                      <div>
                        <p className="text-xs text-[#999999]">Order Placed</p>

                        <p className="mt-0.5 text-sm font-semibold text-[#1F1F1F]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* NOTES */}

                  {order.notes && (
                    <>
                      <div className="my-6 border-t border-[#EEEEEE]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#999999]">
                          Notes
                        </p>

                        <p className="mt-2 rounded-xl bg-[#FAFAFA] p-4 text-sm leading-6 text-[#555555]">
                          {order.notes}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </aside>
            </section>

            {/* ==================== ACTIONS ==================== */}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D41B27] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621] sm:w-auto"
              >
                Back to Home
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/menu"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#EEEEEE] bg-white px-7 py-3.5 text-sm font-semibold text-[#1F1F1F] transition hover:border-[#D41B27] hover:text-[#D41B27] sm:w-auto"
              >
                Order More Food
              </Link>
            </div>

            {/* ==================== HELP ==================== */}

            <div className="mt-8 rounded-2xl border border-[#EEEEEE] bg-white p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1F1F1F]">
                <Phone className="h-4 w-4 text-[#D41B27]" />
                Need help with your order?
              </div>

              <p className="mt-1 text-xs text-[#6B6B6B]">
                Contact Bella Vista Restaurant for assistance.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
