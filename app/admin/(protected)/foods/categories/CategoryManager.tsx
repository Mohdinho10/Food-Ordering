"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/admin-category";

type Category = {
  id: string;
  name: string;
  _count: {
    products: number;
  };
};

type Props = {
  categories: Category[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export default function CategoryManager({
  categories,
  canCreate,
  canUpdate,
  canDelete,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<Category | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function handleCreate() {
    if (!canCreate) return;

    clearMessages();

    startTransition(async () => {
      const result = await createCategory(newCategoryName);

      if (!result.success) {
        setError(result.error || "Unable to create category.");
        return;
      }

      setNewCategoryName("");
      setSuccess("Category created successfully.");
    });
  }

  function startEditing(category: Category) {
    if (!canUpdate) return;

    clearMessages();

    setEditingId(category.id);
    setEditingName(category.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  function handleUpdate() {
    if (!canUpdate || !editingId) return;

    clearMessages();

    startTransition(async () => {
      const result = await updateCategory(editingId, editingName);

      if (!result.success) {
        setError(result.error || "Unable to update category.");
        return;
      }

      setEditingId(null);
      setEditingName("");
      setSuccess("Category updated successfully.");
    });
  }

  function openDeleteModal(category: Category) {
    if (!canDelete) return;

    clearMessages();
    setDeleteCategoryTarget(category);
  }

  function closeDeleteModal() {
    if (isPending) return;

    setDeleteCategoryTarget(null);
  }

  function handleDelete() {
    if (!canDelete || !deleteCategoryTarget) return;

    const category = deleteCategoryTarget;

    clearMessages();

    if (category._count.products > 0) {
      setError(
        "This category contains foods. Move or delete those foods before deleting the category.",
      );
      setDeleteCategoryTarget(null);
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(category.id);

      if (!result.success) {
        setError(result.error || "Unable to delete category.");
        return;
      }

      setDeleteCategoryTarget(null);
      setSuccess("Category deleted successfully.");
    });
  }

  useEffect(() => {
    if (!deleteCategoryTarget) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setDeleteCategoryTarget(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteCategoryTarget, isPending]);

  return (
    <>
      <div className="space-y-6">
        {/* Add Category */}
        {canCreate && (
          <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
            <div className="border-b border-[#EEEEEE] px-6 py-5">
              <h2 className="text-sm font-bold text-[#1F1F1F]">Add Category</h2>

              <p className="mt-1 text-xs text-[#999999]">
                Create a category for organizing your restaurant foods.
              </p>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                  maxLength={50}
                  placeholder="e.g. Salads"
                  disabled={isPending}
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
                />

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isPending || !newCategoryName.trim()}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Messages */}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-[#F4C7CB] bg-[#FDEBEC] px-4 py-3">
            <p className="text-sm font-medium text-[#B91621]">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="cursor-pointer text-[#B91621]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-[#CDE8D5] bg-[#EDF8F1] px-4 py-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#2F855A]" />

              <p className="text-sm font-medium text-[#2F855A]">{success}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="cursor-pointer text-[#2F855A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Categories */}
        <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
          <div className="border-b border-[#EEEEEE] px-6 py-5">
            <h2 className="text-sm font-bold text-[#1F1F1F]">Categories</h2>

            <p className="mt-1 text-xs text-[#999999]">
              {categories.length} categor
              {categories.length === 1 ? "y" : "ies"} in your restaurant menu.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEBEC]">
                <Plus className="h-6 w-6 text-[#D41B27]" />
              </div>

              <h3 className="mt-5 text-base font-bold text-[#1F1F1F]">
                No categories yet
              </h3>

              <p className="mt-1.5 text-sm text-[#999999]">
                {canCreate
                  ? "Create your first category above."
                  : "No categories have been created yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEEEEE]">
              {categories.map((category) => {
                const isEditing = editingId === category.id;

                return (
                  <div
                    key={category.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {isEditing ? (
                      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleUpdate();
                            }

                            if (event.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                          maxLength={50}
                          autoFocus
                          disabled={isPending}
                          className="w-full rounded-xl border border-[#EEEEEE] px-4 py-2.5 text-sm outline-none transition focus:border-[#D41B27] sm:max-w-sm"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={isPending || !editingName.trim()}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#D41B27] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isPending}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#666666] transition hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-[#1F1F1F]">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-[#999999]">
                            {category._count.products} food
                            {category._count.products === 1 ? "" : "s"}
                          </p>
                        </div>

                        {(canUpdate || canDelete) && (
                          <div className="flex items-center gap-2">
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => startEditing(category)}
                                disabled={isPending}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#666666] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#D41B27] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(category)}
                                disabled={isPending}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#666666] transition hover:border-[#FDEBEC] hover:bg-[#FDEBEC] hover:text-[#B91621] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCategoryTarget && canDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              closeDeleteModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDEBEC]">
                <Trash2 className="h-5 w-5 text-[#D41B27]" />
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isPending}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#999999] transition hover:bg-[#FAFAFA] hover:text-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6 pt-5">
              {deleteCategoryTarget._count.products > 0 ? (
                <>
                  <h2
                    id="delete-category-title"
                    className="text-lg font-bold text-[#1F1F1F]"
                  >
                    Category can&apos;t be deleted
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#777777]">
                    <span className="font-semibold text-[#1F1F1F]">
                      {deleteCategoryTarget.name}
                    </span>{" "}
                    currently contains{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {deleteCategoryTarget._count.products} food
                      {deleteCategoryTarget._count.products === 1 ? "" : "s"}
                    </span>
                    .
                  </p>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#F4C7CB] bg-[#FDEBEC] px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B91621]" />

                    <p className="text-xs leading-5 text-[#B91621]">
                      Move or delete the foods in this category before deleting
                      the category.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="mt-6 w-full cursor-pointer rounded-xl bg-[#1F1F1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#333333]"
                  >
                    Got it
                  </button>
                </>
              ) : (
                <>
                  <h2
                    id="delete-category-title"
                    className="text-lg font-bold text-[#1F1F1F]"
                  >
                    Delete category?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#777777]">
                    You&apos;re about to permanently delete{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {deleteCategoryTarget.name}
                    </span>
                    . This action cannot be undone.
                  </p>

                  <div className="mt-5 rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#999999]">
                        Foods in category
                      </span>

                      <span className="text-sm font-bold text-[#1F1F1F]">
                        0
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      disabled={isPending}
                      className="w-full cursor-pointer rounded-xl border border-[#EEEEEE] px-5 py-3 text-sm font-semibold text-[#666666] transition hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Category
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
