"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";

import { updateFoodAvailability } from "@/app/actions/admin-food";

type Props = {
  foodId: string;
  initialAvailable: boolean;
};

export default function AvailabilityToggle({
  foodId,
  initialAvailable,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [available, setAvailable] = useState(initialAvailable);
  const [error, setError] = useState("");

  function handleToggle() {
    if (isPending) {
      return;
    }

    setError("");

    const newAvailability = !available;

    startTransition(async () => {
      const result = await updateFoodAvailability(foodId, newAvailability);

      if (!result.success) {
        setError(result.error || "Unable to update availability.");
        return;
      }

      setAvailable(newAvailability);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={
          available ? "Mark food as unavailable" : "Mark food as available"
        }
        className={`group relative inline-flex h-8 w-[58px] cursor-pointer items-center rounded-full p-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          available ? "bg-[#2F855A]" : "bg-[#D7D7D7]"
        }`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
            available ? "translate-x-[26px]" : "translate-x-0"
          }`}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#777777]" />
          ) : available ? (
            <Check className="h-3.5 w-3.5 text-[#2F855A]" />
          ) : (
            <X className="h-3.5 w-3.5 text-[#999999]" />
          )}
        </span>
      </button>

      <span
        className={`text-[11px] font-semibold ${
          available ? "text-[#2F855A]" : "text-[#999999]"
        }`}
      >
        {available ? "Available" : "Unavailable"}
      </span>

      {error && (
        <p className="max-w-[150px] text-[11px] font-medium text-[#B91621]">
          {error}
        </p>
      )}
    </div>
  );
}
