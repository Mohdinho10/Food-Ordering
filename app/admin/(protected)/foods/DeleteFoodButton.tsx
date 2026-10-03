"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, X, AlertTriangle } from "lucide-react";

import { deleteFood } from "@/app/actions/admin-food";

type Props = {
  foodId: string;
  foodName: string;
};

export default function DeleteFoodButton({ foodId, foodName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    if (isPending) {
      return;
    }

    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isPending) {
      return;
    }

    setIsModalOpen(false);
    setError("");
  }

  function handleDelete() {
    if (isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await deleteFood(foodId);

      if (!result.success) {
        setError(result.error || "Unable to delete food.");
        return;
      }

      setIsModalOpen(false);
    });
  }

  return (
    <>
      {/* Delete Button */}
      <div className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={openModal}
          disabled={isPending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#F3D5D7] px-3 py-2 text-xs font-semibold text-[#B91621] transition hover:border-[#B91621] hover:bg-[#FDEBEC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}

          {isPending ? "Deleting..." : "Delete"}
        </button>

        {error && !isModalOpen && (
          <p className="max-w-[220px] text-right text-[11px] font-medium leading-4 text-[#B91621]">
            {error}
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-food-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDEBEC]">
                  <AlertTriangle
                    className="h-5 w-5 text-[#B91621]"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h2
                    id="delete-food-title"
                    className="text-lg font-bold text-[#1F1F1F]"
                  >
                    Delete food?
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-600">
                You are about to permanently delete:
              </p>

              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="break-words text-sm font-semibold text-[#1F1F1F]">
                  {foodName}
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                This food will be removed from the restaurant menu and customers
                will no longer be able to order it.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-[#F3D5D7] bg-[#FDEBEC] px-4 py-3">
                  <p className="text-sm font-medium leading-5 text-[#B91621]">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#B91621] px-5 text-sm font-semibold text-white transition hover:bg-[#99141D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Food
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
