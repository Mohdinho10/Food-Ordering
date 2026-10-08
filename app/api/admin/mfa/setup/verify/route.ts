import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import {
  decryptMfaSecret,
  formatRecoveryCode,
  generateRecoveryCode,
} from "@/app/lib/mfa";
import bcrypt from "bcryptjs";
import { verify } from "otplib";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const code =
      typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";

    if (!/^\d{6}$/.test(code)) {
      return Response.json(
        { error: "Enter a valid 6-digit code." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.mfaEnabled) {
      return Response.json(
        { error: "MFA is already enabled." },
        { status: 409 },
      );
    }

    if (!user.mfaSecret) {
      return Response.json(
        { error: "MFA setup has not been started." },
        { status: 400 },
      );
    }

    let secret: string;

    try {
      secret = decryptMfaSecret(user.mfaSecret);
    } catch {
      return Response.json(
        { error: "MFA setup is invalid. Please restart setup." },
        { status: 400 },
      );
    }

    const result = await verify({
      secret,
      token: code,
    });

    if (!result.valid) {
      return Response.json(
        { error: "Incorrect authenticator code." },
        { status: 400 },
      );
    }

    const recoveryCodes = Array.from({ length: 10 }, () =>
      generateRecoveryCode(),
    );

    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map(async (code) => ({
        codeHash: await bcrypt.hash(code, 12),
      })),
    );

    await prisma.$transaction(async (tx) => {
      await tx.mfaRecoveryCode.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.mfaRecoveryCode.createMany({
        data: hashedRecoveryCodes.map(({ codeHash }) => ({
          userId: user.id,
          codeHash,
        })),
      });

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          mfaEnabled: true,
        },
      });
    });

    return Response.json({
      success: true,
      recoveryCodes: recoveryCodes.map(formatRecoveryCode),
    });
  } catch (error) {
    console.error("MFA VERIFICATION ERROR:", error);

    return Response.json(
      { error: "Unable to complete MFA setup." },
      { status: 500 },
    );
  }
}
