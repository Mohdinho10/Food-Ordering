"use client";

import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type AuditLogFiltersProps = {
  search: string;
  action: string;
  actions: string[];
};

export default function AuditLogFilters({
  search,
  action,
  actions,
}: AuditLogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);

  function updateFilters(nextSearch: string, nextAction: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }

    if (nextAction) {
      params.set("action", nextAction);
    } else {
      params.delete("action");
    }

    params.delete("page");

    const query = params.toString();

    router.push(query ? `/admin/audit-logs?${query}` : "/admin/audit-logs");
  }

  function clearFilters() {
    setSearchValue("");
    router.push("/admin/audit-logs");
  }

  const hasFilters = Boolean(search || action);

  return (
    <div className="rounded-2xl border border-[#EEEEEE] bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />

          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateFilters(searchValue, action);
              }
            }}
            placeholder="Search user, action, entity or ID..."
            className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white pl-10 pr-4 text-sm text-[#333333] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC]"
          />
        </div>

        {/* Action filter */}
        <div className="relative lg:w-64">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />

          <select
            value={action}
            onChange={(event) => updateFilters(searchValue, event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-[#E5E5E5] bg-white pl-10 pr-4 text-sm text-[#333333] outline-none transition focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC]"
          >
            <option value="">All actions</option>

            {actions.map((item) => (
              <option key={item} value={item}>
                {item
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={() => updateFilters(searchValue, action)}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#D41B27] px-5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
        >
          Search
        </button>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm font-semibold text-[#666666] transition hover:bg-[#FAFAFA]"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
