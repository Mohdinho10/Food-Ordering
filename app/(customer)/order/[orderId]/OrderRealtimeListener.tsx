"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAblyClient } from "@/app/lib/ably";
import type { InboundMessage } from "ably";

type OrderRealtimeListenerProps = {
  orderId: string;
};

export default function OrderRealtimeListener({
  orderId,
}: OrderRealtimeListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const client = getAblyClient();
    const channel = client.channels.get("restaurant:orders");

    const handleMessage = (message: InboundMessage) => {
      if (message.name !== "order.updated") {
        return;
      }

      const updatedOrderId = message.data?.orderId;

      // Only refresh if this event belongs to
      // the order currently being viewed.
      if (updatedOrderId !== orderId) {
        return;
      }

      console.log("Order updated:", updatedOrderId);

      router.refresh();
    };

    channel.subscribe("order.updated", handleMessage);

    return () => {
      channel.unsubscribe("order.updated", handleMessage);
    };
  }, [orderId, router]);

  return null;
}
