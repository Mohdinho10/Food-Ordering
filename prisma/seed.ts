import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

console.log("DATABASE_URL exists:", !!connectionString);

if (!connectionString) {
  throw new Error("DATABASE_URL is not loaded!");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================
  // CLEAR EXISTING DATA
  // =========================

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // =========================
  // CATEGORIES
  // =========================

  const burgers = await prisma.category.create({
    data: {
      name: "Burgers",
    },
  });

  const pizza = await prisma.category.create({
    data: {
      name: "Pizza",
    },
  });

  const chicken = await prisma.category.create({
    data: {
      name: "Chicken",
    },
  });

  const waffles = await prisma.category.create({
    data: {
      name: "Waffles",
    },
  });

  const desserts = await prisma.category.create({
    data: {
      name: "Desserts",
    },
  });

  const drinks = await prisma.category.create({
    data: {
      name: "Drinks",
    },
  });

  const sides = await prisma.category.create({
    data: {
      name: "Sides",
    },
  });

  // =========================
  // BURGERS
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "Beef Burger",
        description:
          "Juicy grilled beef patty served with fresh lettuce, tomato, onions and our special sauce.",
        price: 15000,
        image: "/images/beef-burger.png",
        categoryId: burgers.id,
      },
      {
        name: "Chicken Burger",
        description:
          "Crispy chicken fillet with fresh lettuce, tomato and creamy house sauce.",
        price: 17000,
        image: "/images/chicken-burger.png",
        categoryId: burgers.id,
      },
      {
        name: "Fish Burger",
        description:
          "Crispy seasoned fish fillet with fresh vegetables and our signature sauce.",
        price: 18000,
        image: "/images/fish-burger.png",
        categoryId: burgers.id,
      },
    ],
  });

  // =========================
  // PIZZA
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "Margherita Pizza",
        description:
          "Classic pizza topped with tomato sauce, mozzarella cheese and fresh herbs.",
        price: 25000,
        image: "/images/margherita-pizza.png",
        categoryId: pizza.id,
      },
      {
        name: "Mexican Pizza",
        description:
          "Flavorful pizza topped with seasoned meat, vegetables, cheese and a spicy Mexican-style sauce.",
        price: 30000,
        image: "/images/mexican-pizza.png",
        categoryId: pizza.id,
      },
      {
        name: "Pepperoni Pizza",
        description:
          "Classic cheesy pizza loaded with pepperoni and rich tomato sauce.",
        price: 32000,
        image: "/images/pepperoni-pizza.png",
        categoryId: pizza.id,
      },
      {
        name: "Chili Pizza",
        description:
          "A delicious spicy pizza with rich tomato sauce, cheese and chili toppings.",
        price: 28000,
        image: "/images/chili-pizza.png",
        categoryId: pizza.id,
      },
    ],
  });

  // =========================
  // CHICKEN
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "Crispy Chicken",
        description:
          "Golden crispy chicken prepared with our special seasoning.",
        price: 18000,
        image: "/images/crispy-chicken.png",
        categoryId: chicken.id,
      },
      {
        name: "Chicken Wings",
        description:
          "Crispy chicken wings seasoned and cooked until perfectly golden.",
        price: 18000,
        image: "/images/chicken-wings.png",
        categoryId: chicken.id,
      },
      {
        name: "Chicken Fingers",
        description:
          "Tender strips of chicken coated in a crispy golden breading.",
        price: 17000,
        image: "/images/chicken-fingers.png",
        categoryId: chicken.id,
      },
    ],
  });

  // =========================
  // WAFFLES
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "Banana Waffle",
        description:
          "Warm crispy waffle served with fresh banana and delicious toppings.",
        price: 16000,
        image: "/images/waffle-banana.png",
        categoryId: waffles.id,
      },
      {
        name: "Strawberry Waffle",
        description:
          "Freshly prepared waffle served with strawberries and sweet toppings.",
        price: 17000,
        image: "/images/waffle-strawberry.png",
        categoryId: waffles.id,
      },
      {
        name: "Plain Waffle",
        description:
          "Freshly prepared golden waffle with a light, crispy outside and soft center.",
        price: 12000,
        image: "/images/waffle-plain.png",
        categoryId: waffles.id,
      },
    ],
  });

  // =========================
  // DESSERTS
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "Chocolate Cone",
        description: "Creamy chocolate ice cream served in a crispy cone.",
        price: 8000,
        image: "/images/chocolate-cone.png",
        categoryId: desserts.id,
      },
      {
        name: "Lotus Cone",
        description:
          "Creamy ice cream with delicious Lotus biscuit flavor served in a cone.",
        price: 9000,
        image: "/images/lotus-cone.png",
        categoryId: desserts.id,
      },
      {
        name: "Mixed Cone",
        description:
          "A delicious combination of creamy ice cream flavors served in a crispy cone.",
        price: 9000,
        image: "/images/mix-cone.png",
        categoryId: desserts.id,
      },
      {
        name: "Strawberry Cone",
        description: "Sweet strawberry ice cream served in a crispy cone.",
        price: 8000,
        image: "/images/strawberry-cone.png",
        categoryId: desserts.id,
      },
    ],
  });

  // =========================
  // DRINKS
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "Banana Shake",
        description:
          "Creamy and refreshing banana shake prepared with fresh bananas.",
        price: 10000,
        image: "/images/banana-shake.png",
        categoryId: drinks.id,
      },
      {
        name: "Chocolate Shake",
        description:
          "Rich and creamy chocolate milkshake with a delicious chocolate flavor.",
        price: 10000,
        image: "/images/chocolate-shake.png",
        categoryId: drinks.id,
      },
      {
        name: "Mixed Shake",
        description: "A creamy mixed-flavor shake made for a refreshing treat.",
        price: 11000,
        image: "/images/mix-shake.png",
        categoryId: drinks.id,
      },
      {
        name: "Lemon Mojito",
        description: "Refreshing lemon mojito with a bright citrus flavor.",
        price: 8000,
        image: "/images/lemon-mojito.png",
        categoryId: drinks.id,
      },
      {
        name: "Orange Mojito",
        description:
          "Refreshing orange mojito with a sweet and citrusy flavor.",
        price: 8000,
        image: "/images/orange-mojito.png",
        categoryId: drinks.id,
      },
      {
        name: "Strawberry Mojito",
        description:
          "Refreshing strawberry mojito made with sweet strawberry flavor.",
        price: 9000,
        image: "/images/strawberry-mojito.png",
        categoryId: drinks.id,
      },
    ],
  });

  // =========================
  // SIDES
  // =========================

  await prisma.product.createMany({
    data: [
      {
        name: "French Fries",
        description: "Golden crispy fries seasoned and served hot.",
        price: 7000,
        image: "/images/french-fries.png",
        categoryId: sides.id,
      },
      {
        name: "Loaded Fries",
        description:
          "Crispy golden fries topped with delicious sauces and savory toppings.",
        price: 12000,
        image: "/images/loaded-fries.png",
        categoryId: sides.id,
      },
      {
        name: "Cheese Fries",
        description:
          "Golden crispy fries generously topped with melted cheese and our special sauce.",
        price: 10000,
        image: "/images/cheese-fries.png",
        categoryId: sides.id,
      },
      {
        name: "Onion Rings",
        description:
          "Crispy golden onion rings served with a delicious dipping sauce.",
        price: 10000,
        image: "/images/onion-rings.png",
        categoryId: sides.id,
      },
      {
        name: "Potato Wedges",
        description:
          "Seasoned potato wedges baked until golden and crispy on the outside.",
        price: 9000,
        image: "/images/potato-wedges.png",
        categoryId: sides.id,
      },
    ],
  });

  // =========================
  // SUMMARY
  // =========================

  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();

  console.log("================================");
  console.log("✅ Database seeded successfully!");
  console.log(`📁 Categories: ${categoryCount}`);
  console.log(`🍔 Products: ${productCount}`);
  console.log("================================");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
