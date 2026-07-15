import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [sentinelClient()],
});
