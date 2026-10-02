"use client";

import { useEffect, useState } from "react";
import { getAblyClient } from "@/app/lib/ably";
import type { InboundMessage } from "ably";

type TestMessage = {
  text: string;
  sender: string;
};

export default function RealtimeTestPage() {
  const [status, setStatus] = useState("Connecting...");
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getAblyClient();
    const channel = client.channels.get("restaurant:test");

    const handleStateChange = (stateChange: { current: string }) => {
      console.log("Ably connection:", stateChange);

      setStatus(stateChange.current);
    };

    const handleMessage = (message: InboundMessage) => {
      console.log("Received message:", message);

      if (!message.data) {
        return;
      }

      if (
        typeof message.data !== "object" ||
        !("text" in message.data) ||
        !("sender" in message.data)
      ) {
        return;
      }

      const data = message.data as TestMessage;

      setMessages((current) => [
        ...current,
        {
          text: data.text,
          sender: data.sender,
        },
      ]);
    };

    client.connection.on(handleStateChange);

    channel.subscribe("test-message", handleMessage);

    return () => {
      channel.unsubscribe("test-message", handleMessage);
      client.connection.off(handleStateChange);
    };
  }, []);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    try {
      const client = getAblyClient();
      const channel = client.channels.get("restaurant:test");

      await channel.publish("test-message", {
        text: trimmedMessage,
        sender: "This browser",
      });

      setMessage("");
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-5 py-12">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">Realtime Test</h1>

          <p className="mt-2 text-sm text-[#777777]">
            Testing communication between browsers through Ably.
          </p>

          <div className="mt-6 rounded-2xl bg-[#FAFAFA] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#999999]">
              Connection Status
            </p>

            <p
              className={`mt-2 text-lg font-bold ${
                status === "connected" ? "text-green-600" : "text-[#D41B27]"
              }`}
            >
              {status}
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type a test message..."
              className="min-w-0 flex-1 rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
            />

            <button
              type="button"
              onClick={sendMessage}
              className="cursor-pointer rounded-xl bg-[#D41B27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91621]"
            >
              Send
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#999999]">
              Messages
            </p>

            <div className="mt-3 space-y-2">
              {messages.length === 0 ? (
                <div className="rounded-xl bg-[#FAFAFA] px-4 py-3 text-sm text-[#999999]">
                  No messages yet.
                </div>
              ) : (
                messages.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-[#FDEBEC] px-4 py-3"
                  >
                    <p className="text-sm font-medium text-[#1F1F1F]">
                      {item.text}
                    </p>

                    <p className="mt-1 text-xs text-[#999999]">{item.sender}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
