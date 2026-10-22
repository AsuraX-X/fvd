import { REQUEST_PATH_HEADER } from "@/lib/terms";
import { NextResponse, type NextRequest } from "next/server";

// Layouts don't receive the URL, so expose it as a request header for the
// auth-guarded layouts (app/dashboard, app/admin) to build a sign-in return
// path from. Always overwritten here, so a client-sent value can't leak in.
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    REQUEST_PATH_HEADER,
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
