"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAblyClient } from "@/app/lib/ably";
import type { InboundMessage } from "ably";

export default function DashboardRealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    const client = getAblyClient();
    const channel = client.channels.get("restaurant:orders");

    const handleMessage = (message: InboundMessage) => {
      if (
        message.name !== "order.created" &&
        message.name !== "order.updated"
      ) {
        return;
      }

      console.log("Dashboard realtime update:", message.name, message.data);

      router.refresh();
    };

    channel.subscribe("order.created", handleMessage);
    channel.subscribe("order.updated", handleMessage);

    return () => {
      channel.unsubscribe("order.created", handleMessage);
      channel.unsubscribe("order.updated", handleMessage);
    };
  }, [router]);

  return null;
}
