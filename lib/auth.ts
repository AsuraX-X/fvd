import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./emails";
import { prisma } from "./prisma";
import { TERMS_VERSION } from "./terms";

export const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";
export const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS || BASE_URL)
  .split(",")
  .map((s) => s.trim());

// A welcome email is a nice-to-have: log a failure rather than failing the
// sign-up or verification request that triggered it.
const sendWelcomeEmailSafely = async (user: { email: string; name: string }) => {
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error(error);
  }
};

export const auth = betterAuth({
  appName: "FVDLance",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: BASE_URL,
  trustedOrigins: TRUSTED_ORIGINS,
  advanced: {
    // Fetch related rows (e.g. session + user on /get-session) in one Prisma
    // query via `include` instead of separate round trips.
    database: { joins: true },
    // Vercel's edge overwrites these with the real client IP, so rate limiting
    // keys per-visitor instead of lumping everyone into one bucket.
    ipAddress: {
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    // Fires once, on the unverified → verified transition (better-auth returns
    // early for already-verified users), so email sign-ups get exactly one welcome.
    afterEmailVerification: async (user) => {
      await sendWelcomeEmailSafely(user);
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
        // OAuth users arrive already verified; email sign-ups are welcomed in
        // `afterEmailVerification` instead, once they confirm their address.
        after: async (user) => {
          if (user.emailVerified) await sendWelcomeEmailSafely(user);
        },
      },
      update: {
        before: async (user) => {
          // `termsVersion` is `input: true` for sign-up, which also lets
          // /update-user set it. Acceptance only happens via the acceptTerms
          // action (a direct Prisma write), so strip it from better-auth updates.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { termsVersion, termsAcceptedAt, ...data } = user;
          return { data };
        },
      },
    },
  },
  plugins: [dash()],
});
