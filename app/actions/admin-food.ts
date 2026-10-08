"use server";

import Ably from "ably";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import cloudinary from "@/app/lib/cloudinary";
import { requirePermission } from "@/app/lib/authorization";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

// ----------------------------------------
// Cloudinary helpers
// ----------------------------------------

function extractCloudinaryPublicId(imageUrl: string) {
  try {
    const url = new URL(imageUrl);

    const uploadIndex = url.pathname.indexOf("/upload/");

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = url.pathname.slice(uploadIndex + "/upload/".length);

    const parts = publicId.split("/");

    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));

    if (versionIndex !== -1) {
      publicId = parts.slice(versionIndex + 1).join("/");
    }

    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
}

async function deleteCloudinaryImage(imageUrl: string | null) {
  if (!imageUrl) {
    return;
  }

  const publicId = extractCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("CLOUDINARY DELETE ERROR:", error);
  }
}

// ----------------------------------------
// Ably realtime helper
// ----------------------------------------

async function publishFoodEvent(
  event: "food.created" | "food.updated" | "food.deleted",
  foodId: string,
) {
  const ablyApiKey = process.env.ABLY_API_KEY;

  if (!ablyApiKey) {
    console.error("ABLY_API_KEY is not configured.");
    return;
  }

  try {
    const ably = new Ably.Rest({
      key: ablyApiKey,
    });

    const channel = ably.channels.get("restaurant:menu");

    await channel.publish(event, {
      foodId,
    });

    console.log(`Realtime ${event} event published:`, foodId);
  } catch (error) {
    console.error(`Ably ${event} error:`, error);
  }
}

// ----------------------------------------
// Create Food
// ----------------------------------------

export async function createFood(formData: FormData) {
  await requirePermission("products.create");

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceValue = String(formData.get("price") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const image = formData.get("image");

  if (!name) {
    return {
      success: false,
      error: "Food name is required.",
    };
  }

  if (name.length > 100) {
    return {
      success: false,
      error: "Food name must be 100 characters or less.",
    };
  }

  if (!priceValue) {
    return {
      success: false,
      error: "Price is required.",
    };
  }

  const price = Number(priceValue);

  if (!Number.isFinite(price) || price <= 0) {
    return {
      success: false,
      error: "Please enter a valid price greater than 0.",
    };
  }

  if (!categoryId) {
    return {
      success: false,
      error: "Please select a category.",
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      success: false,
      error: "Selected category does not exist.",
    };
  }

  if (!(image instanceof File) || image.size === 0) {
    return {
      success: false,
      error: "Please select a food image.",
    };
  }

  if (!allowedImageTypes.includes(image.type)) {
    return {
      success: false,
      error: "Only JPG, PNG, and WebP images are allowed.",
    };
  }

  if (image.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "Image must be 5MB or smaller.",
    };
  }

  try {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "bella-vista/foods",
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
          });
        },
      );

      uploadStream.end(buffer);
    });

    const food = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        image: uploadResult.secure_url,
        categoryId,
        available: true,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/admin/foods");

    await publishFoodEvent("food.created", food.id);
  } catch (error) {
    console.error("CREATE FOOD ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while creating the food.",
    };
  }

  redirect("/admin/foods");
}

// ----------------------------------------
// Update Food
// ----------------------------------------

export async function updateFood(foodId: string, formData: FormData) {
  await requirePermission("products.update");

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const existingFood = await prisma.product.findUnique({
    where: {
      id: foodId,
    },
    select: {
      id: true,
      image: true,
    },
  });

  if (!existingFood) {
    return {
      success: false,
      error: "Food not found.",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceValue = String(formData.get("price") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const image = formData.get("image");

  if (!name) {
    return {
      success: false,
      error: "Food name is required.",
    };
  }

  if (name.length > 100) {
    return {
      success: false,
      error: "Food name must be 100 characters or less.",
    };
  }

  if (!priceValue) {
    return {
      success: false,
      error: "Price is required.",
    };
  }

  const price = Number(priceValue);

  if (!Number.isFinite(price) || price <= 0) {
    return {
      success: false,
      error: "Please enter a valid price greater than 0.",
    };
  }

  if (!categoryId) {
    return {
      success: false,
      error: "Please select a category.",
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      success: false,
      error: "Selected category does not exist.",
    };
  }

  const hasNewImage = image instanceof File && image.size > 0;

  if (hasNewImage) {
    if (!allowedImageTypes.includes(image.type)) {
      return {
        success: false,
        error: "Only JPG, PNG, and WebP images are allowed.",
      };
    }

    if (image.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Image must be 5MB or smaller.",
      };
    }
  }

  try {
    let imageUrl = existingFood.image;

    if (hasNewImage) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<{
        secure_url: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "bella-vista/foods",
            resource_type: "image",
            transformation: [
              {
                width: 1200,
                height: 1200,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed."));
              return;
            }

            resolve({
              secure_url: result.secure_url,
            });
          },
        );

        uploadStream.end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    await prisma.product.update({
      where: {
        id: foodId,
      },
      data: {
        name,
        description: description || null,
        price,
        categoryId,
        image: imageUrl,
      },
    });

    if (hasNewImage && existingFood.image) {
      await deleteCloudinaryImage(existingFood.image);
    }

    revalidatePath("/admin/foods");
    revalidatePath(`/admin/foods/${foodId}/edit`);

    await publishFoodEvent("food.updated", foodId);
  } catch (error) {
    console.error("UPDATE FOOD ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while updating the food.",
    };
  }

  redirect("/admin/foods");
}

// ----------------------------------------
// Update Food Availability
// ----------------------------------------

export async function updateFoodAvailability(
  foodId: string,
  available: boolean,
) {
  await requirePermission("products.update");

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const food = await prisma.product.findUnique({
    where: {
      id: foodId,
    },
    select: {
      id: true,
    },
  });

  if (!food) {
    return {
      success: false,
      error: "Food not found.",
    };
  }

  try {
    await prisma.product.update({
      where: {
        id: foodId,
      },
      data: {
        available,
      },
    });

    revalidatePath("/admin/foods");

    await publishFoodEvent("food.updated", foodId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("UPDATE FOOD AVAILABILITY ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while updating food availability.",
    };
  }
}

// ----------------------------------------
// Delete Food
// ----------------------------------------

export async function deleteFood(foodId: string) {
  await requirePermission("products.delete");

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const food = await prisma.product.findUnique({
    where: {
      id: foodId,
    },
    select: {
      id: true,
      name: true,
      image: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  if (!food) {
    return {
      success: false,
      error: "Food not found.",
    };
  }

  if (food._count.orderItems > 0) {
    return {
      success: false,
      error:
        "This food cannot be permanently deleted because it has already been used in an order. Mark it as unavailable instead.",
    };
  }

  try {
    await prisma.product.delete({
      where: {
        id: foodId,
      },
    });

    if (food.image) {
      await deleteCloudinaryImage(food.image);
    }

    revalidatePath("/admin/foods");

    await publishFoodEvent("food.deleted", foodId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE FOOD ERROR:", error);

    return {
      success: false,
      error: "Something went wrong while deleting the food.",
    };
  }
}
