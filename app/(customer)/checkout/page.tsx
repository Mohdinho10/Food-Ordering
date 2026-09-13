"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Store,
  User,
  Users,
  Utensils,
} from "lucide-react";
import { useCartStore } from "@/app/store/cartStore";

type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";
type FulfillmentTime = "ASAP" | "SCHEDULED";
type PaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD";

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [fulfillmentTime, setFulfillmentTime] =
    useState<FulfillmentTime>("ASAP");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [partySize, setPartySize] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const total = subtotal;

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const handlePlaceOrder = async () => {
    setError("");

    // Normalize the phone number by removing spaces.
    // Example:
    // +255 700 123 456 -> +255700123456
    const normalizedPhone = customerPhone.replace(/\s+/g, "");

    // Client-side validation
    if (!customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!normalizedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    // Tanzania mobile number validation.
    // Accepts numbers such as:
    // +255700123456
    // +255710123456
    // +255650123456
    if (!/^\+255[67]\d{8}$/.test(normalizedPhone)) {
      setError(
        "Please enter a valid Tanzanian phone number starting with +255, e.g. +255 700 123 456.",
      );
      return;
    }

    if (orderType === "DELIVERY" && !customerAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (orderType === "DINE_IN" && !partySize) {
      setError("Please select the number of people.");
      return;
    }

    if (fulfillmentTime === "SCHEDULED" && !scheduledAt) {
      setError("Please select a date and time for your order.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone: normalizedPhone,
          customerAddress:
            orderType === "DELIVERY" ? customerAddress : undefined,
          orderType,
          fulfillmentTime,
          scheduledAt:
            fulfillmentTime === "SCHEDULED" ? scheduledAt : undefined,
          partySize: orderType === "DINE_IN" ? partySize : undefined,
          paymentMethod,
          notes,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place your order.");
      }

      // Clear the cart after the order has
      // successfully been created in the database.
      clearCart();

      // Redirect to the order page.
      router.push(`/order/${data.orderId}`);
    } catch (error) {
      console.error("Place order error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#FAFAFA]">
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FDEBEC]">
              <ShoppingBag className="h-9 w-9 text-[#D41B27]" />
            </div>

            <h1 className="mt-7 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Your Cart is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6B6B6B] sm:text-base">
              You need to add some delicious food before checking out.
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D41B27] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
            >
              Browse Menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#FAFAFA]">
      {/* ==================== PAGE HEADER ==================== */}

      <section className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B6B6B] transition hover:text-[#D41B27]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D41B27]">
              Almost There
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Checkout
            </h1>

            <p className="mt-3 text-sm text-[#6B6B6B] sm:text-base">
              Tell us how you&apos;d like to receive your order.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== CHECKOUT CONTENT ==================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* ==================== FORM ==================== */}

          <div className="space-y-6">
            {/* CUSTOMER INFORMATION */}

            <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                  <User className="h-5 w-5 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    Your Information
                  </h2>

                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    We&apos;ll use this information for your order.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {/* NAME */}

                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                    <input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="+255 700 000 000"
                      inputMode="tel"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#999999]">
                    Enter your phone number starting with +255
                  </p>
                </div>
              </div>
            </section>

            {/* ORDER TYPE */}

            <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                  <Utensils className="h-5 w-5 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    How Would You Like Your Order?
                  </h2>

                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Choose how you&apos;d like to receive your food.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {/* DELIVERY */}

                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    orderType === "DELIVERY"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] bg-white hover:border-[#D41B27]/40 hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      orderType === "DELIVERY"
                        ? "bg-[#D41B27] text-white"
                        : "bg-[#FDEBEC] text-[#D41B27]"
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#1F1F1F]">
                    Delivery
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                    Have your food delivered to you.
                  </p>
                </button>

                {/* PICKUP */}

                <button
                  type="button"
                  onClick={() => setOrderType("PICKUP")}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    orderType === "PICKUP"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] bg-white hover:border-[#D41B27]/40 hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      orderType === "PICKUP"
                        ? "bg-[#D41B27] text-white"
                        : "bg-[#FDEBEC] text-[#D41B27]"
                    }`}
                  >
                    <Store className="h-5 w-5" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#1F1F1F]">
                    Pickup
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                    Pick up your order from the restaurant.
                  </p>
                </button>

                {/* DINE IN */}

                <button
                  type="button"
                  onClick={() => setOrderType("DINE_IN")}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    orderType === "DINE_IN"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] bg-white hover:border-[#D41B27]/40 hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      orderType === "DINE_IN"
                        ? "bg-[#D41B27] text-white"
                        : "bg-[#FDEBEC] text-[#D41B27]"
                    }`}
                  >
                    <Utensils className="h-5 w-5" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#1F1F1F]">
                    Dine-in
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                    Enjoy your meal at the restaurant.
                  </p>
                </button>
              </div>

              {/* DELIVERY ADDRESS */}

              {orderType === "DELIVERY" && (
                <div className="mt-6">
                  <label
                    htmlFor="customerAddress"
                    className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                  >
                    Delivery Address
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#999999]" />

                    <textarea
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(event) =>
                        setCustomerAddress(event.target.value)
                      }
                      placeholder="Enter your delivery address"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* DINE-IN NUMBER OF PEOPLE */}

              {orderType === "DINE_IN" && (
                <div className="mt-6">
                  <label
                    htmlFor="partySize"
                    className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                  >
                    Number of People
                  </label>

                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                    <select
                      id="partySize"
                      value={partySize}
                      onChange={(event) => setPartySize(event.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#D41B27] focus:bg-white"
                    >
                      <option value="">Select number of people</option>
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5 people</option>
                      <option value="6">6 people</option>
                      <option value="7">7 people</option>
                      <option value="8">8 people</option>
                      <option value="9">9 people</option>
                      <option value="10">10 people</option>
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* FULFILLMENT TIME */}

            <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                  <Clock className="h-5 w-5 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    When Would You Like It?
                  </h2>

                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Choose when you&apos;d like your order.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {/* ASAP */}

                <button
                  type="button"
                  onClick={() => setFulfillmentTime("ASAP")}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    fulfillmentTime === "ASAP"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] bg-white hover:border-[#D41B27]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        fulfillmentTime === "ASAP"
                          ? "bg-[#D41B27] text-white"
                          : "bg-[#FDEBEC] text-[#D41B27]"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#1F1F1F]">
                        As Soon As Possible
                      </h3>

                      <p className="mt-1 text-xs text-[#6B6B6B]">
                        Prepare my order now
                      </p>
                    </div>
                  </div>
                </button>

                {/* SCHEDULED */}

                <button
                  type="button"
                  onClick={() => setFulfillmentTime("SCHEDULED")}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    fulfillmentTime === "SCHEDULED"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] bg-white hover:border-[#D41B27]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        fulfillmentTime === "SCHEDULED"
                          ? "bg-[#D41B27] text-white"
                          : "bg-[#FDEBEC] text-[#D41B27]"
                      }`}
                    >
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#1F1F1F]">
                        Schedule for Later
                      </h3>

                      <p className="mt-1 text-xs text-[#6B6B6B]">
                        Choose a date and time
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {fulfillmentTime === "SCHEDULED" && (
                <div className="mt-6">
                  <label
                    htmlFor="scheduledAt"
                    className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                  >
                    Date &amp; Time
                  </label>

                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                    <input
                      id="scheduledAt"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) => setScheduledAt(event.target.value)}
                      className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#D41B27] focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* PAYMENT METHOD */}

            <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                  <ShoppingBag className="h-5 w-5 text-[#D41B27]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    Payment Method
                  </h2>

                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Choose how you&apos;d like to pay.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* CASH */}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition ${
                    paymentMethod === "CASH"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] hover:border-[#D41B27]/40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      paymentMethod === "CASH"
                        ? "bg-[#D41B27] text-white"
                        : "bg-[#F7F7F7] text-[#555555]"
                    }`}
                  >
                    <span className="text-sm font-bold">TSh</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1F1F1F]">Cash</h3>

                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      Pay with cash when receiving your order.
                    </p>
                  </div>

                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === "CASH"
                        ? "border-[#D41B27] bg-[#D41B27]"
                        : "border-[#CCCCCC]"
                    }`}
                  />
                </button>

                {/* MOBILE MONEY */}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("MOBILE_MONEY")}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition ${
                    paymentMethod === "MOBILE_MONEY"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] hover:border-[#D41B27]/40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      paymentMethod === "MOBILE_MONEY"
                        ? "bg-[#D41B27] text-white"
                        : "bg-[#F7F7F7] text-[#555555]"
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1F1F1F]">
                      Mobile Money
                    </h3>

                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      Pay using your mobile money service.
                    </p>
                  </div>

                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === "MOBILE_MONEY"
                        ? "border-[#D41B27] bg-[#D41B27]"
                        : "border-[#CCCCCC]"
                    }`}
                  />
                </button>

                {/* CARD */}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition ${
                    paymentMethod === "CARD"
                      ? "border-[#D41B27] bg-[#FDEBEC]"
                      : "border-[#EEEEEE] hover:border-[#D41B27]/40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      paymentMethod === "CARD"
                        ? "bg-[#D41B27] text-white"
                        : "bg-[#F7F7F7] text-[#555555]"
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1F1F1F]">Card</h3>

                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      Pay securely using your bank card.
                    </p>
                  </div>

                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === "CARD"
                        ? "border-[#D41B27] bg-[#D41B27]"
                        : "border-[#CCCCCC]"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* ORDER NOTES */}

            <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Additional Notes
                <span className="ml-2 text-xs font-normal text-[#999999]">
                  Optional
                </span>
              </h2>

              <p className="mt-1 text-sm text-[#6B6B6B]">
                Anything you&apos;d like the restaurant to know?
              </p>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. No onions, extra sauce..."
                rows={4}
                className="mt-5 w-full resize-none rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
              />
            </section>
          </div>

          {/* ==================== ORDER SUMMARY ==================== */}

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1F1F1F]">Your Order</h2>

                <span className="rounded-full bg-[#FDEBEC] px-3 py-1 text-xs font-semibold text-[#D41B27]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {/* ORDER ITEMS */}

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="64px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#1F1F1F]">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#6B6B6B]">
                            TSh {item.price.toLocaleString()}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-[#1F1F1F]">
                          TSh {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center">
                        <div className="flex items-center rounded-full border border-[#EEEEEE] bg-[#FAFAFA]">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease ${item.name} quantity`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#555555] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            aria-label={`Increase ${item.name} quantity`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#555555] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-[#EEEEEE]" />

              {/* TOTAL */}

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#1F1F1F]">
                  Total
                </span>

                <span className="text-xl font-bold text-[#D41B27]">
                  TSh {total.toLocaleString()}
                </span>
              </div>

              {/* ERROR MESSAGE */}

              {error && (
                <div className="mt-5 rounded-xl border border-[#F5C2C7] bg-[#FDEBEC] px-4 py-3">
                  <p className="text-sm leading-5 text-[#B91621]">{error}</p>
                </div>
              )}

              {/* PLACE ORDER */}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#888888]">
                By placing your order, you agree that the information provided
                will be used to process your order.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
