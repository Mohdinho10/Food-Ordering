"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";
import { useCartStore } from "@/app/store/cartStore";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const total = subtotal;

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

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
              Looks like you haven&apos;t added anything to your cart yet.
              Explore our menu and find something delicious.
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
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDEBEC]">
              <ShoppingBag className="h-5 w-5 text-[#D41B27]" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D41B27]">
                Your Order
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                Your Cart
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#6B6B6B]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </section>

      {/* ==================== CART CONTENT ==================== */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* ==================== ITEMS ==================== */}
          <div>
            <div className="space-y-4">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-5"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      {/* PRODUCT IMAGE */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7] sm:h-28 sm:w-28">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2.5"
                          sizes="112px"
                        />
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-[#1F1F1F] sm:text-lg">
                              {item.name}
                            </h2>

                            <p className="mt-1 text-sm text-[#6B6B6B]">
                              TSh {item.price.toLocaleString()} each
                            </p>
                          </div>

                          {/* REMOVE */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#999999] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          {/* QUANTITY */}
                          <div className="flex items-center rounded-full border border-[#EEEEEE] bg-[#FAFAFA]">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              aria-label={`Decrease ${item.name} quantity`}
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#555555] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="w-8 text-center text-sm font-semibold text-[#1F1F1F]">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              aria-label={`Increase ${item.name} quantity`}
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#555555] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* ITEM TOTAL */}
                          <p className="text-sm font-bold text-[#D41B27] sm:text-base">
                            TSh {itemTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTINUE SHOPPING */}
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D41B27] transition hover:text-[#B91621]"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* ==================== ORDER SUMMARY ==================== */}
          <div className="lg:sticky lg:top-28">
            <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-7">
              <h2 className="text-xl font-bold text-[#1F1F1F]">
                Order Summary
              </h2>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B6B6B]">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>

                  <span className="font-semibold text-[#1F1F1F]">
                    TSh {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-[#EEEEEE]" />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#1F1F1F]">
                  Total
                </span>

                <span className="text-xl font-bold text-[#D41B27]">
                  TSh {total.toLocaleString()}
                </span>
              </div>

              {/* CHECKOUT BUTTON */}
              <Link
                href="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* TRUST MESSAGE */}
              <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#777777]">
                <Utensils className="h-3.5 w-3.5" />
                Fresh food. Fast service. Great taste.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
