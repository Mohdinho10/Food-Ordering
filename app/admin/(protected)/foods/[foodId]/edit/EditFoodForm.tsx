"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ImagePlus, Loader2, Save, Upload, X } from "lucide-react";

import { updateFood } from "@/app/actions/admin-food";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

type Category = {
  id: string;
  name: string;
};

type Food = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: string;
  available: boolean;
  categoryName: string;
};

type Props = {
  food: Food;
  categories: Category[];
};

export default function EditFoodForm({ food, categories }: Props) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(food.name);
  const [description, setDescription] = useState(food.description || "");
  const [price, setPrice] = useState(String(food.price));
  const [categoryId, setCategoryId] = useState(food.categoryId);

  const [image, setImage] = useState<File | null>(null);

  const [error, setError] = useState("");

  // ----------------------------------------
  // Image preview
  // ----------------------------------------

  const imagePreview = useMemo(() => {
    if (!image) {
      return food.image;
    }

    return URL.createObjectURL(image);
  }, [image, food.image]);

  // ----------------------------------------
  // Image selection
  // ----------------------------------------

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!allowedImageTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");

      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Image must be 5MB or smaller.");

      event.target.value = "";
      return;
    }

    setImage(selectedFile);
  }

  // ----------------------------------------
  // Remove newly selected image
  // ----------------------------------------

  function removeNewImage() {
    setImage(null);
  }

  // ----------------------------------------
  // Submit
  // ----------------------------------------

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Food name is required.");
      return;
    }

    if (name.trim().length > 100) {
      setError("Food name must be 100 characters or less.");
      return;
    }

    if (!price.trim()) {
      setError("Price is required.");
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("categoryId", categoryId);

    // Only send an image if the admin
    // selected a new one.
    if (image) {
      formData.append("image", image);
    }

    startTransition(async () => {
      const result = await updateFood(food.id, formData);

      if (!result.success) {
        setError(
          result.error || "Something went wrong while updating the food.",
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back */}
      <Link
        href="/admin/foods"
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#777777] transition hover:text-[#D41B27]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Foods
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
          Edit Food
        </h1>

        <p className="mt-1.5 text-sm text-[#777777]">
          Update the details of this menu item.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-[#F4C7CB] bg-[#FDEBEC] px-4 py-3">
          <p className="text-sm font-medium text-[#B91621]">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="cursor-pointer text-[#B91621]"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* -------------------------------- */}
          {/* Food Information */}
          {/* -------------------------------- */}

          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="border-b border-[#EEEEEE] px-6 py-5">
              <h2 className="text-sm font-bold text-[#1F1F1F]">
                Food Information
              </h2>

              <p className="mt-1 text-xs text-[#999999]">
                Update the basic information for this food.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#333333]"
                >
                  Food Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  disabled={isPending}
                  placeholder="e.g. Classic Cheeseburger"
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-[#333333]"
                >
                  Description
                  <span className="ml-1 font-normal text-[#AAAAAA]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  disabled={isPending}
                  placeholder="Describe the ingredients or what makes this food special..."
                  className="w-full resize-none rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                />
              </div>

              {/* Price + Category */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-[#333333]"
                  >
                    Price
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium text-[#999999]">
                      TSh
                    </span>

                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      step="1"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      disabled={isPending}
                      placeholder="15000"
                      className="w-full rounded-xl border border-[#EEEEEE] bg-white py-3 pl-14 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="mb-2 block text-sm font-semibold text-[#333333]"
                  >
                    Category
                  </label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    disabled={isPending}
                    className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                  >
                    <option value="">Select a category</option>

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

          {/* -------------------------------- */}
          {/* Food Image */}
          {/* -------------------------------- */}

          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="border-b border-[#EEEEEE] px-6 py-5">
              <h2 className="text-sm font-bold text-[#1F1F1F]">Food Image</h2>

              <p className="mt-1 text-xs text-[#999999]">
                Keep the current image or upload a new one.
              </p>
            </div>

            <div className="p-6">
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#EEEEEE] bg-[#F7F7F7]">
                  <div className="relative aspect-[16/9] w-full sm:aspect-[2/1]">
                    <Image
                      src={imagePreview}
                      alt={name || "Food image"}
                      fill
                      className="object-contain p-2 transition-transform duration-300 hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, 768px"
                    />
                  </div>

                  {image && (
                    <div className="absolute left-4 top-4 rounded-lg bg-[#1F1F1F]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      New image
                    </div>
                  )}

                  {image && (
                    <button
                      type="button"
                      onClick={removeNewImage}
                      disabled={isPending}
                      className="absolute right-4 top-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-[#666666] shadow-sm transition hover:bg-white hover:text-[#B91621] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Remove new image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEBEC]">
                    <ImagePlus className="h-6 w-6 text-[#D41B27]" />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-[#1F1F1F]">
                    No image
                  </h3>

                  <p className="mt-1 text-xs text-[#999999]">
                    Upload an image for this food.
                  </p>
                </div>
              )}

              {/* Upload */}
              <div className="mt-5">
                <label
                  htmlFor="image"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm font-semibold text-[#666666] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27] ${
                    isPending ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Upload className="h-4 w-4" />

                  {image ? "Choose Different Image" : "Replace Image"}
                </label>

                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isPending}
                  className="sr-only"
                />

                <p className="mt-2 text-xs text-[#999999]">
                  JPG, PNG or WebP. Maximum file size: 5MB.
                </p>
              </div>
            </div>
          </section>

          {/* -------------------------------- */}
          {/* Current Status */}
          {/* -------------------------------- */}

          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div>
                <h2 className="text-sm font-bold text-[#1F1F1F]">
                  Availability
                </h2>

                <p className="mt-1 text-xs text-[#999999]">
                  This food is currently{" "}
                  <span className="font-semibold text-[#666666]">
                    {food.available ? "available" : "unavailable"}
                  </span>
                  .
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  food.available
                    ? "bg-[#EDF8F1] text-[#2F855A]"
                    : "bg-[#FDEBEC] text-[#B91621]"
                }`}
              >
                {food.available ? "Available" : "Unavailable"}
              </div>
            </div>
          </section>

          {/* -------------------------------- */}
          {/* Actions */}
          {/* -------------------------------- */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/foods"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#EEEEEE] bg-white px-5 py-3 text-sm font-semibold text-[#666666] transition hover:bg-[#FAFAFA]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
