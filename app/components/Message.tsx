"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type MessageProps = {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
};

export default function Message({ type, message, onClose }: MessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
        isSuccess
          ? "border-[#CDEAD2] bg-[#F1FAF3] text-[#247A35]"
          : "border-[#F4C7CB] bg-[#FDEBEC] text-[#B91621]"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <p className="text-sm font-medium leading-5">{message}</p>
    </div>
  );
}
