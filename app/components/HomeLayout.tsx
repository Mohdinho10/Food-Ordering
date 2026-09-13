"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  ArrowRight,
  Utensils,
  Bike,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface HomeClientProps {
  popularItems: Product[];
}

export default function HomeLayout({ popularItems }: HomeClientProps) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const getQuantity = (id: string) => {
    return items.find((item) => item.id === id)?.quantity ?? 0;
  };

  return (
    <div className="bg-[#FAFAFA] text-[#1F1F1F]">
      {/* ==================== HERO ==================== */}
      <section className="relative min-h-155 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&q=85"
          alt="Bella Vista Restaurant"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative mx-auto flex min-h-155 max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl text-white">
            <p className="mb-5 text-sm font-semibold tracking-[0.3em] text-[#FDEBEC]">
              WELCOME TO BELLA VISTA
            </p>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Good Food,
              <br />
              <span className="text-[#D41B27]">Great Moments.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Delicious food made with passion, fresh ingredients, and flavors
              that bring people together.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="flex items-center justify-center gap-2 rounded-full bg-[#D41B27] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
              >
                View Our Menu
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="flex items-center justify-center rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1F1F1F]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== POPULAR ITEMS ==================== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
                Customer Favorites
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Popular Right Now
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B6B6B]">
                Discover some of our most loved dishes, prepared fresh and ready
                to make your day better.
              </p>
            </div>

            <Link
              href="/menu"
              className="flex items-center gap-2 text-sm font-semibold text-[#D41B27] hover:text-[#B91621]"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {popularItems?.map((item) => {
              const quantity = getQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)]"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="relative aspect-square overflow-hidden bg-[#FAFAFA]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-4 transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    />
                  </div>

                  {/* PRODUCT INFORMATION */}
                  <div className="p-5">
                    <h3 className="font-semibold">{item.name}</h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#6B6B6B]">
                      {item.description}
                    </p>

                    {/* PRICE + ADD BUTTON */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-[#D41B27]">
                        TSh {item.price.toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          addItem({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                          })
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#D41B27] text-white transition hover:bg-[#B91621] active:scale-95"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* QUANTITY */}
                    <div className="mt-3 flex items-center justify-between rounded-full bg-[#FAFAFA] px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity > 0) {
                            decreaseQuantity(item.id);
                          }
                        }}
                        disabled={quantity === 0}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-[#1F1F1F] shadow-sm transition hover:bg-[#FDEBEC] hover:text-[#D41B27] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="text-sm font-semibold">{quantity}</span>

                      <button
                        type="button"
                        onClick={() => {
                          if (quantity === 0) {
                            addItem({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image,
                            });
                          } else {
                            increaseQuantity(item.id);
                          }
                        }}
                        aria-label={`Increase ${item.name} quantity`}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-[#1F1F1F] shadow-sm transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="border-y border-[#EEEEEE] bg-[#FAFAFA] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          {/* FRESH & DELICIOUS */}
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
              <Utensils className="h-5 w-5 text-[#D41B27]" />
            </div>

            <div>
              <h3 className="font-semibold">Fresh & Delicious</h3>

              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Quality ingredients and carefully prepared meals.
              </p>
            </div>
          </div>

          {/* FAST DELIVERY */}
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
              <Bike className="h-5 w-5 text-[#D41B27]" />
            </div>

            <div>
              <h3 className="font-semibold">Fast Delivery</h3>

              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Enjoy your favorite meals delivered right to you.
              </p>
            </div>
          </div>

          {/* QUALITY GUARANTEED */}
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
              <ShieldCheck className="h-5 w-5 text-[#D41B27]" />
            </div>

            <div>
              <h3 className="font-semibold">Quality Guaranteed</h3>

              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                We care about every meal that leaves our kitchen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
