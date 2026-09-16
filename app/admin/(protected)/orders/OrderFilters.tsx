"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const orderTypeOptions = [
  { value: "ALL", label: "All Types" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "PICKUP", label: "Pickup" },
  { value: "DINE_IN", label: "Dine In" },
];

const dateOptions = [
  { value: "ALL", label: "All Dates" },
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "7_DAYS", label: "Last 7 Days" },
  { value: "30_DAYS", label: "Last 30 Days" },
];

export default function OrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  /*
   * Filters currently stored in the URL.
   */
  const currentStatus = searchParams.get("status") || "ALL";

  const currentOrderType = searchParams.get("orderType") || "ALL";

  const currentDate = searchParams.get("date") || "ALL";

  const currentSearch = searchParams.get("search") || "";

  /*
   * Local state for the search input.
   *
   * We keep this separate from the URL so the user
   * can type naturally while the server-side search
   * updates after the debounce delay.
   */
  const [search, setSearch] = useState(currentSearch);

  /*
   * Stores the debounce timer.
   */
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Clean up the debounce timer when the component
   * unmounts.
   *
   * This useEffect is appropriate because it is
   * synchronizing with an external timer.
   */
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /*
   * Search input handler.
   */
  const handleSearchChange = (value: string) => {
    /*
     * Update the input immediately.
     */
    setSearch(value);

    /*
     * Cancel the previous search timer.
     */
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    /*
     * Wait 400ms after the user stops typing
     * before updating the URL.
     */
    searchTimeoutRef.current = setTimeout(() => {
      const trimmedSearch = value.trim();

      const params = new URLSearchParams(searchParams.toString());

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      } else {
        params.delete("search");
      }

      /*
       * Updating the URL causes the Server Component
       * page.tsx to run again with the new search params.
       */
      startTransition(() => {
        router.replace(
          params.toString() ? `${pathname}?${params.toString()}` : pathname,
        );
      });
    }, 400);
  };

  /*
   * Update dropdown filters.
   */
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    /*
     * "ALL" means remove that filter from the URL.
     */
    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
      );
    });
  };

  /*
   * Clear every filter.
   */
  const clearFilters = () => {
    /*
     * Cancel any pending search.
     */
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    /*
     * Clear the input immediately.
     */
    setSearch("");

    /*
     * Remove all URL parameters.
     */
    startTransition(() => {
      router.push(pathname);
    });
  };

  /*
   * Determine whether any filter is active.
   */
  const hasFilters =
    currentStatus !== "ALL" ||
    currentOrderType !== "ALL" ||
    currentDate !== "ALL" ||
    currentSearch !== "" ||
    search.trim() !== "";

  return (
    <div className="border-b border-[#EEEEEE] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

          <input
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by name, phone, or order ID..."
            className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
          />

          {isPending && (
            <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#EEEEEE] border-t-[#D41B27]" />
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Status */}
          <select
            value={currentStatus}
            onChange={(event) => updateFilters("status", event.target.value)}
            disabled={isPending}
            className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm font-medium text-[#666666] outline-none transition focus:border-[#D41B27] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Order Type */}
          <select
            value={currentOrderType}
            onChange={(event) => updateFilters("orderType", event.target.value)}
            disabled={isPending}
            className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm font-medium text-[#666666] outline-none transition focus:border-[#D41B27] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {orderTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Date */}
          <select
            value={currentDate}
            onChange={(event) => updateFilters("date", event.target.value)}
            disabled={isPending}
            className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm font-medium text-[#666666] outline-none transition focus:border-[#D41B27] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              disabled={isPending}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-3 text-sm font-medium text-[#777777] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filter Indicator */}
        {hasFilters && (
          <div className="flex items-center gap-2 text-xs text-[#999999]">
            <SlidersHorizontal className="h-3.5 w-3.5" />

            <span>
              {isPending ? "Updating orders..." : "Filters are active"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
