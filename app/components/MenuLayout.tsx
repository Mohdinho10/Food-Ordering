"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

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
  initialSearch?: string;
};

type CartAnimationDetail = {
  image: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

export default function MenuLayout({
  categories,
  activeCategoryId,
  initialSearch = "",
}: MenuClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);

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

  /*
   * If the customer is viewing a category that no longer
   * has available foods, return to the main menu.
   */
  if (activeCategoryId !== "ALL" && !activeCategory) {
    router.replace("/menu", { scroll: false });
  }

  /*
   * Search locally and instantly as the customer types.
   */
  const searchedCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        products: category.products.filter((product) => {
          const searchableText =
            `${product.name} ${product.description}`.toLowerCase();

          return searchableText.includes(query);
        }),
      }))
      .filter((category) => category.products.length > 0);
  }, [categories, search]);

  /*
   * Apply category filtering after search filtering.
   */
  const displayedCategories =
    activeCategoryId === "ALL"
      ? searchedCategories
      : searchedCategories.filter(
          (category) => category.id === activeCategoryId,
        );

  const hasSearch = search.trim().length > 0;

  const totalSearchResults = displayedCategories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  function clearSearch() {
    setSearch("");

    const categoryParam =
      activeCategoryId !== "ALL"
        ? `?category=${encodeURIComponent(activeCategoryId)}`
        : "";

    router.replace(`/menu${categoryParam}`, {
      scroll: false,
    });
  }

  return (
    <>
      <style jsx>{`
        .category-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .category-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .category-scroll::-webkit-scrollbar-track {
          display: none;
        }

        .category-scroll::-webkit-scrollbar-thumb {
          display: none;
        }
      `}</style>

      <div className="bg-[#FAFAFA] text-[#1F1F1F]">
        {/* ==================== PAGE HEADER ==================== */}

        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
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

            {/* ==================== SEARCH ==================== */}

            <div className="mx-auto mt-8 w-full max-w-xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999999]" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search food..."
                  aria-label="Search food"
                  className="h-13 w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] pl-12 pr-12 text-sm text-[#1F1F1F] shadow-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white focus:ring-4 focus:ring-[#FDEBEC]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear food search"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#999999] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {hasSearch && (
                <p className="mt-3 text-left text-xs text-[#999999]">
                  Searching for{" "}
                  <span className="font-semibold text-[#1F1F1F]">
                    “{search.trim()}”
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==================== CATEGORY NAVIGATION ==================== */}

        <section className="sticky top-20 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div
            className="category-scroll mx-auto max-w-7xl overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 sm:px-6 lg:px-8"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="flex min-w-max items-center justify-start gap-2 py-4 lg:justify-center">
              {categoryNames.map((category) => {
                const isActive = activeCategoryId === category.id;

                const params = new URLSearchParams();

                if (category.id !== "ALL") {
                  params.set("category", category.id);
                }

                if (hasSearch) {
                  params.set("search", search.trim());
                }

                const query = params.toString();

                const href = query ? `/menu?${query}` : "/menu";

                return (
                  <Link
                    key={category.id}
                    href={href}
                    scroll={false}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
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

        {/* ==================== PRODUCTS ==================== */}

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {hasSearch ? (
            displayedCategories.length > 0 ? (
              <>
                <div className="mb-7">
                  <p className="text-sm font-medium text-[#D41B27]">
                    Search results
                  </p>

                  <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                    {totalSearchResults}{" "}
                    {totalSearchResults === 1 ? "food" : "foods"} found
                  </h2>
                </div>

                {activeCategoryId === "ALL" ? (
                  displayedCategories.map((category) => (
                    <section key={category.id} className="mb-12 last:mb-0">
                      <div className="mb-5 flex items-end justify-between">
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#D41B27]">
                            Category
                          </p>

                          <h2 className="text-xl font-bold sm:text-2xl">
                            {category.name}
                          </h2>
                        </div>
                      </div>

                      <ProductGrid products={category.products} />
                    </section>
                  ))
                ) : (
                  <ProductGrid
                    products={
                      displayedCategories.find(
                        (category) => category.id === activeCategoryId,
                      )?.products ?? []
                    }
                  />
                )}
              </>
            ) : (
              <NoSearchResults search={search} onClear={clearSearch} />
            )
          ) : activeCategoryId === "ALL" ? (
            categories.length > 0 ? (
              categories.map((category) => (
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
              ))
            ) : (
              <EmptyMenu />
            )
          ) : activeCategory ? (
            <section>
              <div className="mb-7">
                <p className="mb-1 text-sm font-medium text-[#D41B27]">
                  Explore
                </p>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  {activeCategory.name}
                </h2>
              </div>

              <ProductGrid products={activeCategory.products} />
            </section>
          ) : (
            <EmptyCategory />
          )}
        </main>
      </div>
    </>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  const addItem = useCartStore((state) => state.addItem);

  function handleAddToCart(
    event: MouseEvent<HTMLButtonElement>,
    product: Product,
  ) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    const rect = event.currentTarget.getBoundingClientRect();

    window.dispatchEvent(
      new CustomEvent<CartAnimationDetail>("cart:add-animation", {
        detail: {
          image: product.image,
          startX: rect.left + rect.width / 2 - 24,
          startY: rect.top + rect.height / 2 - 24,
          startWidth: 48,
          startHeight: 48,
        },
      }),
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group flex overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)] sm:block"
        >
          {/* Desktop / Tablet Image */}
          <div className="relative hidden aspect-square shrink-0 overflow-hidden bg-[#F7F7F7] sm:block">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-5 transition duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>

          {/* Mobile Image */}
          <div className="relative m-3 h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7] sm:hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-1.5"
              sizes="80px"
            />
          </div>

          {/* Information */}
          <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-5">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-gray-900 sm:text-lg">
                {product.name}
              </h3>

              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-4 text-gray-500 sm:text-sm sm:leading-5">
                  {product.description}
                </p>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 sm:mt-5">
              <span className="whitespace-nowrap text-sm font-bold text-[#D41B27] sm:text-lg">
                TSh {product.price.toLocaleString()}
              </span>

              <button
                type="button"
                onClick={(event) => handleAddToCart(event, product)}
                aria-label={`Add ${product.name} to cart`}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#D41B27] text-white transition-all duration-200 hover:scale-105 hover:bg-[#B91621] active:scale-90 sm:h-10 sm:w-10"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NoSearchResults({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEBEC]">
        <Search className="h-6 w-6 text-[#D41B27]" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#1F1F1F]">No foods found</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        We couldn&apos;t find anything matching{" "}
        <span className="font-semibold text-[#1F1F1F]">“{search.trim()}”</span>.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621]"
      >
        Clear Search
      </button>
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

function EmptyMenu() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-bold text-[#1F1F1F]">No foods available</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        There are currently no foods available on the menu. Please check again
        later.
      </p>
    </div>
  );
}
