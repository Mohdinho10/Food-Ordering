"use server";

import Ably from "ably";
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

/**
 * Publish an order.updated event through Ably.
 *
 * Realtime should never prevent the database update from succeeding.
 */
async function publishOrderUpdated(orderId: string) {
  const ablyApiKey = process.env.ABLY_API_KEY;

  if (!ablyApiKey) {
    console.error("ABLY_API_KEY is not configured.");
    return;
  }

  try {
    const ably = new Ably.Rest({
      key: ablyApiKey,
    });

    const channel = ably.channels.get("restaurant:orders");

    await channel.publish("order.updated", {
      orderId,
    });

    console.log("Realtime order.updated event published:", orderId);
  } catch (error) {
    // Do not fail the order update if Ably has a problem.
    console.error("Ably order.updated error:", error);
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  // ==================== AUTHENTICATION ====================

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  // ==================== VALIDATE STATUS ====================

  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error: "Invalid order status.",
    };
  }

  // ==================== CHECK ORDER ====================

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!order) {
    return {
      success: false,
      error: "Order not found.",
    };
  }

  // ==================== UPDATE ORDER ====================

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
    },
  });

  // ==================== REFRESH ADMIN PAGES ====================

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");

  // ==================== REALTIME UPDATE ====================

  await publishOrderUpdated(orderId);

  // ==================== SUCCESS ====================

  return {
    success: true,
  };
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
) {
  // ==================== AUTHENTICATION ====================

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  // ==================== VALIDATE PAYMENT STATUS ====================

  if (!validPaymentStatuses.includes(paymentStatus)) {
    return {
      success: false,
      error: "Invalid payment status.",
    };
  }

  // ==================== CHECK ORDER ====================

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!order) {
    return {
      success: false,
      error: "Order not found.",
    };
  }

  // ==================== UPDATE PAYMENT STATUS ====================

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus,
    },
  });

  // ==================== REFRESH ADMIN PAGES ====================

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");

  // ==================== REALTIME UPDATE ====================

  await publishOrderUpdated(orderId);

  // ==================== SUCCESS ====================

  return {
    success: true,
  };
}
