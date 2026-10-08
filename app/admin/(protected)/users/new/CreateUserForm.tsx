"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { createUser } from "@/app/actions/admin-user";

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type CreateUserFormProps = {
  roles: Role[];
};

const PHONE_PREFIX = "+255 ";

function formatTanzaniaPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  // Remove Tanzania country code if the user pastes it.
  if (digits.startsWith("255")) {
    digits = digits.slice(3);
  }

  // Allow local numbers such as 0693275058.
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Tanzania mobile numbers have 9 digits after +255.
  digits = digits.slice(0, 9);

  return `${PHONE_PREFIX}${digits}`;
}

export default function CreateUserForm({ roles }: CreateUserFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handlePhoneChange(value: string) {
    setPhone(formatTanzaniaPhone(value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const normalizedPhone = phone.replace(/\s+/g, "");

    if (!name.trim()) {
      setError("Please enter the user's name.");
      return;
    }

    if (!/^\+255[67]\d{8}$/.test(normalizedPhone)) {
      setError(
        "Please enter a valid Tanzanian mobile number, for example +255 693 275 058.",
      );
      return;
    }

    if (!roleId) {
      setError("Please select a role.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a temporary password or PIN.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUser({
        name: name.trim(),
        phone: normalizedPhone,
        roleId,
        temporaryPassword: password.trim(),
      });

      if (!result.success) {
        setError(result.error || "Failed to create user.");
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      console.error("Create user error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#EEEEEE] bg-white p-5 sm:p-6"
    >
      <div className="grid gap-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-[#333333]"
          >
            Full Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ahmed Ali"
            disabled={isLoading}
            autoComplete="name"
            className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#333333] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-[#333333]"
          >
            Mobile Number
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => handlePhoneChange(event.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            disabled={isLoading}
            className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#333333] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
          />

          <p className="mt-2 text-xs text-[#999999]">
            Enter the 9 digits after +255, for example{" "}
            <span className="font-medium text-[#666666]">+255 693 275 058</span>
          </p>
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-semibold text-[#333333]"
          >
            Role
          </label>

          <select
            id="role"
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            disabled={isLoading}
            className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#333333] outline-none transition focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {roles.find((role) => role.id === roleId)?.description && (
            <p className="mt-2 text-xs text-[#999999]">
              {roles.find((role) => role.id === roleId)?.description}
            </p>
          )}
        </div>

        {/* Temporary Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-[#333333]"
          >
            Temporary Password / PIN
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a temporary password or PIN"
              disabled={isLoading}
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 pr-11 text-sm text-[#333333] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] transition hover:text-[#D41B27] disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-[#999999]">
            The user will be required to change this after their first login.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create User
            </>
          )}
        </button>
      </div>
    </form>
  );
}
