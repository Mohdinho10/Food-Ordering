import MenuLayout from "@/app/components/MenuLayout";
import { prisma } from "@/app/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function MenuPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const categoryId = params.category || "ALL";

  // Get ALL categories.
  // These are always sent to the frontend so all
  // category buttons remain visible.
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Check whether the selected category actually exists.
  const selectedCategory =
    categoryId !== "ALL"
      ? categories.find((category) => category.id === categoryId)
      : null;

  // Invalid category IDs fall back to All.
  const activeCategoryId = selectedCategory ? categoryId : "ALL";

  /*
   * Prisma filters the products from the database.
   *
   * ALL:
   *   Get all available products.
   *
   * Specific category:
   *   Get only available products belonging
   *   to that category.
   */
  const products = await prisma.product.findMany({
    where: {
      available: true,

      ...(activeCategoryId !== "ALL"
        ? {
            categoryId: activeCategoryId,
          }
        : {}),
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
   * When "All" is selected, group the products
   * under their categories.
   *
   * When a specific category is selected, only
   * that category receives products.
   */
  const menuCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,

    products:
      activeCategoryId === "ALL" || category.id === activeCategoryId
        ? products
            .filter((product) => product.categoryId === category.id)
            .map((product) => ({
              id: product.id,
              name: product.name,
              description: product.description ?? "",
              price: Number(product.price),
              image: product.image ?? "/images/placeholder.png",
            }))
        : [],
  }));

  return (
    <MenuLayout
      categories={menuCategories}
      activeCategoryId={activeCategoryId}
    />
  );
}
