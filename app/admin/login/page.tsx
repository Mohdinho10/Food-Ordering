"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, Utensils } from "lucide-react";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SIGN IN RESULT:", result);

      if (result?.error) {
        setError("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        window.location.href = "/admin/dashboard";
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
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
                    required
                  />
                </div>
              </div>

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
                    className="w-full rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:bg-white"
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

              {error && (
                <div className="rounded-xl bg-[#FDEBEC] px-4 py-3">
                  <p className="text-sm font-medium text-[#B91621]">{error}</p>
                </div>
              )}

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
