"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
  UserX,
} from "lucide-react";

import {
  deleteUser,
  resetUserMfa,
  resetUserPassword,
  updateUser,
} from "@/app/actions/admin-user";

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type UserData = {
  id: string;
  name: string;
  phone: string;
  roleId: string;
  roleName: string;
  status: string;
  mfaEnabled: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

type Props = {
  user: UserData;
  roles: Role[];
  permissions: {
    canUpdate: boolean;
    canSuspend: boolean;
    canDelete: boolean;
  };
  isSelf: boolean;
};

export default function EditUserForm({
  user,
  roles,
  permissions,
  isSelf,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [roleId, setRoleId] = useState(user.roleId);
  const [status, setStatus] = useState(user.status);

  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resettingMfa, setResettingMfa] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showMessage = (message: string) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  async function handleSave() {
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!permissions.canUpdate && !permissions.canSuspend) {
      setError("You do not have permission to update this user.");
      return;
    }

    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    if (!cleanPhone) {
      setError("Phone number is required.");
      return;
    }

    if (!roleId) {
      setError("Please select a role.");
      return;
    }

    setSaving(true);

    try {
      const result = await updateUser({
        userId: user.id,
        name: cleanName,
        phone: cleanPhone,
        roleId,
        status,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      showMessage("User updated successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong while updating the user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    setSuccess("");

    if (!permissions.canUpdate) {
      setError("You do not have permission to reset passwords.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password/PIN must be at least 6 characters.");
      return;
    }

    setResettingPassword(true);

    try {
      const result = await resetUserPassword({
        userId: user.id,
        newPassword,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNewPassword("");
      showMessage(
        "Password reset successfully. The user will be required to change it when they sign in.",
      );
    } catch {
      setError("Something went wrong while resetting the password.");
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleResetMfa() {
    setError("");
    setSuccess("");

    if (!permissions.canUpdate) {
      setError("You do not have permission to reset MFA.");
      return;
    }

    const confirmed = window.confirm(
      "Reset MFA for this user?\n\nThey will need to set up MFA again the next time they access the admin panel.",
    );

    if (!confirmed) return;

    setResettingMfa(true);

    try {
      const result = await resetUserMfa({
        userId: user.id,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      showMessage("MFA has been reset successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong while resetting MFA.");
    } finally {
      setResettingMfa(false);
    }
  }

  async function handleDelete() {
    setError("");
    setSuccess("");

    if (!permissions.canDelete) {
      setError("You do not have permission to delete users.");
      return;
    }

    if (isSelf) {
      setError("You cannot delete your own account.");
      return;
    }

    const firstConfirm = window.confirm(
      `Delete ${user.name} permanently?\n\nThis action cannot be undone.`,
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "Are you absolutely sure? All login access for this user will be removed.",
    );

    if (!secondConfirm) return;

    setDeleting(true);

    try {
      const result = await deleteUser({
        userId: user.id,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Something went wrong while deleting the user.");
    } finally {
      setDeleting(false);
    }
  }

  const hasChanges =
    name !== user.name ||
    phone !== user.phone ||
    roleId !== user.roleId ||
    status !== user.status;

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Account */}
      <section className="rounded-2xl border border-[#EEEEEE] bg-white shadow-sm">
        <div className="border-b border-[#EEEEEE] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEBEC] text-[#D41B27]">
              <UserRound className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#1F1F1F]">
                Account Information
              </h2>
              <p className="mt-0.5 text-xs text-[#999999]">
                Basic information and access level.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555555]">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!permissions.canUpdate || saving}
              placeholder="Enter full name"
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10 disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555555]">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={!permissions.canUpdate || saving}
              placeholder="+255..."
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10 disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
            />

            <p className="mt-1.5 text-[11px] text-[#999999]">
              The phone number is used as the user&apos;s login identifier.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555555]">
              Role
            </label>

            <select
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              disabled={!permissions.canUpdate || saving}
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10 disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
            >
              <option value="">Select role</option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#555555]">
              Account Status
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={!permissions.canSuspend || saving || isSelf}
              className="h-11 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10 disabled:cursor-not-allowed disabled:bg-[#F8F8F8]"
            >
              <option value="ACTIVE">Active</option>
              <option value="INVITED">Invited</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {isSelf && (
              <p className="mt-1.5 text-[11px] text-[#999999]">
                You cannot suspend your own account.
              </p>
            )}
          </div>

          {/* Save */}
          {(permissions.canUpdate || permissions.canSuspend) && (
            <div className="flex justify-end border-t border-[#EEEEEE] pt-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  (!hasChanges &&
                    permissions.canUpdate &&
                    permissions.canSuspend)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-5 text-sm font-semibold text-white transition hover:bg-[#B91621] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-[#EEEEEE] bg-white shadow-sm">
        <div className="border-b border-[#EEEEEE] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEBEC] text-[#D41B27]">
              <LockKeyhole className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#1F1F1F]">Security</h2>
              <p className="mt-0.5 text-xs text-[#999999]">
                Manage password and multi-factor authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Password reset */}
          <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#666666]">
                <KeyRound className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#1F1F1F]">
                  Reset Password / PIN
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#888888]">
                  Set a temporary password for this user. They will be required
                  to change it after signing in.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={!permissions.canUpdate || resettingPassword}
                    placeholder="New password or PIN"
                    className="h-10 flex-1 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm text-[#1F1F1F] outline-none placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10 disabled:cursor-not-allowed disabled:bg-[#F5F5F5]"
                  />

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={
                      !permissions.canUpdate ||
                      resettingPassword ||
                      !newPassword
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D41B27] px-4 text-xs font-semibold text-[#D41B27] transition hover:bg-[#FDEBEC] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resettingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MFA */}
          <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#666666]">
                {user.mfaEnabled ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldOff className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#1F1F1F]">
                    Multi-Factor Authentication
                  </h3>

                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                      user.mfaEnabled
                        ? "bg-green-50 text-green-700"
                        : "bg-[#EEEEEE] text-[#777777]"
                    }`}
                  >
                    {user.mfaEnabled ? "Enabled" : "Not Enabled"}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-[#888888]">
                  Resetting MFA removes the user&apos;s current authenticator
                  setup. They will need to configure MFA again.
                </p>

                <button
                  type="button"
                  onClick={handleResetMfa}
                  disabled={
                    !permissions.canUpdate || resettingMfa || !user.mfaEnabled
                  }
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 text-xs font-semibold text-[#555555] transition hover:border-[#D41B27] hover:text-[#D41B27] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resettingMfa ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldOff className="h-4 w-4" />
                  )}
                  Reset MFA
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      {permissions.canDelete && (
        <section className="rounded-2xl border border-red-200 bg-white shadow-sm">
          <div className="border-b border-red-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <UserX className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-red-700">Danger Zone</h2>

                <p className="mt-0.5 text-xs text-[#999999]">
                  Actions that can affect this user&apos;s account permanently.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1F1F1F]">
                  Delete User
                </h3>

                <p className="mt-1 max-w-xl text-xs leading-5 text-[#888888]">
                  Permanently remove this user&apos;s account and login access.
                  Audit history will remain in the system.
                </p>

                {isSelf && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    You cannot delete your own account.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || isSelf}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete User
              </button>
            </div>
          </div>
        </section>
      )}

      {/* No permissions */}
      {!permissions.canUpdate &&
        !permissions.canSuspend &&
        !permissions.canDelete && (
          <div className="rounded-2xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#BBBBBB]" />

            <h2 className="mt-3 text-sm font-bold text-[#1F1F1F]">View Only</h2>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#888888]">
              You can view this user&apos;s information, but you don&apos;t have
              permission to make changes.
            </p>
          </div>
        )}
    </div>
  );
}
