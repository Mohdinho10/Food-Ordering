import "server-only";

import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export type Permission =
  | "dashboard.view"
  | "orders.view"
  | "orders.update"
  | "orders.cancel"
  | "products.view"
  | "products.create"
  | "products.update"
  | "products.delete"
  | "categories.view"
  | "categories.create"
  | "categories.update"
  | "categories.delete"
  | "reports.view"
  | "users.view"
  | "users.create"
  | "users.update"
  | "users.suspend"
  | "users.delete"
  | "audit_logs.view"
  | "settings.view"
  | "settings.manage"
  | "security.manage";

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get all permissions belonging to the current user.
 */
export async function getCurrentUserPermissions(): Promise<Permission[]> {
  const user = await getCurrentUser();

  if (!user?.role) {
    return [];
  }

  return user.role.permissions
    .map((rolePermission) => rolePermission.permission.name)
    .filter((permission): permission is Permission => isPermission(permission));
}

/**
 * Check whether a permission is valid in our application.
 */
function isPermission(value: string): value is Permission {
  return [
    "dashboard.view",
    "orders.view",
    "orders.update",
    "orders.cancel",
    "products.view",
    "products.create",
    "products.update",
    "products.delete",
    "categories.view",
    "categories.create",
    "categories.update",
    "categories.delete",
    "reports.view",
    "users.view",
    "users.create",
    "users.update",
    "users.suspend",
    "users.delete",
    "audit_logs.view",
    "settings.view",
    "settings.manage",
    "security.manage",
  ].includes(value);
}

/**
 * Check whether the current user has a specific permission.
 *
 * Intended for server-side checks.
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();

  return permissions.includes(permission);
}

/**
 * Require a specific permission.
 *
 * If the user is not authenticated, they are sent to login.
 * If the user does not have the required permission,
 * they are sent to the unauthorized page.
 */
export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const permissions = user.role?.permissions
    .map((rolePermission) => rolePermission.permission.name)
    .filter(isPermission);

  if (!permissions?.includes(permission)) {
    redirect("/admin/unauthorized");
  }

  return user;
}
