import MenuLayout from "@/app/components/MenuLayout";
import MenuRealtimeListener from "./MenuRealtimeListener";
import { prisma } from "@/app/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
};

export default async function MenuPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const requestedCategoryId = params.category || "ALL";
  const initialSearch = params.search || "";

  /*
   * Get ALL categories from the database.
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
   */
  const selectedCategory =
    requestedCategoryId !== "ALL"
      ? categories.find((category) => category.id === requestedCategoryId)
      : null;

  const activeCategoryId = selectedCategory ? requestedCategoryId : "ALL";

  /*
   * Always fetch all available products.
   *
   * Search and category filtering happen instantly
   * on the client.
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
   * Build categories with their available products.
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
      <MenuRealtimeListener />

      <MenuLayout
        categories={menuCategories}
        activeCategoryId={activeCategoryId}
        initialSearch={initialSearch}
      />
    </>
  );
}
