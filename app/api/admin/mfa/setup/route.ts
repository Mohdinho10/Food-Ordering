import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import { encryptMfaSecret } from "@/app/lib/mfa";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
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

    const secret = generateSecret();

    const uri = generateURI({
      issuer: "Bella Vista Restaurant",
      label: user.phone ?? user.name,
      secret,
    });

    const qrCode = await QRCode.toDataURL(uri, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        mfaSecret: encryptMfaSecret(secret),
      },
    });

    return Response.json({
      qrCode,
      secret,
    });
  } catch (error) {
    console.error("MFA SETUP ERROR:", error);

    return Response.json(
      { error: "Unable to start MFA setup." },
      { status: 500 },
    );
  }
}
