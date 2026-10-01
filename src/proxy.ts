import { NextResponse } from "next/server";

import { SECURITY_HEADERS } from "./lib/security/headers";

export function proxy() {
  const response = NextResponse.next();
  // The policy forbids eval and websockets, which the dev server's hot reload needs.
  if (process.env.NODE_ENV !== "production") return response;
  for (const { key, value } of SECURITY_HEADERS) response.headers.set(key, value);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
