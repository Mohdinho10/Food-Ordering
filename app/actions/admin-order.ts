"use server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "../generated/prisma/browser";
const validStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];
const validPaymentStatuses: PaymentStatus[] = ["PENDING", "PAID", "FAILED"];
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  /* * Make sure the request comes from an * authenticated admin. */
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }
  /* * Validate the requested status. */ if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid order status." };
  }
  /* * Make sure the order actually exists. */ const order =
    await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

  if (!order) {
    return { success: false, error: "Order not found." };
  }
  /* * Update the order status. */ await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  /* * Refresh both the order details page * and the orders list. */ revalidatePath(
    `/admin/orders/${orderId}`,
  );
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
) {
  /* * Make sure the request comes from an * authenticated admin. */
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }
  /* * Validate the requested payment status. */ if (
    !validPaymentStatuses.includes(paymentStatus)
  ) {
    return { success: false, error: "Invalid payment status." };
  }
  /* * Make sure the order actually exists. */ const order =
    await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

  if (!order) {
    return { success: false, error: "Order not found." };
  }
  /* * Update the payment status. */ await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });
  /* * Refresh the order details page, * orders list, and dashboard. */ revalidatePath(
    `/admin/orders/${orderId}`,
  );
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
