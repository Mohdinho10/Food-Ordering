import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";
type FulfillmentTime = "ASAP" | "SCHEDULED";
type PaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD";

type OrderRequest = {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  orderType: OrderType;
  fulfillmentTime: FulfillmentTime;
  scheduledAt?: string;
  partySize?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: {
    id: string;
    quantity: number;
  }[];
};

export async function POST(request: Request) {
  try {
    const body: OrderRequest = await request.json();

    const {
      customerName,
      customerPhone,
      customerAddress,
      orderType,
      fulfillmentTime,
      scheduledAt,
      partySize,
      paymentMethod,
      notes,
      items,
    } = body;

    // Normalize the phone number by removing spaces.
    // Example:
    // +255 700 123 456 -> +255700123456
    const normalizedPhone = customerPhone?.replace(/\s+/g, "");

    // ==================== BASIC VALIDATION ====================

    if (!customerName?.trim()) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 },
      );
    }

    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Please enter your phone number." },
        { status: 400 },
      );
    }

    // Tanzania mobile number validation.
    // Accepts numbers such as:
    // +255700123456
    // +255710123456
    // +255650123456
    if (!/^\+255[67]\d{8}$/.test(normalizedPhone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Tanzanian phone number starting with +255, e.g. +255 700 123 456.",
        },
        { status: 400 },
      );
    }

    if (!orderType) {
      return NextResponse.json(
        {
          error: "Please select how you would like to receive your order.",
        },
        { status: 400 },
      );
    }

    if (!fulfillmentTime) {
      return NextResponse.json(
        { error: "Please select when you would like your order." },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Please select a payment method." },
        { status: 400 },
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    if (orderType === "DELIVERY" && !customerAddress?.trim()) {
      return NextResponse.json(
        { error: "Please enter your delivery address." },
        { status: 400 },
      );
    }

    if (orderType === "DINE_IN" && !partySize) {
      return NextResponse.json(
        { error: "Please select the number of people." },
        { status: 400 },
      );
    }

    if (fulfillmentTime === "SCHEDULED" && !scheduledAt) {
      return NextResponse.json(
        { error: "Please select a date and time for your order." },
        { status: 400 },
      );
    }

    // ==================== GET REAL PRODUCTS FROM DATABASE ====================

    const productIds = items.map((item) => item.id);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        available: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        {
          error: "One or more items in your cart are no longer available.",
        },
        { status: 400 },
      );
    }

    // ==================== CALCULATE TOTAL USING DB PRICES ====================

    let total = 0;

    const orderItems = items.map((item) => {
      const product = products.find((product) => product.id === item.id);

      if (!product) {
        throw new Error("Product not found.");
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error("Invalid item quantity.");
      }

      const price = Number(product.price);

      total += price * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // ==================== CREATE ORDER + ORDER ITEMS ====================

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),

        // Store the normalized phone number.
        // Example:
        // +255 700 123 456 -> +255700123456
        customerPhone: normalizedPhone,

        customerAddress:
          orderType === "DELIVERY" ? customerAddress?.trim() || null : null,

        orderType,

        fulfillmentTime,

        scheduledAt:
          fulfillmentTime === "SCHEDULED" ? new Date(scheduledAt!) : null,

        partySize: orderType === "DINE_IN" ? Number(partySize) : null,

        notes: notes?.trim() || null,

        paymentMethod,

        total,

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // ==================== SUCCESS ====================

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while placing your order.",
      },
      { status: 500 },
    );
  }
}
