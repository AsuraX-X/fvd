import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../../lib/auth";

const handlers = toNextJsHandler(auth.handler);

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  const headers = new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,user-agent",
    "Access-Control-Expose-Headers": "Location",
    "Access-Control-Allow-Credentials": "true",
  });

  return new Response(null, { status: 204, headers });
}

export const GET = async (req: Request) => {
  const res = await handlers.GET(req);
  const headers = new Headers(res.headers);
  const origin = req.headers.get("origin") ?? "*";
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Expose-Headers", "Location");
  return new Response(res.body, { status: res.status, headers });
};

export const POST = async (req: Request) => {
  const res = await handlers.POST(req);
  const headers = new Headers(res.headers);
  const origin = req.headers.get("origin") ?? "*";
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Expose-Headers", "Location");
  try {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/sign-out")) {
      headers.set("X-Better-Auth-Event", "signout");
    }
  } catch (e) {
    /* ignore */
  }

  return new Response(res.body, { status: res.status, headers });
};
