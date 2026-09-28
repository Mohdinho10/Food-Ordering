"use client";
import { useState, useTransition } from "react";
import { Check, ChevronDown, CreditCard, Loader2, X } from "lucide-react";
import { updatePaymentStatus } from "@/app/actions/admin-order";

const paymentStatusOptions = [
  {
    value: "PENDING",
    label: "Pending",
    description: "Payment has not been completed yet",
  },
  {
    value: "PAID",
    label: "Paid",
    description: "Payment has been received successfully",
  },
  {
    value: "FAILED",
    label: "Failed",
    description: "Payment could not be completed",
  },
] as const;
type PaymentStatus = (typeof paymentStatusOptions)[number]["value"];
type Props = { orderId: string; currentStatus: PaymentStatus };
export default function PaymentStatusControl({
  orderId,
  currentStatus,
}: Props) {
  const [selectedStatus, setSelectedStatus] =
    useState<PaymentStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const currentOption = paymentStatusOptions.find(
    (option) => option.value === selectedStatus,
  );
  const hasChanged = selectedStatus !== currentStatus;
  const handleUpdate = () => {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await updatePaymentStatus(orderId, selectedStatus);
      if (!result.success) {
        setError(result.error || "Unable to update payment status.");
        return;
      }
      setMessage("Payment status updated successfully.");
    });
  };
  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setMessage("");
    setError("");
  };
  return (
    <div>
      {" "}
      {/* Header */}{" "}
      <div className="flex items-center gap-3">
        {" "}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBEC]">
          {" "}
          <CreditCard className="h-4 w-4 text-[#D41B27]" />{" "}
        </div>{" "}
        <div>
          {" "}
          <h3 className="font-bold text-[#1F1F1F]"> Update Payment </h3>{" "}
          <p className="mt-0.5 text-xs text-[#999999]">
            {" "}
            Change the current payment status{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Payment Status Select */}{" "}
      <div className="mt-5">
        {" "}
        <label
          htmlFor="payment-status"
          className="mb-2 block text-xs font-semibold text-[#666666]"
        >
          {" "}
          Payment Status{" "}
        </label>{" "}
        <div className="relative">
          {" "}
          <select
            id="payment-status"
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value as PaymentStatus);
              setMessage("");
              setError("");
            }}
            disabled={isPending}
            className="w-full appearance-none rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3.5 pr-10 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#D41B27] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {" "}
            {paymentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {" "}
                {option.label}{" "}
              </option>
            ))}{" "}
          </select>{" "}
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />{" "}
        </div>{" "}
        {currentOption && (
          <p className="mt-2 text-xs text-[#999999]">
            {" "}
            {currentOption.description}{" "}
          </p>
        )}{" "}
      </div>{" "}
      {/* Buttons */}{" "}
      {hasChanged && (
        <div className="mt-5 flex gap-3">
          {" "}
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isPending}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {" "}
            {isPending ? (
              <>
                {" "}
                <Loader2 className="h-4 w-4 animate-spin" /> Updating...{" "}
              </>
            ) : (
              <>
                {" "}
                <Check className="h-4 w-4" /> Update Payment{" "}
              </>
            )}{" "}
          </button>{" "}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-3 text-sm font-semibold text-[#777777] transition hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {" "}
            <X className="h-4 w-4" /> Cancel{" "}
          </button>{" "}
        </div>
      )}{" "}
      {/* Success */}{" "}
      {message && (
        <div className="mt-4 rounded-xl bg-[#EDF8F1] px-4 py-3">
          {" "}
          <p className="text-xs font-medium text-[#2F855A]"> {message} </p>{" "}
        </div>
      )}{" "}
      {/* Error */}{" "}
      {error && (
        <div className="mt-4 rounded-xl bg-[#FDEBEC] px-4 py-3">
          {" "}
          <p className="text-xs font-medium text-[#B91621]"> {error} </p>{" "}
        </div>
      )}{" "}
    </div>
  );
}
