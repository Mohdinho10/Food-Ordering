import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/app/lib/prisma";
import { requirePermission } from "@/app/lib/authorization";

import CategoryManager from "./CategoryManager";

export default async function CategoriesPage() {
  const user = await requirePermission("categories.view");

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const permissions =
    user.role?.permissions.map(
      (rolePermission) => rolePermission.permission.name,
    ) ?? [];

  const canCreate = permissions.includes("categories.create");
  const canUpdate = permissions.includes("categories.update");
  const canDelete = permissions.includes("categories.delete");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/foods"
          className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#777777] transition hover:text-[#D41B27]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Foods
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
          Categories
        </h1>

        <p className="mt-1.5 text-sm text-[#777777]">
          Organize your restaurant menu with food categories.
        </p>
      </div>

      <CategoryManager
        categories={categories}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
