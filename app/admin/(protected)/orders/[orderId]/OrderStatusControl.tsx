"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Clock3, Loader2, X } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin-order";

const statusOptions = [
  {
    value: "PENDING",
    label: "Pending",
    description: "Waiting for confirmation",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    description: "Order has been confirmed",
  },
  {
    value: "PREPARING",
    label: "Preparing",
    description: "Kitchen is preparing the order",
  },
  {
    value: "READY",
    label: "Ready",
    description: "Order is ready for pickup",
  },
  {
    value: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Order is on the way",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    description: "Order has been delivered",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "Order has been cancelled",
  },
] as const;

type OrderStatus = (typeof statusOptions)[number]["value"];

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

export default function OrderStatusControl({ orderId, currentStatus }: Props) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);

  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentOption = statusOptions.find(
    (option) => option.value === selectedStatus,
  );

  const hasChanged = selectedStatus !== currentStatus;

  const handleUpdate = () => {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, selectedStatus);

      if (!result.success) {
        setError(result.error || "Unable to update order status.");
        return;
      }

      setMessage("Order status updated successfully.");
    });
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setMessage("");
    setError("");
  };

  return (
    <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
          <Clock3 className="h-4 w-4 text-[#D41B27]" />
        </div>

        <div>
          <h2 className="font-bold text-[#1F1F1F]">Update Status</h2>

          <p className="mt-0.5 text-xs text-[#999999]">
            Change the current order status
          </p>
        </div>
      </div>

      {/* Status Select */}
      <div className="mt-5">
        <label
          htmlFor="order-status"
          className="mb-2 block text-xs font-semibold text-[#666666]"
        >
          Order Status
        </label>

        <div className="relative">
          <select
            id="order-status"
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value as OrderStatus);
              setMessage("");
              setError("");
            }}
            disabled={isPending}
            className="w-full appearance-none rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3.5 pr-10 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#D41B27] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
        </div>

        {currentOption && (
          <p className="mt-2 text-xs text-[#999999]">
            {currentOption.description}
          </p>
        )}
      </div>

      {/* Buttons */}
      {hasChanged && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isPending}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Update Status
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-3 text-sm font-semibold text-[#777777] transition hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      )}

      {/* Success */}
      {message && (
        <div className="mt-4 rounded-xl bg-[#EDF8F1] px-4 py-3">
          <p className="text-xs font-medium text-[#2F855A]">{message}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-[#FDEBEC] px-4 py-3">
          <p className="text-xs font-medium text-[#B91621]">{error}</p>
        </div>
      )}
    </section>
  );
}
