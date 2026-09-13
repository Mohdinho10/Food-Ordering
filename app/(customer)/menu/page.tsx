import MenuLayout from "@/app/components/MenuLayout";
import { prisma } from "@/app/lib/prisma";

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: {
          available: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const menuCategories = categories?.map((category) => ({
    id: category.id,
    name: category.name,
    products: category.products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: Number(product.price),
      image: product.image ?? "/images/placeholder.png",
    })),
  }));

  return <MenuLayout categories={menuCategories} />;
}
