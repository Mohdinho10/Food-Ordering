import { prisma } from "@/app/lib/prisma";
import AddFoodForm from "./AddFoodForm";

export default async function NewFoodPage() {
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
