"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { createUser } from "@/app/actions/admin-user";

// import { createUser } from "@/app/actions/admin-user";

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  roles: Role[];
};

export default function CreateUserForm({ roles }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter the user's name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter the user's phone number.");
      return;
    }

    if (!roleId) {
      setError("Please select a role.");
      return;
    }

    if (!temporaryPassword) {
      setError("Please enter a temporary password or PIN.");
      return;
    }

    if (temporaryPassword.length < 6) {
      setError("The temporary password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUser({
        name: name.trim(),
        phone: phone.trim(),
        roleId,
        temporaryPassword,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("User created successfully.");

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      console.error("Create user error:", error);
      setError("Something went wrong while creating the user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-[#333333]"
        >
          Full name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ahmed Hassan"
          autoComplete="name"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl border border-[#E2E2E2] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-semibold text-[#333333]"
        >
          Phone number
        </label>

        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="e.g. 0712 345 678"
          autoComplete="tel"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl border border-[#E2E2E2] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
        />

        <p className="mt-1.5 text-xs text-[#999999]">
          Used to identify the staff member when logging in.
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
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl border border-[#E2E2E2] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
        >
          <option value="">Select a role</option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        {roleId && (
          <div className="mt-2 rounded-xl bg-[#FAFAFA] px-4 py-3">
            <p className="text-xs leading-5 text-[#888888]">
              {roles.find((role) => role.id === roleId)?.description ||
                "This role controls what the user can access in the admin panel."}
            </p>
          </div>
        )}
      </div>

      {/* Temporary password */}
      <div>
        <label
          htmlFor="temporaryPassword"
          className="mb-2 block text-sm font-semibold text-[#333333]"
        >
          Temporary password / PIN
        </label>

        <div className="relative">
          <input
            id="temporaryPassword"
            type={showPassword ? "text" : "password"}
            value={temporaryPassword}
            onChange={(event) => setTemporaryPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-[#E2E2E2] bg-white px-4 pr-12 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#FDEBEC] disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            disabled={isSubmitting}
            aria-label={
              showPassword
                ? "Hide temporary password"
                : "Show temporary password"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#999999] transition hover:bg-[#F5F5F5] hover:text-[#555555]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-[#999999]">
          Give this temporary password to the staff member securely. They will
          be required to change it after their first login.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[#F3C4C7] bg-[#FDEBEC] px-4 py-3">
          <p className="text-sm font-medium text-[#B91621]">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-[#C7E8D2] bg-[#EAF8EF] px-4 py-3">
          <p className="text-sm font-medium text-[#237A42]">{success}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-[#EEEEEE] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          disabled={isSubmitting}
          className="h-11 rounded-xl border border-[#E2E2E2] px-5 text-sm font-semibold text-[#555555] transition hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
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
