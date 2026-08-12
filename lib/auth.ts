import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

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
  emailAndPassword: { enabled: true },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  plugins: [dash()],
});
