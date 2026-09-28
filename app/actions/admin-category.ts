"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

function formatCategoryName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function createCategory(name: string) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const categoryName = formatCategoryName(name);

  if (!categoryName) {
    return {
      success: false,
      error: "Category name is required.",
    };
  }

  if (categoryName.length > 50) {
    return {
      success: false,
      error: "Category name must be 50 characters or less.",
    };
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: categoryName,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (existingCategory) {
    return {
      success: false,
      error: "A category with this name already exists.",
    };
  }

  try {
    await prisma.category.create({
      data: {
        name: categoryName,
      },
    });

    revalidatePath("/admin/foods");
    revalidatePath("/admin/foods/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while creating the category.",
    };
  }
}

export async function updateCategory(categoryId: string, name: string) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const categoryName = formatCategoryName(name);

  if (!categoryName) {
    return {
      success: false,
      error: "Category name is required.",
    };
  }

  if (categoryName.length > 50) {
    return {
      success: false,
      error: "Category name must be 50 characters or less.",
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  const duplicateCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: categoryName,
        mode: "insensitive",
      },
      NOT: {
        id: categoryId,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateCategory) {
    return {
      success: false,
      error: "A category with this name already exists.",
    };
  }

  try {
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: categoryName,
      },
    });

    revalidatePath("/admin/foods");
    revalidatePath("/admin/foods/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while updating the category.",
    };
  }
}

export async function deleteCategory(categoryId: string) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error:
        "This category contains foods. Move or delete those foods before deleting the category.",
    };
  }

  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    revalidatePath("/admin/foods");
    revalidatePath("/admin/foods/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while deleting the category.",
    };
  }
}
