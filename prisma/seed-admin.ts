import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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
  const email = "admin@gmail.com";
  const password = "admin1234";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "Admin",
      password: hashedPassword,
    },
    create: {
      name: "Admin",
      email,
      password: hashedPassword,
    },
  });

  console.log("Admin account created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
