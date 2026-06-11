import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [sentinelClient()],
});
