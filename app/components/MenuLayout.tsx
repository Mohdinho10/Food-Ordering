"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useCartStore } from "../store/cartStore";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

type Category = {
  id: string;
  name: string;
  products: Product[];
};

type MenuClientProps = {
  categories: Category[];
  activeCategoryId: string;
};

export default function MenuLayout({
  categories,
  activeCategoryId,
}: MenuClientProps) {
  /*
   * IMPORTANT:
   * We build the navigation from ALL categories.
   *
   * Therefore, even when Pizza is selected,
   * Burgers, Salads, Drinks, etc. remain visible.
   */
  const categoryNames = [
    {
      id: "ALL",
      name: "All",
    },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  ];

  const activeCategory =
    activeCategoryId === "ALL"
      ? null
      : categories.find((category) => category.id === activeCategoryId);

  return (
    <div className="bg-[#FAFAFA] text-[#1F1F1F]">
      {/* Page Header */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
            Bella Vista Restaurant
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Our Menu
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Fresh ingredients, delicious flavors, and something for everyone.
            Choose your favorites and enjoy a great meal.
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max items-center justify-center gap-2 py-4">
            {categoryNames.map((category) => {
              const isActive = activeCategoryId === category.id;

              const href =
                category.id === "ALL"
                  ? "/menu"
                  : `/menu?category=${category.id}`;

              return (
                <Link
                  key={category.id}
                  href={href}
                  scroll={false}
                  className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#D41B27] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {activeCategoryId === "ALL" ? (
          /*
           * ALL SELECTED
           *
           * Show every category that has
           * at least one available product.
           */
          categories.map((category) => {
            if (category.products.length === 0) {
              return null;
            }

            return (
              <section key={category.id} className="mb-16 last:mb-0">
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-[#D41B27]">
                      Explore
                    </p>

                    <h2 className="text-2xl font-bold sm:text-3xl">
                      {category.name}
                    </h2>
                  </div>

                  <Link
                    href={`/menu?category=${category.id}`}
                    scroll={false}
                    className="hidden cursor-pointer text-sm font-semibold text-[#D41B27] transition hover:text-[#B91621] sm:block"
                  >
                    View all
                  </Link>
                </div>

                <ProductGrid products={category.products} />
              </section>
            );
          })
        ) : activeCategory ? (
          /*
           * SPECIFIC CATEGORY SELECTED
           *
           * Only the selected category's products
           * are displayed.
           *
           * But ALL category buttons remain above.
           */
          <section>
            <div className="mb-7">
              <p className="mb-1 text-sm font-medium text-[#D41B27]">Explore</p>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {activeCategory.name}
              </h2>
            </div>

            {activeCategory.products.length > 0 ? (
              <ProductGrid products={activeCategory.products} />
            ) : (
              <EmptyCategory />
            )}
          </section>
        ) : (
          <EmptyCategory />
        )}
      </main>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)]"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#F7F7F7]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-5 transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>

          {/* Information */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-gray-900">
                  {product.name}
                </h3>

                <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-lg font-bold text-[#D41B27]">
                TSh {product.price.toLocaleString()}
              </span>

              <button
                type="button"
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
                aria-label={`Add ${product.name} to cart`}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#D41B27] text-white transition-all duration-200 hover:scale-105 hover:bg-[#B91621] active:scale-95"
              >
                <Plus size={19} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyCategory() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-bold text-[#1F1F1F]">No items available</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        There are currently no available foods in this category. Please check
        another category.
      </p>

      <Link
        href="/menu"
        scroll={false}
        className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621]"
      >
        View All Foods
      </Link>
    </div>
  );
}
