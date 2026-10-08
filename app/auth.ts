import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import { decryptMfaSecret } from "@/app/lib/mfa";
import bcrypt from "bcryptjs";
import { verify } from "otplib";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        phone: {
          label: "Phone Number",
          type: "tel",
        },
        password: {
          label: "Password",
          type: "password",
        },
        mfaCode: {
          label: "Authenticator Code",
          type: "text",
        },
        recoveryCode: {
          label: "Recovery Code",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const phone = String(credentials.phone).trim();
        const password = String(credentials.password);

        const mfaCode = credentials.mfaCode
          ? String(credentials.mfaCode).replace(/\s/g, "")
          : "";

        const recoveryCode = credentials.recoveryCode
          ? String(credentials.recoveryCode)
              .replace(/-/g, "")
              .replace(/\s/g, "")
              .toUpperCase()
          : "";

        if (!phone || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            phone,
          },
          include: {
            role: true,
          },
        });

        if (!user) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          return null;
        }

        if (!user.passwordHash) {
          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordIsValid) {
          return null;
        }

        /*
         * MFA is not enabled yet.
         *
         * The user is allowed into the temporary authenticated state
         * so they can complete MFA setup.
         */
        if (!user.mfaEnabled) {
          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role?.name ?? null,
            mustChangePassword: user.mustChangePassword,
            mfaEnabled: false,
            mfaVerified: false,
          };
        }

        /*
         * From this point onward MFA is mandatory.
         */
        if (!user.mfaSecret) {
          return null;
        }

        /*
         * Authenticator-app code.
         */
        if (mfaCode) {
          try {
            const secret = decryptMfaSecret(user.mfaSecret);

            const result = await verify({
              secret,
              token: mfaCode,
            });

            if (result.valid) {
              return {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role?.name ?? null,
                mustChangePassword: user.mustChangePassword,
                mfaEnabled: true,
                mfaVerified: true,
              };
            }
          } catch {
            return null;
          }
        }

        /*
         * Recovery code.
         *
         * Recovery codes are stored as bcrypt hashes, never plaintext.
         */
        if (recoveryCode) {
          const recoveryCodes = await prisma.mfaRecoveryCode.findMany({
            where: {
              userId: user.id,
              usedAt: null,
            },
          });

          for (const storedCode of recoveryCodes) {
            const matches = await bcrypt.compare(
              recoveryCode,
              storedCode.codeHash,
            );

            if (!matches) {
              continue;
            }

            const consumed = await prisma.mfaRecoveryCode.updateMany({
              where: {
                id: storedCode.id,
                usedAt: null,
              },
              data: {
                usedAt: new Date(),
              },
            });

            if (consumed.count !== 1) {
              return null;
            }

            return {
              id: user.id,
              name: user.name,
              phone: user.phone,
              role: user.role?.name ?? null,
              mustChangePassword: user.mustChangePassword,
              mfaEnabled: true,
              mfaVerified: true,
            };
          }
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
        token.mfaEnabled = user.mfaEnabled;
        token.mfaVerified = user.mfaVerified;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string | null;
        session.user.role = token.role as string | null;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        session.user.mfaEnabled = token.mfaEnabled as boolean;
        session.user.mfaVerified = token.mfaVerified as boolean;
      }

      return session;
    },
  },
});
