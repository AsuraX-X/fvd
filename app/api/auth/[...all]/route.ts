import { toNextJsHandler } from "better-auth/next-js";
import { auth, TRUSTED_ORIGINS } from "../../../../lib/auth";

const handlers = toNextJsHandler(auth.handler);

function allowedOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return origin && TRUSTED_ORIGINS.includes(origin) ? origin : null;
}

function applyCors(headers: Headers, origin: string | null) {
  if (!origin) return;
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Expose-Headers", "Location");
}

export async function OPTIONS(req: Request) {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,user-agent",
  });
  applyCors(headers, allowedOrigin(req));

  return new Response(null, { status: 204, headers });
}

export const GET = async (req: Request) => {
  const res = await handlers.GET(req);
  const headers = new Headers(res.headers);
  applyCors(headers, allowedOrigin(req));
  return new Response(res.body, { status: res.status, headers });
};

export const POST = async (req: Request) => {
  const res = await handlers.POST(req);
  const headers = new Headers(res.headers);
  applyCors(headers, allowedOrigin(req));
  try {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/sign-out")) {
      headers.set("X-Better-Auth-Event", "signout");
    }
  } catch (e) {
    /* ignore */
    console.error(e);
  }

  return new Response(res.body, { status: res.status, headers });
};
