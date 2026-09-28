"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
  UtensilsCrossed,
} from "lucide-react";

import { createFood } from "@/app/actions/admin-food";

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
};

export default function AddFoodForm({ categories }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setImageError("");
    setImagePreview(null);

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, and WebP images are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be 5MB or smaller.");

      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImagePreview(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setImageError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      setImageError("Please select a food image.");
      return;
    }

    startTransition(async () => {
      const result = await createFood(formData);

      if (!result?.success) {
        setError(result?.error || "Something went wrong.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/foods"
          className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#777777] transition hover:text-[#D41B27]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Foods
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
          Add Food
        </h1>

        <p className="mt-1.5 text-sm text-[#777777]">
          Add a new item to your restaurant menu.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Image */}
          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="border-b border-[#EEEEEE] px-6 py-5">
              <h2 className="text-sm font-bold text-[#1F1F1F]">Food Image</h2>

              <p className="mt-1 text-xs text-[#999999]">
                Upload a clear image of the food. JPG, PNG, or WebP up to 5MB.
              </p>
            </div>

            <div className="p-6">
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#EEEEEE] bg-[#FAFAFA]">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={imagePreview}
                      alt="Food preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-[#EEEEEE] bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-[#666666]">
                      <ImagePlus className="h-4 w-4 text-[#D41B27]" />
                      Image selected
                    </div>

                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isPending}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#777777] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-6 py-14 text-center transition hover:border-[#F4BFC3] hover:bg-[#FDEBEC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEBEC] transition group-hover:scale-105">
                    <Upload className="h-6 w-6 text-[#D41B27]" />
                  </div>

                  <p className="mt-5 text-sm font-bold text-[#1F1F1F]">
                    Click to upload an image
                  </p>

                  <p className="mt-1.5 text-xs text-[#999999]">
                    JPG, PNG or WebP · Maximum 5MB
                  </p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {imageError && (
                <p className="mt-3 text-xs font-medium text-[#B91621]">
                  {imageError}
                </p>
              )}
            </div>
          </section>

          {/* Basic Information */}
          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="border-b border-[#EEEEEE] px-6 py-5">
              <h2 className="text-sm font-bold text-[#1F1F1F]">
                Basic Information
              </h2>

              <p className="mt-1 text-xs text-[#999999]">
                Enter the details customers will see on your menu.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#444444]"
                >
                  Food Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Classic Cheeseburger"
                  disabled={isPending}
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-[#444444]"
                >
                  Description
                  <span className="ml-1 font-normal text-[#AAAAAA]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the food, ingredients, or what makes it special..."
                  disabled={isPending}
                  className="w-full resize-none rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm leading-6 text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-[#444444]"
                  >
                    Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#999999]">
                      TSh
                    </span>

                    <input
                      id="price"
                      name="price"
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="15000"
                      disabled={isPending}
                      className="w-full rounded-xl border border-[#EEEEEE] bg-white py-3 pl-14 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="categoryId"
                    className="mb-2 block text-sm font-semibold text-[#444444]"
                  >
                    Category
                  </label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue=""
                    disabled={isPending}
                    className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#666666] outline-none transition focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Availability */}
          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="flex items-center gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEBEC]">
                <UtensilsCrossed className="h-5 w-5 text-[#D41B27]" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#1F1F1F]">
                  Availability
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#999999]">
                  New foods are automatically marked as available.
                </p>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-[#F4C7CB] bg-[#FDEBEC] px-4 py-3">
              <p className="text-sm font-medium text-[#B91621]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/foods"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#EEEEEE] px-5 py-3 text-sm font-semibold text-[#666666] transition hover:bg-[#FAFAFA] hover:text-[#1F1F1F]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading & Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Food
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
