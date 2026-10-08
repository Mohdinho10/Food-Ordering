"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogIn,
  Phone,
  ShieldCheck,
  Utensils,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        phone: phone.trim(),
        password,
        mfaCode: useRecoveryCode ? "" : mfaCode.trim(),
        recoveryCode: useRecoveryCode ? recoveryCode.trim() : "",
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Unable to sign in. Check your phone number, password, and MFA code.",
        );
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }

      setError("Unable to sign in. Please try again.");
      setIsLoading(false);
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D41B27] shadow-[0_8px_24px_rgba(212,27,39,0.2)]">
              <Utensils className="h-8 w-8 text-white" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
              Bella Vista
            </h1>

            <p className="mt-1 text-sm text-[#777777]">Restaurant Admin</p>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-[#1F1F1F]">Welcome Back</h2>

              <p className="mt-1.5 text-sm leading-5 text-[#777777]">
                Sign in to manage your restaurant.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+255 693 275 058"
                    className="scheme-light w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="scheme-light w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-12 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#999999] transition hover:bg-[#FDEBEC] hover:text-[#D41B27]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* MFA */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor={useRecoveryCode ? "recoveryCode" : "mfaCode"}
                    className="block text-sm font-semibold text-[#1F1F1F]"
                  >
                    {useRecoveryCode ? "Recovery Code" : "Authenticator Code"}
                  </label>

                  <ShieldCheck className="h-4 w-4 text-[#D41B27]" />
                </div>

                {!useRecoveryCode ? (
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                    <input
                      id="mfaCode"
                      name="mfaCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(event) =>
                        setMfaCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="6-digit code"
                      className="scheme-light w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-4 text-sm tracking-[0.25em] text-[#1F1F1F] outline-none transition placeholder:tracking-normal placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                    <input
                      id="recoveryCode"
                      name="recoveryCode"
                      type="text"
                      autoComplete="off"
                      maxLength={19}
                      value={recoveryCode}
                      onChange={(event) =>
                        setRecoveryCode(
                          event.target.value
                            .toUpperCase()
                            .replace(/[^A-F0-9-]/g, "")
                            .slice(0, 19),
                        )
                      }
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="scheme-light w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-4 text-sm tracking-wider text-[#1F1F1F] outline-none transition placeholder:tracking-normal placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUseRecoveryCode((value) => !value);
                    setMfaCode("");
                    setRecoveryCode("");
                  }}
                  className="mt-2 cursor-pointer text-xs font-semibold text-[#D41B27] hover:text-[#B91621]"
                >
                  {useRecoveryCode
                    ? "Use authenticator code instead"
                    : "Use a recovery code instead"}
                </button>

                <p className="mt-2 text-xs leading-5 text-[#999999]">
                  MFA is required after your account is enrolled.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-[#FDEBEC] px-4 py-3">
                  <p className="text-sm font-medium text-[#B91621]">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogIn className="h-4 w-4" />

                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-[#FAFAFA] px-4 py-3">
              <div className="flex items-start gap-2">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#999999]" />

                <p className="text-xs leading-5 text-[#777777]">
                  This area is restricted to authorized restaurant staff.
                  Multi-factor authentication protects every staff account.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#AAAAAA]">
            Bella Vista Restaurant Management
          </p>
        </div>
      </div>
    </main>
  );
}
