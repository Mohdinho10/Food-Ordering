"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAblyClient } from "@/app/lib/ably";

export default function MenuRealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get("restaurant:menu");

    const handleFoodCreated = () => {
      console.log("Food created — refreshing customer menu");
      router.refresh();
    };

    const handleFoodUpdated = () => {
      console.log("Food updated — refreshing customer menu");
      router.refresh();
    };

    const handleFoodDeleted = () => {
      console.log("Food deleted — refreshing customer menu");
      router.refresh();
    };

    channel.subscribe("food.created", handleFoodCreated);
    channel.subscribe("food.updated", handleFoodUpdated);
    channel.subscribe("food.deleted", handleFoodDeleted);

    return () => {
      channel.unsubscribe("food.created", handleFoodCreated);
      channel.unsubscribe("food.updated", handleFoodUpdated);
      channel.unsubscribe("food.deleted", handleFoodDeleted);
    };
  }, [router]);

  return null;
}
