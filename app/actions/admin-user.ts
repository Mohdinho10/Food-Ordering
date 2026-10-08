"use server";

import bcrypt from "bcryptjs";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  hasPermission,
  requirePermission,
} from "@/app/lib/authorization";

type CreateUserInput = {
  name: string;
  phone: string;
  roleId: string;
  temporaryPassword: string;
};

type CreateUserResult = { success: true } | { success: false; error: string };

export async function createUser(
  input: CreateUserInput,
): Promise<CreateUserResult> {
  const currentUser = await requirePermission("users.create");

  const name = input.name.trim();
  const phone = input.phone.trim();
  const roleId = input.roleId.trim();
  const temporaryPassword = input.temporaryPassword.trim();

  if (!name) {
    return {
      success: false,
      error: "Name is required.",
    };
  }

  if (!phone) {
    return {
      success: false,
      error: "Phone number is required.",
    };
  }

  if (!roleId) {
    return {
      success: false,
      error: "Role is required.",
    };
  }

  if (temporaryPassword.length < 6) {
    return {
      success: false,
      error: "Temporary password/PIN must be at least 6 characters.",
    };
  }

  const [existingUser, role] = await Promise.all([
    prisma.user.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
      },
    }),

    prisma.role.findUnique({
      where: {
        id: roleId,
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (existingUser) {
    return {
      success: false,
      error: "A user with this phone number already exists.",
    };
  }

  if (!role) {
    return {
      success: false,
      error: "Selected role does not exist.",
    };
  }

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      roleId: role.id,

      // Transitional fields required by the current schema.
      email: `${phone.replace(/\D/g, "")}@temporary.local`,
      password: passwordHash,
      passwordHash,

      status: "INVITED",
      mustChangePassword: true,

      mfaEnabled: false,
      mfaSecret: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: "USER_CREATED",
      entity: "User",
      entityId: user.id,

      oldData: Prisma.JsonNull,

      newData: {
        name: user.name,
        phone: user.phone,
        roleId: user.roleId,
        role: role.name,
        status: user.status,
      },
    },
  });

  return {
    success: true,
  };
}

// ============================================
// UPDATE USER
// ============================================

type UpdateUserInput = {
  userId: string;
  name: string;
  phone: string;
  roleId: string;
  status: string;
};

type UpdateUserResult = { success: true } | { success: false; error: string };

export async function updateUser(
  input: UpdateUserInput,
): Promise<UpdateUserResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  const roleId = input.roleId.trim();
  const status = input.status.trim();

  if (!name) {
    return {
      success: false,
      error: "Name is required.",
    };
  }

  if (!phone) {
    return {
      success: false,
      error: "Phone number is required.",
    };
  }

  if (!roleId) {
    return {
      success: false,
      error: "Role is required.",
    };
  }

  if (!["ACTIVE", "INVITED", "SUSPENDED"].includes(status)) {
    return {
      success: false,
      error: "Invalid account status.",
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    include: {
      role: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  const isSelf = currentUser.id === targetUser.id;

  const canUpdate = await hasPermission("users.update");
  const canSuspend = await hasPermission("users.suspend");

  if (!canUpdate && !canSuspend) {
    return {
      success: false,
      error: "You do not have permission to update users.",
    };
  }

  // Role, name, and phone require users.update.
  if (
    !canUpdate &&
    (name !== targetUser.name ||
      phone !== (targetUser.phone || "") ||
      roleId !== (targetUser.roleId || ""))
  ) {
    return {
      success: false,
      error: "You do not have permission to edit this user's details.",
    };
  }

  // Status changes require users.suspend.
  if (!canSuspend && status !== targetUser.status) {
    return {
      success: false,
      error: "You do not have permission to change account status.",
    };
  }

  // Never allow a user to suspend or deactivate themselves.
  if (isSelf && status !== targetUser.status) {
    return {
      success: false,
      error: "You cannot change your own account status.",
    };
  }

  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!role) {
    return {
      success: false,
      error: "Selected role does not exist.",
    };
  }

  // Prevent duplicate phone numbers.
  const existingPhoneUser = await prisma.user.findFirst({
    where: {
      phone,
      NOT: {
        id: targetUser.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingPhoneUser) {
    return {
      success: false,
      error: "Another user already uses this phone number.",
    };
  }

  const oldData = {
    name: targetUser.name,
    phone: targetUser.phone,
    roleId: targetUser.roleId,
    role: targetUser.role?.name || null,
    status: targetUser.status,
  };

  const updatedUser = await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      ...(canUpdate
        ? {
            name,
            phone,
            roleId: role.id,
          }
        : {}),

      ...(canSuspend
        ? {
            status: status as "ACTIVE" | "INVITED" | "SUSPENDED",
          }
        : {}),
    },
    include: {
      role: true,
    },
  });

  const newData = {
    name: updatedUser.name,
    phone: updatedUser.phone,
    roleId: updatedUser.roleId,
    role: updatedUser.role?.name || null,
    status: updatedUser.status,
  };

  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: "USER_UPDATED",
      entity: "User",
      entityId: targetUser.id,
      oldData,
      newData,
    },
  });

  return {
    success: true,
  };
}

// ============================================
// RESET USER PASSWORD
// ============================================

type ResetUserPasswordInput = {
  userId: string;
  newPassword: string;
};

export async function resetUserPassword(
  input: ResetUserPasswordInput,
): Promise<UpdateUserResult> {
  const currentUser = await requirePermission("users.update");

  const newPassword = input.newPassword.trim();

  if (newPassword.length < 6) {
    return {
      success: false,
      error: "Password/PIN must be at least 6 characters.",
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      // Transitional fields.
      password: passwordHash,
      passwordHash,

      mustChangePassword: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: "USER_PASSWORD_RESET",
      entity: "User",
      entityId: targetUser.id,

      oldData: Prisma.JsonNull,

      newData: {
        passwordReset: true,
        mustChangePassword: true,
      },
    },
  });

  return {
    success: true,
  };
}

// ============================================
// RESET USER MFA
// ============================================

type ResetUserMfaInput = {
  userId: string;
};

export async function resetUserMfa(
  input: ResetUserMfaInput,
): Promise<UpdateUserResult> {
  const currentUser = await requirePermission("users.update");

  const targetUser = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      name: true,
      mfaEnabled: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  if (!targetUser.mfaEnabled) {
    return {
      success: false,
      error: "MFA is already disabled for this user.",
    };
  }

  await prisma.user.update({
    where: {
      id: targetUser.id,
    },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: "USER_MFA_RESET",
      entity: "User",
      entityId: targetUser.id,

      oldData: {
        mfaEnabled: true,
      },

      newData: {
        mfaEnabled: false,
      },
    },
  });

  return {
    success: true,
  };
}

// ============================================
// DELETE USER
// ============================================

type DeleteUserInput = {
  userId: string;
};

export async function deleteUser(
  input: DeleteUserInput,
): Promise<UpdateUserResult> {
  const currentUser = await requirePermission("users.delete");

  // Never allow an administrator to delete their own account.
  if (currentUser.id === input.userId) {
    return {
      success: false,
      error: "You cannot delete your own account.",
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    include: {
      role: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  // Capture the user's information before deletion
  // so it remains available in the audit trail.
  const deletedUserData = {
    name: targetUser.name,
    phone: targetUser.phone,
    email: targetUser.email,
    roleId: targetUser.roleId,
    role: targetUser.role?.name || null,
    status: targetUser.status,
    mfaEnabled: targetUser.mfaEnabled,
  };

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_DELETED",
        entity: "User",
        entityId: targetUser.id,

        oldData: deletedUserData,

        newData: Prisma.JsonNull,
      },
    });

    await tx.user.delete({
      where: {
        id: targetUser.id,
      },
    });
  });

  return {
    success: true,
  };
}
