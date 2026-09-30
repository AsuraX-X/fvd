import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { prisma } from "./prisma";
import { EMAIL_FROM, resend } from "./resend";
import { TERMS_VERSION } from "./terms";

export const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";
export const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS || BASE_URL)
  .split(",")
  .map((s) => s.trim());

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: BASE_URL,
  trustedOrigins: TRUSTED_ORIGINS,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Verify your email",
        html: `<p>Welcome to FVDlance! Please verify your email address to activate your account.</p><p><a href="${url}">Verify your email</a></p><p>If you didn't create this account, you can ignore this email.</p>`,
      });

      if (error) {
        throw new Error(`Failed to send verification email: ${error.message}`);
      }
    },
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  user: {
    additionalFields: {
      // Sent by the sign-up form's terms checkbox; validated in the hook below.
      termsVersion: { type: "string", required: false, input: true },
      termsAcceptedAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Email sign-ups must tick the terms checkbox. OAuth sign-ups can't,
          // so they're created without acceptance and sent to /accept-terms.
          if (ctx?.path === "/sign-up/email") {
            if (user.termsVersion !== TERMS_VERSION) {
              throw new APIError("BAD_REQUEST", {
                message:
                  "You must accept the Terms of Service and Privacy Policy.",
              });
            }
            return { data: { ...user, termsAcceptedAt: new Date() } };
          }
          return {
            data: { ...user, termsVersion: null, termsAcceptedAt: null },
          };
        },
      },
    },
  },
  plugins: [dash()],
});
