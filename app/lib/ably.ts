"use client";

import * as Ably from "ably";

let ablyClient: Ably.Realtime | null = null;

export function getAblyClient() {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: "/api/ably/token",
      authMethod: "GET",
    });
  }

  return ablyClient;
}
