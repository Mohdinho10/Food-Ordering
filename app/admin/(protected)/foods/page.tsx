import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  Settings2,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";

import AvailabilityToggle from "./AvailabilityToggle";
import DeleteFoodButton from "./DeleteFoodButton";
import FoodsRealtimeListener from "./FoodsRealtimeListener";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
};

function formatCurrency(value: unknown) {
  return `TSh ${Number(value).toLocaleString("en-TZ")}`;
}

export default async function FoodsPage({ searchParams }: PageProps) {
  const user = await requirePermission("products.view");

  const params = await searchParams;

  const search = params.search?.trim() || "";
  const categoryId = params.category || "ALL";

  const permissions =
    user.role?.permissions.map(
      (rolePermission) => rolePermission.permission.name,
    ) ?? [];

  const canCreate = permissions.includes("products.create");
  const canUpdate = permissions.includes("products.update");
  const canDelete = permissions.includes("products.delete");
  const canViewCategories = permissions.includes("categories.view");

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const where = {
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(categoryId !== "ALL"
      ? {
          categoryId,
        }
      : {}),
  };

  const foods = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [totalFoods, availableFoods, unavailableFoods] = await Promise.all([
    prisma.product.count(),

    prisma.product.count({
      where: {
        available: true,
      },
    }),

    prisma.product.count({
      where: {
        available: false,
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Realtime listener */}
      <FoodsRealtimeListener />

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Foods
          </h1>

          <p className="mt-1.5 text-sm text-[#777777]">
            Manage your restaurant menu and food items.
          </p>
        </div>

        {(canViewCategories || canCreate) && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {canViewCategories && (
              <Link
                href="/admin/foods/categories"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-5 py-3 text-sm font-semibold text-[#666666] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27] sm:w-auto"
              >
                <Settings2 className="h-4 w-4" />
                Manage Categories
              </Link>
            )}

            {canCreate && (
              <Link
                href="/admin/foods/new"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Food
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Foods */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Total Foods</p>

              <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                {totalFoods}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
            </div>
          </div>
        </div>

        {/* Available */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Available</p>

              <p className="mt-2 text-2xl font-bold text-[#2F855A]">
                {availableFoods}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF8F1]">
              <CheckCircle2 className="h-4 w-4 text-[#2F855A]" />
            </div>
          </div>
        </div>

        {/* Unavailable */}
        <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#999999]">Unavailable</p>

              <p className="mt-2 text-2xl font-bold text-[#B91621]">
                {unavailableFoods}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
              <XCircle className="h-4 w-4 text-[#B91621]" />
            </div>
          </div>
        </div>
      </div>

      {/* Foods Container */}
      <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
        {/* Filters */}
        <div className="border-b border-[#EEEEEE] px-5 py-5 sm:px-6">
          <form method="GET" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search foods..."
                className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
              />
            </div>

            <select
              name="category"
              defaultValue={categoryId}
              className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm font-medium text-[#666666] outline-none transition focus:border-[#D41B27] sm:w-52"
            >
              <option value="ALL">All Categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-[#1F1F1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#333333]"
            >
              Search
            </button>

            {(search || categoryId !== "ALL") && (
              <Link
                href="/admin/foods"
                className="flex cursor-pointer items-center justify-center rounded-xl border border-[#EEEEEE] px-5 py-3 text-sm font-semibold text-[#777777] transition hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-hidden md:block">
          {foods.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#999999]">
                    Food
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#999999]">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#999999]">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#999999]">
                    Availability
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#999999]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEEEEE]">
                {foods.map((food) => (
                  <tr
                    key={food.id}
                    className="group transition hover:bg-[#FAFAFA]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7] ring-1 ring-black/5">
                          {food.image ? (
                            <Image
                              src={food.image}
                              alt={food.name}
                              fill
                              sizes="64px"
                              className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#FAFAFA]">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDEBEC]">
                                <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                            {food.name}
                          </p>

                          {food.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-[#999999]">
                              {food.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#FAFAFA] px-3 py-1 text-xs font-medium text-[#666666]">
                        {food.category.name}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap text-sm font-bold text-[#1F1F1F]">
                        {formatCurrency(food.price)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {canUpdate && (
                        <AvailabilityToggle
                          foodId={food.id}
                          initialAvailable={food.available}
                        />
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-start justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/admin/foods/${food.id}/edit`}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#666666] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        )}

                        {canDelete && (
                          <DeleteFoodButton
                            foodId={food.id}
                            foodName={food.name}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              hasFilters={Boolean(search || categoryId !== "ALL")}
              canCreate={canCreate}
            />
          )}
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-[#EEEEEE] md:hidden">
          {foods.length > 0 ? (
            foods.map((food) => (
              <div key={food.id} className="group p-5">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F7F7F7] ring-1 ring-black/5">
                    {food.image ? (
                      <Image
                        src={food.image}
                        alt={food.name}
                        fill
                        sizes="96px"
                        className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#FAFAFA]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDEBEC]">
                          <UtensilsCrossed className="h-4 w-4 text-[#D41B27]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#1F1F1F]">
                          {food.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#999999]">
                          {food.category.name}
                        </p>
                      </div>

                      <p className="shrink-0 whitespace-nowrap text-sm font-bold text-[#1F1F1F]">
                        {formatCurrency(food.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      {canUpdate && (
                        <AvailabilityToggle
                          foodId={food.id}
                          initialAvailable={food.available}
                        />
                      )}

                      <div className="flex flex-wrap items-start justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/admin/foods/${food.id}/edit`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#666666] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        )}

                        {canDelete && (
                          <DeleteFoodButton
                            foodId={food.id}
                            foodName={food.name}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              hasFilters={Boolean(search || categoryId !== "ALL")}
              canCreate={canCreate}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({
  hasFilters,
  canCreate,
}: {
  hasFilters: boolean;
  canCreate: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEBEC]">
        <UtensilsCrossed className="h-6 w-6 text-[#D41B27]" />
      </div>

      <h3 className="mt-5 text-base font-bold text-[#1F1F1F]">
        {hasFilters ? "No foods found" : "No foods yet"}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#999999]">
        {hasFilters
          ? "Try changing your search or category filter."
          : "Start building your restaurant menu by adding your first food item."}
      </p>

      {!hasFilters && canCreate && (
        <Link
          href="/admin/foods/new"
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621]"
        >
          <Plus className="h-4 w-4" />
          Add Your First Food
        </Link>
      )}
    </div>
  );
}
