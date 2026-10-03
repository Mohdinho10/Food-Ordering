import MenuLayout from "@/app/components/MenuLayout";
import MenuRealtimeListener from "./MenuRealtimeListener";
import { prisma } from "@/app/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function MenuPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const requestedCategoryId = params.category || "ALL";

  /*
   * Get ALL categories from the database.
   *
   * We need all categories here because the category
   * buttons should remain visible even when one category
   * is selected.
   */
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  /*
   * Check whether the requested category exists.
   *
   * If the category ID does not exist anymore,
   * fall back to "ALL".
   *
   * If it exists but currently has no available foods,
   * we keep the ID here temporarily so MenuLayout can
   * redirect the customer back to /menu.
   */
  const selectedCategory =
    requestedCategoryId !== "ALL"
      ? categories.find((category) => category.id === requestedCategoryId)
      : null;

  const activeCategoryId = selectedCategory ? requestedCategoryId : "ALL";

  /*
   * IMPORTANT:
   *
   * Always fetch ALL available products.
   *
   * We DO NOT filter products by activeCategoryId here.
   *
   * This allows us to:
   *
   * 1. Keep all categories visible in the navigation.
   * 2. Hide categories that have no available foods.
   * 3. Display only the selected category when a category
   *    is clicked.
   */
  const products = await prisma.product.findMany({
    where: {
      available: true,
    },

    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      categoryId: true,
    },
  });

  /*
   * Build the categories with their available products.
   *
   * Then remove categories that have no available foods.
   *
   * This means:
   *
   * Category with foods     → shown
   * Category with no foods  → hidden
   */
  const menuCategories = categories
    .map((category) => ({
      id: category.id,
      name: category.name,

      products: products
        .filter((product) => product.categoryId === category.id)
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          image: product.image ?? "/images/placeholder.png",
        })),
    }))
    .filter((category) => category.products.length > 0);

  return (
    <>
      {/* Realtime updates for customer menu */}
      <MenuRealtimeListener />

      <MenuLayout
        categories={menuCategories}
        activeCategoryId={activeCategoryId}
      />
    </>
  );
}
