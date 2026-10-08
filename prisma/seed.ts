import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

console.log("DATABASE_URL exists:", !!connectionString);

if (!connectionString) {
  throw new Error("DATABASE_URL is not loaded!");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

// ============================================
// PERMISSIONS
// ============================================

const permissions = [
  {
    name: "dashboard.view",
    description: "View the admin dashboard",
  },

  {
    name: "orders.view",
    description: "View orders",
  },
  {
    name: "orders.update",
    description: "Update order status and information",
  },
  {
    name: "orders.cancel",
    description: "Cancel orders",
  },

  {
    name: "products.view",
    description: "View products",
  },
  {
    name: "products.create",
    description: "Create products",
  },
  {
    name: "products.update",
    description: "Update products",
  },
  {
    name: "products.delete",
    description: "Delete products",
  },

  {
    name: "categories.view",
    description: "View categories",
  },
  {
    name: "categories.create",
    description: "Create categories",
  },
  {
    name: "categories.update",
    description: "Update categories",
  },
  {
    name: "categories.delete",
    description: "Delete categories",
  },

  {
    name: "reports.view",
    description: "View reports",
  },

  {
    name: "users.view",
    description: "View users",
  },
  {
    name: "users.create",
    description: "Create users",
  },
  {
    name: "users.update",
    description: "Update users",
  },
  {
    name: "users.suspend",
    description: "Suspend or activate users",
  },
  {
    name: "users.delete",
    description: "Permanently delete users",
  },

  {
    name: "audit_logs.view",
    description: "View audit logs",
  },

  {
    name: "settings.view",
    description: "View restaurant settings",
  },
  {
    name: "settings.manage",
    description: "Manage restaurant settings",
  },

  {
    name: "security.manage",
    description: "Manage security and MFA settings",
  },
];

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🌱 Starting database seed...");
  console.log("");

  // ============================================
  // PERMISSIONS
  // ============================================

  console.log("Creating permissions...");

  const permissionRecords = [];

  for (const permission of permissions) {
    const record = await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: permission,
    });

    permissionRecords.push(record);
  }

  console.log(`✓ ${permissionRecords.length} permissions ready`);
  console.log("");

  // ============================================
  // ROLES
  // ============================================

  console.log("Creating roles...");

  const ownerRole = await prisma.role.upsert({
    where: {
      name: "OWNER",
    },
    update: {
      description: "Full access to the restaurant system",
    },
    create: {
      name: "OWNER",
      description: "Full access to the restaurant system",
    },
  });

  const managerRole = await prisma.role.upsert({
    where: {
      name: "MANAGER",
    },
    update: {
      description: "Manage restaurant operations and staff",
    },
    create: {
      name: "MANAGER",
      description: "Manage restaurant operations and staff",
    },
  });

  const staffRole = await prisma.role.upsert({
    where: {
      name: "STAFF",
    },
    update: {
      description: "Handle day-to-day restaurant operations",
    },
    create: {
      name: "STAFF",
      description: "Handle day-to-day restaurant operations",
    },
  });

  console.log("✓ OWNER role ready");
  console.log("✓ MANAGER role ready");
  console.log("✓ STAFF role ready");
  console.log("");

  // ============================================
  // OWNER PERMISSIONS
  // ============================================

  console.log("Assigning OWNER permissions...");

  // OWNER receives every permission, including users.delete.
  for (const permission of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✓ OWNER permissions assigned");

  // ============================================
  // MANAGER PERMISSIONS
  // ============================================

  console.log("Assigning MANAGER permissions...");

  const managerPermissions = [
    "dashboard.view",

    "orders.view",
    "orders.update",
    "orders.cancel",

    "products.view",
    "products.create",
    "products.update",
    "products.delete",

    "categories.view",
    "categories.create",
    "categories.update",
    "categories.delete",

    "reports.view",

    "users.view",
    "users.create",
    "users.update",
    "users.suspend",

    "audit_logs.view",

    "settings.view",
  ];

  for (const permissionName of managerPermissions) {
    const permission = permissionRecords.find(
      (item) => item.name === permissionName,
    );

    if (!permission) {
      throw new Error(
        `Permission "${permissionName}" was not found during seeding.`,
      );
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✓ MANAGER permissions assigned");

  // ============================================
  // STAFF PERMISSIONS
  // ============================================

  console.log("Assigning STAFF permissions...");

  const staffPermissions = ["dashboard.view", "orders.view", "orders.update"];

  for (const permissionName of staffPermissions) {
    const permission = permissionRecords.find(
      (item) => item.name === permissionName,
    );

    if (!permission) {
      throw new Error(
        `Permission "${permissionName}" was not found during seeding.`,
      );
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: staffRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: staffRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✓ STAFF permissions assigned");
  console.log("");

  // ============================================
  // OWNER ACCOUNT
  // ============================================

  console.log("Creating/updating OWNER account...");

  const passwordHash = await bcrypt.hash("mohd1234", 12);

  const existingOwner = await prisma.user.findFirst({
    where: {
      OR: [
        {
          phone: "+255693275058",
        },
        {
          email: "owner@bellavista.local",
        },
      ],
    },
  });

  if (existingOwner) {
    await prisma.user.update({
      where: {
        id: existingOwner.id,
      },
      data: {
        name: "Muhammad Abubakar",
        phone: "+255693275058",

        // Temporary compatibility with the old authentication system
        password: passwordHash,

        // New authentication system
        passwordHash,

        roleId: ownerRole.id,
        status: "ACTIVE",
        mustChangePassword: false,
      },
    });

    console.log("✓ Existing user converted to OWNER");
  } else {
    await prisma.user.create({
      data: {
        name: "Muhammad Abubakar",

        // Temporary compatibility with the old authentication system
        email: "owner@bellavista.local",
        password: passwordHash,

        // New authentication system
        phone: "+255693275058",
        passwordHash,

        roleId: ownerRole.id,
        status: "ACTIVE",
        mustChangePassword: false,
      },
    });

    console.log("✓ OWNER account created");
  }

  console.log("");

  // ============================================
  // SUMMARY
  // ============================================

  console.log("============================================");
  console.log("🌱 DATABASE SEED COMPLETED");
  console.log("============================================");
  console.log("");

  console.log("Owner:");
  console.log("Name: Muhammad Abubakar");
  console.log("Phone: +255693275058");
  console.log("Role: OWNER");
  console.log("");

  console.log("Development password: mohd1234");
  console.log("");

  console.log("Roles:");
  console.log("- OWNER");
  console.log("- MANAGER");
  console.log("- STAFF");
  console.log("");

  console.log(`Permissions: ${permissionRecords.length}`);
  console.log("");

  console.log("============================================");
}

// ============================================
// RUN
// ============================================

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
