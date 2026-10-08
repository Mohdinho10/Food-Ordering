"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
  Utensils,
} from "lucide-react";

type SetupResponse = {
  qrCode: string;
  secret: string;
};

type VerifyResponse = {
  success: boolean;
  recoveryCodes: string[];
};

export default function MfaSetupPage() {
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState("");

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const startSetup = async () => {
      try {
        const response = await fetch("/api/admin/mfa/setup", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to start MFA setup.");
          return;
        }

        setSetup(data);
      } catch (error) {
        console.error("MFA SETUP ERROR:", error);
        setError("Unable to start MFA setup.");
      } finally {
        setIsLoading(false);
      }
    };

    startSetup();
  }, []);

  const handleVerify = async () => {
    setError("");

    const cleanCode = code.replace(/\D/g, "");

    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/admin/mfa/setup/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: cleanCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to verify MFA.");
        setIsVerifying(false);
        return;
      }

      setRecoveryCodes(data.recoveryCodes);
    } catch (error) {
      console.error("MFA VERIFY ERROR:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleContinue = async () => {
    await signOut({
      callbackUrl: "/admin/login",
    });
  };

  if (recoveryCodes.length > 0) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D41B27] shadow-[0_8px_24px_rgba(212,27,39,0.2)]">
                <Check className="h-8 w-8 text-white" />
              </div>

              <h1 className="mt-6 text-2xl font-bold text-[#1F1F1F]">
                MFA Enabled
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777777]">
                Your authenticator app is now connected to your Bella Vista
                account.
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="rounded-2xl border border-[#F2D7D9] bg-[#FDEBEC] p-5">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-[#D41B27]" />

                  <div>
                    <h2 className="text-sm font-bold text-[#1F1F1F]">
                      Save your recovery codes
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#777777]">
                      Each recovery code can be used once if you lose access to
                      your authenticator app. Store them somewhere safe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {recoveryCodes.map((recoveryCode) => (
                  <div
                    key={recoveryCode}
                    className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 text-center font-mono text-sm font-semibold tracking-wider text-[#1F1F1F]"
                  >
                    {recoveryCode}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm font-semibold text-[#555555] transition hover:border-[#D41B27] hover:text-[#D41B27]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Recovery Codes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-full bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
              >
                Continue to Sign In
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#999999]">
                You will need your authenticator code the next time you sign in.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D41B27] shadow-[0_8px_24px_rgba(212,27,39,0.2)]">
              <Utensils className="h-8 w-8 text-white" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#1F1F1F]">
              Secure Your Account
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777777]">
              Multi-factor authentication is required for all Bella Vista staff
              accounts.
            </p>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#D41B27]" />

                <p className="mt-4 text-sm text-[#777777]">
                  Preparing secure setup...
                </p>
              </div>
            ) : error && !setup ? (
              <div className="rounded-2xl bg-[#FDEBEC] p-5">
                <p className="text-sm font-medium text-[#B91621]">{error}</p>
              </div>
            ) : setup ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEBEC]">
                    <Smartphone className="h-5 w-5 text-[#D41B27]" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#1F1F1F]">
                      1. Install an authenticator app
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#777777]">
                      Use Google Authenticator, Microsoft Authenticator, or
                      another compatible TOTP authenticator.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEBEC]">
                    <ShieldCheck className="h-5 w-5 text-[#D41B27]" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#1F1F1F]">
                      2. Scan this QR code
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#777777]">
                      Open your authenticator app and scan the QR code below.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="rounded-2xl border border-[#EEEEEE] bg-white p-4">
                    <img
                      src={setup.qrCode}
                      alt="MFA setup QR code"
                      className="h-64 w-64"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#FAFAFA] p-4">
                  <p className="text-center text-xs font-semibold text-[#777777]">
                    Can&apos;t scan the QR code?
                  </p>

                  <p className="mt-2 break-all text-center font-mono text-xs font-semibold tracking-wider text-[#1F1F1F]">
                    {setup.secret}
                  </p>
                </div>

                <div className="mt-7">
                  <label
                    htmlFor="mfaCode"
                    className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                  >
                    3. Enter the 6-digit code
                  </label>

                  <input
                    id="mfaCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-4 text-center text-lg font-semibold tracking-[0.5em] text-[#1F1F1F] outline-none transition placeholder:tracking-normal placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                  />
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-[#FDEBEC] px-4 py-3">
                    <p className="text-sm font-medium text-[#B91621]">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}

                  {isVerifying
                    ? "Verifying..."
                    : "Enable Multi-Factor Authentication"}
                </button>
              </>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-[#AAAAAA]">
            Bella Vista Restaurant Management
          </p>
        </div>
      </div>
    </main>
  );
}
