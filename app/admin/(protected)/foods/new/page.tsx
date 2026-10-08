import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";

import AddFoodForm from "./AddFoodForm";

export default async function NewFoodPage() {
  await requirePermission("products.create");

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return <AddFoodForm categories={categories} />;
}
