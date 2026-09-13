import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone = body.phone?.trim();

    if (!phone) {
      return NextResponse.json(
        {
          error: "Please enter your phone number.",
        },
        { status: 400 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        customerPhone: phone,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        customerName: true,
        orderType: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Track orders error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while finding your orders.",
      },
      { status: 500 },
    );
  }
}
