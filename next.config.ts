import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "awareness-surrounding-contribute-principles.trycloudflare.com",
  ],
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [new URL("https://placehold.co/**")],
  },
};

export default nextConfig;
