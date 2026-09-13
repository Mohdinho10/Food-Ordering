import HomeLayout from "./components/HomeLayout";
import { prisma } from "./lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {
      available: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 5,
  });

  const popularItems = products?.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: Number(product.price),
    image: product.image ?? "/images/placeholder.png",
  }));

  return <HomeLayout popularItems={popularItems} />;
}
