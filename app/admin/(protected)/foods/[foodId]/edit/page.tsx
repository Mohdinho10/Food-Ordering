import { notFound } from "next/navigation";

import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";

import EditFoodForm from "./EditFoodForm";

type PageProps = {
  params: Promise<{
    foodId: string;
  }>;
};

export default async function EditFoodPage({ params }: PageProps) {
  await requirePermission("products.update");

  const { foodId } = await params;

  const [food, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id: foodId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        categoryId: true,
        available: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!food) {
    notFound();
  }

  return (
    <EditFoodForm
      food={{
        id: food.id,
        name: food.name,
        description: food.description,
        price: Number(food.price),
        image: food.image,
        categoryId: food.categoryId,
        available: food.available,
        categoryName: food.category.name,
      }}
      categories={categories}
    />
  );
}
